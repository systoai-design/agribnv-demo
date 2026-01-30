import { useState, useRef, useCallback } from 'react';

interface SwipeConfig {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

export function useSwipeGesture({
  threshold = 50,
  onSwipeLeft,
  onSwipeRight,
}: SwipeConfig): SwipeHandlers {
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    setIsSwiping(true);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return;
    touchEndX.current = e.touches[0].clientX;
  }, [isSwiping]);

  const onTouchEnd = useCallback(() => {
    if (!isSwiping) return;
    setIsSwiping(false);

    const diff = touchStartX.current - touchEndX.current;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        onSwipeLeft?.();
      } else {
        onSwipeRight?.();
      }
    }
  }, [isSwiping, threshold, onSwipeLeft, onSwipeRight]);

  return { onTouchStart, onTouchMove, onTouchEnd };
}
