import React, { createContext, useContext, useState } from 'react';

// Define types for our items and outfits
export type ClothingItem = {
  id: string;
  name: string;
  category: string;
  color: string;
  style: string;
  image: string;
  lastWorn?: Date;
  timesWorn: number;
};

export type Outfit = {
  id: string;
  name: string;
  items: ClothingItem[];
  occasion: string;
  favorite: boolean;
  createdAt: Date;
};

export type StylePreference = {
  name: string;
  selected: boolean;
};

type ClosetContextType = {
  items: ClothingItem[];
  addItem: (item: Omit<ClothingItem, 'id' | 'timesWorn'>) => void;
  removeItem: (id: string) => void;
  outfits: Outfit[];
  addOutfit: (outfit: Omit<Outfit, 'id' | 'createdAt'>) => void;
  removeOutfit: (id: string) => void;
  favoriteOutfit: (id: string) => void;
  generateOutfit: (occasion?: string) => Outfit;
  stylePreferences: StylePreference[];
  updateStylePreferences: (styles: StylePreference[]) => void;
  uploadProgress: number;
  setUploadProgress: (progress: number) => void;
  isOnboardingComplete: boolean;
  completeOnboarding: () => void;
  isStyleQuizComplete: boolean;
  completeStyleQuiz: () => void;
};

const ClosetContext = createContext<ClosetContextType | undefined>(undefined);

