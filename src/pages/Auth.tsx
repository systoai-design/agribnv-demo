import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, Mail, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

type AuthForm = z.infer<typeof authSchema>;

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user, signIn, signUp } = useAuth();
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
        const { error } = await signUp(data.email, data.password, data.fullName);
        if (error) {
          toast({ title: 'Sign up failed', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Welcome to Agribnv!', description: 'Your account has been created.' });
          navigate('/');
        }
      } else {
        const { error } = await signIn(data.email, data.password);
        if (error) {
          toast({ title: 'Sign in failed', description: error.message, variant: 'destructive' });
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
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
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
              We'll call or text you to confirm your number. Standard message and data rates apply.{' '}
              <a href="#" className="underline font-semibold">Privacy Policy</a>
            </p>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-[#E61E4D] to-[#D70466] hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Continue'
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
              onClick={() => { setIsSignUp(!isSignUp); reset(); }}
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
