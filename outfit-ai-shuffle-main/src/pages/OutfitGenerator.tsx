
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SwipeableOutfit } from "@/components/outfits/SwipeableOutfit";
import { Outfit, useCloset } from "@/contexts/ClosetContext";
import { RefreshCw, ListFilter, Cloud, ThermometerSun } from "lucide-react";

const OutfitGenerator = () => {
  const { outfits, favoriteOutfit, generateOutfit } = useCloset();
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0);
  const [occasion, setOccasion] = useState("casual");
  const [weatherFilter, setWeatherFilter] = useState(true);
  const [currentWeather, setCurrentWeather] = useState({
    temp: 72,
    condition: "Sunny"
  });
  
  // Generate some more demo outfits
  const [generatedOutfits, setGeneratedOutfits] = useState<Outfit[]>(() => {
    const initialOutfits = [...outfits];
    // Generate a few more outfits to start with
    for (let i = 0; i < 3; i++) {
      initialOutfits.push(generateOutfit("casual"));
    }
    return initialOutfits;
  });

  const handleSwipeLeft = (outfit: Outfit) => {
    console.log("Disliked outfit:", outfit.id);
    setGeneratedOutfits(prev => {
      const next = prev.length < 10 ? [...prev, generateOutfit(occasion)] : prev;
      setCurrentOutfitIndex(idx => (idx + 1) % next.length);
      return next;
    });
  };

  const handleSwipeRight = (outfit: Outfit) => {
    console.log("Liked outfit:", outfit.id);
    favoriteOutfit(outfit.id);
    setGeneratedOutfits(prev => {
      const next = prev.length < 10 ? [...prev, generateOutfit(occasion)] : prev;
      setCurrentOutfitIndex(idx => (idx + 1) % next.length);
      return next;
    });
  };

  const handleRefresh = () => {
    const newOutfit = generateOutfit(occasion);
    setGeneratedOutfits([newOutfit, ...generatedOutfits.slice(0, 4)]);
    setCurrentOutfitIndex(0);
  };

  return (
    <AppLayout>
      <div className="container px-6 py-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold font-heading">Outfit Generator</h1>
          <Button variant="outline" size="lg" onClick={handleRefresh} className="gap-2">
            <RefreshCw size={20} /> Refresh
          </Button>
        </div>
        
        {/* Filters */}
        <div className="mb-8 bg-accent p-6 rounded-xl max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <ListFilter size={24} />
              <h2 className="text-xl font-medium">Filters</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="occasion" className="text-base block mb-2">Occasion</Label>
              <Select value={occasion} onValueChange={setOccasion}>
                <SelectTrigger id="occasion" className="h-12">
                  <SelectValue placeholder="Select occasion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="date">Date Night</SelectItem>
                  <SelectItem value="workout">Workout</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col">
              <Label htmlFor="weather-filter" className="text-base block mb-2">Weather-aware</Label>
              <div className="flex items-center gap-3 h-12">
                <Switch 
                  id="weather-filter"
                  checked={weatherFilter}
                  onCheckedChange={setWeatherFilter}
                />
                <div className="flex items-center gap-2">
                  {weatherFilter && (
                    <>
                      <ThermometerSun size={20} />
                      <span className="text-lg">{currentWeather.temp}°F</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Swipeable Outfit */}
          <div className="flex justify-center">
            {/* Swipeable Outfit Cards */}
            <div className="relative min-h-[500px] w-full max-w-md">
              {generatedOutfits.length > 0 ? (
                <div className="card-stack">
                <SwipeableOutfit
                  key={generatedOutfits[currentOutfitIndex]?.id}
                  outfit={generatedOutfits[currentOutfitIndex]}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                    <RefreshCw className="text-muted-foreground" size={32} />
                  </div>
                  <h3 className="text-xl font-medium mb-3">No outfits to show</h3>
                  <p className="text-muted-foreground mb-6">
                    Add more items to your closet to get outfit suggestions
                  </p>
                  <Button size="lg" onClick={() => {
                    const newOutfit = generateOutfit(occasion);
                    setGeneratedOutfits([newOutfit, ...generatedOutfits]);
                    setCurrentOutfitIndex(0);
                  }}>Generate an Outfit</Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Instructions */}
          <div className="flex items-center justify-center">
            <div className="text-center max-w-md">
              <h3 className="text-xl font-medium mb-6">How it works:</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex justify-center items-center w-16 h-16 rounded-full bg-red-100 text-red-600 text-xl font-bold">
                    ←
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium">Swipe left to skip</h4>
                    <p className="text-muted-foreground">Don't like this outfit? Swipe left to see the next one</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex justify-center items-center w-16 h-16 rounded-full bg-green-100 text-green-600 text-xl font-bold">
                    →
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium">Swipe right to save</h4>
                    <p className="text-muted-foreground">Love this look? Swipe right to add it to your favorites</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Outfit {currentOutfitIndex + 1} of {generatedOutfits.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default OutfitGenerator;
