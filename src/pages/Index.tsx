import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { PropertyGrid } from '@/components/properties/PropertyGrid';
import { CategoryFilter } from '@/components/properties/CategoryFilter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { Property, PropertyCategory } from '@/types/database';

export default function Index() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<PropertyCategory[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [guestCount, setGuestCount] = useState(1);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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

  const filteredProperties = properties.filter((property) => {
    const matchesSearch = !searchQuery || 
      property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(property.category);
    const matchesPrice = property.price_per_night >= priceRange[0] && property.price_per_night <= priceRange[1];
    const matchesGuests = property.max_guests >= guestCount;
    return matchesSearch && matchesCategory && matchesPrice && matchesGuests;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setPriceRange([0, 10000]);
    setGuestCount(1);
  };

  const hasActiveFilters = selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 10000 || guestCount > 1;

  return (
    <Layout>
      {/* Category Filter */}
      <CategoryFilter
        selectedCategories={selectedCategories}
        onCategoryChange={setSelectedCategories}
        onFiltersClick={() => setIsFiltersOpen(true)}
      />

      {/* Main Content */}
      <section id="search-section" className="container py-6">
        {/* Mobile Search */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search destinations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 rounded-full border-2 text-base shadow-soft"
            />
          </div>
        </motion.div>

        {/* Results */}
        <div className="mb-6">
          {hasActiveFilters && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 mb-4"
            >
              <span className="text-sm text-muted-foreground">
                {filteredProperties.length} places
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-sm underline"
              >
                Clear all
              </Button>
            </motion.div>
          )}
        </div>

        <PropertyGrid properties={filteredProperties} isLoading={isLoading} />
      </section>

      {/* Filters Sheet */}
      <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-center text-lg font-semibold">Filters</SheetTitle>
          </SheetHeader>
          
          <div className="py-8 space-y-8">
            {/* Price Range */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Price range</h3>
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
                <div className="flex-1 p-3 border rounded-xl">
                  <p className="text-xs text-muted-foreground">Minimum</p>
                  <p className="font-semibold">₱{priceRange[0].toLocaleString()}</p>
                </div>
                <span className="text-muted-foreground">–</span>
                <div className="flex-1 p-3 border rounded-xl">
                  <p className="text-xs text-muted-foreground">Maximum</p>
                  <p className="font-semibold">₱{priceRange[1].toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Guests */}
            <div className="space-y-6 border-t pt-8">
              <h3 className="text-xl font-semibold">Guests</h3>
              <div className="flex items-center justify-between">
                <span>Number of guests</span>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-10 w-10"
                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                    disabled={guestCount <= 1}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center font-semibold">{guestCount}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-10 w-10"
                    onClick={() => setGuestCount(guestCount + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-background">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={clearFilters} className="underline font-semibold">
                Clear all
              </Button>
              <Button onClick={() => setIsFiltersOpen(false)} className="rounded-lg px-6">
                Show {filteredProperties.length} places
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </Layout>
  );
}
