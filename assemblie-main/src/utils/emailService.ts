
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// This service handles sending emails through the supabase edge function
export const sendEmail = async (to: string, subject: string, body: string, attachmentUrl?: string): Promise<boolean> => {
  // Log the email for debugging purposes
  console.log(`Attempting to send email to ${to} with subject: ${subject}`);
  if (attachmentUrl) {
    console.log(`With attachment URL: ${attachmentUrl}`);
  }
  
  try {
    // Call the edge function to send the email
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { 
        to, 
        subject, 
        body,
        attachmentUrl 
      }
    });
    
    if (error) {
      console.error("Error invoking edge function:", error);
      toast.error(`Failed to send email: ${error.message || "Unknown error"}`);
      return false;
    }
    
    if (data?.error) {
      console.error("Error from edge function response:", data.error);
      toast.error(`Failed to send email: ${data.error}`);
      return false;
    }
    
    // Show success message
    if (body.includes("verification code") || body.includes("OTP")) {
      toast.success(`Verification code sent to ${to}`);
    } else {
      toast.success(`Email sent to ${to} successfully`);
    }
    
    return true;
  } catch (error: any) {
    console.error("Exception sending email:", error);
    toast.error(`Failed to send email: ${error.message || "Unknown error"}`);
    return false;
  }
};

// Function to send order confirmation with invoice
export const sendOrderConfirmation = async (
  to: string, 
  customerName: string, 
  orderId: string, 
  orderDetails: any,
  invoiceUrl?: string
): Promise<boolean> => {
  const subject = `Your Order Confirmation #${orderId} - Assemblie`;
  
  // Create a nice HTML email body
  const body = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #8B5CF6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background-color: #f9fafb; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; background-color: #f3f4f6; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
          .button { background-color: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin: 20px 0; }
          .info-box { background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 15px; margin-top: 20px; }
          .highlight { color: #8B5CF6; font-weight: bold; }
          .divider { height: 1px; background-color: #e5e7eb; margin: 20px 0; }
          .logo { font-size: 28px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          table th { background-color: #f3f4f6; padding: 10px; text-align: left; }
          table td { padding: 10px; border-top: 1px solid #e5e7eb; }
          .social-links { margin-top: 15px; }
          .social-links a { margin: 0 10px; text-decoration: none; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Assemblie</div>
            <p>Custom PC Solutions</p>
          </div>
          <div class="content">
            <h2>Thank You for Your Order!</h2>
            <p>Dear ${customerName},</p>
            <p>We're thrilled to confirm that your order has been received and is being processed by our team of experts.</p>
            
            <div class="info-box">
              <h3>Order Details:</h3>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-IN', {year: 'numeric', month: 'long', day: 'numeric'})}</p>
              <p><strong>Build Type:</strong> ${orderDetails.buildType || 'Custom PC'}</p>
              <p><strong>Total Amount:</strong> ₹${orderDetails.total?.toLocaleString('en-IN') || 'N/A'}</p>
            </div>
            
            <div class="divider"></div>
            
            <p>Your invoice has been attached to this email for your records. You can also track your order status by logging into your account on our website.</p>
            
            <center><a href="https://assemblie.in/tracking?id=${orderId}" class="button">Track Your Order</a></center>
            
            <p>If you have any questions about your order, please don't hesitate to contact our customer support team at <a href="mailto:support@assemblie.in">support@assemblie.in</a>.</p>
            
            <p>Thank you for choosing Assemblie for your custom PC needs!</p>
            
            <p>Best regards,<br>The Assemblie Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Assemblie. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
            <div class="social-links">
              <a href="https://facebook.com/assemblie">Facebook</a> | 
              <a href="https://twitter.com/assemblie">Twitter</a> | 
              <a href="https://instagram.com/assemblie">Instagram</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
  
  return await sendEmail(to, subject, body, invoiceUrl);
};
