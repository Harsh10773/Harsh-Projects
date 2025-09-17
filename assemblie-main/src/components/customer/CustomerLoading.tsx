
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";

const CustomerLoading = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-6">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-accent" />
              <p className="mt-4 text-lg font-medium">Loading customer portal...</p>
              <p className="text-sm text-muted-foreground">Please wait while we prepare your dashboard</p>
            </div>
            
            <div className="max-w-md mx-auto bg-accent/5 border border-accent/20 rounded-md p-4 mt-6">
              <p className="text-sm text-center">
                Retrieving your orders, tracking information, and profile settings
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLoading;
