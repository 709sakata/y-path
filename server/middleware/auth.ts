import { Request, Response, NextFunction } from "express";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  console.log("isAdmin check - Session ID:", req.sessionID);
  console.log("isAdmin check - UserID in session:", req.session.userId);
  console.log("isAdmin check - Role in session:", req.session.role);
  
  if (!req.session.userId) {
    console.log("isAdmin: No userId in session. Headers:", JSON.stringify(req.headers));
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  if (req.session.role === 'admin') {
    next();
  } else {
    console.log(`isAdmin: Forbidden for user ${req.session.userId} with role ${req.session.role}`);
    res.status(403).json({ error: "Forbidden: Admin access required" });
  }
};
