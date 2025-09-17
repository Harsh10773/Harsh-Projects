import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Mail, Store, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { sendEmail } from "@/utils/emailService";
import { InputOTPField } from "@/components/ui/input-otp-field";
import ForgotPassword from "@/components/auth/ForgotPassword";

interface VendorAuthProps {
  onSignIn: (email: string, password: string, storeName: string) => void;
  termsAccepted: boolean;
  onTermsChange: (checked: boolean) => void;
  onShowTerms: () => void;
}

const VendorAuth = ({ onSignIn, termsAccepted, onTermsChange, onShowTerms }: VendorAuthProps) => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all fields");
      setLoading(false);
      return;
    }
    
    try {
      await onSignIn(loginEmail, loginPassword, storeName);
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to sign in");
    } finally {
      setLoading(false);
    }
  };
  
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
  
  const handleInitiateRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    
    if (!registerEmail || !registerPassword || !confirmPassword || !storeName) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }
    
    if (registerPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }
    
    if (!termsAccepted) {
      toast.error("Please accept the Terms and Conditions");
      onShowTerms();
      setLoading(false);
      return;
    }
    
    try {
      const { data: existingVendor, error: checkError } = await supabase
        .from('vendor_auth')
        .select('email')
        .eq('email', registerEmail)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking existing vendor:", checkError);
        throw checkError;
      }
      
      if (existingVendor) {
        toast.error("Email already registered");
        setLoading(false);
        return;
      }
      
      const newOtp = generateOtp();
      setGeneratedOtp(newOtp);
      setVerificationEmail(registerEmail);
      
      setRegistrationData({
        email: registerEmail,
        password: registerPassword,
        vendorName: vendorName || 'Vendor',
        storeName,
        storeAddress: storeAddress || ''
      });
      
      await sendOtpEmail(registerEmail, newOtp);
      
      setShowOtpVerification(true);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to initiate registration");
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyOtp = async () => {
    setLoading(true);
    
    try {
      if (otp === generatedOtp) {
        console.log("OTP verified, registering user:", registrationData);
        
        const { data, error } = await supabase.auth.signUp({
          email: registrationData.email,
          password: registrationData.password,
          options: {
            data: {
              user_type: 'vendor',
              vendor_name: registrationData.vendorName,
              store_name: registrationData.storeName,
              store_address: registrationData.storeAddress
            }
          }
        });
        
        if (error) {
          console.error("Registration error:", error);
          toast.error(error.message);
          setLoading(false);
          return;
        }
        
        console.log("Registration successful:", data);
        toast.success("Registration successful! Please check your email for verification.", {
          duration: 5000
        });
        
        setShowOtpVerification(false);
        setOtp("");
        setGeneratedOtp("");
        setRegistrationData(null);
        
        setRegisterEmail("");
        setRegisterPassword("");
        setConfirmPassword("");
        setStoreName("");
        setStoreAddress("");
        setVendorName("");
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast.error(error.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendOtp = async () => {
    if (!verificationEmail) return;
    
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
  
  const toggleLoginPasswordVisibility = () => {
    setShowLoginPassword(!showLoginPassword);
  };
  
  const toggleRegisterPasswordVisibility = () => {
    setShowRegisterPassword(!showRegisterPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  const handleCancelOtpVerification = () => {
    setShowOtpVerification(false);
    setOtp("");
    setGeneratedOtp("");
    setRegistrationData(null);
  };
  
  if (showForgotPassword) {
    return (
      <ForgotPassword 
        onBack={() => setShowForgotPassword(false)}
        userType="vendor"
      />
    );
  }
  
  if (showOtpVerification) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="border border-accent/50 shadow-lg bg-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-primary">Email Verification</CardTitle>
            <CardDescription className="text-center">
              Enter the verification code sent to {verificationEmail}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
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
    <div className="max-w-md mx-auto">
      <Card className="border border-accent/50 shadow-lg bg-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-primary">Vendor Portal</CardTitle>
          <CardDescription className="text-center">
            Login or register as a component supplier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="vendor@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" /> Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showLoginPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={toggleLoginPasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showLoginPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      variant="link" 
                      className="text-sm text-accent p-0 h-auto"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleInitiateRegistration}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vendor-name" className="flex items-center gap-2">
                      <Store className="h-4 w-4" /> Vendor Name
                    </Label>
                    <Input
                      id="vendor-name"
                      placeholder="Your name"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-name" className="flex items-center gap-2">
                      <Store className="h-4 w-4" /> Store Name
                    </Label>
                    <Input
                      id="store-name"
                      placeholder="Your store name"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-address" className="flex items-center gap-2">
                      <Store className="h-4 w-4" /> Store Address
                    </Label>
                    <Input
                      id="store-address"
                      placeholder="Your store address"
                      value={storeAddress}
                      onChange={(e) => setStoreAddress(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="vendor@example.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" /> Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showRegisterPassword ? "text" : "password"}
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={toggleRegisterPasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showRegisterPassword ? (
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
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms" 
                      checked={termsAccepted}
                      onCheckedChange={onTermsChange}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the <button 
                        type="button" 
                        className="text-accent underline hover:text-accent/80"
                        onClick={onShowTerms}
                      >
                        Terms and Conditions
                      </button>
                    </label>
                  </div>
                  
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={loading}>
                    {loading ? "Processing..." : "Register"}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-foreground/70 text-center">
            Verified vendors can submit component listings and receive orders in ₹
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VendorAuth;
