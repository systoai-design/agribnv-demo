import { Link } from 'react-router-dom';
import { MapPin, Users, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Property, CATEGORY_LABELS, CATEGORY_ICONS } from '@/types/database';
import { cn } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
  className?: string;
}

export function PropertyCard({ property, className }: PropertyCardProps) {
  const primaryImage = property.images?.find(img => img.is_primary) || property.images?.[0];
  const imageUrl = primaryImage?.image_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop';

  return (
    <Link to={`/properties/${property.id}`} className={cn('block group', className)}>
      <Card className="overflow-hidden border-0 shadow-card hover:shadow-card-hover transition-all duration-300 group-hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={imageUrl}
            alt={property.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Category Badge */}
          <Badge 
            className="absolute top-3 left-3 bg-card/90 text-foreground backdrop-blur-sm border-0"
          >
            <span className="mr-1">{CATEGORY_ICONS[property.category]}</span>
            {CATEGORY_LABELS[property.category]}
          </Badge>
          {/* Hands-on Activity Badge */}
          {property.experiences && property.experiences.length > 0 && (
            <Badge 
              className="absolute top-3 right-3 bg-accent text-accent-foreground border-0"
            >
              Hands-on Activities
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <MapPin className="h-3.5 w-3.5" />
            <span>{property.location}</span>
          </div>

          {/* Title */}
          <h3 className="font-display font-semibold text-lg text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {property.name}
          </h3>

          {/* Description */}
          {property.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {property.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Up to {property.max_guests} guests</span>
            </div>
            <div className="text-right">
              <span className="font-display font-bold text-lg text-foreground">
                ₱{property.price_per_night.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground"> / night</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
