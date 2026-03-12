import express from "express";
import { supabase } from "../supabase";
import { isAdmin } from "../middleware/auth";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { data: programs, error: pError } = await supabase
      .from('programs')
      .select('*, program_schedules(*), organizations(name)')
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false });
      
    if (pError) throw pError;

    // Get all attendance counts for these schedules
    const scheduleIds = programs.flatMap(p => p.program_schedules?.map((s: any) => s.id) || []);
    
    if (scheduleIds.length > 0) {
      const { data: reservations, error: rError } = await supabase
        .from('reservations')
        .select('id, program_schedule_id')
        .in('program_schedule_id', scheduleIds)
        .neq('status', 'cancelled');
      
      if (rError) throw rError;

      const resIds = reservations.map(r => r.id);
      
      if (resIds.length > 0) {
        const { data: attendance, error: aError } = await supabase
          .from('attendance')
          .select('reservation_id')
          .in('reservation_id', resIds);
        
        if (aError) throw aError;

        // Count participants per schedule
        const counts: Record<string, number> = {};
        reservations.forEach(r => {
          const attCount = attendance.filter(a => a.reservation_id === r.id).length;
          counts[r.program_schedule_id] = (counts[r.program_schedule_id] || 0) + attCount;
        });

        // Inject counts into programs data
        programs.forEach(p => {
          p.program_schedules?.forEach((s: any) => {
            s.current_participants = counts[s.id] || 0;
          });
        });
      } else {
        programs.forEach(p => {
          p.program_schedules?.forEach((s: any) => {
            s.current_participants = 0;
          });
        });
      }
    }

    const mappedPrograms = programs.map(p => {
      const { program_schedules, organizations, ...rest } = p;
      return {
        ...rest,
        organization_name: organizations?.name,
        schedules: program_schedules
      };
    });

    res.json(mappedPrograms);
  } catch (e: any) {
    console.error("Fetch error (programs):", e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/", isAdmin, async (req, res) => {
  const { title, description, base_price, capacity, category, schedules, status, organization_id } = req.body;
  try {
    // 1. Create program
    const { data: programData, error: programError } = await supabase
      .from('programs')
      .insert([
        { 
          title, 
          description, 
          base_price: base_price || 0, 
          capacity: capacity || 20, 
          category: category || 'irregular',
          status: status || 'active',
          organization_id: organization_id || null
        }
      ])
      .select();
      
    if (programError) throw programError;
    const programId = programData[0].id;

    // 2. Create schedules if provided
    if (schedules && Array.isArray(schedules)) {
      const schedulesData = schedules.map((s: any) => ({
        program_id: programId,
        date: s.date,
        start_time: s.start_time,
        end_time: s.end_time,
        location: s.location,
        capacity: s.capacity || capacity || 20
      }));
      await supabase.from('program_schedules').insert(schedulesData);
    }

    res.json({ id: programId });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.put("/:id", isAdmin, async (req, res) => {
  const { title, description, base_price, capacity, category, schedules, status, organization_id } = req.body;
  const programId = req.params.id;

  try {
    // 1. Update program
    const { error: programError } = await supabase
      .from('programs')
      .update({ 
        title, 
        description, 
        base_price: base_price || 0, 
        capacity: capacity || 20, 
        category: category || 'irregular',
        status: status || 'active',
        organization_id: organization_id || null
      })
      .eq('id', programId);
      
    if (programError) throw programError;

    // 2. Update schedules
    // For simplicity, we delete existing schedules and re-insert them
    // In a real production app, you might want to update existing ones by ID
    if (schedules && Array.isArray(schedules)) {
      await supabase.from('program_schedules').delete().eq('program_id', programId);
      
      const schedulesData = schedules.map((s: any) => ({
        program_id: programId,
        date: s.date,
        start_time: s.start_time,
        end_time: s.end_time,
        location: s.location,
        capacity: s.capacity || capacity || 20
      }));
      await supabase.from('program_schedules').insert(schedulesData);
    }

    res.json({ success: true });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:id", isAdmin, async (req, res) => {
  const { error } = await supabase
    .from('programs')
    .update({ status: 'cancelled' })
    .eq('id', req.params.id);
    
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

export default router;
