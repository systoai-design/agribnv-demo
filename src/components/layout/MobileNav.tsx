import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Heart, User, LayoutDashboard, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const { user, isHost } = useAuth();
  const location = useLocation();

  const navItems = [
    { href: '/', label: 'Explore', icon: Search },
    ...(user ? [{ href: '/bookings', label: 'Trips', icon: Calendar }] : []),
    ...(isHost ? [{ href: '/host', label: 'Host', icon: LayoutDashboard }] : []),
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="flex flex-col items-center gap-1 px-4 py-2"
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              className={cn(
                'transition-colors',
                isActive(item.href) ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-6 w-6" strokeWidth={isActive(item.href) ? 2.5 : 1.5} />
            </motion.div>
            <span className={cn(
              'text-[10px] font-medium',
              isActive(item.href) ? 'text-primary' : 'text-muted-foreground'
            )}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
