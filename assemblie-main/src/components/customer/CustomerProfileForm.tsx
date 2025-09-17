import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { User, Phone, MapPin, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CustomerProfile } from "./CustomerProfileTab";

interface CustomerProfileFormProps {
  profile: CustomerProfile | null;
  userId: string;
}

const CustomerProfileForm = ({ profile, userId }: CustomerProfileFormProps) => {
  const [formFullName, setFormFullName] = useState(profile?.full_name || "");
  const [formPhone, setFormPhone] = useState(profile?.phone || "");
  const [formAddress, setFormAddress] = useState(profile?.address || "");
  const [formCity, setFormCity] = useState(profile?.city || "");
  const [formState, setFormState] = useState(profile?.state || "");
  const [formZipcode, setFormZipcode] = useState(profile?.zipcode || "");
  
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) return;
    
    if (!formPhone) {
      toast.error("Please enter a phone number");
      return;
    }
    
    setIsUpdatingProfile(true);
    setUpdateSuccess(false);
    
    try {
      const { error } = await supabase
        .from('customer_profiles')
        .update({
          full_name: formFullName,
          phone: formPhone,
          address: formAddress,
          city: formCity,
          state: formState,
          zipcode: formZipcode,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) {
        console.error("Error updating profile:", error);
        toast.error("Could not update your profile");
        return;
      }
      
      toast.success("Profile updated successfully");
      setUpdateSuccess(true);
      
    } catch (error) {
      console.error("Error in update profile:", error);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <>
      {updateSuccess && (
        <Card className="mb-6 border-green-500/30 bg-green-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <div>
              <h4 className="font-medium">Profile Updated</h4>
              <p className="text-sm text-muted-foreground">Your profile information has been saved successfully.</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center mb-1">
              <User className="h-4 w-4 mr-1" />
              <Label htmlFor="fullName">Full Name</Label>
            </div>
            <Input
              id="fullName"
              value={formFullName}
              onChange={(e) => setFormFullName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center mb-1">
              <Phone className="h-4 w-4 mr-1" />
              <Label htmlFor="phone">Phone Number</Label>
            </div>
            <Input
              id="phone"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center mb-1">
              <MapPin className="h-4 w-4 mr-1" />
              <Label htmlFor="address">Address</Label>
            </div>
            <Input
              id="address"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formCity}
              onChange={(e) => setFormCity(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formState}
                onChange={(e) => setFormState(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zipcode">Zip Code</Label>
              <Input
                id="zipcode"
                value={formZipcode}
                onChange={(e) => setFormZipcode(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="bg-accent hover:bg-accent/90"
          disabled={isUpdatingProfile}
        >
          {isUpdatingProfile ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </>
  );
};

export default CustomerProfileForm;