// Sample data for initial state
const dummyItems: ClothingItem[] = [
  {
    id: '1',
    name: 'Black Skinny Jeans',
    category: 'Pants',
    color: 'Black',
    style: 'Casual',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400',
    lastWorn: new Date('2023-12-01'),
    timesWorn: 12,
  },
  {
    id: '2',
    name: 'White Sneakers',
    category: 'Shoes',
    color: 'White',
    style: 'Sporty',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400',
    lastWorn: new Date('2023-12-15'),
    timesWorn: 8,
  },
  {
    id: '3',
    name: 'Red Flannel Shirt',
    category: 'Tops',
    color: 'Red',
    style: 'Grunge',
    image: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=400',
    lastWorn: new Date('2023-11-20'),
    timesWorn: 5,
  },
  {
    id: '4',
    name: 'Navy Blazer',
    category: 'Outerwear',
    color: 'Navy',
    style: 'Business',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400',
    lastWorn: new Date('2023-12-10'),
    timesWorn: 6,
  },
  {
    id: '5',
    name: 'White Button Shirt',
    category: 'Tops',
    color: 'White',
    style: 'Business',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400',
    lastWorn: new Date('2023-12-12'),
    timesWorn: 15,
  },
  {
    id: '6',
    name: 'Black Dress Shoes',
    category: 'Shoes',
    color: 'Black',
    style: 'Formal',
    image: 'https://images.unsplash.com/photo-1582897085656-c636d006a246?auto=format&fit=crop&w=400',
    lastWorn: new Date('2023-12-08'),
    timesWorn: 4,
  },
  {
    id: '7',
    name: 'Denim Jacket',
    category: 'Outerwear',
    color: 'Blue',
    style: 'Casual',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400',
    lastWorn: new Date('2023-11-25'),
    timesWorn: 9,
  },
  {
    id: '8',
    name: 'Khaki Chinos',
    category: 'Pants',
    color: 'Brown',
    style: 'Casual',
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=400',
    lastWorn: new Date('2023-12-05'),
    timesWorn: 7,
  },
  {
    id: '9',
    name: 'Gray Sweater',
    category: 'Tops',
    color: 'Gray',
    style: 'Casual',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=400',
    lastWorn: new Date('2023-11-30'),
    timesWorn: 11,
  },
  {
    id: '10',
    name: 'Black Leather Boots',
    category: 'Shoes',
    color: 'Black',
    style: 'Casual',
    image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=400',
    lastWorn: new Date('2023-12-03'),
    timesWorn: 13,
  },
  {
    id: '11',
    name: 'Black T-Shirt',
    category: 'Tops',
    color: 'Black',
    style: 'Casual',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400',
    lastWorn: new Date('2023-12-14'),
    timesWorn: 20,
  },
  {
    id: '12',
    name: 'Blue Dress Shirt',
    category: 'Tops',
    color: 'Blue',
    style: 'Business',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400',
    lastWorn: new Date('2023-12-07'),
    timesWorn: 8,
  },
  {
    id: '13',
    name: 'Brown Leather Belt',
    category: 'Accessories',
    color: 'Brown',
    style: 'Formal',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400',
    lastWorn: new Date('2023-12-09'),
    timesWorn: 18,
  },
  {
    id: '14',
    name: 'Black Hoodie',
    category: 'Tops',
    color: 'Black',
    style: 'Streetwear',
    image: 'https://images.unsplash.com/photo-1556821840-3a9fbc86339e?auto=format&fit=crop&w=400',
    lastWorn: new Date('2023-11-28'),
    timesWorn: 14,
  },
  {
    id: '15',
    name: 'Gray Suit Pants',
    category: 'Pants',
    color: 'Gray',
    style: 'Formal',
    image: 'https://images.unsplash.com/photo-1594938390264-faf4d8188985?auto=format&fit=crop&w=400',
    lastWorn: new Date('2023-12-11'),
    timesWorn: 3,
  },
  {
    id: '16',
    name: 'White Canvas Shoes',
    category: 'Shoes',
    color: 'White',
    style: 'Casual',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400',
    lastWorn: new Date('2023-12-13'),
    timesWorn: 10,
  },
  {
    id: '17',
    name: 'Green Polo Shirt',
    category: 'Tops',
    color: 'Green',
    style: 'Casual',
    image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&w=400',
    lastWorn: new Date('2023-11-22'),
    timesWorn: 6,
  },
  {
    id: '18',
    name: 'Black Jeans',
    category: 'Pants',
    color: 'Black',
    style: 'Casual',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=400',
    lastWorn: new Date('2023-12-02'),
    timesWorn: 16,
  },
  {
    id: '19',
    name: 'Brown Loafers',
    category: 'Shoes',
    color: 'Brown',
    style: 'Business',
    image: 'https://images.unsplash.com/photo-1616103871875-9c8e1e911d5d?auto=format&fit=crop&w=400',
    lastWorn: new Date('2023-11-27'),
    timesWorn: 5,
  },
  {
    id: '20',
    name: 'Burgundy Scarf',
    category: 'Accessories',
    color: 'Red',
    style: 'Vintage',
    image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=400',
    lastWorn: new Date('2023-11-26'),
    timesWorn: 2,
  },
  {
    id: '21',
    name: 'Plaid Dress Shirt',
    category: 'Tops',
    color: 'Blue',
    style: 'Casual',
    image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=400',
    lastWorn: new Date('2023-12-04'),
    timesWorn: 7,
  },
  {
    id: '22',
    name: 'Dark Blue Jeans',
    category: 'Pants',
    color: 'Blue',
    style: 'Casual',
    image: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=400',
    lastWorn: new Date('2023-12-06'),
    timesWorn: 12,
  },
  {
    id: '23',
    name: 'Black Watch',
    category: 'Accessories',
    color: 'Black',
    style: 'Minimalist',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400',
    lastWorn: new Date('2023-12-15'),
    timesWorn: 25,
  },
  {
    id: '24',
    name: 'Cream Cardigan',
    category: 'Outerwear',
    color: 'White',
    style: 'Boho',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=400',
    lastWorn: new Date('2023-11-24'),
    timesWorn: 4,
  }
];

const dummyOutfits: Outfit[] = [
  {
    id: '1',
    name: 'Casual Weekend',
    items: [dummyItems[0], dummyItems[1], dummyItems[2]],
    occasion: 'Casual',
    favorite: true,
    createdAt: new Date('2023-12-10'),
  },
];

const dummyStylePreferences: StylePreference[] = [
  { name: 'Streetwear', selected: true },
  { name: 'Cottagecore', selected: false },
  { name: 'CEO Energy', selected: false },
  { name: 'Vintage', selected: true },
  { name: 'Minimalist', selected: true },
];

