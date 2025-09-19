
import { useState, useRef } from 'react';
import { Outfit } from '@/contexts/ClosetContext';
import { OutfitCard } from './OutfitCard';

interface SwipeableOutfitProps {
  outfit: Outfit;
  onSwipeLeft: (outfit: Outfit) => void;
  onSwipeRight: (outfit: Outfit) => void;
}

export function SwipeableOutfit({ outfit, onSwipeLeft, onSwipeRight }: SwipeableOutfitProps) {
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!cardRef.current) return;
    
    currentXRef.current = e.touches[0].clientX;
    const deltaX = currentXRef.current - startXRef.current;
    
    // Apply transformation
    cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.03}deg)`;
    
    // Visual feedback based on swipe direction
    if (deltaX > 50) {
      setSwipeDirection('right');
    } else if (deltaX < -50) {
      setSwipeDirection('left');
    } else {
      setSwipeDirection(null);
    }
  };

  const handleTouchEnd = () => {
    if (!cardRef.current) return;
    
    const deltaX = currentXRef.current - startXRef.current;
    
    // Determine if swipe was significant enough
    if (deltaX > 100) {
      // Swipe right - like
      completeSwipeAnimation('right');
      setTimeout(() => onSwipeRight(outfit), 300);
    } else if (deltaX < -100) {
      // Swipe left - dislike
      completeSwipeAnimation('left');
      setTimeout(() => onSwipeLeft(outfit), 300);
    } else {
      // Reset if swipe wasn't significant
      resetCardPosition();
    }
  };

  const completeSwipeAnimation = (direction: 'left' | 'right') => {
    if (!cardRef.current) return;
    
    // Animate card off-screen
    const translateX = direction === 'right' ? 1000 : -1000;
    const rotation = direction === 'right' ? 30 : -30;
    
    cardRef.current.style.transition = 'transform 0.3s ease';
    cardRef.current.style.transform = `translateX(${translateX}px) rotate(${rotation}deg)`;
  };

  const resetCardPosition = () => {
    if (!cardRef.current) return;
    
    cardRef.current.style.transition = 'transform 0.3s ease';
    cardRef.current.style.transform = 'translateX(0) rotate(0)';
    
    // Reset state
    setSwipeDirection(null);
    
    // Clear transition after animation completes
    setTimeout(() => {
      if (cardRef.current) {
        cardRef.current.style.transition = '';
      }
    }, 300);
  };

  return (
    <div 
      ref={cardRef}
      className="touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <OutfitCard 
        outfit={outfit} 
        className={`
          ${swipeDirection === 'right' ? 'border-2 border-green-500' : ''}
          ${swipeDirection === 'left' ? 'border-2 border-red-500' : ''}
        `}
        onSkip={() => onSwipeLeft(outfit)}
        onLike={() => onSwipeRight(outfit)}
      />
    </div>
  );
}
