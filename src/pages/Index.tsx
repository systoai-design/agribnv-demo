import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { PropertyGrid } from '@/components/properties/PropertyGrid';
import { SearchFilters } from '@/components/properties/SearchFilters';
import { supabase } from '@/integrations/supabase/client';
import { Property, PropertyCategory } from '@/types/database';
import { Leaf } from 'lucide-react';

export default function Index() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<PropertyCategory[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [guestCount, setGuestCount] = useState(1);

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

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative gradient-hero text-primary-foreground py-16 md:py-24">
        <div className="container text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Leaf className="h-9 w-9" />
            </div>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Discover Guimaras Farm Stays
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Experience authentic agritourism — from mango picking to farm-to-table dining
          </p>
        </div>
      </section>

      {/* Search & Properties */}
      <section className="container py-8">
        <SearchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategories={selectedCategories}
          onCategoryChange={setSelectedCategories}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          guestCount={guestCount}
          onGuestCountChange={setGuestCount}
        />
        <div className="mt-8">
          <PropertyGrid properties={filteredProperties} isLoading={isLoading} />
        </div>
      </section>
    </Layout>
  );
}
