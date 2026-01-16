import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Navigation } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useEscapeKey } from '@/hooks/useEscapeKey';

interface SearchBarProps {
  location: string;
  onLocationChange: (location: string) => void;
  dateRange: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  guestCount: number;
  onGuestCountChange: (count: number) => void;
  onSearch?: () => void;
  className?: string;
  isCompact?: boolean;
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

// Airbnb-style grid icon component
const GridIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 32 32" 
    className={className}
    fill="currentColor"
  >
    <path d="M4 4h10v10H4zM18 4h10v10H18zM4 18h10v10H4zM18 18h10v10H18z" />
  </svg>
);

const SUGGESTED_DESTINATIONS = [
  { 
    name: 'Nearby', 
    description: "Find what's around you",
    iconType: 'navigation' as const,
  },
  { 
    name: 'Tagaytay, Philippines', 
    description: 'Cool highland farms',
    iconType: 'grid' as const,
  },
  { 
    name: 'Batangas, Philippines', 
    description: 'Beachside retreats',
    iconType: 'grid' as const,
  },
  { 
    name: 'La Union, Philippines', 
    description: 'Surf and farm',
    iconType: 'grid' as const,
  },
  { 
    name: 'Baguio, Philippines', 
    description: 'Mountain fresh',
    iconType: 'grid' as const,
  },
  { 
    name: 'Guimaras, Philippines', 
    description: 'Mango paradise',
    iconType: 'grid' as const,
  },
];

const springTransition = {
  type: 'spring',
  damping: 28,
  stiffness: 350,
  mass: 0.8,
};

