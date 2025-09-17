
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ADMIN_EMAIL } from "@/pages/Auth";

interface ResetAuthDataProps {
  isVisible: boolean;
}

const ResetAuthData: React.FC<ResetAuthDataProps> = ({ isVisible }) => {
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isVisible) return null;

  const resetAuthData = async () => {
    try {
      setIsResetting(true);
      
      // Check current user is admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        toast.error("Only admin can perform this action");
        setShowConfirm(false);
        return;
      }
      
      // Call the reset-authentication function
      const { data, error } = await supabase.functions.invoke("reset-authentication");
      
      if (error) {
        console.error("Error resetting authentication data:", error);
        toast.error("Failed to reset authentication data: " + error.message);
        return;
      }
      
      console.log("Reset authentication response:", data);
      
      if (data.success) {
        toast.success("Authentication data has been successfully reset");
      } else {
        toast.error("Error resetting authentication data");
      }
    } catch (error: any) {
      console.error("Error in resetAuthData:", error);
      toast.error("An unexpected error occurred: " + error.message);
    } finally {
      setIsResetting(false);
      setShowConfirm(false);
    }
  };

  return (
    <Card className="border-red-200 bg-red-50 dark:bg-red-950/10">
      <CardHeader>
        <CardTitle className="text-red-600 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Reset Authentication Data
        </CardTitle>
        <CardDescription className="text-red-500/90">
          This will delete all user accounts but keep the table structure intact.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-red-600/80 mb-4">
          Warning: This action will delete all user accounts from the authentication system and clear related tables.
          This action cannot be undone. The admin account will remain.
        </p>
        
        {!showConfirm ? (
          <Button 
            variant="destructive" 
            onClick={() => setShowConfirm(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            Reset Authentication Data
          </Button>
        ) : (
          <div className="space-y-4">
            <p className="font-medium text-red-600">Are you absolutely sure?</p>
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                onClick={resetAuthData}
                disabled={isResetting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Resetting...
                  </>
                ) : (
                  "Yes, Reset All Auth Data"
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowConfirm(false)}
                disabled={isResetting}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-red-500/70">
        Note: This operation only deletes data, not the tables themselves.
      </CardFooter>
    </Card>
  );
};

export default ResetAuthData;
