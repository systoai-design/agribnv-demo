import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MapPin, ChevronRight, Home, Compass, Sparkles } from 'lucide-react';
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

const SUGGESTED_DESTINATIONS = [
  { name: 'Nearby', description: 'Find what\'s around you', emoji: '📍' },
  { name: 'Tagaytay', description: 'Because your wishlist has stays', emoji: '🏔️' },
  { name: 'Baguio', description: 'Great for a weekend getaway', emoji: '🌲' },
  { name: 'Batangas', description: 'For sights like Taal Volcano', emoji: '🌋' },
  { name: 'La Union', description: 'Surf and farm adventures', emoji: '🏄' },
  { name: 'Guimaras', description: 'Mango paradise', emoji: '🥭' },
];

type ActiveStep = 'where' | 'when' | 'who' | null;

const springTransition = { type: 'spring', damping: 30, stiffness: 400 };
const expandTransition = { type: 'spring', damping: 25, stiffness: 350 };

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
  const [activeTab, setActiveTab] = useState<'homes' | 'experiences' | 'services'>('homes');

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

  const tabs = [
    { id: 'homes' as const, label: 'Homes', icon: Home },
    { id: 'experiences' as const, label: 'Experiences', icon: Compass },
    { id: 'services' as const, label: 'Services', icon: Sparkles },
  ];

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
            transition={springTransition}
            className="fixed inset-0 z-50 bg-background overflow-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-card z-10 px-4 pt-4 pb-3 border-b border-border/30">
              {/* Close Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="absolute left-4 top-4 p-2 rounded-full border border-border/50 bg-card shadow-sm"
              >
                <X className="h-4 w-4 text-foreground" />
              </motion.button>

              {/* Tabs with Icons */}
              <div className="flex justify-center gap-8 pt-10 pb-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      whileTap={{ scale: 0.95 }}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className={cn(
                        'p-2 rounded-full transition-colors',
                        isActive ? 'bg-primary/10' : ''
                      )}>
                        <Icon className={cn(
                          'h-5 w-5 transition-colors',
                          isActive ? 'text-primary' : 'text-muted-foreground'
                        )} />
                      </div>
                      <span className={cn(
                        'text-xs font-medium transition-colors',
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      )}>
                        {tab.label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="activeSearchTab"
                          className="absolute bottom-0 h-0.5 w-16 bg-primary rounded-full"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Search Sections */}
            <div className="p-4 space-y-3 pb-32">
              {/* Where Section */}
              <motion.div
                layout
                className={cn(
                  'bg-card border rounded-3xl overflow-hidden transition-all',
                  activeStep === 'where' 
                    ? 'border-border shadow-lg' 
                    : 'border-border/30'
                )}
              >
                <motion.button
                  className="w-full p-5 flex items-center justify-between"
                  onClick={() => setActiveStep(activeStep === 'where' ? null : 'where')}
                  whileTap={{ scale: 0.995 }}
                >
                  <span className={cn(
                    'font-medium transition-colors',
                    activeStep === 'where' ? 'text-xs text-muted-foreground' : 'text-sm text-muted-foreground'
                  )}>
                    Where
                  </span>
                  {activeStep !== 'where' && (
                    <span className="font-semibold text-foreground">
                      {location || "I'm flexible"}
                    </span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {activeStep === 'where' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={expandTransition}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-5">
                        {/* Large Header */}
                        <h2 className="text-2xl font-bold text-foreground">Where to?</h2>
                        
                        {/* Search Input */}
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="Search destinations"
                            value={location}
                            onChange={(e) => onLocationChange(e.target.value)}
                            className="pl-12 h-14 rounded-2xl border-2 border-border focus:border-primary bg-background text-base"
                            autoFocus
                          />
                        </div>

                        {/* Suggested Destinations */}
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Suggested destinations
                          </p>
                          {SUGGESTED_DESTINATIONS.map((dest) => (
                            <motion.button
                              key={dest.name}
                              className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-colors text-left"
                              onClick={() => {
                                onLocationChange(dest.name === 'Nearby' ? '' : dest.name);
                                setActiveStep('when');
                              }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="h-12 w-12 rounded-xl bg-muted/80 flex items-center justify-center flex-shrink-0 text-2xl">
                                {dest.emoji}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground">{dest.name}</p>
                                <p className="text-sm text-muted-foreground truncate">{dest.description}</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* When Section */}
              <motion.div
                layout
                className={cn(
                  'bg-card border rounded-3xl overflow-hidden transition-all',
                  activeStep === 'when' 
                    ? 'border-border shadow-lg' 
                    : 'border-border/30'
                )}
              >
                <motion.button
                  className="w-full p-5 flex items-center justify-between"
                  onClick={() => setActiveStep(activeStep === 'when' ? null : 'when')}
                  whileTap={{ scale: 0.995 }}
                >
                  <span className={cn(
                    'font-medium transition-colors',
                    activeStep === 'when' ? 'text-xs text-muted-foreground' : 'text-sm text-muted-foreground'
                  )}>
                    When
                  </span>
                  {activeStep !== 'when' && (
                    <span className="font-semibold text-foreground">{formatDateRange()}</span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {activeStep === 'when' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={expandTransition}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">When's your trip?</h2>
                        
                        {/* Quick Options */}
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                          {['Any week', 'Weekend', 'This month', 'Flexible'].map((option) => (
                            <Button
                              key={option}
                              variant="outline"
                              size="sm"
                              className="rounded-full whitespace-nowrap border-border/50 text-foreground hover:border-primary"
                              onClick={() => onDateRangeChange({ from: undefined, to: undefined })}
                            >
                              {option}
                            </Button>
                          ))}
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

              {/* Who Section */}
              <motion.div
                layout
                className={cn(
                  'bg-card border rounded-3xl overflow-hidden transition-all',
                  activeStep === 'who' 
                    ? 'border-border shadow-lg' 
                    : 'border-border/30'
                )}
              >
                <motion.button
                  className="w-full p-5 flex items-center justify-between"
                  onClick={() => setActiveStep(activeStep === 'who' ? null : 'who')}
                  whileTap={{ scale: 0.995 }}
                >
                  <span className={cn(
                    'font-medium transition-colors',
                    activeStep === 'who' ? 'text-xs text-muted-foreground' : 'text-sm text-muted-foreground'
                  )}>
                    Who
                  </span>
                  {activeStep !== 'who' && (
                    <span className="font-semibold text-foreground">
                      {guestCount > 1 ? `${guestCount} guests` : 'Add guests'}
                    </span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {activeStep === 'who' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={expandTransition}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">Who's coming?</h2>
                        
                        {/* Guest Types */}
                        <div className="space-y-4">
                          {/* Adults */}
                          <div className="flex items-center justify-between py-4 border-b border-border/30">
                            <div>
                              <p className="font-semibold text-foreground">Adults</p>
                              <p className="text-sm text-muted-foreground">Ages 13 or above</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                className={cn(
                                  'h-9 w-9 rounded-full border flex items-center justify-center transition-colors',
                                  guestCount <= 1 
                                    ? 'border-border/30 text-muted-foreground/50 cursor-not-allowed' 
                                    : 'border-border text-foreground hover:border-foreground'
                                )}
                                onClick={() => onGuestCountChange(Math.max(1, guestCount - 1))}
                                disabled={guestCount <= 1}
                              >
                                <span className="text-xl leading-none">−</span>
                              </motion.button>
                              <span className="w-8 text-center font-semibold text-foreground">{guestCount}</span>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                className="h-9 w-9 rounded-full border border-border text-foreground hover:border-foreground flex items-center justify-center transition-colors"
                                onClick={() => onGuestCountChange(guestCount + 1)}
                              >
                                <span className="text-xl leading-none">+</span>
                              </motion.button>
                            </div>
                          </div>
                          
                          {/* Pets Option */}
                          <div className="flex items-center justify-between py-2">
                            <div>
                              <p className="font-semibold text-foreground">Pets</p>
                              <p className="text-sm text-muted-foreground underline">Bringing a service animal?</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                className="h-9 w-9 rounded-full border border-border/30 text-muted-foreground/50 cursor-not-allowed flex items-center justify-center"
                                disabled
                              >
                                <span className="text-xl leading-none">−</span>
                              </motion.button>
                              <span className="w-8 text-center font-semibold text-muted-foreground">0</span>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                className="h-9 w-9 rounded-full border border-border text-foreground hover:border-foreground flex items-center justify-center transition-colors"
                              >
                                <span className="text-xl leading-none">+</span>
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Footer */}
            <motion.div 
              className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border/30 safe-area-pb"
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2, ...springTransition }}
            >
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="ghost"
                  onClick={handleClear}
                  className="underline font-semibold text-foreground hover:text-primary hover:bg-transparent px-0"
                >
                  Clear all
                </Button>
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleSearch}
                    className="rounded-xl px-6 h-12 gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 font-semibold shadow-lg"
                  >
                    <Search className="h-4 w-4" />
                    Search
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
