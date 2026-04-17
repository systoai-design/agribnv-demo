import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BlockedRange {
  from: Date;
  to: Date;
}

// Returns date ranges that are already booked for a property.
// `from` is the check-in day (blocked). `to` is the last blocked day
// (i.e. the day BEFORE check-out), so calendars can disable it directly.
export function useAvailability(propertyId: string | undefined) {
  const [blockedRanges, setBlockedRanges] = useState<BlockedRange[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!propertyId) {
      setBlockedRanges([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const fetchBlocked = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('bookings')
        .select('check_in, check_out')
        .eq('property_id', propertyId)
        .in('status', ['pending', 'confirmed'])
        .gte('check_out', today.toISOString().slice(0, 10));

      if (cancelled) return;

      if (error || !data) {
        setBlockedRanges([]);
      } else {
        setBlockedRanges(
          data.map((b) => {
            const from = new Date(b.check_in);
            const checkOut = new Date(b.check_out);
            // Block the nights check_in..check_out-1. Checkout day itself is free.
            const to = new Date(checkOut);
            to.setDate(to.getDate() - 1);
            return { from, to };
          })
        );
      }
      setIsLoading(false);
    };

    fetchBlocked();

    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  return { blockedRanges, isLoading };
}
