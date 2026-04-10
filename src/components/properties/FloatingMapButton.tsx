import { useState, useEffect } from 'react';
import { Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import haptics from '@/utils/haptics';

interface FloatingMapButtonProps {
  threshold?: number;
}

export function FloatingMapButton({ threshold = 300 }: FloatingMapButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const handleClick = () => {
    haptics.selection();
    navigate('/map');
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-2 px-5 py-3',
        'bg-foreground text-background',
        'rounded-full shadow-lg',
        'hover:scale-105 active:scale-95 transition-all duration-300 ease-out',
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-5 pointer-events-none'
      )}
    >
      <Map className="h-4 w-4" />
      <span className="text-sm font-semibold">Show map</span>
    </button>
  );
}
