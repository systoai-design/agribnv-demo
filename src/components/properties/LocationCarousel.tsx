import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Property } from '@/types/database';
import { PropertyCard } from './PropertyCard';

interface LocationCarouselProps {
  title: string;
  properties: Property[];
  onShowAll?: () => void;
}

const MAX_VISIBLE = 8;

const LocationCarousel = ({ title, properties, onShowAll }: LocationCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const displayedProperties = properties.slice(0, MAX_VISIBLE);
  const remainingCount = properties.length - MAX_VISIBLE;
  const hasMore = remainingCount > 0;

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        scrollEl.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [properties]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (properties.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4 md:px-0">
        <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
        {onShowAll && hasMore && (
          <button
            onClick={onShowAll}
            className="text-sm font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
          >
            Show all
          </button>
        )}
      </div>

      {/* Carousel */}
      <div className="relative group">
        {/* Left scroll button - desktop only */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-background shadow-lg rounded-full items-center justify-center border opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Right scroll button - desktop only */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-background shadow-lg rounded-full items-center justify-center border opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
            style={{ transform: 'translate(50%, -50%)' }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Gradient fade - left */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-[5] pointer-events-none md:hidden" />
        )}

        {/* Gradient fade - right */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-[5] pointer-events-none md:hidden" />
        )}

        {/* Scrollable container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth px-4 md:px-0 pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayedProperties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="snap-start shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)] xl:w-[calc(16.666%-13px)] 2xl:w-[calc(12.5%-14px)]"
            >
              <PropertyCard property={property} index={index} />
            </motion.div>
          ))}

          {/* Show All card - appears after 8th property when there are more */}
          {hasMore && onShowAll && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: MAX_VISIBLE * 0.05, duration: 0.3 }}
              className="snap-start shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)] xl:w-[calc(16.666%-13px)] 2xl:w-[calc(12.5%-14px)]"
            >
              <button
                onClick={onShowAll}
                className="w-full aspect-[3/4] rounded-xl border-2 border-dashed border-muted-foreground/30 
                           flex flex-col items-center justify-center gap-3 
                           hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center 
                                group-hover:bg-primary/20 transition-colors">
                  <ChevronRight className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">Show all</p>
                  <p className="text-sm text-muted-foreground">{remainingCount}+ stays</p>
                </div>
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default LocationCarousel;
