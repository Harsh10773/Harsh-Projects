
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { sendEmail } from "@/utils/emailService";
import { InputOTPField } from "@/components/ui/input-otp-field";

interface ContactDetailsStepProps {
  formData: {
    name: string;
    email: string;
    phone: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  termsAccepted: boolean;
  setTermsAccepted: (value: boolean) => void;
  setShowTermsDialog: (value: boolean) => void;
}

const ContactDetailsStep: React.FC<ContactDetailsStepProps> = ({
  formData,
  handleChange,
  termsAccepted,
  setTermsAccepted,
  setShowTermsDialog
}) => {
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [loading, setLoading] = useState(false);
  
  const generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated OTP:", otp);
    return otp;
  };
  
  const sendOtpEmail = async (email: string, otp: string) => {
    console.log(`Sending OTP ${otp} to ${email}`);
    
    await sendEmail(
      email,
      "Verify your email address",
      `Your verification code for NexusBuild is: ${otp}\n\nThis code will expire in 10 minutes.`
    );
    
    toast.info(`Verification code sent to ${email}. Please check your inbox.`);
    return true;
  };
  
  const handleVerifyEmail = async () => {
    if (!formData.email) {
      toast.error("Please enter an email address");
      return;
    }
    
    setLoading(true);
    
    try {
      const newOtp = generateOtp();
      setGeneratedOtp(newOtp);
      setVerificationEmail(formData.email);
      
      await sendOtpEmail(formData.email, newOtp);
      
      setIsVerifyingEmail(true);
    } catch (error: any) {
      console.error("Email verification error:", error);
      toast.error(error.message || "Failed to start email verification");
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyOtp = async () => {
    setLoading(true);
    
    try {
      if (otp === generatedOtp) {
        toast.success("Email verified successfully!");
        setEmailVerified(true);
        setIsVerifyingEmail(false);
        setOtp("");
      } else {
        toast.error("Invalid verification code. Please try again.");
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast.error(error.message || "Failed to verify code");
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendOtp = async () => {
    setLoading(true);
    
    try {
      const newOtp = generateOtp();
      setGeneratedOtp(newOtp);
      
      await sendOtpEmail(verificationEmail, newOtp);
      
      toast.success("Verification code resent");
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      toast.error(error.message || "Failed to resend verification code");
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelOtpVerification = () => {
    setIsVerifyingEmail(false);
    setOtp("");
  };
  
  if (isVerifyingEmail) {
    return (
      <div className="space-y-6">
        <Card className="border border-accent/50 shadow-lg bg-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold text-center text-primary">Email Verification</CardTitle>
            <CardDescription className="text-center">
              Enter the verification code sent to {verificationEmail}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <InputOTPField
                  value={otp}
                  onChange={setOtp}
                  maxLength={6}
                  disabled={loading}
                />
              </div>
              <Button 
                className="w-full bg-accent hover:bg-accent/90" 
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
              >
                {loading ? "Verifying..." : "Verify Code"}
              </Button>
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={handleCancelOtpVerification}>
                  Cancel
                </Button>
                <Button variant="ghost" onClick={handleResendOtp} disabled={loading}>
                  Resend Code
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Contact Information</h2>
      <p className="text-foreground/70 mb-6">
        We need your contact details to send you vendor quotes and build updates
      </p>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="flex gap-2">
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={emailVerified ? "border-green-500" : ""}
              required
            />
            <Button 
              type="button" 
              onClick={handleVerifyEmail}
              disabled={!formData.email || emailVerified || loading}
              variant={emailVerified ? "outline" : "default"}
              className={emailVerified ? "border-green-500 text-green-500" : ""}
            >
              {emailVerified ? "Verified ✓" : "Verify"}
            </Button>
          </div>
          {emailVerified && (
            <p className="text-xs text-green-500 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" /> Email verified successfully
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      
      <div className="p-4 border border-accent/30 bg-accent/5 rounded-md mt-6">
        <div className="flex items-start space-x-2">
          <Checkbox 
            id="terms" 
            className="mt-1"
            checked={termsAccepted}
            onCheckedChange={(checked) => {
              setTermsAccepted(checked as boolean);
            }}
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the <button 
                type="button" 
                className="text-accent underline hover:text-accent/80"
                onClick={() => setShowTermsDialog(true)}
              >
                Terms and Conditions
              </button>
            </label>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" /> You must accept the terms to proceed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetailsStep;
