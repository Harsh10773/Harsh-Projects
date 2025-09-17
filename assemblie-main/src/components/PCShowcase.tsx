
import { useRef } from "react";
import { ChevronLeft, ChevronRight, Cpu, Zap, Monitor, Fan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const PCShowcase = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };
  
  const pcBuilds = [
    {
      id: 1,
      name: "Apex Predator",
      image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specs: "AMD Ryzen 9 5950X, RTX 3090, 64GB RAM",
      type: "Gaming",
    },
    {
      id: 2,
      name: "Content Creator",
      image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specs: "Intel i9-12900K, RTX 3080, 128GB RAM",
      type: "Workstation",
    },
    {
      id: 3,
      name: "Stealth Operator",
      image: "https://images.unsplash.com/photo-1562976540-1502c2145186?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specs: "AMD Ryzen 7 5800X, RTX 3070, 32GB RAM",
      type: "Gaming",
    },
    {
      id: 4,
      name: "Compact Powerhouse",
      image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specs: "Intel i7-12700K, RTX 3060 Ti, 16GB RAM",
      type: "SFF",
    },
    {
      id: 5,
      name: "Arctic Frost",
      image: "https://images.unsplash.com/photo-1624705011877-8d4a8fdcaf2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specs: "AMD Ryzen 9 5900X, RX 6900 XT, 64GB RAM",
      type: "Gaming",
    },
  ];
  
  const features = [
    {
      icon: <Cpu className="h-6 w-6 text-accent" />,
      title: "Premium Components",
      description: "Only the best parts from trusted brands make it into our builds."
    },
    {
      icon: <Zap className="h-6 w-6 text-accent" />,
      title: "Performance Tuned",
      description: "Every system is benchmarked and optimized for maximum performance."
    },
    {
      icon: <Monitor className="h-6 w-6 text-accent" />,
      title: "Custom RGB Lighting",
      description: "Personalize your build with synchronized RGB lighting effects."
    },
    {
      icon: <Fan className="h-6 w-6 text-accent" />,
      title: "Advanced Cooling",
      description: "Custom liquid cooling options for low temperatures and quiet operation."
    },
  ];

  return (
    <section className="py-24 container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-white mb-4">Showcase Builds</h2>
        <p className="text-foreground/70">
          Browse our recent custom PC builds for inspiration or as a starting point for your own dream machine.
        </p>
      </div>
      
      {/* Horizontal Scrolling Gallery */}
      <div className="relative">
        <Button 
          variant="outline" 
          size="icon" 
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/80 backdrop-blur-sm"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none py-8 px-4 gap-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {pcBuilds.map((pc) => (
            <div 
              key={pc.id} 
              className="snap-center shrink-0 w-72 sm:w-80 group"
            >
              <div className="relative overflow-hidden rounded-lg border-glow h-80">
                <img 
                  src={pc.image} 
                  alt={pc.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="inline-block px-2 py-1 rounded bg-accent/20 text-accent text-xs mb-2">
                    {pc.type}
                  </span>
                  <h3 className="text-xl font-bold text-white">{pc.name}</h3>
                  <p className="text-sm text-white/70">{pc.specs}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/80 backdrop-blur-sm"
          onClick={scrollRight}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Features Section */}
      <div className="mt-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Why Choose Us</h2>
          <p className="text-foreground/70">
            Our custom-built PCs are crafted with premium components and meticulous attention to detail.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-colors">
              <CardContent className="p-6">
                <div className="rounded-full w-12 h-12 flex items-center justify-center bg-accent/10 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-foreground/70 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PCShowcase;
