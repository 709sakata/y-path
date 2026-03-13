import express from "express";
import { supabase } from "../supabase";
import { isAdmin } from "../middleware/auth";

const router = express.Router();

// Get all users
router.get("/", isAdmin, async (req, res) => {
  try {
    let usersData = { users: [] };
    let usersError = null;

    try {
      const result = await supabase.auth.admin.listUsers();
      if (result.error) {
        console.warn("Could not list auth users (might be missing service_role key):", result.error.message);
      } else {
        usersData = result.data || { users: [] };
      }
    } catch (err) {
      console.warn("Exception when listing auth users:", err);
    }

    // Get parents to match with users
    const { data: parents, error: parentsError } = await supabase
      .from('parents')
      .select(`
        id, 
        name, 
        email, 
        created_at,
        parent_organizations (
          organization_id
        )
      `);
      
    if (parentsError) throw parentsError;

    const authUserMap = new Map(usersData.users?.map((u: any) => [u.id, u]) || []);

    const users = parents.map((p: any) => {
      const authUser = authUserMap.get(p.id) as any;
      const orgId = p.parent_organizations && p.parent_organizations.length > 0 
        ? p.parent_organizations[0].organization_id 
        : null;
        
      return {
        id: p.id,
        email: p.email || authUser?.email || '',
        role: authUser?.app_metadata?.role || authUser?.user_metadata?.role || 'customer',
        name: p.name || '',
        organization_id: orgId,
        created_at: p.created_at || authUser?.created_at,
        last_sign_in_at: authUser?.last_sign_in_at || null
      };
    });

    res.json(users);
  } catch (e: any) {
    console.error("Fetch users error:", e);
    res.status(500).json({ error: e.message });
  }
});

// Update user role
router.put("/:id/role", isAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  
  if (!['admin', 'customer'].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    const { data, error } = await supabase.auth.admin.updateUserById(id, {
      app_metadata: { role },
      user_metadata: { role }
    });

    if (error) throw error;
    res.json({ success: true });
  } catch (e: any) {
    console.error("Update user role error:", e);
    res.status(500).json({ error: e.message });
  }
});

// Delete user
router.delete("/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    // Note: Deleting a user from auth.users might fail if there are foreign key constraints
    // in the parents table or other tables. We might need to handle those first or let cascade handle it.
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) throw error;
    
    // Also delete from parents table if cascade is not set up
    await supabase.from('parents').delete().eq('id', id);
    
    res.json({ success: true });
  } catch (e: any) {
    console.error("Delete user error:", e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
