import express from "express";
import { supabase } from "../supabase";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password, role, parentName, phone, childName, childBirthday } = req.body;
  
  if (!password || password.length < 6) {
    return res.status(400).json({ error: "パスワードは6文字以上で入力してください" });
  }

  try {
    // 1. Create user. We try to use the Admin API if possible to bypass email confirmation
    // which is often a hurdle in demo/dev environments.
    let authData, authError;
    
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: role || 'customer' }
      });
      authData = data;
      authError = error;
    } catch (adminError) {
      // Fallback to regular signUp if admin API is not available (e.g. missing service key)
      console.log("Admin createUser failed, falling back to signUp:", adminError);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role: role || 'customer' }
        }
      });
      authData = data;
      authError = error;
    }

    if (authError) {
      console.error("Supabase Auth Error:", authError);
      if (authError.message.includes("Email not confirmed")) {
        throw new Error("メールアドレスの確認が必要です。送信されたメールを確認するか、管理者に連絡してください。");
      }
      throw authError;
    }
    if (!authData.user) throw new Error("User creation failed");

    const userId = authData.user.id;

    // 2. Create a profile in the parents table
    const { error: parentError } = await supabase
      .from('parents')
      .insert([
        { 
          id: userId, 
          name: parentName, 
          email: email, 
          phone: phone,
          membership_type: 'general',
          membership_status: 'active',
          joined_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ]);
    
    if (parentError) {
      console.error("Parent creation error:", parentError);
      throw parentError;
    }

    // 3. If children are provided, create them
    if (req.body.children && Array.isArray(req.body.children) && req.body.children.length > 0) {
      const childrenData = req.body.children.map((child: any) => ({
        parent_id: userId,
        name: child.name,
        birthday: child.birthday,
        notes: child.notes || "",
        is_active: true
      }));
      
      const { error: childrenError } = await supabase
        .from('children')
        .insert(childrenData);
        
      if (childrenError) {
        console.error("Children creation error:", JSON.stringify(childrenError, null, 2));
        throw new Error("お子様の登録に失敗しました: " + childrenError.message);
      }
    } else if (childName) {
      // Fallback for single child registration (legacy support)
      const { error: childError } = await supabase
        .from('children')
        .insert([{ parent_id: userId, name: childName, birthday: childBirthday, is_active: true }]);
      if (childError) console.error("Single child creation error:", childError);
    }

    // 4. Set session
    req.session.userId = userId;
    req.session.role = role || 'admin';
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ error: "セッションの保存に失敗しました" });
      }
      res.json({ success: true });
    });
  } catch (e: any) {
    console.error("Registration error:", e);
    res.status(400).json({ error: e.message || "登録に失敗しました。入力内容を確認してください。" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("メールアドレスまたはパスワードが正しくありません。");
      }
      if (error.message.includes("Email not confirmed")) {
        // Attempt to auto-confirm if we have admin privileges
        try {
          const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
          if (!listError && userList.users) {
            const unconfirmedUser = userList.users.find(u => u.email === email);
            if (unconfirmedUser) {
              await supabase.auth.admin.updateUserById(unconfirmedUser.id, { email_confirm: true });
              // Retry login once after auto-confirming
              const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                email,
                password
              });
              if (!retryError && retryData.user) {
                // Success on retry
                const user = retryData.user;
                const role = user.user_metadata?.role || 'admin';
                req.session.userId = user.id;
                req.session.role = role;
                let parent = null;
                if (role === 'customer') {
                  const { data: parentData } = await supabase
                    .from('parents')
                    .select('*, children(*)')
                    .eq('id', user.id)
                    .single();
                  parent = parentData;
                }
                return req.session.save((err) => {
                  if (err) return res.status(500).json({ error: "セッションの保存に失敗しました" });
                  res.json({ success: true, user: { id: user.id, email: user.email, role: role }, parent });
                });
              }
            }
          }
        } catch (adminErr) {
          console.error("Auto-confirm attempt failed:", adminErr);
        }
        throw new Error("メールアドレスの確認が完了していません。送信されたメールを確認するか、管理者に連絡してください。");
      }
      throw error;
    }
    if (!data.user) throw new Error("Login failed");

    const user = data.user;
    const role = user.user_metadata?.role || 'admin';
    
    req.session.userId = user.id;
    req.session.role = role; // Store role in session
    
    let parent = null;
    const { data: parentData } = await supabase
      .from('parents')
      .select('*, children(*)')
      .eq('id', user.id)
      .single();
    parent = parentData;
    
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ error: "ログイン状態の保存に失敗しました" });
      }
      console.log("Session saved successfully for user:", user.id, "SessionID:", req.sessionID);
      res.json({ 
        success: true, 
        user: { id: user.id, email: user.email, role: role }, 
        parent 
      });
    });
  } catch (e: any) {
    console.error("Login error:", e);
    res.status(401).json({ error: e.message || "Invalid credentials" });
  }
});

router.get("/me", async (req, res) => {
  if (req.session.userId) {
    try {
      const role = req.session.role || 'admin';
      const userId = req.session.userId;
      
      const { data: parentData } = await supabase
        .from('parents')
        .select('*, children(*)')
        .eq('id', userId)
        .single();
      
      res.json({ 
        user: { id: userId, role: role, organization_id: parentData?.organization_id }, 
        parent: parentData 
      });
    } catch (e) {
      console.error("Auth me error:", e);
      res.json({ user: null, parent: null });
    }
  } else {
    res.json({ user: null, parent: null });
  }
});

router.post("/logout", async (req, res) => {
  await supabase.auth.signOut();
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

export default router;
