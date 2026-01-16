import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Property } from '@/types/database';
import { cn } from '@/lib/utils';
import { useWishlist } from '@/hooks/useWishlist';
import haptics from '@/utils/haptics';

interface PropertyCardProps {
  property: Property;
  className?: string;
  index?: number;
  variant?: 'default' | 'overlay';
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop';

export function PropertyCard({ property, className, index = 0, variant = 'overlay' }: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const { isWishlisted, toggleWishlist } = useWishlist();

  const isLiked = isWishlisted(property.id);

  const images = property.images?.sort((a, b) => a.display_order - b.display_order) || [];
  const imageUrls = images.length > 0 
    ? images.map(img => img.image_url) 
    : [FALLBACK_IMAGE];

  const handleImageError = (index: number) => {
    setFailedImages(prev => new Set(prev).add(index));
  };

  const getImageSrc = (index: number) => {
    return failedImages.has(index) ? FALLBACK_IMAGE : imageUrls[index];
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    haptics.selection();
    setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    haptics.selection();
    setCurrentImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(property.id);
  };

  // Generate a consistent pseudo-random rating based on property id
  const getRating = () => {
    const hash = property.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (4.5 + (hash % 6) / 10).toFixed(1);
  };

  // Overlay variant - text on image with info below
  if (variant === 'overlay') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className={cn('group', className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/properties/${property.id}`} className="block">
          {/* Image Container with Overlay Text */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-card group-hover:shadow-card-hover transition-shadow">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={getImageSrc(currentImageIndex)}
                alt={property.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full object-cover"
                onError={() => handleImageError(currentImageIndex)}
              />
            </AnimatePresence>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Heart Button - Top Right */}
            <motion.button
              onClick={handleToggleLike}
              whileTap={{ scale: 0.85 }}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-sm transition-colors z-10"
            >
              <motion.div
                animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart 
                  className={cn(
                    'h-5 w-5 transition-all',
                    isLiked 
                      ? 'fill-primary text-primary' 
                      : 'text-white stroke-[2]'
                  )}
                />
              </motion.div>
            </motion.button>

            {/* Navigation Arrows - Desktop only */}
            <AnimatePresence>
              {isHovered && imageUrls.length > 1 && (
                <>
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white hover:scale-105 rounded-full p-1.5 shadow-md transition-transform hidden md:flex"
                  >
                    <ChevronLeft className="h-4 w-4 text-foreground" />
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white hover:scale-105 rounded-full p-1.5 shadow-md transition-transform hidden md:flex"
                  >
                    <ChevronRight className="h-4 w-4 text-foreground" />
                  </motion.button>
                </>
              )}
            </AnimatePresence>

            {/* Image Dots */}
            {imageUrls.length > 1 && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1.5">
                {imageUrls.slice(0, 5).map((_, idx) => (
                  <motion.div
                    key={idx}
                    className={cn(
                      'w-1.5 h-1.5 rounded-full transition-all',
                      idx === currentImageIndex 
                        ? 'bg-white w-2' 
                        : 'bg-white/60'
                    )}
                  />
                ))}
              </div>
            )}

            {/* Overlay Text Content - Name & Location on image */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="font-bold text-white text-base uppercase tracking-wide line-clamp-1">
                {property.name}
              </h3>
              <div className="flex items-center gap-1 text-white/90 mt-0.5">
                <MapPin className="h-3 w-3" />
                <p className="text-xs line-clamp-1">{property.location}</p>
              </div>
            </div>
          </div>

          {/* Info Section Below Image */}
          <div className="mt-2 px-1">
            <h4 className="font-semibold text-foreground text-sm line-clamp-1">
              {property.name}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-muted-foreground">
                ₱{property.price_per_night.toLocaleString()} / night
              </span>
              <span className="text-muted-foreground">·</span>
              <div className="flex items-center gap-0.5">
                <span className="text-amber-500">★</span>
                <span className="text-sm text-muted-foreground">{getRating()}</span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Default variant - horizontal card for wishlists
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn('group', className)}
    >
      <Link to={`/properties/${property.id}`} className="flex gap-4 p-3 bg-card rounded-2xl shadow-soft hover:shadow-card transition-shadow">
        {/* Image */}
        <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
          <img
            src={failedImages.has(0) ? FALLBACK_IMAGE : imageUrls[0]}
            alt={property.name}
            className="w-full h-full object-cover"
            onError={() => handleImageError(0)}
          />
          {/* Heart on image */}
          <motion.button
            onClick={handleToggleLike}
            whileTap={{ scale: 0.85 }}
            className="absolute top-1.5 right-1.5 p-1.5"
          >
            <Heart 
              className={cn(
                'h-4 w-4 transition-all drop-shadow',
                isLiked 
                  ? 'fill-primary text-primary' 
                  : 'text-white stroke-[2]'
              )}
            />
          </motion.button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 py-1">
          <h3 className="font-bold text-primary line-clamp-1">
            {property.name}
          </h3>
          <div className="flex items-center gap-1 text-muted-foreground mt-1">
            <MapPin className="h-3 w-3 shrink-0" />
            <p className="text-sm line-clamp-1">{property.location}</p>
          </div>
          <p className="text-sm font-semibold text-foreground mt-2">
            ₱{property.price_per_night.toLocaleString()} / night
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
