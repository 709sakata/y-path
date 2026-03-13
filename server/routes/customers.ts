import express from "express";
import { supabase } from "../supabase";
import { isAdmin } from "../middleware/auth";

const router = express.Router();

router.get("/", isAdmin, async (req, res) => {
  const userId = req.session.userId;
  try {
    const { data: userProfile } = await supabase
      .from('parent_organizations')
      .select('organization_id')
      .eq('parent_id', userId)
      .limit(1)
      .single();

    let query = supabase
      .from('parents')
      .select('*, children(*), parent_organizations!inner(*)')
      .order('created_at', { ascending: false });

    if (userProfile?.organization_id) {
      query = query.eq('parent_organizations.organization_id', userProfile.organization_id);
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
      .select('*, children(*), parent_organizations(*)')
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
          start_date,
          end_date,
          programs (title),
          schedule_locations (
            meeting_time,
            dismissal_time
          )
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
      date: r.program_schedules?.start_date,
      time: r.program_schedules?.schedule_locations?.[0]?.meeting_time || ''
    }));

    const { data: surveys, error: surveysError } = await supabase
      .from('customer_surveys')
      .select('*')
      .eq('parent_id', targetParentId)
      .order('submitted_at', { ascending: false });

    if (surveysError) throw surveysError;

    res.json({ ...parent, history: mappedReservations, surveys });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.put("/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, parent_organizations, children } = req.body;

  try {
    // 1. Update parent profile
    const { error: parentError } = await supabase
      .from('parents')
      .update({
        name,
        email,
        phone
      })
      .eq('id', id);

    if (parentError) throw parentError;

    // Update parent_organizations if provided
    if (parent_organizations && Array.isArray(parent_organizations)) {
      // Get admin's organization_id if needed
      let adminOrgId = null;
      if (req.session.role === 'admin') {
        const { data: adminProfile } = await supabase
          .from('parents')
          .select('organization_id')
          .eq('id', req.session.userId)
          .single();
        adminOrgId = adminProfile?.organization_id;
      }

      for (const org of parent_organizations) {
        const targetOrgId = org.organization_id || adminOrgId;
        if (targetOrgId) {
          const { error: orgError } = await supabase
            .from('parent_organizations')
            .upsert({
              parent_id: id,
              organization_id: targetOrgId,
              membership_type: org.membership_type,
              membership_status: org.membership_status
            }, { onConflict: 'parent_id, organization_id' });
          if (orgError) throw orgError;
        }
      }
    }

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
