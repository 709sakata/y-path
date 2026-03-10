import express from "express";
import { supabase } from "../supabase";
import { isAdmin } from "../middleware/auth";

const router = express.Router();

router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from('events')
    .select('*, event_schedules(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Supabase fetch error (events):", JSON.stringify(error, null, 2));
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

router.post("/", isAdmin, async (req, res) => {
  const { title, description, base_price, capacity, category, schedules } = req.body;
  try {
    // 1. Create event
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .insert([
        { 
          title, 
          description, 
          base_price: base_price || 0, 
          capacity: capacity || 20, 
          category: category || 'irregular' 
        }
      ])
      .select();
      
    if (eventError) throw eventError;
    const eventId = eventData[0].id;

    // 2. Create schedules if provided
    if (schedules && Array.isArray(schedules)) {
      const schedulesData = schedules.map((s: any) => ({
        event_id: eventId,
        date: s.date,
        start_time: s.start_time,
        end_time: s.end_time,
        location: s.location,
        capacity: s.capacity || capacity || 20
      }));
      await supabase.from('event_schedules').insert(schedulesData);
    }

    res.json({ id: eventId });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:id", isAdmin, async (req, res) => {
  const { error } = await supabase
    .from('events')
    .update({ status: 'cancelled' })
    .eq('id', req.params.id);
    
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

export default router;
