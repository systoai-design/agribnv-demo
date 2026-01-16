import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronLeft, ChevronRight, Star, MapPin } from 'lucide-react';
import { Property, CATEGORY_LABELS } from '@/types/database';
import { cn } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
  className?: string;
  index?: number;
}

// Guest Favorite Badge with laurel design
function GuestFavoriteBadge() {
  return (
    <div className="absolute top-3 left-3 bg-white rounded-xl px-3 py-1.5 shadow-lg flex items-center gap-2">
      <div className="flex items-center gap-1">
        {/* Left laurel */}
        <svg className="h-4 w-4 text-foreground" viewBox="0 0 24 24" fill="none">
          <path 
            d="M8 4C8 4 6 6 6 9C6 12 8 14 8 14" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
          <path 
            d="M6 7C6 7 4 8 3 10C2 12 3 14 3 14" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
          <path 
            d="M5 11C5 11 3 12 2 15C1 18 3 20 3 20" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
        </svg>
        <div className="text-center">
          <p className="text-[10px] font-bold text-foreground leading-tight">Guest</p>
          <p className="text-[10px] font-bold text-foreground leading-tight">favorite</p>
        </div>
        {/* Right laurel */}
        <svg className="h-4 w-4 text-foreground scale-x-[-1]" viewBox="0 0 24 24" fill="none">
          <path 
            d="M8 4C8 4 6 6 6 9C6 12 8 14 8 14" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
          <path 
            d="M6 7C6 7 4 8 3 10C2 12 3 14 3 14" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
          <path 
            d="M5 11C5 11 3 12 2 15C1 18 3 20 3 20" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

export function PropertyCard({ property, className, index = 0 }: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const images = property.images?.sort((a, b) => a.display_order - b.display_order) || [];
  const imageUrls = images.length > 0 
    ? images.map(img => img.image_url) 
    : ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop'];

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  // Generate a random rating for demo
  const rating = (4.5 + Math.random() * 0.5).toFixed(2);
  const isGuestFavorite = property.experiences && property.experiences.length > 0;

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
        {/* Image Container */}
        <div className="relative aspect-[4/3] md:aspect-[4/3] rounded-2xl overflow-hidden mb-3 shadow-soft group-hover:shadow-card transition-shadow">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={imageUrls[currentImageIndex]}
              alt={property.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>

          {/* Guest Favorite Badge - Top Left */}
          {isGuestFavorite && <GuestFavoriteBadge />}

          {/* Heart Button - Top Right */}
          <motion.button
            onClick={toggleLike}
            whileTap={{ scale: 0.85 }}
            className="absolute top-3 right-3 p-2.5 rounded-full transition-colors z-10"
          >
            <motion.div
              animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart 
                className={cn(
                  'h-6 w-6 drop-shadow-md transition-all',
                  isLiked 
                    ? 'fill-primary text-primary' 
                    : 'fill-black/30 text-white stroke-[2]'
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
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
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
              {imageUrls.length > 5 && (
                <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1 px-0.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground line-clamp-1 text-[15px]">
              {property.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0 text-foreground">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="text-sm font-medium">{rating}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <p className="text-sm line-clamp-1">
              {property.location}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {CATEGORY_LABELS[property.category]}
          </p>
          <p className="text-[15px] text-foreground">
            <span className="font-semibold">₱{property.price_per_night.toLocaleString()}</span>
            <span className="text-muted-foreground"> night</span>
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
