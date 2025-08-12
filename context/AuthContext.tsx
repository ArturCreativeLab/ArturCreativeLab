import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User } from '../types';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<{ success: boolean; messageKey: string; }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; messageKey: string; }>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateUser = async (session: Session | null) => {
      if (session?.user && supabase) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
            console.error('Error fetching user profile:', error);
        }
        
        const metadata = session.user.user_metadata as { full_name?: string, name?: string, picture?: string };

        const userData: User = {
          id: session.user.id,
          name: metadata.full_name || metadata.name || 'User',
          email: session.user.email || '',
          picture: metadata.picture || `https://api.dicebear.com/8.x/initials/svg?seed=${metadata.name || metadata.full_name || 'User'}`,
          role: profile?.role === 'admin' ? 'admin' : 'user',
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.removeItem('guest_user');
      } else {
        const guestUserJson = localStorage.getItem('guest_user');
        if (guestUserJson) {
          setUser(JSON.parse(guestUserJson) as User);
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    if (!supabase) {
      const guestUserJson = localStorage.getItem('guest_user');
      if (guestUserJson) {
        setUser(JSON.parse(guestUserJson) as User);
      }
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      void updateUser(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void updateUser(session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    if (!supabase) {
      alert("Supabase is not configured. Google Sign-In is disabled. You can continue as a guest.");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const signUpWithEmail = async (name: string, email: string, password: string) => {
    if (!supabase) return { success: false, messageKey: 'supabase_not_configured' };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });
  
    if (error) {
      return { success: false, messageKey: 'signup_error' };
    }
    if (data.user && !data.session) {
       return { success: true, messageKey: 'signup_success' };
    }
    return { success: true, messageKey: 'signin_success' };
  };

  const signInWithEmail = async (email: string, password: string) => {
      if (!supabase) return { success: false, messageKey: 'supabase_not_configured' };
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        if (error.message === 'Email not confirmed') {
          return { success: false, messageKey: 'signin_email_not_confirmed' };
        }
        return { success: false, messageKey: 'signin_invalid_credentials' };
      }
      return { success: true, messageKey: 'signin_success' };
  };

  const loginAsGuest = () => {
    const guestUser: User = {
      id: 'guest_user_01',
      name: 'Guest User',
      email: 'guest@example.com',
      picture: `https://api.dicebear.com/8.x/initials/svg?seed=Guest`,
      role: 'guest',
    };
    localStorage.setItem('guest_user', JSON.stringify(guestUser));
    setUser(guestUser);
    setLoading(false);
  };

  const logout = async () => {
    localStorage.removeItem('guest_user');
    localStorage.removeItem('user');
    setUser(null);

    if (supabase) {
      await supabase.auth.signOut().catch(console.error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, signUpWithEmail, signInWithEmail, loginAsGuest, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
