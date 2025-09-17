
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
    // Parse request body
    const { file_path, file_content } = await req.json();
    
    if (!file_path || !file_content) {
      throw new Error("Missing required parameters: file_path, file_content");
    }
    
    // Create a Supabase client with the Auth context of the function
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // First check if invoices bucket exists, create if not
    const { data: buckets, error: bucketsError } = await supabaseAdmin
      .storage
      .listBuckets();
    
    if (bucketsError) {
      throw bucketsError;
    }
    
    const invoicesBucketExists = buckets?.some(bucket => bucket.name === 'invoices');
    
    if (!invoicesBucketExists) {
      console.log("Invoices bucket does not exist, creating...");
      
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
    
    // Convert base64 content to Uint8Array for upload
    const base64Data = file_content;
    const binaryData = Uint8Array.from(atob(base64Data), char => char.charCodeAt(0));
    
    // Upload the file
    const { data, error } = await supabaseAdmin
      .storage
      .from('invoices')
      .upload(file_path, binaryData, {
        contentType: 'application/pdf',
        upsert: true
      });
    
    if (error) {
      throw error;
    }
    
    // Get the public URL
    const { data: publicUrlData } = await supabaseAdmin
      .storage
      .from('invoices')
      .getPublicUrl(file_path);
    
    console.log(`Invoice file stored successfully at: ${publicUrlData?.publicUrl}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        file_url: publicUrlData?.publicUrl,
        message: "Invoice file uploaded successfully"
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
