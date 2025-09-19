
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCloset } from "@/contexts/ClosetContext";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { StyleOption } from "@/components/onboarding/StyleOption";

const StyleQuiz = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { completeStyleQuiz, stylePreferences, updateStylePreferences } = useCloset();
  const navigate = useNavigate();

  const styleOptions = [
    {
      name: "Streetwear",
      image: "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=600",
    },
    {
      name: "Cottagecore",
      image: "https://images.unsplash.com/photo-1600706217216-f1276330d00d?auto=format&fit=crop&w=600",
    },
    {
      name: "CEO Energy",
      image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=600",
    },
    {
      name: "Vintage",
      image: "https://images.unsplash.com/photo-1525450824786-227cbef70703?auto=format&fit=crop&w=600",
    },
    {
      name: "Minimalist",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600",
    },
    {
      name: "Bohemian",
      image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600",
    },
  ];

  // Questions for the quiz
  const quizQuestions = [
    {
      question: "Pick your style vibes",
      type: "styleSelection",
    },
    {
      question: "What's your usual outfit for a casual day?",
      options: [
        "Jeans and a t-shirt",
        "Athleisure (leggings, hoodie)",
        "Dress or skirt",
        "Chinos and a button-up",
      ],
    },
    {
      question: "Which colors dominate your closet?",
      options: [
        "Neutrals (black, white, gray)",
        "Earth tones (brown, olive, burgundy)",
        "Pastels and light colors",
        "Bold and bright colors",
      ],
    },
    {
      question: "What's most important when choosing an outfit?",
      options: [
        "Comfort above all",
        "Making a statement",
        "Looking put-together",
        "Expressing my personality",
      ],
    },
  ];

  const handleToggleStyle = (styleName: string) => {
    updateStylePreferences(
      stylePreferences.map(style => 
        style.name === styleName 
          ? { ...style, selected: !style.selected } 
          : style
      )
    );
  };

  const handleNext = () => {
    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeStyleQuiz();
      navigate('/dashboard');
    }
  };

  const getStylePreference = (styleName: string) => {
    const preference = stylePreferences.find(style => style.name === styleName);
    return preference ? preference.selected : false;
  };

  const progressPercentage = ((currentStep + 1) / quizQuestions.length) * 100;

  return (
    <AppLayout hideNav>
      <div className="min-h-screen bg-background">
        <div className="container max-w-md mx-auto px-4 py-8 flex flex-col min-h-screen">
          <div className="mb-8">
            <Progress value={progressPercentage} className="mb-6" />
            <h1 className="text-2xl font-bold mb-2 font-heading">Style Quiz</h1>
            <p className="text-muted-foreground">
              Help us understand your personal style
            </p>
          </div>
          
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-xl font-medium mb-4">{quizQuestions[currentStep].question}</h2>
              
              {currentStep === 0 ? (
                <div className="grid grid-cols-2 gap-4 animate-fade-in">
                  {styleOptions.map((style) => (
                    <StyleOption
                      key={style.name}
                      name={style.name}
                      image={style.image}
                      isSelected={getStylePreference(style.name)}
                      onToggle={() => handleToggleStyle(style.name)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3 animate-fade-in">
                  {quizQuestions[currentStep].options?.map((option, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 cursor-pointer hover:border-primary transition-all"
                      onClick={() => {
                        // In a real app, we would store these answers
                        // For now we'll just continue to the next question
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-auto pb-8">
            <Button onClick={handleNext} className="w-full" size="lg">
              {currentStep < quizQuestions.length - 1 ? (
                <span className="flex items-center gap-2">
                  Continue <ArrowRight size={18} />
                </span>
              ) : (
                "Complete Quiz"
              )}
            </Button>
            {currentStep === 0 && (
              <p className="text-xs text-center text-muted-foreground mt-2">
                Select all that apply, at least one required
              </p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StyleQuiz;
