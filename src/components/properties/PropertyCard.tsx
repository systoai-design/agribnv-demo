import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronLeft, ChevronRight, Star, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Property, CATEGORY_LABELS } from '@/types/database';
import { cn } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
  className?: string;
  index?: number;
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
        <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
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

          {/* Guest Favorite Badge */}
          {property.experiences && property.experiences.length > 0 && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-white text-foreground shadow-soft text-xs font-semibold px-2 py-1 rounded-full">
                Guest favorite
              </Badge>
            </div>
          )}

          {/* Heart Button */}
          <motion.button
            onClick={toggleLike}
            whileTap={{ scale: 0.9 }}
            className="absolute top-3 right-3 p-2"
          >
            <Heart 
              className={cn(
                'h-6 w-6 transition-colors drop-shadow-md',
                isLiked ? 'fill-primary text-primary' : 'fill-black/40 text-white stroke-2'
              )}
            />
          </motion.button>

          {/* Navigation Arrows */}
          <AnimatePresence>
            {isHovered && imageUrls.length > 1 && (
              <>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-soft transition-transform hover:scale-105"
                >
                  <ChevronLeft className="h-4 w-4" />
                </motion.button>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-soft transition-transform hover:scale-105"
                >
                  <ChevronRight className="h-4 w-4" />
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
                    'w-1.5 h-1.5 rounded-full transition-colors',
                    idx === currentImageIndex ? 'bg-white' : 'bg-white/60'
                  )}
                  animate={{ scale: idx === currentImageIndex ? 1.2 : 1 }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-[15px] text-foreground line-clamp-1">
              {property.location}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm">4.9</span>
            </div>
          </div>
          <p className="text-muted-foreground text-sm line-clamp-1">
            {property.name}
          </p>
          <p className="text-muted-foreground text-sm">
            {CATEGORY_LABELS[property.category]}
          </p>
          <p className="pt-1">
            <span className="font-semibold">₱{property.price_per_night.toLocaleString()}</span>
            <span className="text-muted-foreground"> night</span>
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
