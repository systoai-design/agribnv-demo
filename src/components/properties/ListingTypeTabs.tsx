import { useNavigate } from 'react-router-dom';
import { Home, Sparkles, MapPin, ShoppingBag } from 'lucide-react';
import { ListingType } from '@/types/database';
import { cn } from '@/lib/utils';
import haptics from '@/utils/haptics';

interface ListingTypeTabsProps {
  selectedType: ListingType;
  onTypeChange: (type: ListingType) => void;
}

type TabItem =
  | { kind: 'filter'; id: ListingType; label: string; icon: React.ElementType }
  | { kind: 'link'; id: string; label: string; icon: React.ElementType; to: string };

const TABS: TabItem[] = [
  { kind: 'filter', id: 'farm_stay', label: 'Farm', icon: Home },
  { kind: 'filter', id: 'farm_experience', label: 'Experience', icon: Sparkles },
  { kind: 'filter', id: 'farm_tour', label: 'Tours', icon: MapPin },
  { kind: 'link', id: 'products', label: 'Products', icon: ShoppingBag, to: '/products' },
];

export function ListingTypeTabs({ selectedType, onTypeChange }: ListingTypeTabsProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center gap-1 p-1 bg-muted/50 rounded-xl overflow-x-auto scrollbar-hide">
      {TABS.map((tab) => {
        const isSelected = tab.kind === 'filter' && selectedType === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => {
              haptics.light();
              if (tab.kind === 'filter') {
                onTypeChange(tab.id);
              } else {
                navigate(tab.to);
              }
            }}
            className={cn(
              'relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium shrink-0',
              'transition-all duration-200 ease-out active:scale-95',
              isSelected
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
