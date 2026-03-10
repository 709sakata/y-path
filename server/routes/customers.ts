import express from "express";
import { supabase } from "../supabase";
import { isAdmin } from "../middleware/auth";

const router = express.Router();

router.get("/", isAdmin, async (req, res) => {
  const userId = req.session.userId;
  try {
    const { data: userProfile } = await supabase
      .from('parents')
      .select('organization_id')
      .eq('id', userId)
      .single();

    let query = supabase
      .from('parents')
      .select('*, children(*)')
      .order('created_at', { ascending: false });

    if (userProfile?.organization_id) {
      query = query.eq('organization_id', userProfile.organization_id);
    }

    const { data, error } = await query;
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", isAdmin, async (req, res) => {
  const { name, email, phone, membership_type, children } = req.body;
  try {
    // 1. Create parent (Note: This might need an auth user if we want them to login, 
    // but for admin manual entry, we might just create the profile)
    // For now, let's assume we need a UUID. If no user_id, this might fail if it's a FK to auth.users.
    // Actually, in my schema, id REFERENCES auth.users(id).
    // So manual entry without auth user is tricky. 
    // Let's assume for now admin-created parents don't have login until invited.
    
    // For this demo, I'll allow parent creation without auth link if I remove the FK or use a different table.
    // But let's stick to the schema.
    
    res.status(400).json({ error: "Admin manual entry requires Supabase Auth user creation first." });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/:id", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = req.session.userId;
  const role = req.session.role;
  const targetParentId = req.params.id;

  try {
    const { data: parent, error: parentError } = await supabase
      .from('parents')
      .select('*, children(*)')
      .eq('id', targetParentId)
      .single();

    if (parentError || !parent) {
      return res.status(404).json({ error: "Parent not found" });
    }

    if (role !== 'admin' && parent.id !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { data: reservations, error: resError } = await supabase
      .from('reservations')
      .select(`
        *,
        program_schedules (
          date,
          start_time,
          programs (title)
        ),
        attendance (
          *,
          children (name)
        )
      `)
      .eq('parent_id', targetParentId)
      .order('created_at', { ascending: false });

    if (resError) throw resError;

    const mappedReservations = reservations.map((r: any) => ({
      ...r,
      program_title: r.program_schedules?.programs?.title,
      date: r.program_schedules?.date,
      time: r.program_schedules?.start_time
    }));

    res.json({ ...parent, history: mappedReservations });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.put("/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, membership_type, membership_status, children } = req.body;

  try {
    // 1. Update parent profile
    const { error: parentError } = await supabase
      .from('parents')
      .update({
        name,
        email,
        phone,
        membership_type,
        membership_status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (parentError) throw parentError;

    // 2. Handle children updates if provided
    if (children && Array.isArray(children)) {
      for (const child of children) {
        if (child.id) {
          // Update existing child
          const { error: childError } = await supabase
            .from('children')
            .update({
              name: child.name,
              birthday: child.birthday,
              notes: child.notes,
              is_active: child.is_active ?? true
            })
            .eq('id', child.id)
            .eq('parent_id', id);
          if (childError) throw childError;
        } else {
          // Insert new child
          const { error: childError } = await supabase
            .from('children')
            .insert([{
              parent_id: id,
              name: child.name,
              birthday: child.birthday,
              notes: child.notes,
              is_active: true
            }]);
          if (childError) throw childError;
        }
      }
    }

    res.json({ success: true });
  } catch (e: any) {
    console.error("Update customer error:", e);
    res.status(400).json({ error: e.message });
  }
});

export default router;
