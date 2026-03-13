import express from "express";
import { supabase } from "../supabase";
import { isAdmin } from "../middleware/auth";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { data: programs, error: pError } = await supabase
      .from('programs')
      .select(`
        *,
        organizations(name),
        program_schedules(
          *,
          schedule_locations(
            *,
            locations(*)
          )
        ),
        program_pricing(*)
      `)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false });
      
    if (pError) throw pError;

    if (!programs) {
      return res.json([]);
    }

    // Get all attendance counts for these schedules
    const scheduleIds = programs.flatMap(p => p.program_schedules?.map((s: any) => s.id) || []);
    
    if (scheduleIds.length > 0) {
      const { data: reservations, error: rError } = await supabase
        .from('reservations')
        .select('id, program_schedule_id')
        .in('program_schedule_id', scheduleIds)
        .neq('status', 'cancelled');
      
      if (rError) throw rError;

      const resIds = reservations ? reservations.map(r => r.id) : [];
      
      if (resIds.length > 0) {
        const { data: attendance, error: aError } = await supabase
          .from('attendance')
          .select('reservation_id')
          .in('reservation_id', resIds);
        
        if (aError) throw aError;

        // Count participants per schedule
        const counts: Record<string, number> = {};
        if (reservations) {
          reservations.forEach(r => {
            const attCount = attendance ? attendance.filter(a => a.reservation_id === r.id).length : 0;
            counts[r.program_schedule_id] = (counts[r.program_schedule_id] || 0) + attCount;
          });
        }

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
      const { program_schedules, program_pricing, organizations, ...rest } = p;
      return {
        ...rest,
        organization_name: organizations?.name,
        schedules: program_schedules,
        pricing: program_pricing
      };
    });

    res.json(mappedPrograms);
  } catch (e: any) {
    console.error("Fetch error (programs):", e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/", isAdmin, async (req, res) => {
  const { 
    title, description, category, status, organization_id,
    target_age_min, target_age_max, target_grade_min, target_grade_max,
    eligibility, requires_certificate, lottery_based,
    capacity, min_participants, nights, is_annual_recurring,
    pricing_unit, cancellation_policy_id,
    fire_type, water_activity, cotton_required_days, muffler_prohibited,
    study_time, study_minutes_per_session, parent_program,
    rental_available, organizer_name, sponsor_name,
    schedules, pricing
  } = req.body;

  try {
    // 1. Create program
    const { data: programData, error: programError } = await supabase
      .from('programs')
      .insert([
        { 
          title, description, category: category || 'EVENT', status: status || 'draft', organization_id,
          target_age_min, target_age_max, target_grade_min, target_grade_max,
          eligibility: eligibility || 'open', requires_certificate: requires_certificate || false, lottery_based: lottery_based || false,
          capacity: capacity || 20, min_participants, nights: nights || 0, is_annual_recurring: is_annual_recurring || false,
          pricing_unit: pricing_unit || 'per_person', cancellation_policy_id,
          fire_type: fire_type || 'none', water_activity: water_activity || false, cotton_required_days, muffler_prohibited: muffler_prohibited || false,
          study_time: study_time || false, study_minutes_per_session, parent_program: parent_program || false,
          rental_available: rental_available || false, organizer_name, sponsor_name
        }
      ])
      .select();
      
    if (programError) throw programError;
    const programId = programData[0].id;

    // 2. Create pricing
    if (pricing && Array.isArray(pricing)) {
      const pricingData = pricing.map((p: any, index: number) => ({
        program_id: programId,
        tier_label: p.tier_label,
        amount: p.amount,
        extra_fee: p.extra_fee || 0,
        applicable_days: p.applicable_days,
        includes_persons: p.includes_persons,
        max_persons: p.max_persons,
        min_age_free: p.min_age_free,
        notes: p.notes,
        sort_order: p.sort_order || index
      }));
      await supabase.from('program_pricing').insert(pricingData);
    }

    // 3. Create schedules and locations
    if (schedules && Array.isArray(schedules)) {
      for (const s of schedules) {
        const { data: scheduleData, error: scheduleError } = await supabase
          .from('program_schedules')
          .insert([{
            program_id: programId,
            start_date: s.start_date,
            end_date: s.end_date,
            status: s.status || 'open',
            capacity_override: s.capacity_override,
            dismissal_override: s.dismissal_override,
            notes: s.notes
          }])
          .select();
          
        if (scheduleError) throw scheduleError;
        
        if (s.schedule_locations && Array.isArray(s.schedule_locations)) {
          const locData = s.schedule_locations.map((loc: any) => ({
            schedule_id: scheduleData[0].id,
            location_id: loc.location_id,
            meeting_time: loc.meeting_time,
            dismissal_time: loc.dismissal_time
          }));
          await supabase.from('schedule_locations').insert(locData);
        }
      }
    }

    res.json({ id: programId });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.put("/:id", isAdmin, async (req, res) => {
  const { 
    title, description, category, status, organization_id,
    target_age_min, target_age_max, target_grade_min, target_grade_max,
    eligibility, requires_certificate, lottery_based,
    capacity, min_participants, nights, is_annual_recurring,
    pricing_unit, cancellation_policy_id,
    fire_type, water_activity, cotton_required_days, muffler_prohibited,
    study_time, study_minutes_per_session, parent_program,
    rental_available, organizer_name, sponsor_name,
    schedules, pricing
  } = req.body;
  const programId = req.params.id;

  try {
    // 1. Update program
    const { error: programError } = await supabase
      .from('programs')
      .update({ 
        title, description, category: category || 'EVENT', status: status || 'draft', organization_id,
        target_age_min, target_age_max, target_grade_min, target_grade_max,
        eligibility: eligibility || 'open', requires_certificate: requires_certificate || false, lottery_based: lottery_based || false,
        capacity: capacity || 20, min_participants, nights: nights || 0, is_annual_recurring: is_annual_recurring || false,
        pricing_unit: pricing_unit || 'per_person', cancellation_policy_id,
        fire_type: fire_type || 'none', water_activity: water_activity || false, cotton_required_days, muffler_prohibited: muffler_prohibited || false,
        study_time: study_time || false, study_minutes_per_session, parent_program: parent_program || false,
        rental_available: rental_available || false, organizer_name, sponsor_name
      })
      .eq('id', programId);
      
    if (programError) throw programError;

    // 2. Update pricing (delete and re-insert for simplicity)
    if (pricing && Array.isArray(pricing)) {
      await supabase.from('program_pricing').delete().eq('program_id', programId);
      const pricingData = pricing.map((p: any, index: number) => ({
        program_id: programId,
        tier_label: p.tier_label,
        amount: p.amount,
        extra_fee: p.extra_fee || 0,
        applicable_days: p.applicable_days,
        includes_persons: p.includes_persons,
        max_persons: p.max_persons,
        min_age_free: p.min_age_free,
        notes: p.notes,
        sort_order: p.sort_order || index
      }));
      await supabase.from('program_pricing').insert(pricingData);
    }

    // 3. Update schedules (delete and re-insert for simplicity)
    if (schedules && Array.isArray(schedules)) {
      await supabase.from('program_schedules').delete().eq('program_id', programId);
      
      for (const s of schedules) {
        const { data: scheduleData, error: scheduleError } = await supabase
          .from('program_schedules')
          .insert([{
            program_id: programId,
            start_date: s.start_date,
            end_date: s.end_date,
            status: s.status || 'open',
            capacity_override: s.capacity_override,
            dismissal_override: s.dismissal_override,
            notes: s.notes
          }])
          .select();
          
        if (scheduleError) throw scheduleError;
        
        if (s.schedule_locations && Array.isArray(s.schedule_locations)) {
          const locData = s.schedule_locations.map((loc: any) => ({
            schedule_id: scheduleData[0].id,
            location_id: loc.location_id,
            meeting_time: loc.meeting_time,
            dismissal_time: loc.dismissal_time
          }));
          await supabase.from('schedule_locations').insert(locData);
        }
      }
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
