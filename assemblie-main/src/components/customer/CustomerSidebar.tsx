
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Truck, Settings, Cpu, LogOut, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface CustomerSidebarProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  fullName: string;
  onSignOut: () => void;
  isProfileSetupComplete?: boolean;
}

const CustomerSidebar = ({ 
  activeTab, 
  setActiveTab, 
  fullName, 
  onSignOut,
  isProfileSetupComplete = true
}: CustomerSidebarProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      onSignOut(); // Call the provided onSignOut callback
      navigate("/"); // Redirect to home page after sign out
    } catch (error) {
      console.error("Error signing out:", error);
      // If there's an error, still try to redirect
      navigate("/");
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Customer Portal</CardTitle>
        <CardDescription>
          {fullName}
        </CardDescription>
        
        {!isProfileSetupComplete && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <span className="text-yellow-700">Please complete your profile setup to enable all features.</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          orientation="vertical" 
          className="w-full"
        >
          <TabsList className="flex flex-col items-start h-auto w-full rounded-none bg-transparent border-r">
            <TabsTrigger
              value="orders"
              className="justify-start w-full py-3 px-4 rounded-none data-[state=active]:border-l-4 data-[state=active]:border-accent"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              My Orders
            </TabsTrigger>
            <TabsTrigger
              value="tracking"
              className="justify-start w-full py-3 px-4 rounded-none data-[state=active]:border-l-4 data-[state=active]:border-accent"
            >
              <Truck className="mr-2 h-4 w-4" />
              Track Packages
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="justify-start w-full py-3 px-4 rounded-none data-[state=active]:border-l-4 data-[state=active]:border-accent"
            >
              <Settings className="mr-2 h-4 w-4" />
              Profile Settings
            </TabsTrigger>
            
            <Button
              variant="outline"
              className="w-full justify-start rounded-none mt-2 hover:bg-accent/10 border-none"
              onClick={() => navigate("/user")}
            >
              <Cpu className="mr-2 h-4 w-4" />
              Build Your PC
            </Button>
            
            <Separator className="my-2" />
            <Button
              variant="ghost"
              className="w-full justify-start rounded-none hover:bg-accent/10 text-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </TabsList>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CustomerSidebar;
