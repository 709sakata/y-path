import express from "express";
import { supabase } from "../supabase";
import { isAdmin } from "../middleware/auth";

const router = express.Router();

// Import surveys from CSV
router.post("/import", isAdmin, async (req, res) => {
  const { title, surveys, matchColumn, matchType, organization_id, program_id } = req.body;
  
  if (!title || !surveys || !Array.isArray(surveys) || !matchColumn || !matchType) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  try {
    // 1. Fetch all parents to match against
    const { data: parents, error: parentsError } = await supabase
      .from('parents')
      .select('id, email, phone');

    if (parentsError) throw parentsError;

    const parentMap = new Map();
    parents.forEach(p => {
      if (matchType === 'email' && p.email) {
        parentMap.set(p.email.toLowerCase(), p.id);
      } else if (matchType === 'phone' && p.phone) {
        // Normalize phone number (remove non-digits)
        const normalizedPhone = p.phone.replace(/\D/g, '');
        parentMap.set(normalizedPhone, p.id);
      }
    });

    let matchedCount = 0;
    let unlinkedCount = 0;

    const surveyRecords = surveys.map(survey => {
      let parentId = null;
      let email = null;
      const matchValue = survey[matchColumn];

      if (matchValue) {
        let key = matchValue;
        if (matchType === 'email') {
          key = key.toLowerCase();
          email = key; // Save email for future auto-linking
        } else if (matchType === 'phone') {
          key = key.replace(/\D/g, '');
        }
        
        if (parentMap.has(key)) {
          parentId = parentMap.get(key);
          matchedCount++;
        } else {
          unlinkedCount++;
        }
      } else {
        unlinkedCount++;
      }

      // Try to find an email column even if matchType is not email
      if (!email) {
        const emailCol = Object.keys(survey).find(c => c.toLowerCase().includes('email') || c.includes('メール'));
        if (emailCol && survey[emailCol]) {
          email = String(survey[emailCol]).toLowerCase();
        }
      }

      // Extract submitted_at if available (commonly "タイムスタンプ" or "Timestamp" in Google Forms)
      let submittedAt = new Date().toISOString();
      const timestampKey = Object.keys(survey).find(k => k.toLowerCase().includes('timestamp') || k.includes('タイムスタンプ'));
      if (timestampKey && survey[timestampKey]) {
        const parsedDate = new Date(survey[timestampKey]);
        if (!isNaN(parsedDate.getTime())) {
          submittedAt = parsedDate.toISOString();
        }
      }

      return {
        parent_id: parentId,
        organization_id: organization_id || null,
        program_id: program_id || null,
        email: email,
        title,
        submitted_at: submittedAt,
        answers: survey
      };
    });

    // Insert into database
    const { error: insertError } = await supabase
      .from('customer_surveys')
      .insert(surveyRecords);

    if (insertError) throw insertError;

    res.json({
      success: true,
      matchedCount,
      unlinkedCount,
      totalCount: surveyRecords.length
    });

  } catch (e: any) {
    console.error("Survey import error:", e);
    res.status(500).json({ error: e.message });
  }
});

// Get surveys for a specific parent
router.get("/parent/:parentId", isAdmin, async (req, res) => {
  const { parentId } = req.params;
  try {
    const { data, error } = await supabase
      .from('customer_surveys')
      .select('*')
      .eq('parent_id', parentId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Get all surveys
router.get("/", isAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customer_surveys')
      .select(`
        *,
        parents (
          name,
          email
        ),
        organizations (
          name
        ),
        programs (
          title
        )
      `)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Link a survey to a parent, organization, or program
router.put("/:id/link", isAdmin, async (req, res) => {
  const { id } = req.params;
  const { parent_id, organization_id, program_id } = req.body;

  try {
    const updateData: any = {};
    if (parent_id !== undefined) updateData.parent_id = parent_id;
    if (organization_id !== undefined) updateData.organization_id = organization_id;
    if (program_id !== undefined) updateData.program_id = program_id;

    const { data, error } = await supabase
      .from('customer_surveys')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
