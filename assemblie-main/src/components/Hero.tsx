import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Gamepad, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
const Hero = () => {
  const navigate = useNavigate();
  const {
    user,
    isCustomer
  } = useAuth();
  const handleBuildClick = () => {
    if (!user) {
      navigate("/customer-auth");
      toast.info("Please sign in to build your PC");
      return;
    }
    if (isCustomer) {
      // Store in session storage that this user accessed through proper path
      sessionStorage.setItem('customer_access_verified', 'true');
      navigate("/user");
    } else {
      // If user is authenticated but not a customer, redirect to customer auth
      navigate("/customer-auth");
      toast.info("Please use a customer account to access PC building features");
    }
  };
  return <div className="relative overflow-hidden bg-background">
      {/* Animated Background Pattern - removed RGB border */}
      <div className="absolute inset-0 bg-circuit-pattern opacity-20"></div>
      
      <div className="container mx-auto sm:py-24 lg:py-32 max-w-7xl relative z-10 px-[10px] py-[36px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="mb-2 flex items-center">
              <Gamepad className="text-accent mr-2 h-6 w-6 animate-pulse-light" />
              <span className="text-accent/80 text-lg">Ultimate Gaming Experience</span>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6">
              <span className="block text-accent">
                Custom Computer Builds
              </span>
              <span className="block text-white font-bold">
                Tailored Just for
                <span className="ml-2 inline-block text-accent">
                  You
                </span>
              </span>
            </h1>
            
            <p className="text-lg text-foreground/80 mb-8 max-w-xl">
              From gaming rigs to workstations, we handle the entire assembly process with quality components and expert care. 
              <span className="text-accent font-semibold"> Get your dream PC built hassle-free.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white relative group shadow-lg hover:shadow-accent/50 transition-all" onClick={handleBuildClick}>
                <span className="relative flex items-center">
                  Build Your Dream PC <ChevronRight className="ml-1 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>
          </div>
          
          <div className="order-1 lg:order-2 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-background">
              <img src="/lovable-uploads/fb1b11c3-1e16-43a6-a500-7b3d751df164.png" alt="Custom PC Build" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-40"></div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default Hero;