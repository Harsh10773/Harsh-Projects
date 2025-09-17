
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

// Create Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface RequestParams {
  vendor_id: string;
  stat_field: "orders_won" | "orders_lost";
}

serve(async (req: Request) => {
  try {
    // CORS headers
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Content-Type": "application/json",
    };

    // Handle OPTIONS request for CORS
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers });
    }

    // Check if request is POST
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers }
      );
    }

    // Parse request body
    const { vendor_id, stat_field } = await req.json() as RequestParams;

    if (!vendor_id || !stat_field) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers }
      );
    }

    // Validate stat_field
    if (stat_field !== "orders_won" && stat_field !== "orders_lost") {
      return new Response(
        JSON.stringify({ error: "Invalid stat_field parameter" }),
        { status: 400, headers }
      );
    }

    console.log(`Incrementing ${stat_field} for vendor ID: ${vendor_id}`);

    // Use the RPC function to update vendor stats
    const { data, error } = await supabase.rpc('increment_vendor_stat', {
      vendor_id_param: vendor_id,
      field_name: stat_field,
      increment_by: 1
    });

    if (error) {
      console.error("Error incrementing vendor stat:", error);
      return new Response(
        JSON.stringify({ error: `Failed to update vendor stats: ${error.message}` }),
        { status: 500, headers }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: `Successfully incremented ${stat_field}` }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(
      JSON.stringify({ error: `Unhandled error: ${error.message}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
