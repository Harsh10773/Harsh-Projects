
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import CustomerProfileTab, { CustomerProfile } from "@/components/customer/CustomerProfileTab";
import CustomerOrdersTab, { Order } from "@/components/customer/CustomerOrdersTab";
import CustomerTrackingTab from "@/components/customer/CustomerTrackingTab";
import CustomerLoading from "@/components/customer/CustomerLoading";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Customer = () => {
  const navigate = useNavigate();
  const { user, isLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [isProfileSetupComplete, setIsProfileSetupComplete] = useState(false);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  // Use the Order type from CustomerOrdersTab
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Fetch orders for the customer with detailed component information
  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        setIsLoadingOrders(true);
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('customer_id', user.id)
            .order('created_at', { ascending: false });
            
          if (error) throw error;
          
          // Map the data to match the Order interface with all required properties
          const mappedOrders: Order[] = (data || []).map(order => ({
            id: order.id,
            created_at: order.created_at,
            status: order.status,
            grand_total: order.grand_total || 0,
            tracking_id: order.tracking_id,
            estimated_delivery: order.estimated_delivery,
            build_charge: order.build_charge || 0,
            shipping_charge: order.shipping_charge || 0,
            gst_amount: order.gst_amount || 0,
            order_date: order.order_date
          }));
          
          // For each order, fetch the ordered components with detailed names
          for (const order of mappedOrders) {
            try {
              const { data: orderItemsData, error: orderItemsError } = await supabase
                .from('customer_ordered_components')
                .select('*')
                .eq('order_id', order.id);
                
              if (!orderItemsError && orderItemsData) {
                console.log(`Found ${orderItemsData.length} components with detailed names for order ${order.id}`);
                order.components = orderItemsData;
              }
            } catch (componentErr) {
              console.error('Error fetching order components:', componentErr);
            }
          }
          
          setOrders(mappedOrders);
        } catch (error) {
          console.error('Error fetching orders:', error);
          toast.error('Failed to load your orders');
        } finally {
          setIsLoadingOrders(false);
        }
      }
    };
    
    fetchOrders();
  }, [user]);

  // Fetch user profile and check if profile setup is complete
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/auth");
        toast.error("You must be logged in to access this page.");
        return;
      }
      
      // Check if the user has completed their profile setup
      const fetchProfile = async () => {
        setIsLoadingProfile(true);
        try {
          // Use customer_profiles table instead of profiles
          const { data: profileData, error: profileError } = await supabase
            .from('customer_profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (profileError) {
            console.error("Error fetching profile data:", profileError);
            setIsLoadingProfile(false);
            return;
          }
          
          // Set the profile data
          setProfile({
            id: user.id,
            full_name: profileData?.full_name,
            email: profileData?.email,
            phone: profileData?.phone,
            address: profileData?.address,
            city: profileData?.city,
            state: profileData?.state,
            zipcode: profileData?.zipcode
          });
          
          // Check if all required profile fields are filled
          if (profileData && profileData.full_name && profileData.phone && profileData.address && profileData.city && profileData.state && profileData.zipcode) {
            setIsProfileSetupComplete(true);
          } else {
            setIsProfileSetupComplete(false);
          }
        } catch (error) {
          console.error("Error checking profile setup:", error);
        } finally {
          setIsLoadingProfile(false);
        }
      };
      
      fetchProfile();
    }
  }, [user, isLoading, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Successfully signed out");
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
      navigate('/');
    }
  };

  if (isLoading) {
    return <CustomerLoading />;
  }

  if (!user) {
    return null;
  }

  // Get the user's full name from the profile
  const fullName = profile?.full_name || 'Welcome back!';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <CustomerSidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onSignOut={handleSignOut} 
            fullName={fullName}
            isProfileSetupComplete={isProfileSetupComplete}
          />
          
          <div className="md:col-span-3">
            {activeTab === 'profile' && (
              <CustomerProfileTab 
                profile={profile} 
                isLoadingProfile={isLoadingProfile} 
                userId={user.id} 
              />
            )}
            
            {activeTab === 'orders' && (
              <CustomerOrdersTab 
                orders={orders} 
                isLoadingOrders={isLoadingOrders} 
              />
            )}
            
            {activeTab === 'tracking' && (
              <CustomerTrackingTab 
                orders={orders}
              />
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Customer;
