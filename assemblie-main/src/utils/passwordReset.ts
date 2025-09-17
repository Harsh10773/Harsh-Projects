
import { supabase } from "@/integrations/supabase/client";
import { sendEmail } from "@/utils/emailService";
import { toast } from "sonner";

// Generate a 6-digit OTP
export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send reset password OTP email
export const sendResetPasswordOtp = async (email: string, otp: string): Promise<boolean> => {
  try {
    console.log(`Sending password reset OTP ${otp} to ${email}`);
    
    await sendEmail(
      email,
      "Password Reset Verification",
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 30px; border-radius: 8px; border-top: 4px solid #4f46e5;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin-bottom: 5px; font-size: 24px;">Password Reset</h1>
          <div style="height: 3px; width: 80px; background-color: #4f46e5; margin: 0 auto;"></div>
        </div>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">You have requested to reset your password for your <strong>NexusBuild</strong> account.</p>
        <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center; border: 1px solid #eaeaea;">
          <p style="color: #666; margin-bottom: 15px;">Your verification code is:</p>
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4f46e5; margin: 10px 0;">${otp}</p>
          <p style="color: #888; font-size: 13px; margin-top: 15px;">This code will expire in 10 minutes</p>
        </div>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">If you did not request this password reset, please ignore this email or contact support if you have concerns.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center; color: #888; font-size: 14px;">
          <p>Thank you,<br><strong>NexusBuild Team</strong></p>
        </div>
      </div>`
    );
    
    toast.info(`Verification code sent to ${email}. Please check your inbox.`);
    return true;
  } catch (error) {
    console.error("Error sending password reset OTP:", error);
    toast.error("Failed to send verification code. Please try again.");
    return false;
  }
};

// Get user ID from email using edge function
export const getUserIdFromEmail = async (email: string): Promise<string | null> => {
  try {
    // Call the reset-password edge function with verify action
    const { data, error } = await supabase.functions.invoke("reset-password", {
      body: { action: "verify", email }
    });
    
    if (error || !data.success) {
      console.error("Error getting user ID:", error || data.error);
      return null;
    }
    
    return data.userId;
  } catch (error) {
    console.error("Error in getUserIdFromEmail:", error);
    return null;
  }
};

// Update password in Supabase using edge function
export const updatePassword = async (userId: string, newPassword: string): Promise<boolean> => {
  try {
    if (!userId) {
      console.error("Missing user ID for password reset");
      return false;
    }
    
    console.log("Updating password for user ID:", userId);
    
    const { data, error } = await supabase.functions.invoke("reset-password", {
      body: { 
        action: "reset", 
        token: userId, 
        password: newPassword 
      }
    });
    
    if (error) {
      console.error("Error invoking reset-password function:", error);
      toast.error("Failed to update password: " + error.message);
      return false;
    }
    
    if (!data || !data.success) {
      console.error("Error resetting password:", data?.error || "Unknown error");
      toast.error("Failed to update password: " + (data?.error || "Unknown error"));
      return false;
    }
    
    console.log("Password updated successfully");
    toast.success("Password updated successfully!");
    return true;
  } catch (error: any) {
    console.error("Error in updatePassword:", error);
    toast.error("An unexpected error occurred: " + error.message);
    return false;
  }
};

// Check if email exists in Supabase auth
export const checkEmailExists = async (email: string, userType?: 'vendor' | 'customer'): Promise<boolean> => {
  try {
    // Call the reset-password edge function with verify action
    const { data, error } = await supabase.functions.invoke("reset-password", {
      body: { action: "verify", email }
    });
    
    // If no error and data.success is true, the email exists
    return !error && data.success;
  } catch (error) {
    console.error("Error checking email existence:", error);
    return false;
  }
};
