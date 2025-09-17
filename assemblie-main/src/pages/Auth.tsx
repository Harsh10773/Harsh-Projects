import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VendorAuth from "@/components/VendorAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, ShieldCheck, Building2, PackageOpen, Truck, Users, CheckCheck, LayoutPanelTop, Award, Cpu } from "lucide-react";
import ResetAuthData from "@/components/admin/ResetAuthData";

// Fixed admin credentials - match these with create_admin function
export const ADMIN_EMAIL = "admin@assemblie.in";
export const ADMIN_PASSWORD = "admin123";

const Auth = () => {
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  // Run create_admin function to ensure admin exists
  useEffect(() => {
    const createAdmin = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('create_admin');
        if (error) {
          console.error("Error creating admin account:", error);
        } else {
          console.log("Admin account setup response:", data);
        }
      } catch (error) {
        console.error("Failed to invoke create_admin function:", error);
      }
    };
    
    createAdmin();
  }, []);

  // Check if current user is admin
  useEffect(() => {
    if (!isLoading && user) {
      setIsAdmin(user.email === ADMIN_EMAIL);
      
      // Redirect if user is already logged in
      if (user.email === ADMIN_EMAIL) {
        navigate("/admin");
      } else {
        navigate("/vendor");
      }
    }
  }, [user, isLoading, navigate]);
  
  const handleSignIn = async (email: string, password: string, storeName: string) => {
    try {
      console.log("Attempting to sign in with:", email);
      
      // Special case for admin login
      if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        console.log("Admin login detected");
        
        if (password !== ADMIN_PASSWORD) {
          toast.error("Admin login failed. Please check your credentials and try again.");
          return;
        }
        
        // Use the direct Supabase auth method for admin
        const { data, error } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD
        });
        
        if (error) {
          console.error("Admin authentication error:", error);
          toast.error("Admin login failed. Please check your credentials and try again.");
          return;
        }
        
        if (data?.user) {
          console.log("Admin authenticated successfully:", data.user);
          toast.success("Welcome to Admin Portal");
          navigate("/admin");
        }
        return;
      }
      
      // For non-admin users, use the normal authentication flow from useAuth
      await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      toast.success(`Welcome to ${storeName || "Assemblie"}`);
      
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(`Failed to sign in: ${error.message || "Unknown error"}`);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5 flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 px-4 md:px-6 lg:px-8">
        <div className="w-full max-w-7xl mx-auto space-y-16">
          {/* Admin Tools Section - Only visible for admin */}
          {isAdmin && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Admin Tools</h2>
              <ResetAuthData isVisible={isAdmin} />
            </div>
          )}
          
          {/* Hero Section */}
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">Partner with Assemblie</h1>
            <p className="text-xl text-foreground/80">
              Join India's premier network of quality component suppliers and grow your business across the nation.
            </p>
            <div className="pt-4">
              <Button size="lg" variant="default" className="bg-accent hover:bg-accent/90 text-white px-8" onClick={() => document.getElementById('auth-form')?.scrollIntoView({ behavior: 'smooth' })}>
                Become a Partner
              </Button>
            </div>
          </div>
          
          {/* Key Benefits Section */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground">Why Partner With Us?</h2>
              <p className="text-lg text-foreground/70 mt-2">Trusted by over 500 vendors across India</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border border-accent/40 hover:border-accent transition-all shadow-sm hover:shadow-md bg-card/70">
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                      <TrendingUp size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-center">Expand Your Reach</h3>
                    <p className="text-foreground/70 text-center">
                      Access thousands of new customers across 150+ cities in India through our platform.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-accent/40 hover:border-accent transition-all shadow-sm hover:shadow-md bg-card/70">
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                      <ShieldCheck size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-center">Guaranteed Payments</h3>
                    <p className="text-foreground/70 text-center">
                      Receive secure and timely payments directly to your account without hassle.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-accent/40 hover:border-accent transition-all shadow-sm hover:shadow-md bg-card/70">
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                      <LayoutPanelTop size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-center">Powerful Dashboard</h3>
                    <p className="text-foreground/70 text-center">
                      Manage your inventory, track orders, and monitor performance all from a single intuitive interface.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* How It Works Section */}
          <div className="space-y-8 bg-accent/5 p-8 rounded-xl border border-accent/20">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground">How It Works</h2>
              <p className="text-lg text-foreground/70 mt-2">Simple 4-step process to start selling</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="relative">
                <div className="absolute -left-3 -top-3 w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold text-lg">1</div>
                <Card className="h-full border-none shadow">
                  <CardContent className="pt-6 pb-6 px-6">
                    <div className="space-y-3">
                      <Cpu className="h-8 w-8 text-primary" />
                      <h3 className="text-lg font-semibold">Register</h3>
                      <p className="text-sm text-foreground/70">
                        Create your vendor account with verified business credentials.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="relative">
                <div className="absolute -left-3 -top-3 w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold text-lg">2</div>
                <Card className="h-full border-none shadow">
                  <CardContent className="pt-6 pb-6 px-6">
                    <div className="space-y-3">
                      <CheckCheck className="h-8 w-8 text-primary" />
                      <h3 className="text-lg font-semibold">Get Verified</h3>
                      <p className="text-sm text-foreground/70">
                        Our team verifies your business documents within 24-48 hours.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="relative">
                <div className="absolute -left-3 -top-3 w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold text-lg">3</div>
                <Card className="h-full border-none shadow">
                  <CardContent className="pt-6 pb-6 px-6">
                    <div className="space-y-3">
                      <PackageOpen className="h-8 w-8 text-primary" />
                      <h3 className="text-lg font-semibold">List Products</h3>
                      <p className="text-sm text-foreground/70">
                        Add your component catalog with pricing and specifications.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="relative">
                <div className="absolute -left-3 -top-3 w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold text-lg">4</div>
                <Card className="h-full border-none shadow">
                  <CardContent className="pt-6 pb-6 px-6">
                    <div className="space-y-3">
                      <Truck className="h-8 w-8 text-primary" />
                      <h3 className="text-lg font-semibold">Start Fulfilling</h3>
                      <p className="text-sm text-foreground/70">
                        Receive orders, fulfill them, and grow your business!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          
          {/* Testimonials Section */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground">Vendor Success Stories</h2>
              <p className="text-lg text-foreground/70 mt-2">Here's what our partners are saying</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border border-accent/30 bg-card/80">
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="flex flex-col h-full">
                    <div className="text-amber-500 flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Award key={i} size={16} />
                      ))}
                    </div>
                    <p className="italic text-foreground/80 mb-4">
                      "Joining NexusBuild was the best business decision we made. Our sales have increased by 43% in just six months, and we're now expanding our workshop to meet the growing demand."
                    </p>
                    <div className="mt-auto pt-4 border-t border-border/40">
                      <p className="font-medium">Rajesh Kumar</p>
                      <p className="text-sm text-foreground/60">MumbaiTech Components</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-accent/30 bg-card/80">
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="flex flex-col h-full">
                    <div className="text-amber-500 flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Award key={i} size={16} />
                      ))}
                    </div>
                    <p className="italic text-foreground/80 mb-4">
                      "The automated quotation system saves us hours of work every day. We now focus on what we do best - building quality components - while NexusBuild handles the sales and payment processing."
                    </p>
                    <div className="mt-auto pt-4 border-t border-border/40">
                      <p className="font-medium">Priya Sharma</p>
                      <p className="text-sm text-foreground/60">Delhi Electronics Ltd.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Auth Form Section */}
          <div id="auth-form" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-8 pb-16">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">Join Our Vendor Network</h2>
              <p className="text-lg text-foreground/80">
                Get started today and join hundreds of successful vendors already on our platform. Our team will guide you through the entire process.
              </p>
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 mt-0.5">
                    <CheckCheck size={14} />
                  </div>
                  <p>No listing fees or monthly charges</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 mt-0.5">
                    <CheckCheck size={14} />
                  </div>
                  <p>Transparent commission structure</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 mt-0.5">
                    <CheckCheck size={14} />
                  </div>
                  <p>24/7 seller support via phone and email</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 mt-0.5">
                    <CheckCheck size={14} />
                  </div>
                  <p>Weekly settlement of payments</p>
                </div>
              </div>
            </div>
            
            <div>
              <VendorAuth 
                onSignIn={handleSignIn}
                termsAccepted={termsAccepted}
                onTermsChange={(checked) => setTermsAccepted(checked)}
                onShowTerms={() => setShowTerms(true)}
              />
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
              <p>These Terms and Conditions govern your use of the Assemblie Vendor Portal and your participation as a vendor on our platform.</p>
              <h4>1. Vendor Registration</h4>
              <p>By registering as a vendor, you agree to provide accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials.</p>
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

export default Auth;
