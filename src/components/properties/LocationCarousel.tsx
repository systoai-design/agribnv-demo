import { useRef, useState, useEffect } from 'react';
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
    <section className="relative animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-4 md:px-0">
        <h2 className="text-lg md:text-xl font-semibold text-foreground">{title}</h2>
        {onShowAll && hasMore && (
          <button
            onClick={onShowAll}
            className="text-xs font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
          >
            Show all
          </button>
        )}
      </div>

      {/* Carousel */}
      <div className="relative group">
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-background shadow-lg rounded-full items-center justify-center border opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-background shadow-lg rounded-full items-center justify-center border opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
            style={{ transform: 'translate(50%, -50%)' }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-[5] pointer-events-none md:hidden" />
        )}

        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-[5] pointer-events-none md:hidden" />
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth px-4 md:px-0 pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayedProperties.map((property, index) => (
            <div
              key={property.id}
              className="snap-start shrink-0 w-[calc(48%-6px)] sm:w-[calc(33.333%-8px)] md:w-[calc(25%-9px)] lg:w-[calc(20%-10px)] xl:w-[calc(16.666%-10px)]"
            >
              <PropertyCard property={property} index={index} />
            </div>
          ))}

          {hasMore && onShowAll && (
            <div className="snap-start shrink-0 w-[calc(48%-6px)] sm:w-[calc(33.333%-8px)] md:w-[calc(25%-9px)] lg:w-[calc(20%-10px)] xl:w-[calc(16.666%-10px)]">
              <button
                onClick={onShowAll}
                className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-muted-foreground/25 
                           flex flex-col items-center justify-center gap-2 
                           hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center 
                                group-hover:bg-primary/20 transition-colors">
                  <ChevronRight className="w-5 h-5 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm text-foreground">Show all</p>
                  <p className="text-xs text-muted-foreground">{remainingCount}+ stays</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LocationCarousel;
