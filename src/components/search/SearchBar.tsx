import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Calendar, Users, MapPin } from 'lucide-react';
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
}

const POPULAR_LOCATIONS = [
  { name: 'Anywhere', description: 'Search all locations' },
  { name: 'Tagaytay', description: 'Cool highland farms' },
  { name: 'Batangas', description: 'Beachside retreats' },
  { name: 'La Union', description: 'Surf and farm' },
  { name: 'Baguio', description: 'Mountain fresh' },
  { name: 'Guimaras', description: 'Mango paradise' },
];

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
}: SearchBarProps) {
  const [activeSection, setActiveSection] = useState<'location' | 'dates' | 'guests' | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

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

  return (
    <div className={cn('relative', className)}>
      {/* Collapsed Search Bar */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-4 px-4 py-2 rounded-full border shadow-soft hover:shadow-soft-lg transition-shadow cursor-pointer bg-background"
            onClick={() => setIsExpanded(true)}
          >
            <span className="text-sm font-semibold border-r pr-4">
              {location || 'Anywhere'}
            </span>
            <span className="text-sm font-semibold border-r pr-4">
              {formatDateRange()}
            </span>
            <span className="text-sm text-muted-foreground">
              {guestCount > 1 ? `${guestCount} guests` : 'Add guests'}
            </span>
            <div className="bg-primary text-primary-foreground p-2 rounded-full">
              <Search className="h-4 w-4" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Search Bar */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => {
                setIsExpanded(false);
                setActiveSection(null);
              }}
            />

            {/* Search Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-4 inset-x-0 mx-auto z-50 w-[850px] max-w-[calc(100vw-2rem)]"
            >
              <div className="bg-background rounded-full border shadow-card flex items-center">
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
                  <PopoverContent className="w-[400px] max-w-[calc(100vw-2rem)] p-4 rounded-3xl shadow-card" align="center">
                    <div className="space-y-4">
                      <Input
                        placeholder="Search destinations"
                        value={location}
                        onChange={(e) => onLocationChange(e.target.value)}
                        className="rounded-xl"
                        autoFocus
                      />
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
                          Popular destinations
                        </p>
                        {POPULAR_LOCATIONS.map((loc) => (
                          <button
                            key={loc.name}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left"
                            onClick={() => {
                              onLocationChange(loc.name === 'Anywhere' ? '' : loc.name);
                              setActiveSection('dates');
                            }}
                          >
                            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                              <MapPin className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{loc.name}</p>
                              <p className="text-sm text-muted-foreground">{loc.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="h-8 w-px bg-border" />

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

                <div className="h-8 w-px bg-border" />

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
                <div className="pr-2">
                  <Button
                    onClick={handleSearch}
                    className="rounded-full h-12 px-4 gap-2 bg-primary hover:bg-primary/90"
                  >
                    <Search className="h-4 w-4" />
                    <span className="hidden sm:inline">Search</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
