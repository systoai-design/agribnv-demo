import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, SlidersHorizontal, Map, Apple, Leaf, TreePine, Sparkles, UtensilsCrossed, Footprints } from 'lucide-react';
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

const CATEGORIES: { id: PropertyCategory; label: string; icon: React.ElementType }[] = [
  { id: 'fruit_picking', label: 'Fruit Farms', icon: Apple },
  { id: 'organic_farm', label: 'Organic', icon: Leaf },
  { id: 'livestock', label: 'Livestock', icon: TreePine },
  { id: 'wellness', label: 'Wellness', icon: Sparkles },
  { id: 'farm_to_table', label: 'Farm-to-Table', icon: UtensilsCrossed },
  { id: 'eco_trail', label: 'Eco Trails', icon: Footprints },
];

export function CategoryFilter({ selectedCategories, onCategoryChange, onFiltersClick, onMapClick }: CategoryFilterProps) {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const handleMapClick = () => {
    haptics.medium();
    if (onMapClick) {
      onMapClick();
    } else {
      navigate('/map');
    }
  };

  const handleCategoryClick = (categoryId: PropertyCategory) => {
    haptics.light();
    if (selectedCategories.includes(categoryId)) {
      onCategoryChange(selectedCategories.filter(c => c !== categoryId));
    } else {
      onCategoryChange([...selectedCategories, categoryId]);
    }
  };

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

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
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  return (
    <div className="sticky top-16 md:top-20 z-40 bg-background py-3 md:py-4 border-b border-border/30">
      <div className="container">
        <div className="flex items-center gap-3">
          {/* Map Button - Mobile Only */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleMapClick}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border/50 bg-card text-sm font-medium text-foreground shadow-sm shrink-0"
          >
            <Map className="h-4 w-4" />
            <span>Map</span>
          </motion.button>

          {/* Scroll Left Button */}
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

          {/* Categories - Pill Style for Mobile, Circular for Desktop */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex items-center gap-2 md:gap-6 overflow-x-auto scrollbar-hide flex-1"
          >
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategories.includes(category.id);
              const Icon = category.icon;
              return (
                <motion.button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    // Mobile: Pill style
                    'md:hidden flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0',
                    isSelected 
                      ? 'bg-foreground text-background' 
                      : 'bg-card border border-border/50 text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                </motion.button>
              );
            })}
            
            {/* Desktop: Circular Icon Style */}
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategories.includes(category.id);
              const Icon = category.icon;
              return (
                <motion.button
                  key={`desktop-${category.id}`}
                  onClick={() => toggleCategory(category.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden md:flex flex-col items-center gap-2 min-w-[72px]"
                >
                  <div 
                    className={cn(
                      'w-14 h-14 rounded-full flex items-center justify-center transition-all',
                      isSelected 
                        ? 'bg-primary text-primary-foreground shadow-soft' 
                        : 'bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                    )}
                  >
                    <Icon className="h-6 w-6" />
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

          {/* Scroll Right Button */}
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
        </div>
      </div>
    </div>
  );
}
