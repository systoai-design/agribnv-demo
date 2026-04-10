import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function WelcomeHeader() {
  const { user, profile } = useAuth();

  const firstName = profile?.full_name?.split(' ')[0] || 'Explorer';
  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 animate-fade-in">
      <div className="flex items-center gap-2.5">
        <Link to={user ? '/profile' : '/auth'}>
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <p className="text-xs text-muted-foreground leading-tight">Welcome!</p>
          <p className="font-bold text-foreground text-base leading-tight">{firstName}</p>
        </div>
      </div>

      <button
        className="relative p-2 rounded-full bg-card border border-border/50 shadow-sm active:scale-90 transition-transform duration-150"
      >
        <Bell className="h-4 w-4 text-foreground" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
      </button>
    </div>
  );
}
