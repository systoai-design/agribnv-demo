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

  // Generate a random rating for demo
  const rating = (4.5 + Math.random() * 0.5).toFixed(2);

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
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3 shadow-soft group-hover:shadow-card transition-shadow">
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

          {/* Price Badge - Top Left */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary text-primary-foreground shadow-soft text-sm font-semibold px-3 py-1.5 rounded-lg">
              ₱{property.price_per_night.toLocaleString()}
            </Badge>
          </div>

          {/* Heart Button - Top Right */}
          <motion.button
            onClick={toggleLike}
            whileTap={{ scale: 0.9 }}
            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-soft hover:bg-white transition-colors"
          >
            <Heart 
              className={cn(
                'h-5 w-5 transition-colors',
                isLiked ? 'fill-primary text-primary' : 'text-foreground'
              )}
            />
          </motion.button>

          {/* Guest Favorite Badge */}
          {property.experiences && property.experiences.length > 0 && (
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-sage text-foreground shadow-soft text-xs font-medium px-2 py-1 rounded-lg">
                Guest favorite
              </Badge>
            </div>
          )}

          {/* Navigation Arrows */}
          <AnimatePresence>
            {isHovered && imageUrls.length > 1 && (
              <>
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-1.5 shadow-soft transition-transform hover:scale-105"
                >
                  <ChevronLeft className="h-4 w-4 text-foreground" />
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-1.5 shadow-soft transition-transform hover:scale-105"
                >
                  <ChevronRight className="h-4 w-4 text-foreground" />
                </motion.button>
              </>
            )}
          </AnimatePresence>

          {/* Image Dots */}
          {imageUrls.length > 1 && (
            <div className="absolute bottom-3 right-3 flex gap-1">
              {imageUrls.slice(0, 5).map((_, idx) => (
                <motion.div
                  key={idx}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-colors',
                    idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  )}
                  animate={{ scale: idx === currentImageIndex ? 1.2 : 1 }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1 px-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground line-clamp-1">
              {property.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0 text-foreground">
              <Star className="h-4 w-4 fill-current text-warning" />
              <span className="text-sm font-medium">{rating}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <p className="text-sm line-clamp-1">
              {property.location}
            </p>
          </div>
          <p className="text-sm text-sage-dark font-medium">
            {CATEGORY_LABELS[property.category]}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
