import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Property, ListingType, FarmstaySubcategory } from '@/types/database';

export interface PropertyFilters {
  listing_type?: ListingType;
  subcategory?: FarmstaySubcategory[];
  search?: string;
  price_min?: number;
  price_max?: number;
  guests?: number;
}

export function useProperties(initialFilters?: PropertyFilters) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PropertyFilters>(initialFilters ?? {});

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Cast to any: chained conditional filters otherwise blow up TS inference.
    let query: any = supabase
      .from('properties')
      .select('*, images:property_images(*), experiences(*)')
      .eq('is_published', true);

    if (filters.listing_type) {
      query = query.eq('listing_type', filters.listing_type);
    }

    if (filters.subcategory && filters.subcategory.length > 0) {
      query = query.in('subcategory', filters.subcategory);
    }

    if (filters.search) {
      const term = filters.search.replace(/%/g, '').trim();
      if (term) {
        query = query.or(`name.ilike.%${term}%,location.ilike.%${term}%`);
      }
    }

    if (filters.price_min !== undefined) {
      query = query.gte('price_per_night', filters.price_min);
    }

    if (filters.price_max !== undefined) {
      query = query.lte('price_per_night', filters.price_max);
    }

    if (filters.guests && filters.guests > 1) {
      query = query.gte('max_guests', filters.guests);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error: queryError } = await query;

    if (queryError) {
      console.error('Failed to fetch properties:', queryError);
      setError('Failed to load properties');
      setProperties([]);
    } else {
      setProperties((data ?? []) as unknown as Property[]);
    }

    setIsLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const updateListingType = useCallback((type: ListingType) => {
    setFilters((prev) => ({ ...prev, listing_type: type }));
  }, []);

  const updateSubcategories = useCallback((subcategories: FarmstaySubcategory[]) => {
    setFilters((prev) => ({ ...prev, subcategory: subcategories }));
  }, []);

  const updateSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search: search || undefined }));
  }, []);

  const updatePriceRange = useCallback((min: number, max: number) => {
    setFilters((prev) => ({
      ...prev,
      price_min: min > 0 ? min : undefined,
      price_max: max < 10000 ? max : undefined,
    }));
  }, []);

  const updateGuests = useCallback((guests: number) => {
    setFilters((prev) => ({ ...prev, guests: guests > 1 ? guests : undefined }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const hasActiveFilters = Boolean(
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
