import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

export default function Products() {
  return (
    <Layout>
      <div className="container py-16 md:py-24 flex flex-col items-center justify-center text-center max-w-xl mx-auto px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6"
        >
          <ShoppingBag className="h-10 w-10 text-primary" />
        </motion.div>

        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="font-display text-3xl md:text-4xl font-bold mb-3"
        >
          Farm Products
        </motion.h1>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-base md:text-lg mb-8"
        >
          Browse and buy fresh produce, preserves, crafts, and more directly
          from local farmers. Coming soon.
        </motion.p>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
        >
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Back to farm stays
            </Link>
          </Button>
        </motion.div>
      </div>
    </Layout>
  );
}
