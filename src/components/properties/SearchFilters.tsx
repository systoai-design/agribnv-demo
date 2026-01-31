import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { PropertyCategory, CATEGORY_LABELS, CATEGORY_ICONS } from '@/types/database';
import { cn } from '@/lib/utils';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategories: PropertyCategory[];
  onCategoryChange: (categories: PropertyCategory[]) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  guestCount: number;
  onGuestCountChange: (count: number) => void;
}

const ALL_CATEGORIES: PropertyCategory[] = [
  'farmstay',
  'agri_tourism_farm',
  'integrated_farm',
  'working_farm',
  'nature_farm',
  'homestead_farm',
  'crop_farm',
  'livestock_farm',
  'mixed_farm',
  'educational_farm',
];

export function SearchFilters({
  searchQuery,
  onSearchChange,
  selectedCategories,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  guestCount,
  onGuestCountChange,
}: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCategory = (category: PropertyCategory) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const clearFilters = () => {
    onSearchChange('');
    onCategoryChange([]);
    onPriceRangeChange([0, 10000]);
    onGuestCountChange(1);
  };

  const hasActiveFilters = selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 10000 || guestCount > 1;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search farm stays in Guimaras..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-12 bg-card border-border"
          />
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-12 w-12 shrink-0 relative">
              <SlidersHorizontal className="h-5 w-5" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="flex items-center justify-between">
                Filters
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                )}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-8">
              {/* Price Range */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Price per night</Label>
                <Slider
                  value={priceRange}
                  onValueChange={(value) => onPriceRangeChange(value as [number, number])}
                  min={0}
                  max={10000}
                  step={100}
                  className="mt-2"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>₱{priceRange[0].toLocaleString()}</span>
                  <span>₱{priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              {/* Guest Count */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Guests</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onGuestCountChange(Math.max(1, guestCount - 1))}
                    disabled={guestCount <= 1}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-medium">{guestCount}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onGuestCountChange(guestCount + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Farm Type</Label>
                <div className="flex flex-wrap gap-2">
                  {ALL_CATEGORIES.map((category) => (
                    <Badge
                      key={category}
                      variant={selectedCategories.includes(category) ? 'default' : 'outline'}
                      className={cn(
                        'cursor-pointer text-sm py-2 px-3 transition-colors',
                        selectedCategories.includes(category)
                          ? 'bg-primary hover:bg-primary/90'
                          : 'hover:bg-muted'
                      )}
                      onClick={() => toggleCategory(category)}
                    >
                      <span className="mr-1">{CATEGORY_ICONS[category]}</span>
                      {CATEGORY_LABELS[category]}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Category Pills - Desktop */}
      <div className="hidden md:flex flex-wrap gap-2">
        {ALL_CATEGORIES.map((category) => (
          <Badge
            key={category}
            variant={selectedCategories.includes(category) ? 'default' : 'outline'}
            className={cn(
              'cursor-pointer text-sm py-2 px-4 transition-colors',
              selectedCategories.includes(category)
                ? 'bg-primary hover:bg-primary/90'
                : 'hover:bg-muted'
            )}
            onClick={() => toggleCategory(category)}
          >
            <span className="mr-1.5">{CATEGORY_ICONS[category]}</span>
            {CATEGORY_LABELS[category]}
          </Badge>
        ))}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Active Filters - Mobile */}
      {hasActiveFilters && (
        <div className="flex md:hidden flex-wrap gap-2">
          {selectedCategories.map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => toggleCategory(category)}
            >
              {CATEGORY_ICONS[category]} {CATEGORY_LABELS[category]}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {guestCount > 1 && (
            <Badge variant="secondary">
              {guestCount} guests
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
