import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-5 py-4"
    >
      <div className="flex items-center gap-3">
        <Link to={user ? '/profile' : '/auth'}>
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <p className="text-sm text-muted-foreground">Welcome!</p>
          <p className="font-bold text-foreground text-lg">{firstName}</p>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.9 }}
        className="relative p-2.5 rounded-full bg-card border border-border/50 shadow-sm"
      >
        <Bell className="h-5 w-5 text-foreground" />
        {/* Notification dot */}
        <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
      </motion.button>
    </motion.div>
  );
}
