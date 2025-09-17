
import React, { createContext, useContext, useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string, metadata?: { [key: string]: any }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  vendorProfile: any | null;
  isVendor: boolean;
  customerProfile: any | null;
  isCustomer: boolean;
  hasValidVendorProfile: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [vendorProfile, setVendorProfile] = useState<any | null>(null);
  const [customerProfile, setCustomerProfile] = useState<any | null>(null);

  console.log("[AuthProvider] Initial Render");

  useEffect(() => {
    console.log("[AuthProvider] Setting up auth state listeners");
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("[AuthProvider] Auth state changed:", event, currentSession?.user?.id);
        
        // Update session and user state immediately
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Handle different auth events
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (currentSession?.user) {
            console.log("[AuthProvider] User signed in or token refreshed, fetching profiles");
            // Use setTimeout to avoid blocking the auth state change
            setTimeout(() => {
              fetchUserProfiles(currentSession.user.id);
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("[AuthProvider] User signed out, resetting profiles");
          setVendorProfile(null);
          setCustomerProfile(null);
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log("[AuthProvider] Initial auth check:", initialSession?.user?.id || "no session");
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      
      if (initialSession?.user) {
        fetchUserProfiles(initialSession.user.id);
      } else {
        console.log("[AuthProvider] No session, setting loading to false");
        setVendorProfile(null);
        setCustomerProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      console.log("[AuthProvider] Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfiles = async (userId: string) => {
    try {
      console.log("[AuthProvider] Fetching profiles for user ID:", userId);
      setIsLoading(true);
      
      // First check if user has a customer profile by checking user_metadata
      const { data: userData } = await supabase.auth.getUser();
      const userMeta = userData?.user?.user_metadata;
      
      // Check if user's metadata indicates they are a customer
      if (userMeta && userMeta.user_type === 'customer') {
        console.log("[AuthProvider] User metadata indicates customer type");
        
        // Create customer profile if it doesn't exist
        const { data: existingProfile, error: profileError } = await supabase
          .from('customer_profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        if (profileError) {
          console.error("[AuthProvider] Error checking customer profile:", profileError);
        } 
        
        if (!existingProfile && !profileError) {
          // Create a new customer profile
          const { error: insertError } = await supabase
            .from('customer_profiles')
            .insert({
              id: userId,
              email: userMeta.email || userData?.user?.email,
              full_name: userMeta.full_name || 'Customer'
            });
            
          if (insertError) {
            console.error("[AuthProvider] Error creating customer profile:", insertError);
          } else {
            console.log("[AuthProvider] Created new customer profile");
            
            // Retrieve the newly created profile
            const { data: newProfile } = await supabase
              .from('customer_profiles')
              .select('*')
              .eq('id', userId)
              .maybeSingle();
              
            setCustomerProfile(newProfile);
          }
        } else if (existingProfile) {
          console.log("[AuthProvider] Customer profile found:", existingProfile);
          setCustomerProfile(existingProfile);
        }
        
        // Update customer_auth record
        const { data: customerAuthData, error: customerAuthError } = await supabase
          .from('customer_auth')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
          
        if (!customerAuthData && !customerAuthError) {
          // Insert new customer auth record
          const { error: insertError } = await supabase
            .from('customer_auth')
            .insert({
              id: userId,
              email: userMeta.email || userData?.user?.email,
              last_sign_in: new Date().toISOString()
            });
            
          if (insertError) {
            console.error("[AuthProvider] Error inserting customer auth record:", insertError);
          }
        } else if (customerAuthData) {
          // Update last sign in time
          const { error: updateError } = await supabase
            .from('customer_auth')
            .update({ last_sign_in: new Date().toISOString() })
            .eq('id', userId);
            
          if (updateError) {
            console.error("[AuthProvider] Error updating customer auth record:", updateError);
          }
        }
      } else {
        // Not a customer based on metadata, check database anyway as fallback
        const { data: customerData, error: customerError } = await supabase
          .from('customer_profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        if (customerError) {
          console.error("[AuthProvider] Error fetching customer profile:", customerError);
        } else if (customerData) {
          console.log("[AuthProvider] Customer profile found in database:", customerData);
          setCustomerProfile(customerData);
        } else {
          console.log("[AuthProvider] No customer profile found for this user");
          setCustomerProfile(null);
        }
      }
      
      // Check for vendor profile
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (vendorError) {
        console.error("[AuthProvider] Error fetching vendor profile:", vendorError);
      } else if (vendorData) {
        console.log("[AuthProvider] Vendor profile found:", vendorData);
        setVendorProfile(vendorData);
        
        // Update vendor_auth if needed
        const { data: vendorAuthData, error: vendorAuthError } = await supabase
          .from('vendor_auth')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
          
        if (!vendorAuthData && !vendorAuthError) {
          // Insert new vendor auth record
          const { error: insertError } = await supabase
            .from('vendor_auth')
            .insert({
              id: userId,
              email: vendorData.vendor_name ? vendorData.vendor_name : user?.email,
              last_sign_in: new Date().toISOString()
            });
            
          if (insertError) {
            console.error("[AuthProvider] Error inserting vendor auth record:", insertError);
          }
        } else if (vendorAuthData) {
          // Update last sign in time
          const { error: updateError } = await supabase
            .from('vendor_auth')
            .update({ last_sign_in: new Date().toISOString() })
            .eq('id', userId);
            
          if (updateError) {
            console.error("[AuthProvider] Error updating vendor auth record:", updateError);
          }
        }
      } else {
        console.log("[AuthProvider] No vendor profile found for this user");
        setVendorProfile(null);
      }
    } catch (error) {
      console.error("[AuthProvider] Error in fetch user profiles:", error);
    } finally {
      console.log("[AuthProvider] Finished fetching profiles, setting loading to false");
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: { [key: string]: any }) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {},
        },
      });

      if (error) {
        toast.error(error.message);
        throw error;
      }

      // If we have user data and metadata includes full_name, create a customer profile
      if (data.user && metadata?.full_name) {
        // Create a customer profile
        const { error: profileError } = await supabase.from('customer_profiles').insert({
          id: data.user.id,
          email: email,
          full_name: metadata.full_name
        });
        
        if (profileError) {
          console.error("[AuthProvider] Error creating customer profile:", profileError);
          toast.error("Account created but there was an issue setting up your profile.");
        }
      }

      toast.success("Sign up successful! Please check your email for verification.");
    } catch (error: any) {
      console.error("Sign up error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("[AuthProvider] Sign in attempt with email:", email);
      setIsLoading(true);
      
      // Proceed with sign in directly without additional checks
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("[AuthProvider] Sign in error from Supabase:", error);
        toast.error(error.message);
        setIsLoading(false);
        throw error;
      }

      console.log("[AuthProvider] Signed in successfully:", data.user?.id);
      
      // Fetch user profiles immediately after successful sign in
      if (data.user) {
        await fetchUserProfiles(data.user.id);
      }
      
      toast.success("Signed in successfully!");
    } catch (error: any) {
      console.error("[AuthProvider] Sign in error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Reset profiles first - important to do this before the actual sign out
      setVendorProfile(null);
      setCustomerProfile(null);
      
      // Check if we have a session before trying to sign out
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        // We have a valid session, try to sign out
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("[AuthProvider] Error during sign out:", error);
          toast.error("Error signing out: " + error.message);
        } else {
          // Sign out was successful
          toast.success("Signed out successfully");
        }
      } else {
        // No session found, just clear the local state
        console.log("[AuthProvider] No active session found, clearing local state only");
        setSession(null);
        setUser(null);
        toast.success("Signed out successfully");
      }
      
      // Force navigate to homepage after signout
      window.location.href = "/";
      
    } catch (error: any) {
      console.error("[AuthProvider] Sign out error:", error);
      
      // Even if there's an error, reset the state and redirect
      setSession(null);
      setUser(null);
      toast.error("Error during sign out, but session cleared");
      
      // Force navigate to homepage after signout
      window.location.href = "/";
    } finally {
      setIsLoading(false);
    }
  };

  // Check if vendor profile has valid data (not "New Vendor")
  const hasValidVendorProfile = vendorProfile && vendorProfile.store_name !== "New Vendor";

  const value = {
    session,
    user,
    isLoading,
    signUp,
    signIn,
    signOut,
    vendorProfile,
    isVendor: !!vendorProfile,
    customerProfile,
    isCustomer: !!customerProfile,
    hasValidVendorProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