export const ClosetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ClothingItem[]>(dummyItems);
  const [outfits, setOutfits] = useState<Outfit[]>(dummyOutfits);
  const [stylePreferences, setStylePreferences] = useState<StylePreference[]>(dummyStylePreferences);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isStyleQuizComplete, setIsStyleQuizComplete] = useState(false);

  const addItem = (item: Omit<ClothingItem, 'id' | 'timesWorn'>) => {
    const newItem: ClothingItem = {
      ...item,
      id: `item_${Date.now()}`,
      timesWorn: 0,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const generateOutfit = (occasion: string = 'casual'): Outfit => {
    try {
      // Get items by category
      const tops = items.filter(item => item.category === 'Tops');
      const bottoms = items.filter(item => item.category === 'Pants');
      const shoes = items.filter(item => item.category === 'Shoes');
      const outerwear = items.filter(item => item.category === 'Outerwear');
      const accessories = items.filter(item => item.category === 'Accessories');

      // Randomly select items for the outfit
      const selectedItems: ClothingItem[] = [];
      
      // Only add items if they exist
      if (tops.length > 0) selectedItems.push(tops[Math.floor(Math.random() * tops.length)]);
      if (bottoms.length > 0) selectedItems.push(bottoms[Math.floor(Math.random() * bottoms.length)]);
      if (shoes.length > 0) selectedItems.push(shoes[Math.floor(Math.random() * shoes.length)]);
      
      // 50% chance to add outerwear if available
      if (outerwear.length > 0 && Math.random() > 0.5) {
        selectedItems.push(outerwear[Math.floor(Math.random() * outerwear.length)]);
      }
      
      // 30% chance to add accessories if available  
      if (accessories.length > 0 && Math.random() > 0.7) {
        selectedItems.push(accessories[Math.floor(Math.random() * accessories.length)]);
      }

      // If no items were selected, add a fallback item
      if (selectedItems.length === 0 && items.length > 0) {
        selectedItems.push(items[0]);
      }

      const outfitNames = [
        'Casual Comfort', 'Street Style', 'Office Ready', 'Weekend Vibes', 'Classic Look',
        'Modern Mix', 'Cozy Chic', 'Urban Edge', 'Effortless Style', 'Smart Casual'
      ];

      return {
        id: `outfit_${Date.now()}`,
        name: outfitNames[Math.floor(Math.random() * outfitNames.length)],
        items: selectedItems,
        occasion: occasion,
        favorite: false,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Error generating outfit:', error);
      // Return a fallback outfit
      return {
        id: `outfit_${Date.now()}`,
        name: 'Simple Look',
        items: items.slice(0, 3),
        occasion: occasion,
        favorite: false,
        createdAt: new Date(),
      };
    }
  };

  const addOutfit = (outfit: Omit<Outfit, 'id' | 'createdAt'>) => {
    const newOutfit: Outfit = {
      ...outfit,
      id: `outfit_${Date.now()}`,
      createdAt: new Date(),
    };
    setOutfits((prev) => [...prev, newOutfit]);
  };

  const removeOutfit = (id: string) => {
    setOutfits((prev) => prev.filter((outfit) => outfit.id !== id));
  };

  const favoriteOutfit = (id: string) => {
    setOutfits((prev) =>
      prev.map((outfit) =>
        outfit.id === id ? { ...outfit, favorite: !outfit.favorite } : outfit
      )
    );
  };

  const updateStylePreferences = (styles: StylePreference[]) => {
    setStylePreferences(styles);
  };

  const completeOnboarding = () => {
    setIsOnboardingComplete(true);
  };

  const completeStyleQuiz = () => {
    setIsStyleQuizComplete(true);
  };

  return (
    <ClosetContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        outfits,
        addOutfit,
        removeOutfit,
        favoriteOutfit,
        generateOutfit,
        stylePreferences,
        updateStylePreferences,
        uploadProgress,
        setUploadProgress,
        isOnboardingComplete,
        completeOnboarding,
        isStyleQuizComplete,
        completeStyleQuiz,
      }}
    >
      {children}
    </ClosetContext.Provider>
  );
};

export const useCloset = () => {
  const context = useContext(ClosetContext);
  if (context === undefined) {
    throw new Error('useCloset must be used within a ClosetProvider');
  }
  return context;
};