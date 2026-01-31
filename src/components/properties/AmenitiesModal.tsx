import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Wifi, Car, Utensils, TreePine, Tv, Wind, Warehouse, Coffee, Flame, Droplets, Mountain, Waves, UtensilsCrossed, Home, Zap, ShowerHead, Thermometer, Fan, Bed } from 'lucide-react';

// Extended amenity icon mapping
const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Kitchen': Utensils,
  'Wifi': Wifi,
  'Free parking': Car,
  'Parking': Car,
  'Pool': Waves,
  'TV': Tv,
  'Air conditioning': Wind,
  'Washer': Warehouse,
  'Coffee maker': Coffee,
  'Fireplace': Flame,
  'Hot water': Droplets,
  'Mountain view': Mountain,
  'Ocean view': Waves,
  'BBQ grill': UtensilsCrossed,
  'Garden': TreePine,
  'Patio': Home,
  'Electricity': Zap,
  'Shower': ShowerHead,
  'Heating': Thermometer,
  'Ceiling fan': Fan,
  'Extra pillows': Bed,
};

// Get icon for amenity (with fallback)
const getAmenityIcon = (amenity: string) => {
  // Check for direct match
  if (amenityIcons[amenity]) return amenityIcons[amenity];
  
  // Check for partial match
  const lowerAmenity = amenity.toLowerCase();
  if (lowerAmenity.includes('wifi') || lowerAmenity.includes('internet')) return Wifi;
  if (lowerAmenity.includes('kitchen') || lowerAmenity.includes('cook')) return Utensils;
  if (lowerAmenity.includes('parking') || lowerAmenity.includes('car')) return Car;
  if (lowerAmenity.includes('pool') || lowerAmenity.includes('swim')) return Waves;
  if (lowerAmenity.includes('tv') || lowerAmenity.includes('television')) return Tv;
  if (lowerAmenity.includes('air') || lowerAmenity.includes('ac') || lowerAmenity.includes('conditioning')) return Wind;
  if (lowerAmenity.includes('washer') || lowerAmenity.includes('laundry')) return Warehouse;
  if (lowerAmenity.includes('coffee')) return Coffee;
  if (lowerAmenity.includes('fire') || lowerAmenity.includes('bbq') || lowerAmenity.includes('grill')) return Flame;
  if (lowerAmenity.includes('water') || lowerAmenity.includes('shower')) return Droplets;
  if (lowerAmenity.includes('mountain') || lowerAmenity.includes('hill')) return Mountain;
  if (lowerAmenity.includes('ocean') || lowerAmenity.includes('sea') || lowerAmenity.includes('beach')) return Waves;
  if (lowerAmenity.includes('garden') || lowerAmenity.includes('tree') || lowerAmenity.includes('nature')) return TreePine;
  
  // Default fallback
  return Home;
};

interface AmenitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  amenities: string[];
  propertyName: string;
}

export function AmenitiesModal({ isOpen, onClose, amenities, propertyName }: AmenitiesModalProps) {
  // Group amenities by category (simple grouping for now)
  const categorizeAmenities = (amenities: string[]) => {
    const categories: Record<string, string[]> = {
      'Essentials': [],
      'Features': [],
      'Kitchen & Dining': [],
      'Outdoor': [],
      'Other': [],
    };

    amenities.forEach(amenity => {
      const lower = amenity.toLowerCase();
      if (lower.includes('wifi') || lower.includes('parking') || lower.includes('water') || lower.includes('electric')) {
        categories['Essentials'].push(amenity);
      } else if (lower.includes('kitchen') || lower.includes('cook') || lower.includes('coffee') || lower.includes('dining')) {
        categories['Kitchen & Dining'].push(amenity);
      } else if (lower.includes('pool') || lower.includes('garden') || lower.includes('patio') || lower.includes('bbq') || lower.includes('outdoor') || lower.includes('view')) {
        categories['Outdoor'].push(amenity);
      } else if (lower.includes('tv') || lower.includes('ac') || lower.includes('air') || lower.includes('washer') || lower.includes('bed')) {
        categories['Features'].push(amenity);
      } else {
        categories['Other'].push(amenity);
      }
    });

    // Filter out empty categories
    return Object.fromEntries(
      Object.entries(categories).filter(([_, items]) => items.length > 0)
    );
  };

  const categorizedAmenities = categorizeAmenities(amenities);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            What this place offers
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] px-6 py-4">
          <div className="space-y-8">
            {Object.entries(categorizedAmenities).map(([category, items]) => (
              <div key={category}>
                <h4 className="font-semibold text-lg mb-4">{category}</h4>
                <div className="space-y-4">
                  {items.map((amenity) => {
                    const IconComponent = getAmenityIcon(amenity);
                    return (
                      <div 
                        key={amenity} 
                        className="flex items-center gap-4 py-2 border-b border-border/50 last:border-b-0"
                      >
                        <IconComponent className="h-6 w-6 text-foreground shrink-0" />
                        <span className="text-foreground">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
