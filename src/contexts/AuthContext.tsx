import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
}

type ViewMode = 'guest' | 'host';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isHost: boolean;
  viewMode: ViewMode;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  becomeHost: () => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  switchViewMode: (mode: ViewMode) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('guest');
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<void> => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) {
      setProfile(data);
    }
  };

  const checkHostStatus = async (userId: string): Promise<void> => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'host')
      .maybeSingle();
    
    const hostStatus = !!data;
    setIsHost(hostStatus);
    // Auto-set view mode to host if user is a host (can be changed later)
    if (hostStatus) {
      setViewMode('host');
    }
  };

  const switchViewMode = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
      await checkHostStatus(user.id);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Listener for ONGOING auth changes (does NOT control isLoading)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fire and forget for ongoing changes - don't await, don't set loading
        if (session?.user) {
          fetchProfile(session.user.id);
          checkHostStatus(session.user.id);
        } else {
          setProfile(null);
          setIsHost(false);
          setViewMode('guest');
        }
      }
    );

    // INITIAL load - controls isLoading, awaits role check
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        // Await role check BEFORE setting loading false
        if (session?.user) {
          await Promise.all([
            fetchProfile(session.user.id),
            checkHostStatus(session.user.id)
          ]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || '',
        },
      },
    });

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsHost(false);
    setViewMode('guest');
  };

  const becomeHost = async () => {
    if (!user) {
      return { error: new Error('Not authenticated') };
    }

    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: user.id, role: 'host' });

    if (!error) {
      setIsHost(true);
    }

    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isHost,
        viewMode,
        isLoading,
        signUp,
        signIn,
        signOut,
        becomeHost,
        refreshProfile,
        switchViewMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
