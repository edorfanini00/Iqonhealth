import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase, isSupabaseConfigured } from '@/utils/supabase';
import { getAuthUser, saveAuthUser, clearAuthUser } from '@/utils/storage';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  provider: 'apple' | 'google' | 'email' | 'guest';
  avatar?: string | null;
  onboardingComplete?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string, isSignUp: boolean) => Promise<void>;
  continueAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signInWithApple: async () => {},
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  continueAsGuest: async () => {},
  signOut: async () => {},
  completeOnboarding: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// ═══════════════════════════════════════════════════════════════
// Provider
// ═══════════════════════════════════════════════════════════════

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const useSupabase = isSupabaseConfigured();

  // ─────────────────────────────────────────────────────────────
  // Session Restore
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (useSupabase) {
      // Listen for Supabase auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (session?.user) {
            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || null,
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || null,
              provider: (session.user.app_metadata?.provider as any) || 'email',
              avatar: session.user.user_metadata?.avatar_url || null,
              onboardingComplete: session.user.user_metadata?.onboarding_complete || false,
            };
            setUser(authUser);
            await saveAuthUser(authUser);
          } else {
            setUser(null);
            await clearAuthUser();
          }
          setIsLoading(false);
        }
      );

      // Check for existing session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || null,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || null,
            provider: (session.user.app_metadata?.provider as any) || 'email',
            avatar: session.user.user_metadata?.avatar_url || null,
            onboardingComplete: session.user.user_metadata?.onboarding_complete || false,
          };
          setUser(authUser);
        }
        setIsLoading(false);
      });

      return () => { subscription.unsubscribe(); };
    } else {
      // Fallback: local-only mode
      (async () => {
        try {
          const stored = await getAuthUser();
          if (stored) setUser(stored);
        } catch (e) {
          console.warn('Failed to restore auth session:', e);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Email Sign In / Sign Up
  // ─────────────────────────────────────────────────────────────
  const signInWithEmail = async (emailAddr: string, password: string, isSignUp: boolean) => {
    try {
      if (useSupabase) {
        if (isSignUp) {
          const { data, error } = await supabase.auth.signUp({
            email: emailAddr,
            password: password,
          });
          if (error) throw error;
          if (data.user && !data.session) {
            Alert.alert('Check your email', 'We sent you a confirmation link. Please verify your email to continue.');
            return;
          }
        } else {
          const { error } = await supabase.auth.signInWithPassword({
            email: emailAddr,
            password: password,
          });
          if (error) throw error;
        }
        // Auth state change listener will handle setting the user
      } else {
        // Local fallback
        const authUser: AuthUser = {
          id: `email_${Date.now()}`,
          email: emailAddr,
          name: emailAddr.split('@')[0],
          provider: 'email',
          onboardingComplete: false,
        };
        await saveAuthUser(authUser);
        setUser(authUser);
      }
    } catch (e: any) {
      console.error('Email Auth Error:', e);
      const msg = e?.message || 'Could not sign in. Please try again.';
      Alert.alert('Authentication Error', msg);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Apple Sign In
  // ─────────────────────────────────────────────────────────────
  const signInWithApple = async () => {
    try {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          'Not Available',
          'Apple Sign In requires a native build. Use Email or Guest for now.',
        );
        return;
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (useSupabase && credential.identityToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });
        if (error) throw error;
      } else {
        const authUser: AuthUser = {
          id: credential.user,
          email: credential.email,
          name: credential.fullName
            ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
            : null,
          provider: 'apple',
          onboardingComplete: false,
        };
        await saveAuthUser(authUser);
        setUser(authUser);
      }
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED' || e.code === 'ERR_CANCELED') return;
      console.error('Apple Sign In Error:', e);
      Alert.alert('Apple Sign In', 'Unable to sign in with Apple. Try Email or Guest.');
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Google Sign In
  // ─────────────────────────────────────────────────────────────
  const signInWithGoogle = async () => {
    if (useSupabase) {
      Alert.alert(
        'Coming Soon',
        'Google Sign In with Supabase requires additional OAuth configuration. Use Email or Guest for now.',
      );
    } else {
      Alert.alert(
        'Setup Required',
        'Google Sign In needs a backend. Use Email or Guest for now.',
      );
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Guest
  // ─────────────────────────────────────────────────────────────
  const continueAsGuest = async () => {
    try {
      if (useSupabase) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
      } else {
        const guestUser: AuthUser = {
          id: `guest_${Date.now()}`,
          email: null,
          name: 'Guest',
          provider: 'guest',
          onboardingComplete: false,
        };
        await saveAuthUser(guestUser);
        setUser(guestUser);
      }
    } catch (e: any) {
      console.error('Guest Sign In Error:', e);
      // Fallback to local guest
      const guestUser: AuthUser = {
        id: `guest_${Date.now()}`,
        email: null,
        name: 'Guest',
        provider: 'guest',
        onboardingComplete: false,
      };
      await saveAuthUser(guestUser);
      setUser(guestUser);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Complete Onboarding
  // ─────────────────────────────────────────────────────────────
  const completeOnboarding = async () => {
    if (user) {
      const updated = { ...user, onboardingComplete: true };
      setUser(updated);
      await saveAuthUser(updated);

      if (useSupabase) {
        await supabase.auth.updateUser({
          data: { onboarding_complete: true },
        });
      }
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Sign Out
  // ─────────────────────────────────────────────────────────────
  const signOut = async () => {
    if (useSupabase) {
      await supabase.auth.signOut();
    }
    await clearAuthUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signInWithApple,
        signInWithGoogle,
        signInWithEmail,
        continueAsGuest,
        signOut,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
