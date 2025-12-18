import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/supabase';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

// Combined user type for components (merges User and Profile properties)
export interface CombinedUser {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  birthDate?: string | null;
  targetScore?: number | null;
  role: 'student' | 'instructor' | 'admin';
  avatarUrl?: string | null;
  _id: string; // alias for id for compatibility
}

interface AuthContextType extends AuthState {
  // Auth methods
  signUp: (email: string, password: string, name: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithOAuth: (provider: 'google' | 'kakao' | 'github') => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  // Compatibility aliases and computed properties
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    initialized: false,
  });

  // Fetch user profile from database
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data as Profile;
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState({
            user: session.user,
            profile,
            session,
            loading: false,
            initialized: true,
          });
        } else {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            initialized: true,
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setState(prev => ({ ...prev, loading: false, initialized: true }));
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState({
            user: session.user,
            profile,
            session,
            loading: false,
            initialized: true,
          });
        } else {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            initialized: true,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign up with email/password
  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    return { error };
  };

  // Sign in with email/password
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  // Sign in with OAuth provider
  const signInWithOAuth = async (provider: 'google' | 'kakao' | 'github') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setState({
      user: null,
      profile: null,
      session: null,
      loading: false,
      initialized: true,
    });
  };

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!state.user) {
      return { error: new Error('Not authenticated') };
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates as never)
      .eq('id', state.user.id);

    if (!error) {
      setState(prev => ({
        ...prev,
        profile: prev.profile ? { ...prev.profile, ...updates } : null,
      }));
    }

    return { error: error ? new Error(error.message) : null };
  };

  // Refresh profile
  const refreshProfile = async () => {
    if (state.user) {
      const profile = await fetchProfile(state.user.id);
      setState(prev => ({ ...prev, profile }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signUp,
        signIn,
        signInWithOAuth,
        signOut,
        updateProfile,
        refreshProfile,
        // Compatibility aliases
        isLoading: state.loading,
        isAuthenticated: !!state.user,
        logout: signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // Create a combined user object for component compatibility
  const combinedUser: CombinedUser | null = context.user && context.profile ? {
    id: context.user.id,
    _id: context.user.id,
    email: context.profile.email,
    name: context.profile.name,
    phone: context.profile.phone,
    birthDate: context.profile.birth_date,
    targetScore: context.profile.target_score,
    role: context.profile.role,
    avatarUrl: context.profile.avatar_url,
  } : null;

  return {
    ...context,
    user: combinedUser,
  };
}

// Hook for requiring authentication
// eslint-disable-next-line react-refresh/only-export-components
export function useRequireAuth(redirectTo = '/login') {
  const auth = useAuth();

  useEffect(() => {
    if (auth.initialized && !auth.loading && !auth.user) {
      window.location.href = redirectTo;
    }
  }, [auth.initialized, auth.loading, auth.user, redirectTo]);

  return auth;
}

export default AuthContext;
