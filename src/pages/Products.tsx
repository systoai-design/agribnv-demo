import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowLeft, MapPin } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SampleProduct {
  id: string;
  name: string;
  emoji: string;
  gradient: string;
  price: number;
  unit: string;
  farm: string;
  location: string;
  category: string;
}

const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    id: 'mangoes',
    name: 'Sweet Carabao Mangoes',
    emoji: '🥭',
    gradient: 'from-amber-300 via-yellow-300 to-orange-400',
    price: 350,
    unit: 'per kg',
    farm: 'Mango Heritage Farm',
    location: 'Jordan, Guimaras',
    category: 'Fresh Produce',
  },
  {
    id: 'honey',
    name: 'Raw Forest Honey',
    emoji: '🍯',
    gradient: 'from-amber-400 via-amber-500 to-orange-500',
    price: 450,
    unit: '500ml jar',
    farm: 'Palawan Bee Farm',
    location: 'Puerto Princesa',
    category: 'Preserves',
  },
  {
    id: 'milk',
    name: 'Fresh Carabao Milk',
    emoji: '🥛',
    gradient: 'from-slate-100 via-stone-200 to-neutral-300',
    price: 180,
    unit: 'per liter',
    farm: 'Lakbay Dairy Farm',
    location: 'Lipa, Batangas',
    category: 'Dairy',
  },
  {
    id: 'kesong-puti',
    name: 'Kesong Puti',
    emoji: '🧀',
    gradient: 'from-yellow-100 via-amber-100 to-yellow-200',
    price: 280,
    unit: '250g block',
    farm: 'Lakbay Dairy Farm',
    location: 'Lipa, Batangas',
    category: 'Dairy',
  },
  {
    id: 'veggies',
    name: 'Organic Highland Veggie Box',
    emoji: '🥬',
    gradient: 'from-lime-300 via-green-400 to-emerald-500',
    price: 650,
    unit: '5kg mix',
    farm: 'Baguio Strawberry Homestay',
    location: 'Baguio, Benguet',
    category: 'Fresh Produce',
  },
  {
    id: 'strawberries',
    name: 'Baguio Strawberries',
    emoji: '🍓',
    gradient: 'from-rose-300 via-red-400 to-rose-500',
    price: 420,
    unit: 'per kg',
    farm: 'Baguio Strawberry Homestay',
    location: 'Baguio, Benguet',
    category: 'Fresh Produce',
  },
  {
    id: 'coconut-oil',
    name: 'Virgin Coconut Oil',
    emoji: '🥥',
    gradient: 'from-stone-200 via-amber-100 to-stone-300',
    price: 320,
    unit: '500ml bottle',
    farm: 'Calauan Countryside',
    location: 'Calauan, Laguna',
    category: 'Preserves',
  },
  {
    id: 'eggs',
    name: 'Free-Range Farm Eggs',
    emoji: '🥚',
    gradient: 'from-amber-50 via-orange-100 to-amber-200',
    price: 180,
    unit: 'dozen',
    farm: 'Mango Heritage Farm',
    location: 'Jordan, Guimaras',
    category: 'Fresh Produce',
  },
  {
    id: 'coco-sugar',
    name: 'Organic Coco Sugar',
    emoji: '🧂',
    gradient: 'from-amber-600 via-orange-700 to-amber-800',
    price: 220,
    unit: '500g jar',
    farm: 'Pinto Highland Cottage',
    location: 'Tagaytay, Cavite',
    category: 'Preserves',
  },
  {
    id: 'basket',
    name: 'Handwoven Abaca Basket',
    emoji: '🧺',
    gradient: 'from-amber-700 via-orange-800 to-stone-700',
    price: 850,
    unit: 'each',
    farm: 'Bamboo Nipa Hut',
    location: 'Nueva Valencia, Guimaras',
    category: 'Crafts',
  },
  {
    id: 'rice',
    name: 'Heirloom Red Rice',
    emoji: '🌾',
    gradient: 'from-amber-500 via-red-400 to-rose-500',
    price: 280,
    unit: '2kg bag',
    farm: 'Carabao Countryside',
    location: 'Calauan, Laguna',
    category: 'Staples',
  },
  {
    id: 'dried-mangoes',
    name: 'Dried Mango Strips',
    emoji: '🥭',
    gradient: 'from-yellow-400 via-amber-500 to-orange-600',
    price: 180,
    unit: '150g pack',
    farm: 'Mango Heritage Farm',
    location: 'Jordan, Guimaras',
    category: 'Preserves',
  },
];

const CATEGORIES = Array.from(new Set(SAMPLE_PRODUCTS.map((p) => p.category)));

export default function Products() {
  return (
    <Layout>
      <div className="container max-w-6xl px-4 py-6 md:py-10">
        {/* Header */}
        <div className="mb-6 md:mb-10">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Coming Soon — Preview
          </motion.div>
          <motion.h1
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="font-display text-3xl md:text-4xl font-bold mb-2"
          >
            Farm Products
          </motion.h1>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-sm md:text-base max-w-2xl"
          >
            Shop fresh produce, preserves, dairy, and crafts direct from local
            farmers. The marketplace launches soon — here's a peek at what's
            coming.
          </motion.p>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-6 -mx-4 px-4 md:mx-0 md:px-0">
          <button
            type="button"
            className="shrink-0 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium"
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className="shrink-0 px-4 py-2 rounded-full bg-card border border-border/50 text-foreground text-sm font-medium hover:border-primary/50 transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {SAMPLE_PRODUCTS.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.3 }}
              className="group relative"
            >
              <div className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-soft hover:shadow-md transition-shadow">
                {/* Image area: gradient + emoji */}
                <div
                  className={cn(
                    'aspect-square flex items-center justify-center relative bg-gradient-to-br',
                    product.gradient
                  )}
                >
                  <span className="text-6xl md:text-7xl drop-shadow-sm select-none">
                    {product.emoji}
                  </span>
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Soon
                  </span>
                </div>

                {/* Body */}
                <div className="p-3 md:p-4">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                    {product.category}
                  </p>
                  <h3 className="font-semibold text-sm md:text-base leading-tight mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="font-bold text-base md:text-lg text-foreground">
                      ₱{product.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {product.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{product.farm}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-10 md:mt-14 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Want early access when it launches? For now, book a stay and meet the
            farmers in person.
          </p>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Browse farm stays
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
