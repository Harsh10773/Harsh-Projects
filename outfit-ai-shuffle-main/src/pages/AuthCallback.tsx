import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // If we already have a user, send them in
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
      return;
    }

    // Fallback: if after a short delay we still don't have a user, redirect to /auth
    const t = setTimeout(() => {
      if (!user) {
        toast({
          title: "Email link invalid or expired",
          description: "Please try logging in or request a new confirmation link.",
          variant: "destructive",
        });
        navigate("/auth", { replace: true });
      }
    }, 3000);

    return () => clearTimeout(t);
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        <p className="text-muted-foreground">Signing you in…</p>
      </div>
    </div>
  );
};

export default AuthCallback;
