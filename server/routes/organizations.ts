import express from "express";
import { supabase } from "../supabase";
import { isAdmin } from "../middleware/auth";

const router = express.Router();

router.get("/check-env", (req, res) => {
  res.json({
    url: process.env.SUPABASE_URL ? '✓' : '✗ MISSING',
    anon: process.env.SUPABASE_ANON_KEY ? '✓' : '✗ MISSING',
    service: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗ MISSING',
    service_alt: process.env.SERVICE_ROLE_KEY ? '✓' : '✗ MISSING',
    keyType: (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY) ? 'service_role' : 'anon (fallback)'
  });
});

router.get("/check-key", (req, res) => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  res.json({ hasKey: !!key });
});

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

router.post("/", isAdmin, async (req, res) => {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    if (!serviceKey) {
      return res.status(500).json({ error: "サーバーの設定エラー: SUPABASE_SERVICE_ROLE_KEY が設定されていません。AI Studioの環境変数に設定してください。" });
    }

    const { name, description, website } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const { data, error } = await supabase
      .from('organizations')
      .insert([{ name, description, website }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (e: any) {
    console.error("Create organization error:", JSON.stringify(e, null, 2));
    res.status(500).json({ error: e.message || JSON.stringify(e) });
  }
});

router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (e: any) {
    console.error("Delete organization error:", e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
