import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Bookmark, Home, Mail, User, Building2, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import haptics from '@/utils/haptics';

export function MobileNav() {
  const { user, isHost } = useAuth();
  const location = useLocation();

  // Different navigation for hosts vs guests
  const guestNavItems = [
    { href: '/', label: 'Explore', icon: Compass, isCenter: false },
    { href: '/wishlists', label: 'Wishlist', icon: Bookmark, isCenter: false },
    { href: '/', label: 'Home', icon: Home, isCenter: true },
    { href: '/inbox', label: 'Inbox', icon: Mail, isCenter: false },
    ...(user 
      ? [{ href: '/profile', label: 'Profile', icon: User, isCenter: false }]
      : [{ href: '/auth', label: 'Log in', icon: User, isCenter: false }]
    ),
  ];

  const hostNavItems = [
    { href: '/host', label: 'Dashboard', icon: Building2, isCenter: false },
    { href: '/bookings', label: 'Bookings', icon: Calendar, isCenter: false },
    { href: '/host', label: 'Home', icon: Home, isCenter: true },
    { href: '/inbox', label: 'Inbox', icon: Mail, isCenter: false },
    { href: '/profile', label: 'Profile', icon: User, isCenter: false },
  ];

  const navItems = isHost ? hostNavItems : guestNavItems;

  const isActive = (path: string, label: string) => {
    // Special handling for Home vs Explore which share the same path
    if (label === 'Home') return false; // Home is never "active" visually
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-pb px-4 pb-2">
      <div className="flex items-end justify-around py-2 px-2 bg-primary rounded-[28px] shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.label);
          
          // Center home button - elevated
          if (item.isCenter) {
            return (
              <Link
                key={`${item.href}-${item.label}`}
                to={item.href}
                onClick={() => haptics.medium()}
                className="relative -mt-6"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center shadow-lg border-4 border-background"
                >
                  <Icon className="h-6 w-6 text-primary" strokeWidth={2} />
                </motion.div>
              </Link>
            );
          }
          
          return (
            <Link
              key={`${item.href}-${item.label}`}
              to={item.href}
              onClick={() => haptics.selection()}
              className="flex flex-col items-center gap-0.5 py-1.5 px-3"
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Icon 
                  className={cn(
                    'h-5 w-5 transition-colors',
                    active 
                      ? 'text-secondary' 
                      : 'text-primary-foreground/70'
                  )}
                  strokeWidth={active ? 2.5 : 1.5}
                  fill={active && item.icon === Bookmark ? 'currentColor' : 'none'}
                />
              </motion.div>
              <span className={cn(
                'text-[10px] font-medium transition-colors',
                active ? 'text-secondary' : 'text-primary-foreground/70'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
