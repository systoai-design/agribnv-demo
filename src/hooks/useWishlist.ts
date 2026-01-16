import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import haptics from '@/utils/haptics';

export function useWishlist() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's wishlist on mount and when user changes
  useEffect(() => {
    if (!user) {
      setWishlistIds(new Set());
      return;
    }

    const fetchWishlist = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('wishlists')
          .select('property_id')
          .eq('user_id', user.id);

        if (error) throw error;

        setWishlistIds(new Set(data?.map((w) => w.property_id) || []));
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const toggleWishlist = useCallback(
    async (propertyId: string) => {
      if (!user) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to save properties to your wishlist.',
          variant: 'destructive',
        });
        return false;
      }

      const isCurrentlyWishlisted = wishlistIds.has(propertyId);

      // Optimistic update
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyWishlisted) {
          next.delete(propertyId);
        } else {
          next.add(propertyId);
        }
        return next;
      });

      try {
        if (isCurrentlyWishlisted) {
          // Remove from wishlist
          haptics.light();
          const { error } = await supabase
            .from('wishlists')
            .delete()
            .eq('user_id', user.id)
            .eq('property_id', propertyId);

          if (error) throw error;

          toast({
            title: 'Removed from wishlist',
            description: 'Property has been removed from your saved items.',
          });
        } else {
          // Add to wishlist
          haptics.heartLike();
          const { error } = await supabase.from('wishlists').insert({
            user_id: user.id,
            property_id: propertyId,
          });

          if (error) throw error;

          toast({
            title: 'Saved to wishlist',
            description: 'Property has been added to your saved items.',
          });
        }

        return true;
      } catch (error) {
        console.error('Error toggling wishlist:', error);
        
        // Revert optimistic update
        setWishlistIds((prev) => {
          const next = new Set(prev);
          if (isCurrentlyWishlisted) {
            next.add(propertyId);
          } else {
            next.delete(propertyId);
          }
          return next;
        });

        toast({
          title: 'Error',
          description: 'Failed to update wishlist. Please try again.',
          variant: 'destructive',
        });

        return false;
      }
    },
    [user, wishlistIds, toast]
  );

  const isWishlisted = useCallback(
    (propertyId: string) => wishlistIds.has(propertyId),
    [wishlistIds]
  );

  return {
    wishlistIds,
    toggleWishlist,
    isWishlisted,
    isLoading,
    wishlistCount: wishlistIds.size,
  };
}
