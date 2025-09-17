
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PCShowcase from "@/components/PCShowcase";
import Footer from "@/components/Footer";
import AddressFormSection from "@/components/AddressFormSection";
import { Award, Shield, Clock, CreditCard, Cpu, Monitor, Zap, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  const processes = [
    {
      step: "01",
      title: "Book Your Build",
      description: "Tell us your requirements, component preferences, and budget. The more details, the better.",
      icon: <Award className="h-8 w-8 text-accent" />,
    },
    {
      step: "02",
      title: "Track Your Build",
      description: "Follow your PC's progress from component selection to assembly and testing.",
      icon: <Clock className="h-8 w-8 text-accent" />,
    },
    {
      step: "03",
      title: "Enjoy Your New PC",
      description: "Your custom-built PC arrives ready to go with full warranty and technical support.",
      icon: <CreditCard className="h-8 w-8 text-accent" />,
    },
  ];
  
  const buildCategories = [
    {
      title: "Gaming PC",
      description: "Ultimate performance for modern games",
      icon: <Monitor className="h-8 w-8 text-accent" />,
      features: ["High FPS Gaming", "Ray Tracing", "Latest Graphics Cards"],
    },
    {
      title: "Workstation",
      description: "Professional power for creative work",
      icon: <Cpu className="h-8 w-8 text-accent" />,
      features: ["Multi-core CPUs", "High RAM Capacity", "Fast Storage"],
    },
    {
      title: "Streaming",
      description: "Optimized for content creators",
      icon: <Zap className="h-8 w-8 text-accent" />,
      features: ["Encoding Performance", "Multitasking", "Reliable Components"],
    },
    {
      title: "Custom Build",
      description: "Tailored to your specific needs",
      icon: <Wrench className="h-8 w-8 text-accent" />,
      features: ["Any Budget", "Expert Advice", "Premium Parts"],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        <Hero />
        
        {/* How It Works Section */}
        <section className="py-24 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-foreground/70">
              We've simplified the process of getting your custom PC built by experts
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {processes.map((process, index) => (
              <div 
                key={index} 
                className="relative border border-border/50 rounded-lg p-6 hover:border-accent/50 transition-colors group"
              >
                <div className="absolute -top-4 -right-4 bg-accent text-white text-xl font-bold w-10 h-10 rounded-full flex items-center justify-center">
                  {process.step}
                </div>
                <div className="mb-4">{process.icon}</div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">
                  {process.title}
                </h3>
                <p className="text-foreground/70">
                  {process.description}
                </p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Build Categories Section */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">PC Build Categories</h2>
              <p className="text-foreground/70">
                Choose from our specialized PC builds, each tailored for specific needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {buildCategories.map((category, index) => (
                <div 
                  key={index}
                  className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-all hover:shadow-lg hover:shadow-accent/10"
                >
                  <div className="rounded-full bg-accent/10 w-16 h-16 flex items-center justify-center mb-4">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{category.title}</h3>
                  <p className="text-foreground/70 mb-4">{category.description}</p>
                  <ul className="space-y-2 mb-6">
                    {category.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <Shield className="h-4 w-4 text-accent mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {/* Removed "Build Now" button */}
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <PCShowcase />
        
        {/* Address Form Section */}
        <AddressFormSection />
      </main>
      
      <Footer />
      
      {/* Hidden admin link - only visible on double click */}
      <div 
        className="fixed bottom-1 right-1 text-[8px] text-gray-300 cursor-default select-none" 
        onDoubleClick={() => window.location.href = '/admin'}
        title="Admin Access"
      >
        •
      </div>
    </div>
  );
};

export default Index;
