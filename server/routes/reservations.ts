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
      .from('reservations')
      .select(`
        *,
        parents (
          name,
          phone,
          membership_type,
          organization_id
        ),
        program_schedules (
          date,
          start_time,
          programs (title, organization_id)
        ),
        attendance (
          *,
          children (name)
        )
      `)
      .order('created_at', { ascending: false });

    if (userProfile?.organization_id) {
      // In a real app, we'd filter by program's organization_id
      // For now, we'll filter by parent's organization_id as a proxy
      query = query.eq('parents.organization_id', userProfile.organization_id);
    }

    const { data, error } = await query;
      
    if (error) throw error;

    // Map to match the previous structure if needed, or return as is
    const mapped = data.map((r: any) => ({
      ...r,
      parent_name: r.parents?.name,
      parent_phone: r.parents?.phone,
      membership_type: r.parents?.membership_type,
      program_title: r.program_schedules?.programs?.title,
      date: r.program_schedules?.date,
      time: r.program_schedules?.start_time
    }));

    res.json(mapped);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  const { parent_id, program_schedule_id, total_price, notes, child_ids, is_parent_attending } = req.body;
  try {
    // 1. Check capacity
    const { data: schedule, error: schedError } = await supabase
      .from('program_schedules')
      .select('capacity')
      .eq('id', program_schedule_id)
      .single();
    
    if (schedError || !schedule) throw new Error('スケジュールが見つかりません');

    const { data: currentReservations, error: countError } = await supabase
      .from('reservations')
      .select('id')
      .eq('program_schedule_id', program_schedule_id)
      .neq('status', 'cancelled');
    
    if (countError) throw countError;

    const resIds = currentReservations.map(r => r.id);
    let currentParticipantCount = 0;
    
    if (resIds.length > 0) {
      const { count, error: attCountError } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .in('reservation_id', resIds);
      
      if (attCountError) throw attCountError;
      currentParticipantCount = count || 0;
    }

    const newParticipantsCount = (child_ids?.length || 0) + (is_parent_attending ? 1 : 0);
    
    if (currentParticipantCount + newParticipantsCount > schedule.capacity) {
      return res.status(400).json({ error: '定員に達したため予約できません' });
    }

    // 2. Create reservation
    const { data: resData, error: resError } = await supabase
      .from('reservations')
      .insert([
        { 
          parent_id, 
          program_schedule_id, 
          total_price: total_price || 0, 
          notes: notes || "", 
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ])
      .select();
      
    if (resError) throw resError;
    const reservationId = resData[0].id;

    // 2. Create attendance for participants
    const attendanceData = [];
    
    if (is_parent_attending) {
      attendanceData.push({
        reservation_id: reservationId,
        is_parent: true,
        planned_status: 'attending'
      });
    }

    if (child_ids && Array.isArray(child_ids)) {
      child_ids.forEach((childId: string) => {
        attendanceData.push({
          reservation_id: reservationId,
          child_id: childId,
          is_parent: false,
          planned_status: 'attending'
        });
      });
    }

    if (attendanceData.length > 0) {
      const { error: attError } = await supabase.from('attendance').insert(attendanceData);
      if (attError) throw attError;
    }

    res.json({ id: reservationId });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.patch("/:id", isAdmin, async (req, res) => {
  const { status } = req.body;
  try {
    const { error: updateError } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', req.params.id);
      
    if (updateError) throw updateError;
    
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Customer self-cancellation
router.post("/:id/cancel", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // 1. Get parent_id for this user
    const { data: parent, error: pError } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (pError || !parent) throw new Error('会員情報が見つかりません');

    // 2. Verify reservation belongs to this parent and is not already completed/cancelled
    const { data: reservation, error: rError } = await supabase
      .from('reservations')
      .select('status, parent_id')
      .eq('id', req.params.id)
      .single();
    
    if (rError || !reservation) throw new Error('予約が見つかりません');
    if (reservation.parent_id !== parent.id) return res.status(403).json({ error: 'Forbidden' });
    if (reservation.status === 'completed' || reservation.status === 'cancelled') {
      return res.status(400).json({ error: 'この予約はキャンセルできません' });
    }

    // 3. Update status
    const { error: updateError } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', req.params.id);
      
    if (updateError) throw updateError;
    
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
