import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PropertyCategory, CATEGORY_LABELS } from '@/types/database';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  selectedCategories: PropertyCategory[];
  onCategoryChange: (categories: PropertyCategory[]) => void;
  onFiltersClick?: () => void;
}

const CATEGORIES: { id: PropertyCategory; label: string; icon: string }[] = [
  { id: 'fruit_picking', label: 'Fruit Farms', icon: '🍎' },
  { id: 'organic_farm', label: 'Organic', icon: '🌱' },
  { id: 'livestock', label: 'Livestock', icon: '🐄' },
  { id: 'wellness', label: 'Wellness', icon: '🧘' },
  { id: 'farm_to_table', label: 'Farm-to-Table', icon: '🍽️' },
  { id: 'eco_trail', label: 'Eco Trails', icon: '🥾' },
];

export function CategoryFilter({ selectedCategories, onCategoryChange, onFiltersClick }: CategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
      const scrollAmount = 300;
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
    <div className="sticky top-20 z-40 bg-background py-4 border-b">
      <div className="container">
        <div className="flex items-center gap-4">
          {/* Scroll Left Button */}
          {canScrollLeft && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute left-0 z-10 pl-4 pr-8 bg-gradient-to-r from-background via-background to-transparent"
            >
              <Button
                variant="outline"
                size="icon"
                className="rounded-full shadow-soft h-8 w-8"
                onClick={() => scroll('left')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* Categories */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex items-center gap-8 overflow-x-auto scrollbar-hide flex-1 px-2"
          >
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategories.includes(category.id);
              return (
                <motion.button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'flex flex-col items-center gap-2 py-2 px-1 min-w-fit transition-all',
                    'border-b-2',
                    isSelected 
                      ? 'border-foreground text-foreground' 
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                  )}
                >
                  <span className="text-2xl">{category.icon}</span>
                  <span className="text-xs font-medium whitespace-nowrap">{category.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          {canScrollRight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute right-24 z-10 pl-8 pr-4 bg-gradient-to-l from-background via-background to-transparent"
            >
              <Button
                variant="outline"
                size="icon"
                className="rounded-full shadow-soft h-8 w-8"
                onClick={() => scroll('right')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* Filters Button */}
          <Button
            variant="outline"
            className="shrink-0 rounded-xl gap-2 font-medium"
            onClick={onFiltersClick}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
