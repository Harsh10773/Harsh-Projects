
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Settings } from "lucide-react";
import VendorStats from "@/components/vendor/VendorStats";
import OrderManager from "@/components/vendor/OrderManager";
import QuotationsTable from "@/components/vendor/QuotationsTable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface VendorDashboardProps {
  email: string;
  storeName: string;
  onSignOut: () => void;
}

const VendorDashboard = ({ email, storeName, onSignOut }: VendorDashboardProps) => {
  const [activeTab, setActiveTab] = useState("orders");
  const [vendorId, setVendorId] = useState<string>("");
  const [hasNewOrder, setHasNewOrder] = useState(false);
  const [hasQuotationUpdate, setHasQuotationUpdate] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  // Get current vendor ID from Supabase auth
  useEffect(() => {
    const getVendorId = async () => {
      try {
        console.log("Fetching current user from Supabase Auth");
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          console.log("Current user ID:", data.user.id);
          setVendorId(data.user.id);
        }
      } catch (error) {
        console.error("Error getting user:", error);
      }
    };
    
    getVendorId();
    
    // Setup real-time listeners only after getting the vendor ID
    if (vendorId) {
      // Listen for updates to quotation status
      const quotationsChannel = supabase
        .channel('quotation-updates')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'vendor_quotations', filter: `vendor_id=eq.${vendorId}` },
          (payload) => {
            const newStatus = (payload.new as any).status;
            if (newStatus === 'accepted') {
              toast.success('One of your quotations has been accepted!', {
                description: 'Check your quotations tab for details',
                action: {
                  label: 'View',
                  onClick: () => setActiveTab("quotations"),
                },
              });
              // Automatically switch to quotations tab for better UX
              setActiveTab("quotations");
              setHasQuotationUpdate(true);
            } else if (newStatus === 'rejected') {
              toast.error('One of your quotations was not selected', {
                description: 'Check your quotations tab for details',
                action: {
                  label: 'View',
                  onClick: () => setActiveTab("quotations"),
                },
              });
              setHasQuotationUpdate(true);
            }
          }
        )
        .subscribe();
      
      // Listen for new orders
      const ordersChannel = supabase
        .channel('new-orders')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'orders' },
          () => {
            toast.info('New order received!', {
              description: 'Check your orders tab to view details',
              action: {
                label: 'View',
                onClick: () => setActiveTab("orders"),
              },
            });
            // Visual indicator for new order
            setHasNewOrder(true);
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(quotationsChannel);
        supabase.removeChannel(ordersChannel);
      };
    }
  }, [vendorId]);
  
  // Clear new indicators when switching to the respective tab
  useEffect(() => {
    if (activeTab === "orders") {
      setHasNewOrder(false);
    }
    if (activeTab === "quotations") {
      setHasQuotationUpdate(false);
    }
  }, [activeTab]);
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut(); 
      onSignOut(); // Call the provided callback
      navigate("/"); // Redirect to homepage
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
      // If there's an error, still try to redirect
      navigate("/");
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold rgb-text">{storeName}</h1>
          <p className="text-muted-foreground">{email}</p>
        </div>
        <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
      </div>
      
      {/* Vendor Stats - Shows Orders Received, Won, Lost */}
      {vendorId && <VendorStats vendorId={vendorId} />}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="orders" className="flex items-center gap-2 relative">
            <FileText className="h-4 w-4" /> Orders
            {hasNewOrder && (
              <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
          </TabsTrigger>
          <TabsTrigger value="quotations" className="flex items-center gap-2 relative">
            <FileText className="h-4 w-4" /> Quotations
            {hasQuotationUpdate && (
              <span className="absolute top-1 right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders" className="space-y-6">
          {vendorId && <OrderManager vendorId={vendorId} />}
        </TabsContent>
        
        <TabsContent value="quotations" className="space-y-6">
          {vendorId && <QuotationsTable vendorId={vendorId} />}
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Store Settings</CardTitle>
              <CardDescription>Manage your vendor profile and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="store-name">Store Name</Label>
                <Input id="store-name" defaultValue={storeName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" defaultValue={email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Store Address</Label>
                <Textarea id="address" placeholder="Enter your store address" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorDashboard;
