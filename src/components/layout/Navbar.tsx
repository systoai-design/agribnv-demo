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

// Agribnv Logo Component
function AgribnvLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className}>
      {/* Triangle/Mountain shape */}
      <path 
        d="M20 4L36 36H4L20 4Z" 
        fill="currentColor"
      />
      {/* Leaf inside */}
      <path 
        d="M20 12C20 12 15 20 15 26C15 28.5 17 30 20 30C23 30 25 28.5 25 26C25 20 20 12 20 12Z" 
        fill="hsl(100, 35%, 67%)"
      />
      {/* Leaf vein */}
      <path 
        d="M20 16V26" 
        stroke="currentColor" 
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
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
      <motion.header
        initial={false}
        animate={{
          height: isSearchExpanded ? 160 : 80,
        }}
        transition={springTransition}
        className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-sm border-b border-border/50"
      >
        <div className="container h-full flex flex-col">
          {/* Top Row - Logo and User Menu */}
          <div className="flex items-center justify-between h-16 md:h-20 shrink-0">
            {/* Logo */}
            <div className="flex-shrink-0 w-[100px] md:w-[160px]">
              <Link to="/" className="flex items-center gap-2 group">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center"
                >
                  <AgribnvLogo className="h-9 w-9 md:h-10 md:w-10 text-primary" />
                  <span className="hidden md:block ml-2 text-xl font-bold text-primary tracking-tight">
                    Agribnv
                  </span>
                </motion.div>
              </Link>
            </div>

            {/* Center Search - Collapsed (only visible when not expanded) */}
            {showSearch && !isSearchExpanded && (
              <div className="hidden md:flex flex-1 justify-center">
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
            <div className="flex items-center gap-2 flex-shrink-0 w-[100px] md:w-[160px] justify-end">
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

          {/* Expanded Search Row */}
          <AnimatePresence>
            {showSearch && isSearchExpanded && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={springTransition}
                className="hidden md:flex flex-1 items-center justify-center pb-4"
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Backdrop overlay */}
      <AnimatePresence>
        {isSearchExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 z-40"
            style={{ top: 160 }}
            onClick={() => setIsSearchExpanded(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
