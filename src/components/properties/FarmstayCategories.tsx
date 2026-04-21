import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { Tractor, Fish, Home, Warehouse, Building, Tent, Users } from 'lucide-react';
import { FarmstaySubcategory, FARMSTAY_LABELS } from '@/types/database';
import { cn } from '@/lib/utils';
import haptics from '@/utils/haptics';

interface FarmstayCategoriesProps {
  selectedCategories: FarmstaySubcategory[];
  onCategoryChange: (categories: FarmstaySubcategory[]) => void;
}

const SUBCATEGORIES: { id: FarmstaySubcategory; icon: React.ElementType }[] = [
  { id: 'agrifarm', icon: Tractor },
  { id: 'aquafarm', icon: Fish },
  { id: 'homestay', icon: Home },
  { id: 'kubo_hut', icon: Warehouse },
  { id: 'farm_cottage', icon: Building },
  { id: 'camp_stay', icon: Tent },
  { id: 'dorm_shared', icon: Users },
];

export function FarmstayCategories({
  selectedCategories,
  onCategoryChange,
}: FarmstayCategoriesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);

  const handleCategoryClick = (categoryId: FarmstaySubcategory) => {
    if (isDragging) return;
    haptics.light();
    if (selectedCategories.includes(categoryId)) {
      onCategoryChange(selectedCategories.filter(c => c !== categoryId));
    } else {
      onCategoryChange([...selectedCategories, categoryId]);
    }
  };

  const updateScrollWidth = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      // Estimate content width based on number of items
      const contentWidth = SUBCATEGORIES.length * 76 + 16; // card width + gaps
      setScrollWidth(Math.max(0, contentWidth - containerWidth + 80));
    }
  }, []);

  useEffect(() => {
    updateScrollWidth();
    window.addEventListener('resize', updateScrollWidth);
    return () => window.removeEventListener('resize', updateScrollWidth);
  }, [updateScrollWidth]);

  return (
    <div className="py-2">
      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="flex items-center" ref={containerRef}>
          <div className="flex-1 overflow-hidden touch-pan-x relative">
            {/* Fade edge indicator */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            <motion.div
              drag="x"
              dragConstraints={{ left: -scrollWidth, right: 0 }}
              dragElastic={0.1}
              dragMomentum={true}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => {
                setTimeout(() => setIsDragging(false), 100);
              }}
              className="flex items-center gap-2 cursor-grab active:cursor-grabbing px-4"
              style={{ x }}
            >
              {SUBCATEGORIES.map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                const Icon = category.icon;
                return (
                  <motion.button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    whileTap={!isDragging ? { scale: 0.95 } : undefined}
                    className={cn(
                      'flex flex-col items-center justify-center gap-1 w-[68px] h-[58px] rounded-xl text-xs font-medium transition-all shrink-0',
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-soft'
                        : 'bg-card border border-border/50 text-foreground'
                    )}
                  >
                    <div className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center',
                      isSelected ? 'bg-primary-foreground/20' : 'bg-primary/10'
                    )}>
                      <Icon className={cn('h-3.5 w-3.5', isSelected ? 'text-primary-foreground' : 'text-primary')} />
                    </div>
                    <span className="text-[9px] leading-tight">{FARMSTAY_LABELS[category.id]}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-center gap-4 container">
        {SUBCATEGORIES.map((category) => {
          const isSelected = selectedCategories.includes(category.id);
          const Icon = category.icon;
          return (
            <motion.button
              key={`desktop-${category.id}`}
              onClick={() => handleCategoryClick(category.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all',
                isSelected 
                  ? 'bg-primary text-primary-foreground shadow-soft'
                  : 'bg-card border border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{FARMSTAY_LABELS[category.id]}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
