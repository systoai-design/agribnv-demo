import { supabase } from '@/integrations/supabase/client';
import type { Property, ListingType, FarmstaySubcategory } from '@/types/database';

interface TursoResponse<T> {
  data?: T;
  error?: string;
  success?: boolean;
}

const callTurso = async <T>(action: string, params?: Record<string, any>): Promise<TursoResponse<T>> => {
  const { data, error } = await supabase.functions.invoke('turso-db', {
    body: { action, params }
  });
  
  if (error) {
    console.error('Turso function error:', error);
    return { error: error.message };
  }
  
  return data;
};

export interface PropertyFilters {
  listing_type?: ListingType;
  subcategory?: FarmstaySubcategory[];
  search?: string;
  price_min?: number;
  price_max?: number;
  guests?: number;
}

export const tursoDb = {
  // Initialize the Turso database schema
  init: async (): Promise<boolean> => {
    const response = await callTurso<{ success: boolean }>('init');
    return response.success ?? false;
  },

  // Get all properties with optional filtering
  getProperties: async (filters?: PropertyFilters): Promise<Property[]> => {
    const response = await callTurso<Property[]>('getProperties', filters);
    return response.data ?? [];
  },

  // Get a single property by ID
  getProperty: async (id: string): Promise<Property | null> => {
    const response = await callTurso<Property>('getProperty', { id });
    return response.data ?? null;
  },

  // Migrate data from Supabase to Turso
  migrateFromSupabase: async (properties: Property[]): Promise<number> => {
    const response = await callTurso<{ migrated: number }>('migrateFromSupabase', { properties });
    return (response as any).migrated ?? response.data?.migrated ?? 0;
  },

  // Update property filters (listing_type, subcategory)
  updatePropertyFilters: async (updates: { id: string; listing_type: ListingType; subcategory: FarmstaySubcategory }[]): Promise<number> => {
    const response = await callTurso<{ updated: number }>('updatePropertyFilters', { updates });
    return (response as any).updated ?? response.data?.updated ?? 0;
  }
};
