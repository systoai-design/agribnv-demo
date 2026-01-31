import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { ArrowLeft, Leaf, Heart, Users, MapPin, Star, Sparkles } from 'lucide-react';
import agribnvLogo from '@/assets/agribnv-logo.png';

export default function About() {
  const features = [
    {
      icon: Leaf,
      title: 'Farm-First Experience',
      description: 'Discover authentic agricultural stays across the beautiful islands of the Philippines.',
    },
    {
      icon: Heart,
      title: 'Support Local Farmers',
      description: 'Every booking directly supports local farming communities and sustainable practices.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Connect with hosts who are passionate about sharing their farming heritage.',
    },
    {
      icon: MapPin,
      title: 'Guimaras & Beyond',
      description: 'Starting in Guimaras, expanding to farmstays across the Philippine archipelago.',
    },
  ];

  return (
    <Layout showMobileNav={false}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm px-4 py-4 border-b border-border/30">
        <div className="flex items-center gap-4 max-w-2xl mx-auto">
          <Link to="/profile">
            <motion.button whileTap={{ scale: 0.9 }} className="p-2 -ml-2">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </motion.button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">About Agribnv</h1>
        </div>
      </div>

      <div className="container py-8 max-w-2xl mx-auto px-4">
        {/* Logo and Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden">
            <img src={agribnvLogo} alt="Agribnv" className="w-16 h-16 object-contain" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Agribnv</h2>
          <p className="text-muted-foreground">Version 1.0.0</p>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Our Mission</h3>
          </div>
          <p className="text-foreground/80 leading-relaxed">
            Agribnv connects travelers with authentic farm experiences across the Philippines. 
            We believe in sustainable tourism that empowers local farmers, preserves agricultural 
            heritage, and creates meaningful connections between urban visitors and rural communities.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 mb-8"
        >
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider px-1">
            What Makes Us Different
          </h3>
          <div className="grid gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-card rounded-xl p-4 shadow-soft flex gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-card rounded-xl p-4 text-center shadow-soft">
            <p className="text-2xl font-bold text-primary">50+</p>
            <p className="text-xs text-muted-foreground">Farm Stays</p>
          </div>
          <div className="bg-card rounded-xl p-4 text-center shadow-soft">
            <p className="text-2xl font-bold text-primary">5</p>
            <p className="text-xs text-muted-foreground">Municipalities</p>
          </div>
          <div className="bg-card rounded-xl p-4 text-center shadow-soft">
            <div className="flex items-center justify-center gap-1">
              <Star className="h-5 w-5 fill-primary text-primary" />
              <p className="text-2xl font-bold text-primary">4.9</p>
            </div>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-sm text-muted-foreground"
        >
          <p>Made with 💚 in Guimaras, Philippines</p>
          <p className="mt-1">© 2024 Agribnv. All rights reserved.</p>
        </motion.div>
      </div>
    </Layout>
  );
}
