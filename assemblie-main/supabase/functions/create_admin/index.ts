
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// This endpoint creates or updates the admin account
// It's meant to be run once during setup or if admin password needs to be reset

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fixed admin credentials - matching the ones in Auth.tsx
const ADMIN_EMAIL = "admin@nexusbuild.com";
const ADMIN_PASSWORD = "admin123"; 

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    console.log("Starting admin account creation/update process");
    
    // Get supabase client using ENV vars from Supabase edge function environment
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if admin already exists in auth.users
    console.log("Checking if admin exists in auth.users");
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      console.error("Error checking auth users:", authError);
      return new Response(JSON.stringify({ error: "Error checking auth users" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Find if admin email exists in auth users
    const adminUser = authUser.users.find(u => u.email === ADMIN_EMAIL);

    if (!adminUser) {
      console.log("Admin user not found in auth.users, creating new admin");
      // Create admin user in auth.users
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { role: 'admin' }
      });

      if (error) {
        console.error("Error creating admin user:", error);
        return new Response(JSON.stringify({ error: "Failed to create admin account" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      console.log("Admin user created in auth.users:", data.user.id);
      
      // Check if admin exists in vendor_auth table
      const { data: existingAuth, error: lookupError } = await supabaseAdmin
        .from('vendor_auth')
        .select('id, email')
        .eq('email', ADMIN_EMAIL)
        .maybeSingle();

      if (lookupError) {
        console.error("Error checking for existing admin in vendor_auth:", lookupError);
      }

      // Insert admin into vendor_auth if not exists
      if (!existingAuth) {
        console.log("Admin not found in vendor_auth, adding record");
        const { error: insertError } = await supabaseAdmin
          .from('vendor_auth')
          .insert([{ id: data.user.id, email: ADMIN_EMAIL }]);

        if (insertError) {
          console.error("Error adding admin to vendor_auth:", insertError);
          return new Response(JSON.stringify({ error: "Failed to add admin to vendor_auth" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          });
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: "Admin account created successfully" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201,
        }
      );
    }

    // Admin already exists, update password
    console.log("Admin exists, updating password");
    const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(
      adminUser.id,
      { password: ADMIN_PASSWORD }
    );

    if (resetError) {
      console.error("Error resetting admin password:", resetError);
      return new Response(JSON.stringify({ error: "Failed to update admin password" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Make sure admin is in vendor_auth table
    const { data: existingAuth, error: lookupError } = await supabaseAdmin
      .from('vendor_auth')
      .select('id, email')
      .eq('email', ADMIN_EMAIL)
      .maybeSingle();

    if (lookupError) {
      console.error("Error checking for existing admin in vendor_auth:", lookupError);
    }

    if (!existingAuth) {
      console.log("Admin not found in vendor_auth, adding record");
      const { error: insertError } = await supabaseAdmin
        .from('vendor_auth')
        .insert([{ id: adminUser.id, email: ADMIN_EMAIL }]);

      if (insertError) {
        console.error("Error adding admin to vendor_auth:", insertError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Admin account updated successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
