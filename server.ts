import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import { createServer as createViteServer } from "vite";
import session from "express-session";

// Route Imports
import authRoutes from "./server/routes/auth";
import programRoutes from "./server/routes/programs";
import customerRoutes from "./server/routes/customers";
import reservationRoutes from "./server/routes/reservations";
import statsRoutes from "./server/routes/stats";
import organizationRoutes from "./server/routes/organizations";

declare module "express-session" {
  interface SessionData {
    userId: string;
    role: string;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.set('trust proxy', true);
  app.use(express.json());

  // Middleware to force HTTPS recognition behind proxy
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] === 'http') {
      req.headers['x-forwarded-proto'] = 'https';
    }
    next();
  });

  app.use(session({
    name: 'himeji-ymca-session',
    secret: process.env.SESSION_SECRET || 'reserve-flow-secret-key-123',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    proxy: true,
    cookie: { 
      secure: true,
      sameSite: 'none',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - SessionID: ${req.sessionID} - UserID: ${req.session.userId}`);
    next();
  });

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/programs", programRoutes);
  app.use("/api/customers", customerRoutes);
  app.use("/api/reservations", reservationRoutes);
  app.use("/api/stats", statsRoutes);
  app.use("/api/organizations", organizationRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
