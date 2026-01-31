import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={handleClick}
          className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50
                     flex items-center gap-2 px-5 py-3 
                     bg-foreground text-background
                     rounded-full shadow-lg
                     hover:scale-105 active:scale-95 transition-transform"
        >
          <Map className="h-4 w-4" />
          <span className="text-sm font-semibold">Show map</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
