import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, Calendar, Plus, LayoutDashboard, Globe, Search } from 'lucide-react';
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
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, profile, isHost, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border/50">
      <div className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center"
          >
            <svg className="h-8 w-8 text-primary" viewBox="0 0 32 32" fill="currentColor">
              <path d="M16 1c-5.5 0-10 4.5-10 10 0 7.5 10 20 10 20s10-12.5 10-20c0-5.5-4.5-10-10-10zm0 14c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"/>
              <circle cx="16" cy="11" r="2.5"/>
            </svg>
            <span className="hidden sm:block ml-2 text-xl font-bold text-primary">
              agribnv
            </span>
          </motion.div>
        </Link>

        {/* Center Search - Desktop */}
        <div className="hidden md:flex flex-1 justify-center px-8">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-4 px-4 py-2 rounded-full border shadow-soft hover:shadow-soft-lg transition-shadow cursor-pointer"
            onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span className="text-sm font-semibold border-r pr-4">Anywhere</span>
            <span className="text-sm font-semibold border-r pr-4">Any week</span>
            <span className="text-sm text-muted-foreground">Add guests</span>
            <div className="bg-primary text-primary-foreground p-2 rounded-full">
              <Search className="h-4 w-4" />
            </div>
          </motion.div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {isHost && (
            <Button 
              variant="ghost" 
              className="hidden md:flex rounded-full font-semibold"
              asChild
            >
              <Link to="/host">Switch to hosting</Link>
            </Button>
          )}

          <Button variant="ghost" size="icon" className="rounded-full">
            <Globe className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-3 rounded-full pl-3 pr-2 py-6 border-border hover:shadow-soft transition-shadow"
                >
                  <Menu className="h-4 w-4" />
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gray-500 text-white text-sm">
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 rounded-xl shadow-card mt-2" align="end">
              <AnimatePresence>
                {user ? (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="p-3 border-b">
                      <p className="font-semibold">{profile?.full_name || 'Welcome!'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuItem asChild className="py-3 cursor-pointer">
                      <Link to="/bookings">
                        <Calendar className="mr-3 h-4 w-4" />
                        Trips
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="py-3 cursor-pointer">
                      <Link to="/profile">
                        <User className="mr-3 h-4 w-4" />
                        Account
                      </Link>
                    </DropdownMenuItem>
                    {isHost && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="py-3 cursor-pointer">
                          <Link to="/host">
                            <LayoutDashboard className="mr-3 h-4 w-4" />
                            Manage listings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="py-3 cursor-pointer">
                          <Link to="/host/properties/new">
                            <Plus className="mr-3 h-4 w-4" />
                            Create new listing
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="py-3 cursor-pointer text-foreground">
                      <LogOut className="mr-3 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <DropdownMenuItem asChild className="py-3 cursor-pointer font-semibold">
                      <Link to="/auth?mode=signup">Sign up</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="py-3 cursor-pointer">
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
  );
}
