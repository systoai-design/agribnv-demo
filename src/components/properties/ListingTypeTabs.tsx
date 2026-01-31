import { motion } from 'framer-motion';
import { Home, Sparkles, MapPin } from 'lucide-react';
import { ListingType, LISTING_TYPE_LABELS } from '@/types/database';
import { cn } from '@/lib/utils';
import haptics from '@/utils/haptics';

interface ListingTypeTabsProps {
  selectedType: ListingType;
  onTypeChange: (type: ListingType) => void;
}

const LISTING_TYPES: { id: ListingType; icon: React.ElementType }[] = [
  { id: 'farm_stay', icon: Home },
  { id: 'farm_experience', icon: Sparkles },
  { id: 'farm_tour', icon: MapPin },
];

export function ListingTypeTabs({ selectedType, onTypeChange }: ListingTypeTabsProps) {
  return (
    <div className="flex items-center justify-center gap-1 p-1 bg-muted/50 rounded-xl">
      {LISTING_TYPES.map((type) => {
        const isSelected = selectedType === type.id;
        const Icon = type.icon;
        
        return (
          <motion.button
            key={type.id}
            onClick={() => {
              haptics.light();
              onTypeChange(type.id);
            }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              isSelected 
                ? 'text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {isSelected && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary rounded-lg"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{LISTING_TYPE_LABELS[type.id]}</span>
              <span className="sm:hidden">{LISTING_TYPE_LABELS[type.id].split(' ')[0]}</span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
