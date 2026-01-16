import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/hooks/useWishlist';
import { Layout } from '@/components/layout/Layout';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { Button } from '@/components/ui/button';
import { Property } from '@/types/database';

const Wishlists = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { wishlistIds, isLoading: wishlistLoading } = useWishlist();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);

  useEffect(() => {
    const fetchWishlistProperties = async () => {
      if (wishlistIds.size === 0) {
        setProperties([]);
        return;
      }

      setIsLoadingProperties(true);
      try {
        const { data, error } = await supabase
          .from('properties')
          .select(`
            *,
            images:property_images(*),
            experiences(*)
          `)
          .in('id', Array.from(wishlistIds));

        if (error) throw error;

        setProperties(data || []);
      } catch (error) {
        console.error('Error fetching wishlist properties:', error);
      } finally {
        setIsLoadingProperties(false);
      }
    };

    fetchWishlistProperties();
  }, [wishlistIds]);

  const isLoading = authLoading || wishlistLoading || isLoadingProperties;

  // Not logged in state
  if (!authLoading && !user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20 }}
            className="text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Heart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Your wishlists</h1>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Sign in to view your saved properties and create wishlists for your next agritourism adventure.
            </p>
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                <LogIn className="w-4 h-4" />
                Sign in
              </Button>
            </Link>
          </motion.div>
        </div>
      </Layout>
    );
  }

  // Empty wishlist state
  if (!isLoading && properties.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20 }}
            className="text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Heart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Create your first wishlist</h1>
            <p className="text-muted-foreground mb-6 max-w-sm">
              As you search, tap the heart icon to save your favorite farms and experiences.
            </p>
            <Link to="/">
              <Button size="lg">Start exploring</Button>
            </Link>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl md:text-3xl font-bold">Wishlists</h1>
          <p className="text-muted-foreground mt-1">
            {properties.length} saved {properties.length === 1 ? 'property' : 'properties'}
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] bg-muted rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            layout
          >
            <AnimatePresence mode="popLayout">
              {properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: -100, scale: 0.9 }}
                  transition={{
                    type: 'spring',
                    damping: 25,
                    stiffness: 300,
                    delay: index * 0.05,
                  }}
                >
                  <PropertyCard property={property} index={index} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Wishlists;
