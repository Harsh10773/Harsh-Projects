
import React from "react";
import { CardDescription } from "@/components/ui/card";
import { User } from "lucide-react";
import CustomerProfileForm from "./CustomerProfileForm";

export interface CustomerProfile {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
}

interface CustomerProfileTabProps {
  profile: CustomerProfile | null;
  isLoadingProfile: boolean;
  userId: string;
}

const CustomerProfileTab = ({ profile, isLoadingProfile, userId }: CustomerProfileTabProps) => {
  if (isLoadingProfile) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center mb-4">
        <User className="mr-2 h-5 w-5" />
        <div>
          <h3 className="font-medium">Profile Settings</h3>
          <CardDescription>
            Manage your account details and preferences
          </CardDescription>
        </div>
      </div>
      <CustomerProfileForm profile={profile} userId={userId} />
    </>
  );
};

export default CustomerProfileTab;
