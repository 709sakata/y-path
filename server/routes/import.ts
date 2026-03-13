import express from "express";
import { supabase, createAuthClient } from "../supabase";
import { isAdmin } from "../middleware/auth";

const router = express.Router();

router.post("/customers", isAdmin, async (req, res) => {
  const { customers } = req.body;
  if (!Array.isArray(customers)) {
    return res.status(400).json({ error: "Invalid data format" });
  }

  try {
    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const customer of customers) {
      try {
        // 1. Create user in auth (using a dummy password or generating one)
        // Since we can't easily bulk import into auth without admin API,
        // and even with admin API we might hit rate limits,
        // we'll use admin API if available.
        const email = customer.email || `imported_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`;
        const password = Math.random().toString(36).slice(-10) + 'A1!'; // Secure random password
        
        let userId;
        try {
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { role: 'customer' }
          });
          
          if (authError) throw authError;
          userId = authData.user.id;
        } catch (adminErr: any) {
          // Fallback to regular signup
          const tempClient = createAuthClient();
          const { data: authData, error: authError } = await tempClient.auth.signUp({
            email,
            password,
            options: { data: { role: 'customer' } }
          });
          if (authError) throw authError;
          userId = authData.user?.id;
        }

        if (!userId) throw new Error("Failed to create auth user");

        // 2. Create parent record
        const { error: parentError } = await supabase
          .from('parents')
          .insert([{
            id: userId,
            name: customer.name || '名前未設定',
            email: email,
            phone: customer.phone || null,
            membership_type: customer.membership_type || 'general',
            membership_status: 'active',
            joined_at: customer.joined_at || new Date().toISOString()
          }]);

        if (parentError) throw parentError;

        // 3. Create children if any
        if (customer.children && Array.isArray(customer.children)) {
          const childrenData = customer.children.map((child: any) => ({
            parent_id: userId,
            name: child.name || '名前未設定',
            birthday: child.birthday || null,
            is_active: true
          }));
          
          if (childrenData.length > 0) {
            const { error: childError } = await supabase.from('children').insert(childrenData);
            if (childError) throw childError;
          }
        }

        results.success++;
      } catch (err: any) {
        results.failed++;
        results.errors.push(`Row ${customer.name || customer.email}: ${err.message}`);
      }
    }

    res.json(results);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/reservations", isAdmin, async (req, res) => {
  const { reservations } = req.body;
  if (!Array.isArray(reservations)) {
    return res.status(400).json({ error: "Invalid data format" });
  }

  try {
    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const resData of reservations) {
      try {
        // Find parent by email or name
        let parentId = resData.parent_id;
        if (!parentId && resData.parent_email) {
          const { data: parent } = await supabase
            .from('parents')
            .select('id')
            .eq('email', resData.parent_email)
            .single();
          if (parent) parentId = parent.id;
        }

        if (!parentId) throw new Error("Parent not found");

        // Find program schedule
        let scheduleId = resData.program_schedule_id;
        
        if (!scheduleId) throw new Error("Program schedule ID required");

        // Create reservation
        const { data: reservation, error: resError } = await supabase
          .from('reservations')
          .insert([{
            parent_id: parentId,
            program_schedule_id: scheduleId,
            status: resData.status || 'completed', // Past reservations are usually completed
            total_price: resData.total_price || 0,
            payment_status: resData.payment_status || 'paid',
            notes: resData.notes || 'インポートされたデータ',
            created_at: resData.created_at || new Date().toISOString()
          }])
          .select()
          .single();

        if (resError) throw resError;

        // Create attendance records
        if (resData.is_parent_attending) {
          await supabase.from('attendance').insert([{
            reservation_id: reservation.id,
            is_parent: true,
            status: 'attended'
          }]);
        }

        if (resData.child_names && Array.isArray(resData.child_names)) {
          // Find children by name for this parent
          const { data: children } = await supabase
            .from('children')
            .select('id, name')
            .eq('parent_id', parentId);
            
          if (children) {
            for (const childName of resData.child_names) {
              const child = children.find(c => c.name === childName);
              if (child) {
                await supabase.from('attendance').insert([{
                  reservation_id: reservation.id,
                  child_id: child.id,
                  is_parent: false,
                  status: 'attended'
                }]);
              }
            }
          }
        }

        results.success++;
      } catch (err: any) {
        results.failed++;
        results.errors.push(`Row ${resData.parent_email || resData.parent_id}: ${err.message}`);
      }
    }

    res.json(results);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/programs", isAdmin, async (req, res) => {
  const { programs } = req.body;
  if (!Array.isArray(programs)) {
    return res.status(400).json({ error: "Invalid data format" });
  }

  try {
    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const progData of programs) {
      try {
        if (!progData.title) throw new Error("Program title required");

        // Create program
        const { data: program, error: progError } = await supabase
          .from('programs')
          .insert([{
            title: progData.title,
            description: progData.description || '',
            target_age_min: progData.target_age_min || null,
            target_age_max: progData.target_age_max || null,
            eligibility: progData.eligibility || null,
            nights: progData.nights || 0,
            fire_type: progData.fire_type || 'none',
            capacity: progData.capacity || 20,
            category: progData.category || 'irregular',
            status: progData.status || 'active',
            organization_id: progData.organization_id || null
          }])
          .select()
          .single();

        if (progError) throw progError;

        // Create pricing
        if (progData.pricing && Array.isArray(progData.pricing) && progData.pricing.length > 0) {
          const pricingData = progData.pricing.map((p: any, index: number) => ({
            program_id: program.id,
            tier_label: p.tier_label,
            amount: p.amount,
            extra_fee: p.extra_fee || 0,
            sort_order: p.sort_order || index
          }));
          const { error: pricingError } = await supabase.from('program_pricing').insert(pricingData);
          if (pricingError) throw pricingError;
        }

        // Create schedule if date is provided
        if (progData.schedules && Array.isArray(progData.schedules) && progData.schedules.length > 0) {
          for (const s of progData.schedules) {
            const { data: schedule, error: schedError } = await supabase
              .from('program_schedules')
              .insert([{
                program_id: program.id,
                start_date: s.start_date,
                end_date: s.end_date || s.start_date,
                capacity: s.capacity || progData.capacity || 20,
                status: s.status || 'open'
              }])
              .select()
              .single();
            if (schedError) throw schedError;

            if (s.locations && Array.isArray(s.locations) && s.locations.length > 0) {
              const locationsData = s.locations.map((loc: any) => ({
                schedule_id: schedule.id,
                location_name: loc.location_name,
                meeting_time: loc.meeting_time || '09:00',
                dismissal_time: loc.dismissal_time || '17:00',
                type: loc.type || 'both'
              }));
              const { error: locError } = await supabase.from('schedule_locations').insert(locationsData);
              if (locError) throw locError;
            }
          }
        }

        results.success++;
      } catch (err: any) {
        results.failed++;
        results.errors.push(`Row ${progData.title}: ${err.message}`);
      }
    }

    res.json(results);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/surveys", isAdmin, async (req, res) => {
  const { surveys } = req.body;
  if (!Array.isArray(surveys)) {
    return res.status(400).json({ error: "Invalid data format" });
  }

  try {
    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const surveyData of surveys) {
      try {
        let parentId = null;
        
        // Try to link to parent if parent_email is provided
        if (surveyData.parent_email) {
          const { data: parent } = await supabase
            .from('parents')
            .select('id')
            .eq('email', surveyData.parent_email)
            .single();
            
          if (parent) {
            parentId = parent.id;
          }
        }

        const { parent_email, program_id, title, submitted_at, ...answers } = surveyData;

        const { error: surveyError } = await supabase
          .from('customer_surveys')
          .insert([{
            parent_id: parentId,
            program_id: program_id || null,
            email: parent_email || null,
            title: title || 'インポートされたアンケート',
            submitted_at: submitted_at || new Date().toISOString(),
            answers: answers
          }]);

        if (surveyError) throw surveyError;

        results.success++;
      } catch (err: any) {
        results.failed++;
        results.errors.push(`Row ${surveyData.parent_email || 'Unknown'}: ${err.message}`);
      }
    }

    res.json(results);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
