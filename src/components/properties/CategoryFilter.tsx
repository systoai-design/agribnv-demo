import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue } from 'framer-motion';
import { ChevronLeft, ChevronRight, SlidersHorizontal, Map, Home, Fish, Tent, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PropertyCategory } from '@/types/database';
import { cn } from '@/lib/utils';
import haptics from '@/utils/haptics';

interface CategoryFilterProps {
  selectedCategories: PropertyCategory[];
  onCategoryChange: (categories: PropertyCategory[]) => void;
  onFiltersClick?: () => void;
  onMapClick?: () => void;
}

// Updated categories with new labels matching mockup
const CATEGORIES: { id: PropertyCategory; label: string; icon: React.ElementType }[] = [
  { id: 'organic_farm', label: 'Farmstay', icon: Home },
  { id: 'livestock', label: 'Agri-aqua', icon: Fish },
  { id: 'eco_trail', label: 'Campstay', icon: Tent },
  { id: 'wellness', label: 'Agri-experience', icon: Sparkles },
];

export function CategoryFilter({ selectedCategories, onCategoryChange, onFiltersClick, onMapClick }: CategoryFilterProps) {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollWidth, setScrollWidth] = useState(0);
  
  // Drag state for mobile
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleMapClick = () => {
    haptics.medium();
    if (onMapClick) {
      onMapClick();
    } else {
      navigate('/map');
    }
  };

  const handleCategoryClick = (categoryId: PropertyCategory) => {
    if (isDragging) return;
    haptics.light();
    if (selectedCategories.includes(categoryId)) {
      onCategoryChange(selectedCategories.filter(c => c !== categoryId));
    } else {
      onCategoryChange([...selectedCategories, categoryId]);
    }
  };

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth: sw, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < sw - clientWidth - 10);
    }
  }, []);

  const updateScrollWidth = useCallback(() => {
    if (containerRef.current && scrollRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const contentWidth = scrollRef.current.scrollWidth;
      setScrollWidth(Math.max(0, contentWidth - containerWidth + 100));
    }
  }, []);

  useEffect(() => {
    checkScroll();
    updateScrollWidth();
    window.addEventListener('resize', checkScroll);
    window.addEventListener('resize', updateScrollWidth);
    return () => {
      window.removeEventListener('resize', checkScroll);
      window.removeEventListener('resize', updateScrollWidth);
    };
  }, [checkScroll, updateScrollWidth]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300);
    }
  };

  const toggleCategory = (category: PropertyCategory) => {
    if (isDragging) return;
    haptics.light();
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  return (
    <div className="sticky top-0 md:top-20 z-40 bg-background py-3 md:py-4">
      <div className="container">
        <div className="flex items-center gap-3" ref={containerRef}>
          {/* Scroll Left Button - Desktop */}
          {canScrollLeft && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hidden md:block absolute left-0 z-10 pl-4 pr-8 bg-gradient-to-r from-background via-background to-transparent"
            >
              <Button
                variant="outline"
                size="icon"
                className="rounded-full shadow-soft h-8 w-8 border-border/50"
                onClick={() => scroll('left')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* Mobile: Square Category Cards */}
          <div className="md:hidden flex-1 overflow-hidden touch-pan-x">
            <motion.div
              ref={scrollRef}
              drag="x"
              dragConstraints={{ left: -scrollWidth, right: 0 }}
              dragElastic={0.1}
              dragMomentum={true}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => {
                setTimeout(() => setIsDragging(false), 100);
              }}
              className="flex items-center gap-3 cursor-grab active:cursor-grabbing"
              style={{ x }}
            >
              {CATEGORIES.map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                const Icon = category.icon;
                return (
                  <motion.button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    whileTap={!isDragging ? { scale: 0.95 } : undefined}
                    className={cn(
                      'flex flex-col items-center justify-center gap-1.5 w-20 h-20 rounded-2xl text-xs font-medium transition-all shrink-0',
                      isSelected 
                        ? 'bg-primary text-primary-foreground shadow-soft' 
                        : 'bg-card border border-border/50 text-foreground'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      isSelected ? 'bg-primary-foreground/20' : 'bg-primary/10'
                    )}>
                      <Icon className={cn('h-5 w-5', isSelected ? 'text-primary-foreground' : 'text-primary')} />
                    </div>
                    <span className="text-[11px]">{category.label}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>

          {/* Desktop: Scrollable Categories */}
          <div
            className="hidden md:flex items-center gap-6 overflow-x-auto scrollbar-hide flex-1"
            onScroll={checkScroll}
          >
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategories.includes(category.id);
              const Icon = category.icon;
              return (
                <motion.button
                  key={`desktop-${category.id}`}
                  onClick={() => toggleCategory(category.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-2 min-w-[80px]"
                >
                  <div 
                    className={cn(
                      'w-16 h-16 rounded-2xl flex items-center justify-center transition-all',
                      isSelected 
                        ? 'bg-primary text-primary-foreground shadow-soft'
                        : 'bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                    )}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <span className={cn(
                    'text-xs font-medium whitespace-nowrap transition-colors',
                    isSelected ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {category.label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Scroll Right Button - Desktop */}
          {canScrollRight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hidden md:block absolute right-20 z-10 pl-8 pr-4 bg-gradient-to-l from-background via-background to-transparent"
            >
              <Button
                variant="outline"
                size="icon"
                className="rounded-full shadow-soft h-8 w-8 border-border/50"
                onClick={() => scroll('right')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* Filters Button */}
          <Button
            variant="outline"
            className="shrink-0 rounded-xl gap-2 font-medium border-border/50 hover:border-primary/50"
            onClick={onFiltersClick}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </Button>

          {/* Map Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleMapClick}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border/50 bg-card text-sm font-medium text-foreground shadow-sm shrink-0"
          >
            <Map className="h-4 w-4" />
            <span className="hidden sm:inline">Map</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