export function SearchBar({
  location,
  onLocationChange,
  dateRange,
  onDateRangeChange,
  guestCount,
  onGuestCountChange,
  onSearch,
  className,
  isCompact = false,
  isExpanded: externalExpanded,
  onExpandedChange,
}: SearchBarProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'location' | 'dates' | 'guests' | null>(null);

  // Use external state if provided, otherwise use internal
  const isExpanded = externalExpanded ?? internalExpanded;
  const setIsExpanded = onExpandedChange ?? setInternalExpanded;

  // ESC key to collapse expanded search
  const collapseSearch = useCallback(() => {
    setIsExpanded(false);
    setActiveSection(null);
  }, [setIsExpanded]);
  useEscapeKey(collapseSearch, isExpanded);

  const handleSectionClick = (section: 'location' | 'dates' | 'guests') => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
    setActiveSection(section);
  };

  const handleSearch = () => {
    setIsExpanded(false);
    setActiveSection(null);
    onSearch?.();
  };

  const formatDateRange = () => {
    if (!dateRange.from && !dateRange.to) return 'Any week';
    if (dateRange.from && !dateRange.to) return format(dateRange.from, 'MMM d');
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`;
    }
    return 'Any week';
  };

  // Compact version - simple pill
  if (isCompact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-full border shadow-soft bg-background cursor-pointer hover:shadow-soft-lg transition-shadow',
          className
        )}
        onClick={() => setIsExpanded(true)}
      >
        <Search className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Start your search</span>
      </motion.div>
    );
  }

  // Collapsed search bar - shown when not expanded
  if (!isExpanded) {
    return (
      <div className={cn('relative', className)}>
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={springTransition}
          className="flex items-center rounded-full border border-border/60 shadow-lg shadow-black/[0.08] hover:shadow-xl hover:shadow-black/[0.12] transition-all duration-200 cursor-pointer bg-background"
        >
          {/* Where Section */}
          <button
            className="flex-1 min-w-0 px-6 py-3 text-left rounded-full hover:bg-muted/40 transition-colors"
            onClick={() => {
              setIsExpanded(true);
              setActiveSection('location');
            }}
          >
            <p className="text-[12px] font-semibold text-foreground tracking-tight">Where</p>
            <p className="text-[14px] text-muted-foreground truncate">
              {location || 'Search destinations'}
            </p>
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-border/70 shrink-0" />

          {/* When Section */}
          <button
            className="flex-1 min-w-0 px-6 py-3 text-left rounded-full hover:bg-muted/40 transition-colors"
            onClick={() => {
              setIsExpanded(true);
              setActiveSection('dates');
            }}
          >
            <p className="text-[12px] font-semibold text-foreground tracking-tight">When</p>
            <p className="text-[14px] text-muted-foreground truncate">
              {formatDateRange()}
            </p>
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-border/70 shrink-0" />

          {/* Who Section */}
          <button
            className="flex-1 min-w-0 px-5 py-3 text-left rounded-full hover:bg-muted/40 transition-colors"
            onClick={() => {
              setIsExpanded(true);
              setActiveSection('guests');
            }}
          >
            <p className="text-[12px] font-semibold text-foreground tracking-tight">Who</p>
            <p className="text-[14px] text-muted-foreground truncate">
              {guestCount > 1 ? `${guestCount} guests` : 'Add guests'}
            </p>
          </button>

          {/* Search Button */}
          <div className="pr-2 shrink-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-primary/90 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
              onClick={(e) => {
                e.stopPropagation();
                onSearch?.();
              }}
            >
              <Search className="h-4 w-4 text-primary-foreground" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Expanded search bar - shown when expanded
  return (
    <div className={cn('relative w-[850px] max-w-full', className)}>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={springTransition}
        className="bg-background rounded-full border border-border/60 shadow-lg shadow-black/[0.08] flex items-center"
      >
        {/* Location */}
        <Popover open={activeSection === 'location'} onOpenChange={(open) => setActiveSection(open ? 'location' : null)}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                'flex-1 px-6 py-4 text-left rounded-full transition-colors',
                activeSection === 'location' ? 'bg-background shadow-soft' : 'hover:bg-muted/50'
              )}
              onClick={() => handleSectionClick('location')}
            >
              <p className="text-xs font-semibold">Where</p>
              <p className={cn('text-sm', location ? 'text-foreground' : 'text-muted-foreground')}>
                {location || 'Search destinations'}
              </p>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] max-w-[calc(100vw-2rem)] p-6 rounded-3xl shadow-card border-0" align="center" sideOffset={12}>
            <div className="space-y-5">
              <Input
                placeholder="Search destinations"
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                className="rounded-xl border-muted-foreground/20 focus:border-foreground"
                autoFocus
              />
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground px-1">
                  Suggested destinations
                </p>
                <div className="space-y-1">
                  {SUGGESTED_DESTINATIONS.map((loc, index) => (
                    <motion.button
                      key={loc.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted/60 transition-colors text-left group"
                      onClick={() => {
                        onLocationChange(loc.name === 'Nearby' ? '' : loc.name.split(',')[0]);
                        setActiveSection('dates');
                      }}
                    >
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                        loc.iconType === 'navigation' 
                          ? "bg-muted" 
                          : "bg-gradient-to-br from-rose-400 to-rose-500"
                      )}>
                        {loc.iconType === 'navigation' ? (
                          <Navigation className="h-5 w-5 text-foreground" />
                        ) : (
                          <GridIcon className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{loc.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{loc.description}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="h-8 w-px bg-border/70" />

        {/* Dates */}
        <Popover open={activeSection === 'dates'} onOpenChange={(open) => setActiveSection(open ? 'dates' : null)}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                'flex-1 px-6 py-4 text-left rounded-full transition-colors',
                activeSection === 'dates' ? 'bg-background shadow-soft' : 'hover:bg-muted/50'
              )}
              onClick={() => handleSectionClick('dates')}
            >
              <p className="text-xs font-semibold">Check in - Check out</p>
              <p className={cn('text-sm', dateRange.from ? 'text-foreground' : 'text-muted-foreground')}>
                {formatDateRange()}
              </p>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] p-4 rounded-3xl shadow-card overflow-x-auto" align="center">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => onDateRangeChange({ from: undefined, to: undefined })}
                >
                  Clear dates
                </Button>
              </div>
              <CalendarComponent
                mode="range"
                selected={dateRange}
                onSelect={(range) => onDateRangeChange({ from: range?.from, to: range?.to })}
                disabled={{ before: new Date() }}
                numberOfMonths={2}
                className="rounded-xl"
              />
            </div>
          </PopoverContent>
        </Popover>

        <div className="h-8 w-px bg-border/70" />

        {/* Guests */}
        <Popover open={activeSection === 'guests'} onOpenChange={(open) => setActiveSection(open ? 'guests' : null)}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                'flex-1 px-6 py-4 text-left rounded-full transition-colors',
                activeSection === 'guests' ? 'bg-background shadow-soft' : 'hover:bg-muted/50'
              )}
              onClick={() => handleSectionClick('guests')}
            >
              <p className="text-xs font-semibold">Who</p>
              <p className={cn('text-sm', guestCount > 1 ? 'text-foreground' : 'text-muted-foreground')}>
                {guestCount > 1 ? `${guestCount} guests` : 'Add guests'}
              </p>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-6 rounded-3xl shadow-card" align="end">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Guests</p>
                <p className="text-sm text-muted-foreground">How many guests?</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-8 w-8"
                  onClick={() => onGuestCountChange(Math.max(1, guestCount - 1))}
                  disabled={guestCount <= 1}
                >
                  -
                </Button>
                <span className="w-6 text-center font-semibold">{guestCount}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-8 w-8"
                  onClick={() => onGuestCountChange(guestCount + 1)}
                >
                  +
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Search Button */}
        <div className="pr-2 shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch}
            className="h-12 px-5 rounded-full bg-gradient-to-r from-primary to-primary/90 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-shadow"
          >
            <Search className="h-4 w-4 text-primary-foreground" />
            <span className="text-primary-foreground font-medium hidden sm:inline">Search</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
