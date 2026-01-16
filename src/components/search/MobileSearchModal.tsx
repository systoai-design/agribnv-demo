import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MapPin, ChevronRight, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: string;
  onLocationChange: (location: string) => void;
  dateRange: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  guestCount: number;
  onGuestCountChange: (count: number) => void;
  onSearch?: () => void;
}

const POPULAR_LOCATIONS = [
  { name: 'Anywhere', description: 'Search all locations' },
  { name: 'Guimaras', description: 'Mango paradise' },
  { name: 'Tagaytay', description: 'Cool highland farms' },
  { name: 'Batangas', description: 'Beachside retreats' },
  { name: 'La Union', description: 'Surf and farm' },
  { name: 'Baguio', description: 'Mountain fresh' },
];

type ActiveStep = 'where' | 'when' | 'who' | null;

export function MobileSearchModal({
  isOpen,
  onClose,
  location,
  onLocationChange,
  dateRange,
  onDateRangeChange,
  guestCount,
  onGuestCountChange,
  onSearch,
}: MobileSearchModalProps) {
  const [activeStep, setActiveStep] = useState<ActiveStep>('where');

  const formatDateRange = () => {
    if (!dateRange.from && !dateRange.to) return 'Add dates';
    if (dateRange.from && !dateRange.to) return format(dateRange.from, 'MMM d');
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`;
    }
    return 'Add dates';
  };

  const handleSearch = () => {
    onSearch?.();
    onClose();
  };

  const handleClear = () => {
    onLocationChange('');
    onDateRangeChange({ from: undefined, to: undefined });
    onGuestCountChange(1);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-background overflow-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-card z-10 p-4 flex items-center justify-between border-b border-border/50 shadow-soft">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full text-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </Button>
              <div className="flex gap-6">
                <button className="text-sm font-semibold text-primary border-b-2 border-primary pb-1">
                  Stays
                </button>
                <button className="text-sm text-muted-foreground pb-1 hover:text-foreground">
                  Experiences
                </button>
              </div>
              <div className="w-10" />
            </div>

            {/* Search Sections */}
            <div className="p-4 space-y-3 pb-32">
              {/* Where */}
              <motion.div
                className={cn(
                  'bg-card border border-border/50 rounded-2xl overflow-hidden transition-all',
                  activeStep === 'where' ? 'shadow-card' : ''
                )}
              >
                <button
                  className="w-full p-4 flex items-center justify-between"
                  onClick={() => setActiveStep(activeStep === 'where' ? null : 'where')}
                >
                  <span className="text-sm text-muted-foreground font-medium">Where</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{location || "I'm flexible"}</span>
                    <ChevronDown className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      activeStep === 'where' && "rotate-180"
                    )} />
                  </div>
                </button>

                <AnimatePresence>
                  {activeStep === 'where' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-4">
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="Search destinations"
                            value={location}
                            onChange={(e) => onLocationChange(e.target.value)}
                            className="pl-12 h-14 rounded-xl border-2 border-border focus:border-primary bg-muted/30"
                            autoFocus
                          />
                        </div>

                        <div className="space-y-1">
                          {POPULAR_LOCATIONS.map((loc) => (
                            <button
                              key={loc.name}
                              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-sage/20 transition-colors text-left"
                              onClick={() => {
                                onLocationChange(loc.name === 'Anywhere' ? '' : loc.name);
                                setActiveStep('when');
                              }}
                            >
                              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <MapPin className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground truncate">{loc.name}</p>
                                <p className="text-sm text-muted-foreground truncate">{loc.description}</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* When */}
              <motion.div
                className={cn(
                  'bg-card border border-border/50 rounded-2xl overflow-hidden transition-all',
                  activeStep === 'when' ? 'shadow-card' : ''
                )}
              >
                <button
                  className="w-full p-4 flex items-center justify-between"
                  onClick={() => setActiveStep(activeStep === 'when' ? null : 'when')}
                >
                  <span className="text-sm text-muted-foreground font-medium">When</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{formatDateRange()}</span>
                    <ChevronDown className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      activeStep === 'when' && "rotate-180"
                    )} />
                  </div>
                </button>

                <AnimatePresence>
                  {activeStep === 'when' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-2 pb-4 overflow-x-auto">
                        <div className="flex gap-2 mb-4 px-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full border-border/50 text-foreground"
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
                          numberOfMonths={1}
                          className="rounded-xl mx-auto"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Who */}
              <motion.div
                className={cn(
                  'bg-card border border-border/50 rounded-2xl overflow-hidden transition-all',
                  activeStep === 'who' ? 'shadow-card' : ''
                )}
              >
                <button
                  className="w-full p-4 flex items-center justify-between"
                  onClick={() => setActiveStep(activeStep === 'who' ? null : 'who')}
                >
                  <span className="text-sm text-muted-foreground font-medium">Who</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {guestCount > 1 ? `${guestCount} guests` : 'Add guests'}
                    </span>
                    <ChevronDown className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      activeStep === 'who' && "rotate-180"
                    )} />
                  </div>
                </button>

                <AnimatePresence>
                  {activeStep === 'who' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4">
                        <div className="flex items-center justify-between p-4 bg-sage/20 rounded-xl">
                          <div>
                            <p className="font-semibold text-foreground">Guests</p>
                            <p className="text-sm text-muted-foreground">How many guests?</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <Button
                              variant="outline"
                              size="icon"
                              className="rounded-full h-10 w-10 border-primary/30 text-foreground"
                              onClick={() => onGuestCountChange(Math.max(1, guestCount - 1))}
                              disabled={guestCount <= 1}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center font-bold text-lg text-foreground">{guestCount}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="rounded-full h-10 w-10 border-primary/30 text-foreground"
                              onClick={() => onGuestCountChange(guestCount + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border/50 safe-area-pb">
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="ghost"
                  onClick={handleClear}
                  className="underline font-semibold text-foreground hover:text-primary"
                >
                  Clear all
                </Button>
                <Button
                  onClick={handleSearch}
                  className="rounded-xl px-8 h-12 gap-2 bg-primary hover:bg-primary/90 font-semibold shadow-soft"
                >
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
