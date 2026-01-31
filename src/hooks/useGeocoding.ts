import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GeocodeResult {
  latitude: number;
  longitude: number;
  display_name: string;
}

interface UseGeocodingReturn {
  geocode: (address: string) => Promise<GeocodeResult | null>;
  isLoading: boolean;
  error: string | null;
}

export function useGeocoding(): UseGeocodingReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocode = useCallback(async (address: string): Promise<GeocodeResult | null> => {
    if (!address || address.trim().length < 3) {
      setError('Address too short');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('geocode', {
        body: { address: address.trim() },
      });

      if (fnError) {
        console.error('Geocoding function error:', fnError);
        setError(fnError.message || 'Failed to geocode address');
        return null;
      }

      if (data.error) {
        setError(data.error);
        return null;
      }

      return {
        latitude: data.latitude,
        longitude: data.longitude,
        display_name: data.display_name,
      };
    } catch (err) {
      console.error('Geocoding error:', err);
      setError('Failed to geocode address');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { geocode, isLoading, error };
}
