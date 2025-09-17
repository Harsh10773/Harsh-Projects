
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import AdminVendors from "@/components/admin/AdminVendors";
import AdminCustomers from "@/components/admin/AdminCustomers";
import AdminQuotations from "@/components/admin/AdminQuotations";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminOrderTracking from "@/components/admin/AdminOrderTracking";
import AdminInvoices from "@/components/admin/AdminInvoices";
import { Shield, LogOut, Users, ShoppingBag, FileText, User, AlertCircle, MessageSquare, TruckIcon, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllVendors } from "@/utils/notifications";

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("quotations");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vendorsCount, setVendorsCount] = useState(0);
  const [quotationsCount, setQuotationsCount] = useState(0);
  const [componentsCount, setComponentsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const ADMIN_EMAIL = "admin@nexusbuild.com";

  useEffect(() => {
    // Check if user is authorized to access admin page
    const checkAdminAccess = async () => {
      try {
        console.log("Checking admin access...");
        
        // First, check if already authenticated with Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No active session found, redirecting to auth page");
          toast.error("Please log in to access the admin panel");
          navigate("/auth");
          return;
        }
        
        // Verify the user is actually an admin by checking email
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user || user.email !== ADMIN_EMAIL) {
          console.error("Access denied: Not authenticated as admin");
          toast.error("You must be logged in as admin to access the admin panel");
          navigate("/auth");
          return;
        }
        
        console.log("Verified admin user:", user.email);
        
        // Admin access verified
        setIsAdmin(true);
        
        // Get vendor count for badge display
        const vendors = await fetchAllVendors();
        console.log("Fetched vendors:", vendors);
        setVendorsCount(vendors.length);
        
        // Get quotations count
        const { count: quotationsCount, error: quotationError } = await supabase
          .from('vendor_quotations')
          .select('*', { count: 'exact', head: true });
          
        if (!quotationError && quotationsCount !== null) {
          console.log(`Found ${quotationsCount} quotations`);
          setQuotationsCount(quotationsCount);
        }
        
        // Get components count
        const { count: componentsCount, error: componentsError } = await supabase
          .from('customer_ordered_components')
          .select('*', { count: 'exact', head: true });
          
        if (!componentsError && componentsCount !== null) {
          console.log(`Found ${componentsCount} customer ordered components`);
          setComponentsCount(componentsCount);
        }
        
        // Get orders count
        const { count: ordersCount, error: ordersError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });
          
        if (!ordersError && ordersCount !== null) {
          console.log(`Found ${ordersCount} orders`);
          setOrdersCount(ordersCount);
        }
        
      } catch (error) {
        console.error("Error during admin authentication:", error);
        toast.error("Authentication error");
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminAccess();
  }, [navigate]);
  
  const handleSignOut = async () => {
    try {
      // Sign out from Supabase auth
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        toast.error("Error signing out: " + error.message);
        return;
      }
      
      toast.success("Signed out successfully");
      navigate("/auth");
    } catch (error) {
      console.error("Error during sign out:", error);
      toast.error("Failed to sign out properly");
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 border border-red-200 rounded-lg bg-red-50">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You do not have permission to access the admin portal. 
            Please log in with administrator credentials.
          </p>
          <Button variant="outline" onClick={() => navigate("/auth")}>
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-primary mr-4" />
            <h1 className="text-3xl font-bold">Admin Portal</h1>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-6 mb-8">
            <TabsTrigger value="vendors" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Vendors
              {vendorsCount > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {vendorsCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Customers
              {componentsCount > 0 && (
                <span className="ml-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {componentsCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="quotations" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Quotations
              {quotationsCount > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {quotationsCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Orders
              {ordersCount > 0 && (
                <span className="ml-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {ordersCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <TruckIcon className="h-4 w-4" />
              Tracking
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Invoices
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="vendors">
            <AdminVendors />
          </TabsContent>
          
          <TabsContent value="customers">
            <AdminCustomers />
          </TabsContent>
          
          <TabsContent value="quotations">
            <AdminQuotations />
          </TabsContent>
          
          <TabsContent value="orders">
            <AdminOrders />
          </TabsContent>
          
          <TabsContent value="tracking">
            <AdminOrderTracking />
          </TabsContent>
          
          <TabsContent value="invoices">
            <AdminInvoices />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
