import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { List, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types/database';
import PropertyMap from '@/components/map/PropertyMap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/types/database';
import haptics from '@/utils/haptics';

const MapView = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select(`
            *,
            images:property_images(*),
            experiences(*)
          `)
          .eq('is_published', true)
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        if (error) throw error;
        setProperties((data || []) as unknown as Property[]);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const filteredProperties = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      (p.address?.toLowerCase().includes(q) ?? false)
    );
  }, [properties, searchQuery]);

  // Drop a selected property that's no longer in the filtered set
  useEffect(() => {
    if (selectedProperty && !filteredProperties.some((p) => p.id === selectedProperty.id)) {
      setSelectedProperty(null);
    }
  }, [filteredProperties, selectedProperty]);

  const handlePropertySelect = (property: Property) => {
    haptics.selection();
    setSelectedProperty(property);
  };

  const handlePropertyNavigate = (propertyId: string) => {
    haptics.selection();
    navigate(`/properties/${propertyId}`);
  };

  const handleCloseCard = () => {
    haptics.light();
    setSelectedProperty(null);
  };

  const navigateProperties = (direction: 'prev' | 'next') => {
    if (!selectedProperty || filteredProperties.length === 0) return;

    haptics.selection();
    const currentIndex = filteredProperties.findIndex((p) => p.id === selectedProperty.id);
    let newIndex: number;

    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredProperties.length - 1;
    } else {
      newIndex = currentIndex < filteredProperties.length - 1 ? currentIndex + 1 : 0;
    }

    setSelectedProperty(filteredProperties[newIndex]);
  };

  const primaryImage = selectedProperty?.images?.find((img) => img.is_primary)
    || selectedProperty?.images?.[0];

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 bg-background/95 backdrop-blur-sm border-b z-10">
        <Link to="/" className="shrink-0">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => haptics.light()}>
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Show list</span>
          </Button>
        </Link>

        <div className="flex-1 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-9 pr-8 rounded-full"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        <div className="shrink-0 text-sm text-muted-foreground font-medium tabular-nums hidden sm:block">
          {filteredProperties.length} {filteredProperties.length === 1 ? 'place' : 'places'}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            <PropertyMap
              properties={filteredProperties}
              onPropertySelect={handlePropertySelect}
              onPropertyNavigate={handlePropertyNavigate}
              selectedPropertyId={selectedProperty?.id}
              className="h-full"
            />

            {filteredProperties.length === 0 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-sm border rounded-full px-4 py-2 shadow-md text-sm text-muted-foreground">
                No properties match "{searchQuery}"
              </div>
            )}
          </>
        )}

        {/* Selected Property Card */}
        <AnimatePresence>
          {selectedProperty && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96"
            >
              <div className="bg-background rounded-2xl shadow-xl border overflow-hidden">
                {/* Navigation arrows */}
                <div className="absolute top-1/2 -translate-y-1/2 left-2 z-10">
                  <button
                    onClick={() => navigateProperties('prev')}
                    className="w-8 h-8 bg-background/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-2 z-10">
                  <button
                    onClick={() => navigateProperties('next')}
                    className="w-8 h-8 bg-background/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Close button */}
                <button
                  onClick={handleCloseCard}
                  className="absolute top-3 right-3 z-10 w-8 h-8 bg-background/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-background transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Image */}
                <Link to={`/properties/${selectedProperty.id}`}>
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <img
                      src={primaryImage?.image_url || '/placeholder.svg'}
                      alt={selectedProperty.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">
                          {selectedProperty.name}
                        </h3>
                        <p className="text-muted-foreground text-sm truncate">
                          {selectedProperty.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-sm shrink-0">
                        <span>
                          {CATEGORY_ICONS[selectedProperty.category]}
                        </span>
                        <span className="text-muted-foreground">
                          {CATEGORY_LABELS[selectedProperty.category]}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="font-semibold">
                        ₱{selectedProperty.price_per_night.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground"> / night</span>
                    </div>
                  </div>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MapView;
