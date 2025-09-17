
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTPField } from "@/components/ui/input-otp-field";
import { Mail, ArrowLeft, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { 
  generateOtp, 
  sendResetPasswordOtp, 
  updatePassword,
  checkEmailExists,
  getUserIdFromEmail
} from "@/utils/passwordReset";

interface ForgotPasswordProps {
  onBack: () => void;
  userType?: 'vendor' | 'customer';
}

const ForgotPassword = ({ onBack, userType }: ForgotPasswordProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'new-password'>('email');
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if email exists first
      const emailExists = await checkEmailExists(email, userType);
      
      if (!emailExists) {
        toast.error("No account found with this email address");
        setIsLoading(false);
        return;
      }
      
      // Get user ID
      const id = await getUserIdFromEmail(email);
      if (!id) {
        toast.error("Failed to retrieve account information");
        setIsLoading(false);
        return;
      }
      
      setUserId(id);
      
      const newOtp = generateOtp();
      setGeneratedOtp(newOtp);
      
      const sent = await sendResetPasswordOtp(email, newOtp);
      
      if (sent) {
        setStep('otp');
        toast.success("Verification code sent successfully!");
      }
    } catch (error) {
      console.error("Error requesting OTP:", error);
      toast.error("Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyOtp = () => {
    if (!otp) {
      toast.error("Please enter the verification code");
      return;
    }
    
    if (otp === generatedOtp) {
      setStep('new-password');
      toast.success("Verification successful! Set your new password.");
    } else {
      toast.error("Invalid verification code");
    }
  };
  
  const handleResendOtp = async () => {
    setIsLoading(true);
    
    try {
      const newOtp = generateOtp();
      setGeneratedOtp(newOtp);
      
      await sendResetPasswordOtp(email, newOtp);
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error("Failed to resend verification code");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (!userId) {
        toast.error("User ID not found. Please try again from the beginning.");
        setStep('email');
        setIsLoading(false);
        return;
      }
      
      const success = await updatePassword(userId, newPassword);
      
      if (success) {
        toast.success("Password has been reset successfully! You can now log in with your new password.");
        onBack(); // Go back to login
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <Card className="border border-accent/50 shadow-lg bg-card">
      <CardHeader className="space-y-1">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            className="h-8 w-8 mr-2"
          >
            <ArrowLeft size={16} />
          </Button>
          <CardTitle className="text-2xl font-bold text-primary">
            Reset Password
          </CardTitle>
        </div>
        <CardDescription>
          {step === 'email' && "Enter your email to receive a verification code"}
          {step === 'otp' && "Enter the verification code sent to your email"}
          {step === 'new-password' && "Create a new password for your account"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {step === 'email' && (
          <form onSubmit={handleRequestOtp}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-accent hover:bg-accent/90"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Verification Code"}
              </Button>
            </div>
          </form>
        )}
        
        {step === 'otp' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <InputOTPField
                value={otp}
                onChange={setOtp}
                maxLength={6}
                disabled={isLoading}
              />
            </div>
            <Button 
              className="w-full bg-accent hover:bg-accent/90"
              onClick={handleVerifyOtp}
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>
            <div className="flex justify-center mt-4">
              <Button 
                variant="ghost" 
                onClick={handleResendOtp} 
                disabled={isLoading}
                className="text-sm"
              >
                Resend Code
              </Button>
            </div>
          </div>
        )}
        
        {step === 'new-password' && (
          <form onSubmit={handleResetPassword}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> New Password
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-accent hover:bg-accent/90"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Reset Password"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center">
        <p className="text-sm text-foreground/70 text-center">
          {step === 'email' && "We'll send a verification code to your email"}
          {step === 'otp' && "Check your email inbox for the verification code"}
          {step === 'new-password' && "Make sure to use a strong, unique password"}
        </p>
      </CardFooter>
    </Card>
  );
};

export default ForgotPassword;
