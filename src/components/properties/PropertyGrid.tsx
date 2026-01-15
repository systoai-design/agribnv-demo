import { motion } from 'framer-motion';
import { Property } from '@/types/database';
import { PropertyCard } from './PropertyCard';

interface PropertyGridProps {
  properties: Property[];
  isLoading?: boolean;
}

export function PropertyGrid({ properties, isLoading }: PropertyGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <PropertyCardSkeleton key={i} index={i} />
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="text-6xl mb-4">🌾</div>
        <h3 className="text-xl font-semibold mb-2">No exact matches</h3>
        <p className="text-muted-foreground max-w-md">
          Try changing or removing some of your filters or adjusting your search area.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
      {properties.map((property, index) => (
        <PropertyCard key={property.id} property={property} index={index} />
      ))}
    </div>
  );
}

function PropertyCardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="space-y-3"
    >
      <div className="aspect-square rounded-xl bg-muted animate-pulse" />
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-10 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        <div className="h-4 w-28 bg-muted rounded animate-pulse" />
      </div>
    </motion.div>
  );
}
