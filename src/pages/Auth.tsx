import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, Mail, Eye, EyeOff, User, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

type AuthForm = z.infer<typeof authSchema>;
type UserRole = 'guest' | 'host';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('guest');
  const { user, signIn, signUp: authSignUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
  });

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const onSubmit = async (data: AuthForm) => {
    setIsLoading(true);
    try {
      if (isSignUp) {
        // Sign up the user
        const { error } = await authSignUp(data.email, data.password, data.fullName);
        if (error) {
          // Handle specific error messages
          if (error.message.includes('already registered')) {
            toast({ 
              title: 'Account exists', 
              description: 'This email is already registered. Try signing in instead.',
              variant: 'destructive' 
            });
          } else {
            toast({ title: 'Sign up failed', description: error.message, variant: 'destructive' });
          }
        } else {
          // If host role selected, add it (guest role is added by default via trigger)
          if (selectedRole === 'host') {
            // Wait briefly for auth to complete and then add host role
            setTimeout(async () => {
              const { data: sessionData } = await supabase.auth.getSession();
              if (sessionData.session?.user) {
                await supabase.from('user_roles').insert({
                  user_id: sessionData.session.user.id,
                  role: 'host'
                });
              }
            }, 500);
          }
          
          toast({ 
            title: selectedRole === 'host' ? 'Welcome, Host!' : 'Welcome to Agribnv!', 
            description: selectedRole === 'host' 
              ? 'Your host account has been created. Start listing your farm!' 
              : 'Your account has been created.' 
          });
          navigate('/');
        }
      } else {
        const { error } = await signIn(data.email, data.password);
        if (error) {
          if (error.message.includes('Invalid login')) {
            toast({ 
              title: 'Invalid credentials', 
              description: 'Email or password is incorrect. Please try again.',
              variant: 'destructive' 
            });
          } else {
            toast({ title: 'Sign in failed', description: error.message, variant: 'destructive' });
          }
        } else {
          navigate('/');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="bg-card rounded-t-2xl border-b p-4 flex items-center justify-center relative">
          <Link to="/" className="absolute left-4">
            <X className="h-5 w-5" />
          </Link>
          <h2 className="font-semibold">
            {isSignUp ? 'Sign up' : 'Log in'}
          </h2>
        </div>

        {/* Content */}
        <div className="bg-card rounded-b-2xl border border-t-0 p-6 shadow-card">
          <h1 className="text-2xl font-semibold mb-6">
            Welcome to Agribnv
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role Selection for Sign Up */}
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <p className="text-sm font-medium text-muted-foreground">I want to:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('guest')}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                        selectedRole === 'guest'
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        selectedRole === 'guest' ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        <User className="h-6 w-6" />
                      </div>
                      <span className="font-medium text-sm">Book Stays</span>
                      <span className="text-xs text-muted-foreground text-center">Find & book farm experiences</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('host')}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                        selectedRole === 'host'
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        selectedRole === 'host' ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        <Home className="h-6 w-6" />
                      </div>
                      <span className="font-medium text-sm">Host Guests</span>
                      <span className="text-xs text-muted-foreground text-center">List your farm property</span>
                    </button>
                  </div>

                  <Input 
                    id="fullName" 
                    placeholder="Full name"
                    className="h-14 rounded-xl border-2"
                    {...register('fullName')} 
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Input 
                id="email" 
                type="email" 
                placeholder="Email"
                className="h-14 rounded-xl border-2"
                {...register('email')} 
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2 relative">
              <Input 
                id="password" 
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="h-14 rounded-xl border-2 pr-12"
                {...register('password')} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              By signing up, you agree to our{' '}
              <Link to="/terms" className="underline font-semibold">Terms of Use</Link>
              {' '}and{' '}
              <Link to="/privacy" className="underline font-semibold">Privacy Policy</Link>.
            </p>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-[#E61E4D] to-[#D70466] hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                isSignUp 
                  ? (selectedRole === 'host' ? 'Create Host Account' : 'Create Account')
                  : 'Log in'
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-4 text-sm text-muted-foreground">
              or
            </span>
          </div>

          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full h-12 rounded-xl border-2 font-medium justify-start gap-4"
              disabled
            >
              <Mail className="h-5 w-5" />
              Continue with Google
            </Button>
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); reset(); setSelectedRole('guest'); }}
              className="text-sm font-semibold underline"
            >
              {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
