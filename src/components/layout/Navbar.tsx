import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, User, LogOut, Calendar, Plus, LayoutDashboard, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import { SearchBar } from '@/components/search/SearchBar';
import { cn } from '@/lib/utils';
import agribnvLogo from '@/assets/agribnv-logo.png';

interface NavbarProps {
  searchLocation?: string;
  onSearchLocationChange?: (location: string) => void;
  searchDateRange?: { from: Date | undefined; to: Date | undefined };
  onSearchDateRangeChange?: (range: { from: Date | undefined; to: Date | undefined }) => void;
  searchGuestCount?: number;
  onSearchGuestCountChange?: (count: number) => void;
  onSearch?: () => void;
  showSearch?: boolean;
}

// Agribnv Logo Component - Using brand logo image
function AgribnvLogo({ className = '' }: { className?: string }) {
  return (
    <img 
      src={agribnvLogo} 
      alt="Agribnv" 
      className={cn("h-10 w-auto", className)} 
    />
  );
}

const springTransition = {
  type: 'spring',
  damping: 28,
  stiffness: 350,
  mass: 0.8,
};

export function Navbar({
  searchLocation = '',
  onSearchLocationChange,
  searchDateRange = { from: undefined, to: undefined },
  onSearchDateRangeChange,
  searchGuestCount = 1,
  onSearchGuestCountChange,
  onSearch,
  showSearch = true,
}: NavbarProps) {
  const { user, profile, isHost, viewMode, switchViewMode, signOut } = useAuth();
  const { unreadMessageCount } = useNotifications();
  const navigate = useNavigate();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSwitchMode = () => {
    if (viewMode === 'host') {
      switchViewMode('guest');
      navigate('/');
    } else {
      switchViewMode('host');
      navigate('/host');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-sm border-b border-border/50">
        <div className="container h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0 w-[100px] md:w-[140px]">
            <Link to="/" className="flex items-center group">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <AgribnvLogo />
              </motion.div>
            </Link>
          </div>

          {/* Center Search - Always in same position, animates width */}
          {showSearch && (
            <div className="hidden md:flex flex-1 justify-center px-4">
              <SearchBar
                location={searchLocation}
                onLocationChange={onSearchLocationChange || (() => {})}
                dateRange={searchDateRange}
                onDateRangeChange={onSearchDateRangeChange || (() => {})}
                guestCount={searchGuestCount}
                onGuestCountChange={onSearchGuestCountChange || (() => {})}
                onSearch={onSearch}
                isExpanded={isSearchExpanded}
                onExpandedChange={setIsSearchExpanded}
              />
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 w-[100px] md:w-[180px] justify-end">
            {isHost && (
              <Button
                variant="ghost"
                className="hidden lg:flex rounded-full font-medium text-primary hover:bg-sage/20"
                onClick={handleSwitchMode}
              >
                {viewMode === 'host' ? 'Switch to traveling' : 'Switch to hosting'}
              </Button>
            )}

            {user && (
              <Link to="/inbox" className="relative hidden md:inline-flex" aria-label="Messages">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-10 w-10 hover:bg-sage/20"
                >
                  <Mail className="h-5 w-5 text-foreground" />
                </Button>
                {unreadMessageCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center ring-2 ring-card">
                    {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                  </span>
                )}
              </Link>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 md:gap-3 rounded-full px-2 md:pl-3 md:pr-2 py-5 md:py-6 border-border hover:shadow-soft transition-all hover:border-primary/30"
                  >
                    <Menu className="h-4 w-4 text-foreground" />
                    <Avatar className="h-7 w-7 md:h-8 md:w-8">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                        {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 rounded-2xl shadow-card mt-2 border-border/50" align="end">
                <AnimatePresence>
                  {user ? (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="p-4 border-b border-border/50">
                        <p className="font-semibold text-foreground">{profile?.full_name || 'Welcome!'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <DropdownMenuItem asChild className="py-3 px-4 cursor-pointer">
                        <Link to="/inbox" className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-primary" />
                          <span>Messages</span>
                          {unreadMessageCount > 0 && (
                            <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold flex items-center justify-center">
                              {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                            </span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="py-3 px-4 cursor-pointer">
                        <Link to="/bookings" className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>Trips</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="py-3 px-4 cursor-pointer">
                        <Link to="/profile" className="flex items-center gap-3">
                          <User className="h-4 w-4 text-primary" />
                          <span>Account</span>
                        </Link>
                      </DropdownMenuItem>
                      {isHost && (
                        <>
                          <DropdownMenuSeparator className="bg-border/50" />
                          <DropdownMenuItem asChild className="py-3 px-4 cursor-pointer">
                            <Link to="/host" className="flex items-center gap-3">
                              <LayoutDashboard className="h-4 w-4 text-primary" />
                              <span>Manage listings</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="py-3 px-4 cursor-pointer">
                            <Link to="/host/properties/new" className="flex items-center gap-3">
                              <Plus className="h-4 w-4 text-primary" />
                              <span>Create new listing</span>
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator className="bg-border/50" />
                      <DropdownMenuItem onClick={handleSignOut} className="py-3 px-4 cursor-pointer text-foreground">
                        <LogOut className="mr-3 h-4 w-4 text-muted-foreground" />
                        Log out
                      </DropdownMenuItem>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <DropdownMenuItem asChild className="py-3 px-4 cursor-pointer font-semibold">
                        <Link to="/auth?mode=signup">Sign up</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="py-3 px-4 cursor-pointer">
                        <Link to="/auth">Log in</Link>
                      </DropdownMenuItem>
                    </motion.div>
                  )}
                </AnimatePresence>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Backdrop overlay */}
      <AnimatePresence>
        {isSearchExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/45 backdrop-blur-[2px] z-40"
            style={{ top: 80 }}
            onClick={() => setIsSearchExpanded(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
