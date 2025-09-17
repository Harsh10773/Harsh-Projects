import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BuildTypeStep from "@/components/UserPage/BuildTypeStep";
import ComponentsStep from "@/components/UserPage/ComponentsStep";
import ContactInfoStep from "@/components/UserPage/ContactInfoStep";
import ShippingStep from "@/components/UserPage/ShippingStep";
import CheckoutStep from "@/components/UserPage/CheckoutStep";
import StepperNav from "@/components/UserPage/StepperNav";
import { getComponentsByCategory, calculateTotalComponentCost, getRecommendedBuild } from "@/utils/componentPricing";
import { toast } from "sonner";
const User = () => {
  const {
    user,
    isLoading
  } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    buildType: "",
    budget: "",
    budgetAmount: 0,
    processor: "",
    graphics: "",
    memory: "",
    storage: "",
    cooling: "",
    power: "",
    motherboard: "",
    pcCase: "",
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "Karnataka",
    zipCode: ""
  });

  // Track if user is using AI build
  const [isAIBuild, setIsAIBuild] = useState(false);

  // Keep track of component names separately
  const [componentNames, setComponentNames] = useState({
    processor: "",
    graphics: "",
    memory: "",
    storage: "",
    cooling: "",
    power: "",
    motherboard: "",
    pcCase: ""
  });

  // Track available components based on build type and budget
  const [availableComponents, setAvailableComponents] = useState({
    processor: [],
    graphics: [],
    memory: [],
    storage: [],
    cooling: [],
    power: [],
    motherboard: [],
    pcCase: []
  });

  // Track extra storage selected
  const [selectedExtraStorage, setSelectedExtraStorage] = useState([]);

  // Load components based on build type and budget
  useEffect(() => {
    const loadComponents = async () => {
      if (formData.buildType && (formData.budget || isAIBuild)) {
        try {
          // For AI builds, use a default high budget to show all components
          const budgetToUse = isAIBuild && !formData.budget ? "extreme" : formData.budget;
          const components = await getComponentsByCategory(formData.buildType, budgetToUse);
          setAvailableComponents(components);

          // If AI build and no budget set, set a default budget based on build type
          if (isAIBuild && !formData.budget) {
            let defaultBudget = "midrange";
            let defaultAmount = 120000;
            if (formData.buildType === "gaming") {
              defaultBudget = "highend";
              defaultAmount = 180000;
            } else if (formData.buildType === "workstation") {
              defaultBudget = "highend";
              defaultAmount = 200000;
            }
            setFormData(prev => ({
              ...prev,
              budget: defaultBudget,
              budgetAmount: defaultAmount
            }));
          }
        } catch (error) {
          console.error("Error loading components:", error);
          toast.error("Failed to load components. Please try again.");
        }
      }
    };
    loadComponents();
  }, [formData.buildType, formData.budget, isAIBuild]);

  // Calculate pricing details
  const calculatePricing = () => {
    const componentCost = calculateTotalComponentCost(formData, selectedExtraStorage);

    // Calculate build charge based on component cost
    let buildCharge = 0;
    if (componentCost < 25000) {
      buildCharge = 2500;
    } else if (componentCost < 50000) {
      buildCharge = 3500;
    } else if (componentCost < 100000) {
      buildCharge = 5000;
    } else {
      buildCharge = 7500;
    }

    // Calculate weight based on components
    let weight = 5; // Base weight for case and basic components

    // Calculate delivery charge based on weight
    const deliveryCharge = Math.min(2000, Math.max(500, weight * 200));

    // Calculate GST
    const gst = Math.round((componentCost + buildCharge + deliveryCharge) * 0.18);

    // Calculate total
    const total = componentCost + buildCharge + deliveryCharge + gst;
    return {
      buildCost: componentCost,
      buildCharge,
      weight,
      deliveryCharge,
      gst,
      total
    };
  };

  // Format price with currency symbol
  const formatPrice = price => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  // Handle next step button
  const handleNext = () => {
    // Validate current step
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  // Handle previous step button
  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  // Validate current step before proceeding
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        // If using AI build, only build type is required
        if (isAIBuild) {
          if (!formData.buildType) {
            toast.error("Please select a build type");
            return false;
          }
          return true;
        }

        // Otherwise need both build type and budget
        if (!formData.buildType || !formData.budget) {
          toast.error("Please select both build type and budget");
          return false;
        }
        return true;
      case 2:
        // Components are optional, but budget needs to be set
        if (!isAIBuild && !formData.budgetAmount) {
          toast.error("Please set a valid budget");
          return false;
        }
        return true;
      case 3:
        if (!formData.name || !formData.email || !formData.phone) {
          toast.error("Please fill in all contact information");
          return false;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          toast.error("Please enter a valid email address");
          return false;
        }

        // Validate phone format
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(formData.phone)) {
          toast.error("Please enter a valid 10-digit phone number");
          return false;
        }
        return true;
      case 4:
        if (!formData.street || !formData.city || !formData.state || !formData.zipCode) {
          toast.error("Please fill in all address fields");
          return false;
        }

        // Validate zip code format
        const zipRegex = /^\d{6}$/;
        if (!zipRegex.test(formData.zipCode)) {
          toast.error("Please enter a valid 6-digit ZIP code");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  // Handle form field changes
  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle budget change from selection to amount
  const handleBudgetChange = (budget, amount) => {
    setFormData({
      ...formData,
      budget,
      budgetAmount: amount
    });
  };

  // Handle component selection
  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle AI Build application
  const handleApplyAIBuild = components => {
    // Mark as AI build to skip budget selection
    setIsAIBuild(true);

    // Apply all component selections at once
    const updatedFormData = {
      ...formData,
      ...components
    };
    setFormData(updatedFormData);

    // Also update component names
    if (components) {
      const updatedNames = {};

      // For each component, find its name from availableComponents
      Object.keys(components).forEach(componentType => {
        const componentId = components[componentType];
        if (componentId && availableComponents[componentType]) {
          const component = availableComponents[componentType].find(c => c.id === componentId);
          if (component) {
            updatedNames[componentType] = component.name;
          }
        }
      });

      // Update component names state
      setComponentNames({
        ...componentNames,
        ...updatedNames
      });
    }
  };

  // Handle recommendation application
  const handleApplyRecommendation = (component, value) => {
    setFormData({
      ...formData,
      [component]: value
    });

    // Update component name
    if (component && availableComponents[component]) {
      const componentName = availableComponents[component].find(c => c.id === value)?.name || "";
      if (componentName) {
        setComponentNames({
          ...componentNames,
          [component]: componentName
        });
      }
    }
  };

  // Handle extra storage selection
  const handleExtraStorageSelect = selectedStorage => {
    setSelectedExtraStorage(selectedStorage);
  };

  // Pricing calculations
  const pricing = calculatePricing();
  const steps = ["Build Type", "Components", "Contact Info", "Shipping", "Checkout"];

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BuildTypeStep formData={formData} handleInputChange={handleInputChange} handleBudgetChange={handleBudgetChange} handleApplyAIBuild={handleApplyAIBuild} componentNames={componentNames} goToNextStep={handleNext} />;
      case 2:
        return <ComponentsStep formData={formData} availableComponents={availableComponents} totalComponentCost={pricing.buildCost} handleSelectChange={handleSelectChange} handleApplyRecommendation={handleApplyRecommendation} formatPrice={formatPrice} handleExtraStorageSelect={handleExtraStorageSelect} selectedExtraStorage={selectedExtraStorage} componentNames={componentNames} setComponentNames={setComponentNames} />;
      case 3:
        return <ContactInfoStep formData={formData} handleInputChange={handleInputChange} />;
      case 4:
        return <ShippingStep formData={formData} handleInputChange={handleInputChange} />;
      case 5:
        return <CheckoutStep contactInfo={{
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        }} addressInfo={{
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        }} buildType={formData.buildType} selectedComponents={{
          processor: formData.processor,
          graphics: formData.graphics,
          memory: formData.memory,
          storage: formData.storage,
          cooling: formData.cooling,
          power: formData.power,
          motherboard: formData.motherboard,
          pcCase: formData.pcCase
        }} extraStorage={selectedExtraStorage} pricing={pricing} componentNames={componentNames} />;
      default:
        return null;
    }
  };
  return <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-circuit-pattern opacity-5 pointer-events-none"></div>
      
      <Navbar />
      
      <main className="container rounded-2xl text-[10px] px-[182px] py-[15px] mx-[55px] my-px">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center text-foreground">Build Your Ultimate PC</h1>
          
          {/* New enhanced stepper navigation */}
          <div className="mb-8">
            <StepperNav steps={steps} currentStep={currentStep - 1} />
          </div>
          
          <div className="rounded-xl bg-card/80 shadow-lg border border-accent/20 overflow-hidden backdrop-blur-sm">
            <div className="p-6">
              {renderStepContent()}
              
              {/* Navigation buttons with gaming style */}
              {currentStep < 5 && <div className="flex justify-between mt-10">
                  {currentStep > 1 && <button onClick={handlePrevious} className="px-6 py-3 border-2 border-accent/30 rounded-lg hover:bg-accent/10 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:border-accent/50 flex items-center gap-2 transform hover:translate-y-[-2px]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                      Previous
                    </button>}
                  
                  <button onClick={handleNext} className="ml-auto px-6 py-3 bg-gradient-to-r from-accent to-primary text-primary-foreground rounded-lg hover:from-accent/90 hover:to-primary/90 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-accent/20 transform hover:translate-y-[-2px]">
                    {currentStep === 4 ? 'Review Order' : 'Next'}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                  </button>
                </div>}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>;
};
export default User;