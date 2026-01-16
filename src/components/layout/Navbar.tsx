import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, User, LogOut, Calendar, Plus, LayoutDashboard, Globe } from 'lucide-react';
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
import { SearchBar } from '@/components/search/SearchBar';
import { cn } from '@/lib/utils';

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

// Agribnv Logo Component - Based on brand guide (A with leaf)
function AgribnvLogo({ className = '', showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <svg viewBox="0 0 48 48" fill="none" className="h-10 w-10">
        {/* Main A shape - triangle with notch */}
        <path 
          d="M24 4L44 44H35L24 24L13 44H4L24 4Z" 
          fill="currentColor"
          className="text-primary"
        />
        {/* Leaf curve integrated into A */}
        <path 
          d="M24 14C24 14 19 22 19 28C19 32 21 34 24 34C27 34 29 32 29 28C29 22 24 14 24 14Z" 
          fill="hsl(84, 48%, 66%)"
        />
        {/* Leaf stem */}
        <path 
          d="M24 18V30" 
          stroke="currentColor" 
          strokeWidth="1.5"
          strokeLinecap="round"
          className="text-primary"
        />
        {/* Small leaf accent */}
        <path 
          d="M24 22C26 22 27 24 27 24C27 24 26 26 24 26" 
          stroke="currentColor" 
          strokeWidth="1"
          strokeLinecap="round"
          className="text-primary"
          fill="none"
        />
      </svg>
      {showText && (
        <span className="hidden md:block text-xl font-bold text-primary tracking-tight font-display">
          Agribnv
        </span>
      )}
    </div>
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
  const { user, profile, isHost, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
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
          <div className="flex items-center gap-2 flex-shrink-0 w-[100px] md:w-[140px] justify-end">
            {isHost && (
              <Button 
                variant="ghost" 
                className="hidden lg:flex rounded-full font-medium text-primary hover:bg-sage/20"
                asChild
              >
                <Link to="/host">Switch to hosting</Link>
              </Button>
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
            className="fixed inset-0 bg-black/20 z-40"
            style={{ top: 80 }}
            onClick={() => setIsSearchExpanded(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
