import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useShare } from '@/hooks/useShare';
import { 
  Loader2, 
  Camera, 
  ArrowLeft, 
  ChevronRight, 
  Lock,
  Info,
  FileText, 
  Shield, 
  Share2,
  LogOut,
  User,
  Repeat
} from 'lucide-react';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  avatar_url: z.string().url().optional().or(z.literal('')),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, profile, refreshProfile, signOut, isHost, viewMode, switchViewMode, becomeHost } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { share } = useShare();
  const [isLoading, setIsLoading] = useState(false);
  const [isBecomingHost, setIsBecomingHost] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleSwitchMode = () => {
    if (viewMode === 'host') {
      switchViewMode('guest');
      navigate('/');
      toast({ title: 'Switched to Guest mode', description: 'Now browsing as a traveler.' });
    } else {
      switchViewMode('host');
      navigate('/host');
      toast({ title: 'Switched to Host mode', description: 'Now managing your listings.' });
    }
  };

  const handleShareApp = () => {
    share({
      title: 'Agribnv - Farm Stay Experiences',
      text: 'Discover authentic farm stays and agricultural experiences across the Philippines! 🌿',
      url: window.location.origin,
    });
  };

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      avatar_url: profile?.avatar_url || '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || '',
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          avatar_url: data.avatar_url || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      setIsEditing(false);
      toast({ title: 'Profile updated!' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBecomeHost = async () => {
    setIsBecomingHost(true);
    const { error } = await becomeHost();
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Welcome, Host!', description: 'You can now list your properties.' });
    }
    setIsBecomingHost(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20 }}
            className="text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <User className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Your profile</h1>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Sign in to manage your profile and settings.
            </p>
            <Button onClick={() => navigate('/auth')} size="lg">Sign In</Button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  const avatarUrl = watch('avatar_url');
  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U';
  const username = profile?.full_name?.toLowerCase().replace(/\s+/g, '') || 'user';

  const settingsItems = [
    { icon: Lock, label: 'Change Password', href: '/change-password' },
  ];

  const infoItems = [
    { icon: Info, label: 'About App', href: '/about' },
    { icon: FileText, label: 'Terms of Use', href: '/terms' },
    { icon: Shield, label: 'Privacy Policy', href: '/privacy' },
    { icon: Share2, label: 'Share This App', href: '#', action: 'share' },
  ];

  return (
    <Layout>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background px-4 py-4 border-b border-border/30 md:hidden">
        <div className="flex items-center gap-4">
          <Link to="/">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="p-2 -ml-2"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </motion.button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Profile</h1>
        </div>
      </div>

      <div className="container py-8 max-w-md mx-auto px-4">
        {/* Profile Avatar Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="relative mb-4">
            <Avatar className="h-28 w-28 border-4 border-card shadow-lg">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button 
              onClick={() => setIsEditing(true)}
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg border-2 border-card"
            >
              <Camera className="h-5 w-5" />
            </button>
          </div>
          <h2 className="text-xl font-bold text-foreground">{profile?.full_name || 'Your Name'}</h2>
          <p className="text-muted-foreground">@{username}</p>
        </motion.div>

        {/* Edit Form (when editing) */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-card rounded-2xl p-4 mb-6 shadow-soft"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" {...register('full_name')} />
                {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <Input id="avatar_url" placeholder="https://..." {...register('avatar_url')} />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Host Mode Toggle - For users who are hosts */}
        {isHost && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-secondary/20 rounded-2xl p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-secondary-foreground">
                  {viewMode === 'host' ? 'You\'re in Host mode' : 'You\'re in Guest mode'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {viewMode === 'host' ? 'Managing your listings' : 'Browsing farm stays'}
                </p>
              </div>
              <Button onClick={handleSwitchMode} variant="outline" size="sm" className="gap-2">
                <Repeat className="h-4 w-4" />
                {viewMode === 'host' ? 'Switch to Guest' : 'Switch to Host'}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Become Host Card - Only for non-hosts */}
        {!isHost && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-primary/10 rounded-2xl p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-primary">Become a Host</h3>
                <p className="text-sm text-muted-foreground">List your property and earn</p>
              </div>
              <Button onClick={handleBecomeHost} disabled={isBecomingHost} size="sm">
                {isBecomingHost && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Start
              </Button>
            </div>
          </motion.div>
        )}

        {/* General Settings Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3 px-1">
            General Settings
          </h3>
          <div className="bg-card rounded-2xl overflow-hidden shadow-soft">
            {settingsItems.map((item, index) => (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center justify-between p-4 hover:bg-muted/50 transition-colors ${
                  index < settingsItems.length - 1 ? 'border-b border-border/30' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3 px-1">
            Information
          </h3>
          <div className="bg-card rounded-2xl overflow-hidden shadow-soft">
            {infoItems.map((item, index) => {
              const baseClassName = `flex items-center justify-between p-4 hover:bg-muted/50 transition-colors w-full text-left ${
                index < infoItems.length - 1 ? 'border-b border-border/30' : ''
              }`;
              
              if (item.action === 'share') {
                return (
                  <button
                    key={item.label}
                    onClick={handleShareApp}
                    type="button"
                    className={baseClassName}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-foreground">{item.label}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                );
              }
              
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={baseClassName}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-foreground">{item.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Sign Out Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button 
            variant="outline" 
            onClick={handleSignOut} 
            className="w-full rounded-2xl h-12 text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </div>
    </Layout>
  );
}
