
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VendorDashboard from "@/components/VendorDashboard";
import { toast } from "sonner";

const Vendor = () => {
  const navigate = useNavigate();
  const { user, isLoading, isVendor, vendorProfile, hasValidVendorProfile, signOut } = useAuth();
  
  // Check authentication status and redirect if needed
  useEffect(() => {
    if (!isLoading) {
      // If not logged in, redirect to auth page
      if (!user) {
        toast.error("You must be logged in to access the vendor portal");
        navigate("/auth");
        return;
      }
      
      // Special case: If it's the admin email, redirect to admin page
      if (user.email === "admin@nexusbuild.com") {
        console.log("Admin detected, redirecting to admin page");
        navigate("/admin");
        return;
      }
      
      // If logged in but not a vendor, redirect to customer portal or home
      if (!isVendor && user.email !== "admin@nexusbuild.com") {
        toast.error("You do not have vendor access. Please sign in with a vendor account.");
        navigate("/");
        return;
      }
      
      // If vendor profile exists but is not valid (has default "New Vendor" name)
      if (isVendor && !hasValidVendorProfile) {
        toast.warning("Your vendor account needs to be fully set up. Please contact support for assistance.");
        // We'll still show the vendor dashboard, but with limited functionality
      }
    }
  }, [user, isLoading, isVendor, hasValidVendorProfile, navigate]);
  
  // Handle sign out and navigate to home page
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Successfully signed out");
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
      // Still attempt to navigate home even if sign out fails
      navigate('/');
    }
  };
  
  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we verify your account.</p>
        </div>
      </div>
    );
  }
  
  // If the user is the admin, we should have already redirected, but add a fallback
  if (user?.email === "admin@nexusbuild.com") {
    navigate("/admin");
    return null; // Return null while redirecting
  }
  
  // If not logged in or not a vendor, the useEffect above will redirect
  if (!user || (!isVendor && !isLoading)) {
    return null; // Return null while redirecting to avoid flash of content
  }
  
  // Render the vendor dashboard
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        {vendorProfile && (
          <VendorDashboard 
            email={user?.email || ''} 
            storeName={vendorProfile.store_name || 'Vendor Store'} 
            onSignOut={handleSignOut}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Vendor;
