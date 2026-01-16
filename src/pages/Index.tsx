import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { PropertyGrid } from '@/components/properties/PropertyGrid';
import { CategoryFilter } from '@/components/properties/CategoryFilter';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { MobileSearchModal } from '@/components/search/MobileSearchModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Property, PropertyCategory } from '@/types/database';

export default function Index() {
  const { user, profile } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<PropertyCategory[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [guestCount, setGuestCount] = useState(1);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  // Search bar state
  const [searchLocation, setSearchLocation] = useState('');
  const [searchDateRange, setSearchDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [searchGuestCount, setSearchGuestCount] = useState(1);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('properties')
      .select(`*, images:property_images(*), experiences(*)`)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProperties(data as unknown as Property[]);
    }
    setIsLoading(false);
  };

  // Sync search location to filter
  const handleSearch = () => {
    setSearchQuery(searchLocation);
    setGuestCount(searchGuestCount);
  };

  const filteredProperties = properties.filter((property) => {
    const searchTerm = searchQuery || searchLocation;
    const matchesSearch = !searchTerm || 
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(property.category);
    const matchesPrice = property.price_per_night >= priceRange[0] && property.price_per_night <= priceRange[1];
    const matchesGuests = property.max_guests >= Math.max(guestCount, searchGuestCount);
    return matchesSearch && matchesCategory && matchesPrice && matchesGuests;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSearchLocation('');
    setSelectedCategories([]);
    setPriceRange([0, 10000]);
    setGuestCount(1);
    setSearchGuestCount(1);
    setSearchDateRange({ from: undefined, to: undefined });
  };

  const hasActiveFilters = selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 10000 || guestCount > 1 || searchLocation;

  // Get first name for welcome message
  const firstName = profile?.full_name?.split(' ')[0] || 'Explorer';

  return (
    <Layout
      searchLocation={searchLocation}
      onSearchLocationChange={setSearchLocation}
      searchDateRange={searchDateRange}
      onSearchDateRangeChange={setSearchDateRange}
      searchGuestCount={searchGuestCount}
      onSearchGuestCountChange={setSearchGuestCount}
      onSearch={handleSearch}
    >
      {/* Mobile Compact Search Bar */}
      <div className="md:hidden sticky top-0 z-40 bg-background pt-3 pb-2 px-4">
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsMobileSearchOpen(true)}
          className="w-full flex items-center gap-3 px-5 py-3.5 rounded-full bg-card border border-border/50 shadow-md hover:shadow-lg transition-shadow"
        >
          <Search className="h-5 w-5 text-primary" />
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-foreground">Where to?</p>
            <p className="text-xs text-muted-foreground">Anywhere · Any week · Add guests</p>
          </div>
        </motion.button>
      </div>

      {/* Mobile Search Modal */}
      <MobileSearchModal
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
        location={searchLocation}
        onLocationChange={setSearchLocation}
        dateRange={searchDateRange}
        onDateRangeChange={setSearchDateRange}
        guestCount={searchGuestCount}
        onGuestCountChange={setSearchGuestCount}
        onSearch={handleSearch}
      />

      {/* Category Filter */}
      <CategoryFilter
        selectedCategories={selectedCategories}
        onCategoryChange={setSelectedCategories}
        onFiltersClick={() => setIsFiltersOpen(true)}
      />

      {/* Main Content */}
      <section id="search-section" className="container py-4 md:py-6">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4 md:mb-6"
        >
          <div>
            <h2 className="text-lg md:text-2xl font-bold text-foreground">
              {hasActiveFilters ? 'Search Results' : 'Featured Farms'}
            </h2>
            {hasActiveFilters && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {filteredProperties.length} places found
              </p>
            )}
          </div>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-primary hover:text-primary/80"
            >
              Clear filters
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </motion.div>

        <PropertyGrid properties={filteredProperties} isLoading={isLoading} />
      </section>

      {/* Filters Sheet */}
      <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto border-l-0 rounded-l-3xl">
          <SheetHeader className="border-b border-border/50 pb-4">
            <SheetTitle className="text-center text-lg font-semibold text-foreground">Filters</SheetTitle>
          </SheetHeader>
          
          <div className="py-8 space-y-8">
            {/* Price Range */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-foreground">Price range</h3>
              <p className="text-sm text-muted-foreground">Nightly prices before fees and taxes</p>
              <Slider
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                min={0}
                max={10000}
                step={100}
                className="mt-6"
              />
              <div className="flex items-center justify-between gap-4 mt-4">
                <div className="flex-1 p-4 border border-border/50 rounded-2xl bg-muted/30">
                  <p className="text-xs text-muted-foreground font-medium">Minimum</p>
                  <p className="font-bold text-foreground text-lg">₱{priceRange[0].toLocaleString()}</p>
                </div>
                <span className="text-muted-foreground">–</span>
                <div className="flex-1 p-4 border border-border/50 rounded-2xl bg-muted/30">
                  <p className="text-xs text-muted-foreground font-medium">Maximum</p>
                  <p className="font-bold text-foreground text-lg">₱{priceRange[1].toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Guests */}
            <div className="space-y-6 border-t border-border/50 pt-8">
              <h3 className="text-xl font-semibold text-foreground">Guests</h3>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                <span className="font-medium text-foreground">Number of guests</span>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-10 w-10 border-border/50"
                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                    disabled={guestCount <= 1}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center font-bold text-lg text-foreground">{guestCount}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-10 w-10 border-border/50"
                    onClick={() => setGuestCount(guestCount + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border/50 bg-card">
            <div className="flex items-center justify-between gap-4">
              <Button variant="ghost" onClick={clearFilters} className="underline font-semibold text-foreground">
                Clear all
              </Button>
              <Button 
                onClick={() => setIsFiltersOpen(false)} 
                className="rounded-xl px-6 h-12 bg-primary hover:bg-primary/90 font-semibold"
              >
                Show {filteredProperties.length} places
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </Layout>
  );
}
