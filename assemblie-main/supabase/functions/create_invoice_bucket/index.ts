
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    })
  }

  try {
    // Parse request body - for future use if needed
    let requestBody = {};
    try {
      const bodyText = await req.text();
      if (bodyText) {
        requestBody = JSON.parse(bodyText);
      }
    } catch (err) {
      console.log("No body or invalid JSON in request");
    }
    
    // Create a Supabase client with the Auth context of the function
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Check if invoices bucket exists
    const { data: buckets, error: bucketsError } = await supabaseAdmin
      .storage
      .listBuckets();
    
    if (bucketsError) {
      throw bucketsError;
    }
    
    const invoicesBucketExists = buckets?.some(bucket => bucket.name === 'invoices');
    
    if (invoicesBucketExists) {
      console.log("Invoices bucket already exists");
    } else {
      console.log("Creating invoices bucket...");
      
      // Create the invoices bucket
      const { data, error } = await supabaseAdmin
        .storage
        .createBucket('invoices', {
          public: true,
          fileSizeLimit: 5242880 // 5MB
        });
      
      if (error) {
        throw error;
      }
      
      console.log("Invoices bucket created successfully");
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: invoicesBucketExists ? "Invoices bucket already exists" : "Invoices bucket created successfully"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
