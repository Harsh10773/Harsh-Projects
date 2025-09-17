
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Mail, User, ChevronRight, CheckCheck, ShieldCheck, Clock, Search, CreditCard, HeartHandshake, Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { sendEmail } from "@/utils/emailService";
import { InputOTPField } from "@/components/ui/input-otp-field";
import ForgotPassword from "@/components/auth/ForgotPassword";

const CustomerAuth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, isLoading, user, isCustomer, isVendor } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [registrationData, setRegistrationData] = useState<any>(null);
  
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  
  useEffect(() => {
    console.log("Current auth state in CustomerAuth:", { 
      user: user?.id, 
      isCustomer, 
      isVendor, 
      isLoading,
      userMetadata: user?.user_metadata
    });
  }, [user, isCustomer, isVendor, isLoading]);
  
  useEffect(() => {
    if (isLoading) {
      console.log("Auth is still loading, waiting...");
      return;
    }
    
    console.log("Auth state in CustomerAuth:", { user, isCustomer, isVendor });
    
    if (user) {
      if (isCustomer) {
        console.log("User is authenticated and has customer profile, redirecting to customer portal");
        sessionStorage.setItem('customer_access_verified', 'true');
        navigate("/customer");
      } else if (isVendor) {
        toast.error("You are logged in as a vendor. Please use the vendor portal.");
        navigate("/");
      } else {
        console.log("User is authenticated but no customer profile exists yet");
      }
    }
  }, [user, navigate, isCustomer, isVendor, isLoading]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      setCheckingAuth(true);
      console.log("Attempting to sign in with email:", loginEmail);
      
      await signIn(loginEmail, loginPassword);
      
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setCheckingAuth(false);
    }
  };
  
  const generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated OTP:", otp);
    return otp;
  };
  
  const sendOtpEmail = async (email: string, otp: string) => {
    await sendEmail(
      email,
      "Verify your email address - NexusBuild Customer",
      `Your verification code for NexusBuild is: ${otp}\n\nThis code will expire in 10 minutes.`
    );
    
    toast.info(`Verification code sent to ${email}. Please check your inbox.`);
    return true;
  };
  
  const handleInitiateRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerEmail || !registerPassword || !confirmPassword || !fullName) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (registerPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (!termsAccepted) {
      toast.error("Please accept the Terms and Conditions");
      setShowTerms(true);
      return;
    }
    
    try {
      setCheckingAuth(true);
      
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendor_auth')
        .select('email')
        .eq('email', registerEmail)
        .maybeSingle();
      
      if (vendorData) {
        setCheckingAuth(false);
        toast.error("This email is already registered as a vendor. Please use a different email address.");
        return;
      }
      
      const newOtp = generateOtp();
      setGeneratedOtp(newOtp);
      setVerificationEmail(registerEmail);
      
      setRegistrationData({
        email: registerEmail,
        password: registerPassword,
        fullName: fullName
      });
      
      await sendOtpEmail(registerEmail, newOtp);
      
      setShowOtpVerification(true);
      
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setCheckingAuth(false);
    }
  };
  
  const handleVerifyOtp = async () => {
    setCheckingAuth(true);
    
    try {
      if (otp === generatedOtp) {
        console.log("OTP verified, registering user:", registrationData);
        
        await signUp(registrationData.email, registrationData.password, {
          full_name: registrationData.fullName,
          user_type: "customer"
        });
        
        setShowOtpVerification(false);
        setOtp("");
        setGeneratedOtp("");
        setRegistrationData(null);
        
        setActiveTab("login");
        setLoginEmail(registerEmail);
        setLoginPassword("");
        
        setRegisterEmail("");
        setRegisterPassword("");
        setConfirmPassword("");
        setFullName("");
        
        toast.success("Registration successful! Please check your email for verification and then sign in.");
      } else {
        toast.error("Invalid verification code. Please try again.");
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast.error(error.message || "Failed to verify OTP");
    } finally {
      setCheckingAuth(false);
    }
  };
  
  const handleResendOtp = async () => {
    if (!verificationEmail) return;
    
    setCheckingAuth(true);
    
    try {
      const newOtp = generateOtp();
      setGeneratedOtp(newOtp);
      
      await sendOtpEmail(verificationEmail, newOtp);
      
      toast.success("Verification code resent");
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      toast.error(error.message || "Failed to resend verification code");
    } finally {
      setCheckingAuth(false);
    }
  };
  
  const handleCancelOtpVerification = () => {
    setShowOtpVerification(false);
    setOtp("");
    setGeneratedOtp("");
    setRegistrationData(null);
  };
  
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <ForgotPassword 
              onBack={() => setShowForgotPassword(false)}
              userType="customer"
            />
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  if (showOtpVerification) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        
        <main className="container mx-auto px-4 py-16">
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
                      disabled={checkingAuth}
                    />
                  </div>
                  <Button 
                    className="w-full bg-accent hover:bg-accent/90" 
                    onClick={handleVerifyOtp}
                    disabled={checkingAuth || otp.length !== 6}
                  >
                    {checkingAuth ? "Verifying..." : "Verify Code"}
                  </Button>
                  <div className="flex justify-between mt-4">
                    <Button variant="outline" onClick={handleCancelOtpVerification}>
                      Cancel
                    </Button>
                    <Button variant="ghost" onClick={handleResendOtp} disabled={checkingAuth}>
                      Resend Code
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="w-full max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">Welcome to Assemblie</h1>
            <p className="text-xl text-foreground/80">
              Your trusted partner for quality computer components and custom PC builds
            </p>
            <div className="pt-4">
              <Button size="lg" variant="default" className="bg-accent hover:bg-accent/90 text-white px-8" onClick={() => document.getElementById('auth-form')?.scrollIntoView({ behavior: 'smooth' })}>
                Create Account
              </Button>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground">Why Choose Assemblie?</h2>
              <p className="text-lg text-foreground/70 mt-2">Trusted by over 10,000 customers across India</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border border-accent/40 hover:border-accent transition-all shadow-sm hover:shadow-md bg-card/70">
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                      <ShieldCheck size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-center">Quality Assured</h3>
                    <p className="text-foreground/70 text-center">
                      All components are verified and sourced from trusted vendors with quality guarantees.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-accent/40 hover:border-accent transition-all shadow-sm hover:shadow-md bg-card/70">
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                      <CreditCard size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-center">Secure Payments</h3>
                    <p className="text-foreground/70 text-center">
                      Multiple payment options with industry-standard security and buyer protection.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-accent/40 hover:border-accent transition-all shadow-sm hover:shadow-md bg-card/70">
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                      <HeartHandshake size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-center">Expert Support</h3>
                    <p className="text-foreground/70 text-center">
                      Dedicated support team to help with component selection, technical issues, and order tracking.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="space-y-8 bg-accent/5 p-8 rounded-xl border border-accent/20">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground">Customer Features</h2>
              <p className="text-lg text-foreground/70 mt-2">Create an account to unlock these benefits</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Search size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Order Tracking</h3>
                  <p className="text-foreground/70 mt-1">
                    Track your orders in real-time from processing to delivery with detailed status updates.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Order History</h3>
                  <p className="text-foreground/70 mt-1">
                    Access your complete order history and repurchase components with just a click.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Star size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Personalized Recommendations</h3>
                  <p className="text-foreground/70 mt-1">
                    Get custom component suggestions based on your preferences and previous purchases.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <CheckCheck size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Quick Checkout</h3>
                  <p className="text-foreground/70 mt-1">
                    Save your shipping and payment details for faster checkout on future orders.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground">What Our Customers Say</h2>
              <p className="text-lg text-foreground/70 mt-2">Join thousands of satisfied customers</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border border-accent/30 bg-card/80">
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="flex flex-col h-full">
                    <div className="text-amber-500 flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={16} />
                      ))}
                    </div>
                    <p className="italic text-foreground/80 mb-4">
                      "The component quality exceeded my expectations. The system is fast, reliable, and the customer service was exceptional throughout the process."
                    </p>
                    <div className="mt-auto pt-4 border-t border-border/40">
                      <p className="font-medium">Amit Patel</p>
                      <p className="text-sm text-foreground/60">Bangalore</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-accent/30 bg-card/80">
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="flex flex-col h-full">
                    <div className="text-amber-500 flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={16} />
                      ))}
                    </div>
                    <p className="italic text-foreground/80 mb-4">
                      "NexusBuild's order tracking feature gave me peace of mind. I knew exactly when my components would arrive, and the build turned out exactly as I wanted!"
                    </p>
                    <div className="mt-auto pt-4 border-t border-border/40">
                      <p className="font-medium">Sneha Gupta</p>
                      <p className="text-sm text-foreground/60">Hyderabad</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div id="auth-form" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-8 pb-16">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">Create Your Account</h2>
              <p className="text-lg text-foreground/80">
                Join thousands of PC enthusiasts already on our platform. Track orders, save your preferences, and get exclusive offers.
              </p>
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 mt-0.5">
                    <CheckCheck size={14} />
                  </div>
                  <p>Free account creation with email verification</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 mt-0.5">
                    <CheckCheck size={14} />
                  </div>
                  <p>Real-time order tracking and updates</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 mt-0.5">
                    <CheckCheck size={14} />
                  </div>
                  <p>Priority customer support</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 mt-0.5">
                    <CheckCheck size={14} />
                  </div>
                  <p>Early access to new components and special deals</p>
                </div>
              </div>
            </div>
            
            <div className="max-w-md mx-auto w-full">
              <Card className="border border-accent/50 shadow-lg bg-card">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold text-center text-primary">Customer Portal</CardTitle>
                  <CardDescription className="text-center">
                    Login or register as a customer
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                              placeholder="customer@example.com"
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password" className="flex items-center gap-2">
                              <Lock className="h-4 w-4" /> Password
                            </Label>
                            <Input
                              id="password"
                              type="password"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              required
                            />
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
                          <Button 
                            type="submit" 
                            className="w-full bg-accent hover:bg-accent/90" 
                            disabled={isLoading || checkingAuth}
                          >
                            {isLoading || checkingAuth ? "Signing in..." : "Sign In"}
                          </Button>
                        </div>
                      </form>
                    </TabsContent>
                    
                    <TabsContent value="register">
                      <form onSubmit={handleInitiateRegistration}>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="full-name" className="flex items-center gap-2">
                              <User className="h-4 w-4" /> Full Name
                            </Label>
                            <Input
                              id="full-name"
                              placeholder="Your full name"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="register-email" className="flex items-center gap-2">
                              <Mail className="h-4 w-4" /> Email
                            </Label>
                            <Input
                              id="register-email"
                              type="email"
                              placeholder="customer@example.com"
                              value={registerEmail}
                              onChange={(e) => setRegisterEmail(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="register-password" className="flex items-center gap-2">
                              <Lock className="h-4 w-4" /> Password
                            </Label>
                            <Input
                              id="register-password"
                              type="password"
                              value={registerPassword}
                              onChange={(e) => setRegisterPassword(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-password" className="flex items-center gap-2">
                              <Lock className="h-4 w-4" /> Confirm Password
                            </Label>
                            <Input
                              id="confirm-password"
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="terms" 
                              checked={termsAccepted}
                              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                            />
                            <label
                              htmlFor="terms"
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              I agree to the <button 
                                type="button" 
                                className="text-accent underline hover:text-accent/80"
                                onClick={() => setShowTerms(true)}
                              >
                                Terms and Conditions
                              </button>
                            </label>
                          </div>
                          
                          <Button 
                            type="submit" 
                            className="w-full bg-accent hover:bg-accent/90" 
                            disabled={isLoading || checkingAuth}
                          >
                            {isLoading || checkingAuth ? "Processing..." : "Register"}
                          </Button>
                        </div>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="text-sm text-foreground/70 text-center">
                    Customer accounts can track orders and manage personal information
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {showTerms && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-auto p-6">
            <h3 className="text-xl font-semibold mb-4">Terms and Conditions</h3>
            <div className="prose dark:prose-invert">
              <p>These Terms and Conditions govern your use of the Assemblie Customer Portal and our services.</p>
              <h4>1. Account Registration</h4>
              <p>By registering as a customer, you agree to provide accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials.</p>
              {/* More terms content... */}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowTerms(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerAuth;
