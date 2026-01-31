import { useState, useEffect, useCallback } from 'react';
import { tursoDb, PropertyFilters } from '@/lib/turso';
import type { Property, ListingType, FarmstaySubcategory } from '@/types/database';

export function useTursoProperties(initialFilters?: PropertyFilters) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PropertyFilters>(initialFilters ?? {});

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await tursoDb.getProperties(filters);
      setProperties(data);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
      setError('Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const updateListingType = useCallback((type: ListingType) => {
    setFilters(prev => ({ ...prev, listing_type: type }));
  }, []);

  const updateSubcategories = useCallback((subcategories: FarmstaySubcategory[]) => {
    setFilters(prev => ({ ...prev, subcategory: subcategories }));
  }, []);

  const updateSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search: search || undefined }));
  }, []);

  const updatePriceRange = useCallback((min: number, max: number) => {
    setFilters(prev => ({ 
      ...prev, 
      price_min: min > 0 ? min : undefined,
      price_max: max < 10000 ? max : undefined 
    }));
  }, []);

  const updateGuests = useCallback((guests: number) => {
    setFilters(prev => ({ ...prev, guests: guests > 1 ? guests : undefined }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const hasActiveFilters = Boolean(
    filters.listing_type || 
    (filters.subcategory && filters.subcategory.length > 0) ||
    filters.search ||
    filters.price_min ||
    filters.price_max ||
    filters.guests
  );

  return {
    properties,
    isLoading,
    error,
    filters,
    hasActiveFilters,
    updateListingType,
    updateSubcategories,
    updateSearch,
    updatePriceRange,
    updateGuests,
    clearFilters,
    refetch: fetchProperties,
  };
}
