import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Heart, CalendarDays, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const { user, isHost } = useAuth();
  const location = useLocation();

  const navItems = [
    { href: '/', label: 'Explore', icon: Search },
    { href: '/wishlists', label: 'Wishlists', icon: Heart },
    { href: '/bookings', label: 'Trips', icon: CalendarDays },
    ...(user 
      ? [{ href: '/profile', label: 'Profile', icon: User }]
      : [{ href: '/auth', label: 'Log in', icon: User }]
    ),
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/30 md:hidden safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className="flex flex-col items-center gap-1 py-2 px-4 min-w-[60px]"
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className="relative"
              >
                <Icon 
                  className={cn(
                    'h-6 w-6 transition-colors',
                    active 
                      ? 'text-primary' 
                      : 'text-muted-foreground'
                  )}
                  strokeWidth={active ? 2.5 : 1.5}
                  fill={active && item.icon === Heart ? 'currentColor' : 'none'}
                />
                {active && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
              <span className={cn(
                'text-[10px] font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground'
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
