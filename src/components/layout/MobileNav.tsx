import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, User, LayoutDashboard, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const { user, isHost } = useAuth();
  const location = useLocation();

  const navItems = [
    { href: '/', label: 'Explore', icon: Search },
    ...(user ? [{ href: '/bookings', label: 'Bookings', icon: Calendar }] : []),
    ...(isHost ? [{ href: '/host', label: 'Host', icon: LayoutDashboard }] : []),
    ...(user 
      ? [{ href: '/profile', label: 'Profile', icon: User }]
      : [{ href: '/auth', label: 'Sign In', icon: User }]
    ),
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px]',
              isActive(item.href)
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <item.icon className={cn('h-5 w-5', isActive(item.href) && 'text-primary')} />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
