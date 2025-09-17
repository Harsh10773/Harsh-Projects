
import { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { toast } from "sonner";

// Add type declaration for Google Maps
declare global {
  interface Window {
    google: typeof google;
    initAutocomplete: () => void;
  }
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: {
    fullAddress: string;
    city: string;
    state: string;
    zipCode: string;
  }) => void;
  placeholder?: string;
  defaultValue?: string;
  defaultCity?: string;
  defaultState?: string;
  defaultZipCode?: string;
}

const AddressAutocomplete = ({ 
  onAddressSelect, 
  placeholder = "Enter your address", 
  defaultValue = "",
  defaultCity = "",
  defaultState = "",
  defaultZipCode = ""
}: AddressAutocompleteProps) => {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [city, setCity] = useState(defaultCity);
  const [state, setState] = useState(defaultState);
  const [zipCode, setZipCode] = useState(defaultZipCode);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);
  const addressChangedByAutocomplete = useRef(false);
  const apiKeyRef = useRef<string>("AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg"); // Default fallback API key

  useEffect(() => {
    // Create a global callback function for the Google Maps script
    window.initAutocomplete = () => {
      console.log("Google Maps API loaded successfully");
      setApiLoading(false);
      setApiError("");
      initializeAutocomplete();
    };

    // Load Google Maps API script with proper error handling
    const loadGoogleMapsScript = () => {
      // Check if script is already loaded
      if (document.getElementById('google-maps-script')) {
        if (window.google && window.google.maps && window.google.maps.places) {
          initializeAutocomplete();
        }
        return;
      }
      
      setApiLoading(true);
      
      // Check for a custom API key in localStorage
      const storedApiKey = localStorage.getItem("google_maps_api_key");
      if (storedApiKey) {
        apiKeyRef.current = storedApiKey;
      }
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKeyRef.current}&libraries=places&callback=initAutocomplete`;
      script.async = true;
      script.defer = true;
      script.id = 'google-maps-script';
      
      // Handle script load errors
      script.onerror = () => {
        console.error("Google Maps API failed to load");
        setApiLoading(false);
        setApiError("Failed to load Google Maps. Please try again later.");
        toast.error("Could not load Google Maps. Address autocomplete won't work.");
      };
      
      document.head.appendChild(script);
    };

    // Initialize autocomplete if script already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      initializeAutocomplete();
    } else if (!document.getElementById('google-maps-script')) {
      loadGoogleMapsScript();
    }

    return () => {
      // Clean up callback
      delete window.initAutocomplete;
      
      if (autocompleteRef.current) {
        // Clean up event listeners if needed
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []); // Only run this effect once on mount

  // Initial update based on default values
  useEffect(() => {
    if (defaultValue && defaultCity && defaultState && defaultZipCode && isInitialMount.current) {
      // Notify parent of initial values on first render
      onAddressSelect({
        fullAddress: defaultValue,
        city: defaultCity,
        state: defaultState,
        zipCode: defaultZipCode
      });
    }
  }, [defaultValue, defaultCity, defaultState, defaultZipCode, onAddressSelect]);

  useEffect(() => {
    // Skip the initial mount since we're just setting up default values
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only update parent component when address fields change AND the change
    // wasn't triggered by manual input (only by autocomplete selection)
    if (addressChangedByAutocomplete.current) {
      onAddressSelect({
        fullAddress: inputValue,
        city,
        state,
        zipCode
      });
      
      // Reset the flag after notifying parent
      addressChangedByAutocomplete.current = false;
    }
  }, [inputValue, city, state, zipCode, onAddressSelect]);

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google || !window.google.maps || !window.google.maps.places) {
      console.log("Google Maps not fully loaded yet");
      return;
    }

    try {
      const options: google.maps.places.AutocompleteOptions = {
        componentRestrictions: { country: 'in' }, // Restrict to India
        fields: ['address_components', 'formatted_address', 'geometry'],
      };

      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, options);
      
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        
        if (!place || !place.address_components) {
          console.log("No valid place selected");
          return;
        }
        
        // Extract address components
        let street = '';
        let cityValue = '';
        let stateValue = '';
        let zipCodeValue = '';
        
        place.address_components.forEach(component => {
          const types = component.types;
          
          if (types.includes('street_number') || types.includes('route')) {
            street += component.long_name + ' ';
          }
          if (types.includes('locality') || types.includes('administrative_area_level_2')) {
            cityValue = component.long_name;
          }
          if (types.includes('administrative_area_level_1')) {
            stateValue = component.long_name;
          }
          if (types.includes('postal_code')) {
            zipCodeValue = component.long_name;
          }
        });
        
        const fullAddress = place.formatted_address || street.trim();
        
        // Set flag to indicate this change came from autocomplete
        addressChangedByAutocomplete.current = true;
        
        setInputValue(fullAddress);
        setCity(cityValue);
        setState(stateValue);
        setZipCode(zipCodeValue);
        
        // Toast success on successful address selection
        if (fullAddress && cityValue && stateValue) {
          toast.success("Address located successfully!");
        }
      });
    } catch (error) {
      console.error("Error initializing Google Maps Autocomplete:", error);
      setApiError("Could not initialize address search. Please enter your address manually.");
      toast.error("Address search is not working. Please enter your address manually.");
    }
  };

  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    // For manual changes, still notify parent but don't set autocomplete flag to true
    onAddressSelect({
      fullAddress: e.target.value,
      city,
      state,
      zipCode
    });
  };

  const handleUpdateApiKey = () => {
    const newKey = prompt("Please enter your Google Maps API key:");
    if (newKey) {
      // Store the new API key
      localStorage.setItem("google_maps_api_key", newKey);
      apiKeyRef.current = newKey;
      
      // Remove old script
      const oldScript = document.getElementById('google-maps-script');
      if (oldScript) {
        oldScript.remove();
      }
      
      // Reload script with new key
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKeyRef.current}&libraries=places&callback=initAutocomplete`;
      script.async = true;
      script.defer = true;
      script.id = 'google-maps-script';
      document.head.appendChild(script);
      
      toast.success("API key updated. Reloading Google Maps...");
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleManualInputChange}
          placeholder={apiLoading ? "Loading address search..." : (apiError ? "Enter address manually" : placeholder)}
          className="pl-10"
          required
          disabled={apiLoading}
        />
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      </div>
      
      {apiError && (
        <div className="text-xs text-amber-500">
          {apiError}
          <button 
            onClick={handleUpdateApiKey}
            className="ml-2 text-accent underline"
          >
            Update API key
          </button>
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
