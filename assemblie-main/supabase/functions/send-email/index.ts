
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  attachmentUrl?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }
  
  try {
    // Parse the request body
    const requestData = await req.json();
    
    const { to, subject, body, attachmentUrl } = requestData as EmailRequest;

    // Validate email input
    if (!to || !subject || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, or body' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    try {
      // Get API key from environment variable
      const apiKey = Deno.env.get("RESEND_API_KEY");
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: 'Server configuration error: Missing API key' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      // Initialize Resend with API key
      const resend = new Resend(apiKey);
      
      // Configure the sender email with Assemblie branding
      const fromEmail = "noreply@assemblie.in";
      const fromName = "Assemblie";

      // Prepare email options
      const emailOptions: any = {
        from: `${fromName} <${fromEmail}>`,
        to: [to],
        subject: subject.replace(/NexusBuild|Nexus Build/gi, 'Assemblie'), // Replace any instances in subject
        html: body.replace(/NexusBuild|Nexus Build/gi, 'Assemblie'), // Replace any instances in body
      };

      // Prepare attachments if provided
      if (attachmentUrl) {
        try {
          console.log(`Attempting to fetch attachment from URL: ${attachmentUrl}`);
          // Fetch the file from URL
          const response = await fetch(attachmentUrl);
          if (response.ok) {
            const fileBuffer = await response.arrayBuffer();
            const fileBytes = new Uint8Array(fileBuffer);
            
            console.log(`Successfully fetched attachment, size: ${fileBytes.length} bytes`);
            
            // Only add attachment if we actually got content
            if (fileBytes.length > 0) {
              emailOptions.attachments = [
                {
                  filename: 'invoice.pdf',
                  content: fileBytes,
                },
              ];
              console.log("Attachment added successfully to email options");
            } else {
              console.error("Attachment was empty (0 bytes)");
            }
          } else {
            console.error(`Failed to fetch attachment from URL: ${attachmentUrl}, status: ${response.status}`);
          }
        } catch (fetchError) {
          console.error('Error fetching attachment:', fetchError);
          // Continue without attachment if there's an error
        }
      }

      console.log("Sending email with options:", JSON.stringify({
        to: emailOptions.to,
        from: emailOptions.from,
        subject: emailOptions.subject,
        hasAttachments: !!emailOptions.attachments
      }));

      // Send email with better error handling
      const { data, error } = await resend.emails.send(emailOptions);

      if (error) {
        console.error('Resend API error:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to send email', 
            details: error,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.log('Email sent successfully:', data);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email sent successfully',
          data
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('Error sending email with Resend:', error);
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email', 
          details: error.message || 'Unknown Resend error',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error("Error in send-email function:", error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to process request',
        details: error.message || 'Unknown error',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
