
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useCloset } from "@/contexts/ClosetContext";
import { useNavigate } from "react-router-dom";
import { Camera, Upload, ArrowRight, Instagram, ShoppingBag } from "lucide-react";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { completeOnboarding } = useCloset();
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
      navigate('/style-quiz');
    }
  };

  return (
    <AppLayout hideNav>
      <div className="min-h-screen bg-background">
        <div className="container max-w-md mx-auto px-4 py-8 flex flex-col min-h-screen">
          <div className="mb-8 mt-4">
            <div className="w-full bg-muted rounded-full h-2 mb-6">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(currentStep + 1) * 33.33}%` }}
              />
            </div>
            <h1 className="text-2xl font-bold mb-2 font-heading">Welcome to ClosetGenie</h1>
            <p className="text-muted-foreground">
              Let's set up your virtual closet in a few simple steps
            </p>
          </div>
          
          <div className="flex-1">
            {currentStep === 0 && (
              <div className="space-y-6 animate-fade-in">
                <div className="aspect-video bg-accent rounded-xl overflow-hidden relative">
                  <video 
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  >
                    <source src="https://static.videezy.com/system/resources/previews/000/005/529/original/Lights_18_-_30s_-_4k_res.mp4" type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <h2 className="text-white text-xl font-medium">Set Up Your Closet</h2>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-lg font-medium">How to photograph your clothes:</h2>
                  
                  <Card>
                    <CardContent className="p-4 flex gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                        <Camera size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Use good lighting</h3>
                        <p className="text-sm text-muted-foreground">Natural daylight works best for accurate colors</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 flex gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                        <Camera size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Neutral background</h3>
                        <p className="text-sm text-muted-foreground">Lay items flat on a solid color surface</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 flex gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                        <Camera size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Full item view</h3>
                        <p className="text-sm text-muted-foreground">Capture the entire item, not just details</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-lg font-medium">Choose how to add your clothes:</h2>
                
                <div className="grid grid-cols-1 gap-4">
                  <Card className="hover:border-primary cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                        <Camera size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Take photos</h3>
                        <p className="text-sm text-muted-foreground">Photograph items from your closet</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:border-primary cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                        <Upload size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Upload from gallery</h3>
                        <p className="text-sm text-muted-foreground">Select existing photos from your device</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:border-primary cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                        <Instagram size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Import from Instagram</h3>
                        <p className="text-sm text-muted-foreground">Connect your Instagram to import photos</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:border-primary cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                        <ShoppingBag size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Shopping history</h3>
                        <p className="text-sm text-muted-foreground">Connect to Amazon, ASOS or other retailers</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-lg font-medium">What ClosetGenie will do:</h2>
                
                <Carousel>
                  <CarouselContent>
                    <CarouselItem>
                      <Card>
                        <CardContent className="p-0">
                          <div className="aspect-video bg-accent rounded-t-xl overflow-hidden">
                            <img 
                              src="https://images.unsplash.com/photo-1578955085634-a0b01ce5ebb5?auto=format&fit=crop&w=800" 
                              alt="Outfit Generation"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium mb-1">Create stylish outfits</h3>
                            <p className="text-sm text-muted-foreground">Our AI combines your clothes into perfect outfits</p>
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                    
                    <CarouselItem>
                      <Card>
                        <CardContent className="p-0">
                          <div className="aspect-video bg-accent rounded-t-xl overflow-hidden">
                            <img 
                              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800" 
                              alt="Shopping Recommendations"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium mb-1">Find missing pieces</h3>
                            <p className="text-sm text-muted-foreground">Get recommendations for items that complete your wardrobe</p>
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                    
                    <CarouselItem>
                      <Card>
                        <CardContent className="p-0">
                          <div className="aspect-video bg-accent rounded-t-xl overflow-hidden">
                            <img 
                              src="https://images.unsplash.com/photo-1466554934129-f71df54ebb27?auto=format&fit=crop&w=800" 
                              alt="Closet Stats"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium mb-1">Track closet stats</h3>
                            <p className="text-sm text-muted-foreground">See what you wear most and what's gathering dust</p>
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  </CarouselContent>
                  <div className="flex justify-center mt-4">
                    <CarouselPrevious className="static transform-none mx-2" />
                    <CarouselNext className="static transform-none mx-2" />
                  </div>
                </Carousel>
                
                <div className="mt-6 border border-dashed border-primary/50 rounded-lg p-4 bg-primary/5">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <span className="bg-primary/20 text-primary p-1 rounded">PRO</span>
                    Premium Features
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">✓</div>
                      Unlimited outfit generation
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">✓</div>
                      Luxury brand recommendations
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">✓</div>
                      Outfit Roulette for inspiration
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 pb-8">
            <Button 
              onClick={handleNext} 
              className="w-full gap-2" 
              size="lg"
            >
              {currentStep < 2 ? 'Continue' : 'Start Style Quiz'} <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Onboarding;
