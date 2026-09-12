import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types';

interface AuthContextValue {
  user: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, role: UserRole, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) return null;
    return data as Profile;
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && mounted) {
        const profile = await fetchProfile(session.user.id);
        if (mounted) setUser(profile);
      }
      if (mounted) setLoading(false);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          return;
        }
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const profile = await fetchProfile(session.user.id);
          setUser(profile);
        }
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, role: UserRole, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (!data.user) return { error: 'Failed to create account.' };

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email,
        role,
        full_name: fullName,
      });
    if (profileError) return { error: profileError.message };

    const profile = await fetchProfile(data.user.id);
    setUser(profile);
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (!data.user) return { error: 'Login failed.' };

    const profile = await fetchProfile(data.user.id);
    if (!profile) return { error: 'Profile not found. Please contact support.' };
    if (profile.status === 'suspended') return { error: 'Account suspended. Contact admin.' };
    setUser(profile);
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    if (error) return { error: error.message };
    const updated = await fetchProfile(user.id);
    setUser(updated);
    return { error: null };
  };

  const refreshProfile = async () => {
    if (!user) return;
    const profile = await fetchProfile(user.id);
    setUser(profile);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
