
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Get request data
    const { action, email, password, token } = await req.json();

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Handle different action types
    if (action === "reset") {
      console.log("Resetting password for user ID:", token);
      
      // Reset user password using the updateUserById method
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        token, // User ID
        { password: password }
      );

      if (error) {
        console.error("Error resetting password:", error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }

      console.log("Password updated successfully for user:", data.user.email);

      return new Response(
        JSON.stringify({ success: true, message: "Password updated successfully" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else if (action === "verify") {
      console.log("Verifying email exists:", email);
      
      // Verify user exists and return user ID
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        filter: {
          email: email
        }
      });

      if (error) {
        console.error("Error looking up user:", error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404,
          }
        );
      }
      
      if (!data || data.users.length === 0) {
        console.error("User not found for email:", email);
        return new Response(
          JSON.stringify({ success: false, error: "User not found" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404,
          }
        );
      }

      const userId = data.users[0].id;
      console.log("Found user ID:", userId);

      return new Response(
        JSON.stringify({ success: true, userId }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Invalid action
    return new Response(
      JSON.stringify({ success: false, error: "Invalid action" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  } catch (error) {
    console.error("Error in reset-password function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "An unknown error occurred" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
