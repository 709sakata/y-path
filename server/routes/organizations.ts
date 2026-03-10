import express from "express";
import { supabase } from "../supabase";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) throw error;
    res.json(data);
  } catch (e: any) {
    console.error("Fetch error (organizations):", e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
