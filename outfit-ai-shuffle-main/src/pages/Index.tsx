
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <AppLayout hideNav>
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex flex-col">
        <div className="container max-w-md mx-auto px-4 py-12 flex-1 flex flex-col justify-between">
          <div className="text-center mt-12">
            <h1 className="text-4xl font-bold text-primary mb-2 font-heading">
              ClosetGenie
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Your AI stylist in your pocket
            </p>
          </div>

          <div className="mt-8 space-y-6 flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
              <div className="aspect-square rounded-xl bg-secondary/20 flex items-center justify-center p-4">
                <img
                  src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400"
                  alt="Clothing"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="aspect-square rounded-xl bg-primary/20 flex items-center justify-center p-4">
                <img
                  src="https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=400"
                  alt="Outfit"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="aspect-square rounded-xl bg-primary/10 flex items-center justify-center p-4">
                <img
                  src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400"
                  alt="Style"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="aspect-square rounded-xl bg-secondary/10 flex items-center justify-center p-4">
                <img
                  src="https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=400"
                  alt="Shopping"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>

            <div className="px-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  1
                </div>
                <p className="flex-1">Upload your clothing items</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  2
                </div>
                <p className="flex-1">Get AI-generated outfit ideas</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  3
                </div>
                <p className="flex-1">Discover what's missing in your wardrobe</p>
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-4 pb-8">
            <Button asChild className="w-full" size="lg">
              <Link to="/onboarding" className="gap-2">
                Get Started <ArrowRight size={18} />
              </Link>
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              By continuing, you agree to our Terms and Privacy Policy
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
