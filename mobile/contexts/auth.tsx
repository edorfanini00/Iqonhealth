import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase, isSupabaseConfigured } from '@/utils/supabase';
import { getAuthUser, saveAuthUser, clearAuthUser, isPaidUser, setPaidUser as storageSetPaid } from '@/utils/storage';

WebBrowser.maybeCompleteAuthSession();

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
  isPaid: boolean;
  setUserPaid: () => Promise<void>;
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
  isPaid: false,
  setUserPaid: async () => {},
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
  const [isPaid, setIsPaid] = useState(false);
  const useSupabase = isSupabaseConfigured();

  // Load payment status from storage on mount
  useEffect(() => {
    isPaidUser().then(paid => setIsPaid(paid));
  }, []);

  const setUserPaid = async () => {
    await storageSetPaid();
    setIsPaid(true);
  };

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
          // Session restore failed — start fresh
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
      // Email auth error handled via alert below
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
      if (!isAvailable) return; // Silently skip on simulators/Expo Go

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const storedUser = await getAuthUser();
      const authUser: AuthUser = {
        id: credential.user,
        email: credential.email || storedUser?.email || null,
        name: credential.fullName
          ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim() || storedUser?.name || null
          : storedUser?.name || null,
        provider: 'apple',
        onboardingComplete: storedUser?.id === credential.user ? storedUser.onboardingComplete : false,
      };
      await saveAuthUser(authUser);
      setUser(authUser);
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED' || e.code === 'ERR_CANCELED') return;
      Alert.alert('Sign In Failed', 'Unable to complete sign in. Please try again.');
    }
  };

  // ─────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────
  // Google Sign In
  // ─────────────────────────────────────────────────────────────
  const signInWithGoogle = async () => {
    try {
      const redirectUrl = AuthSession.makeRedirectUri({ scheme: 'iqon', path: 'auth/callback' });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl, skipBrowserRedirect: true },
      });

      if (error || !data.url) throw new Error('oauth_failed');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (result.type === 'success' && result.url) {
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(result.url);
        if (sessionError) throw new Error('session_failed');
      }
    } catch (e: any) {
      const msg = e.message || '';
      if (msg.includes('cancel') || msg.includes('dismiss') || msg.includes('Cancel')) return;
      Alert.alert('Sign In Failed', 'Unable to complete sign in. Please try again.');
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
      // Guest sign in failed — using local fallback
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
        isPaid,
        setUserPaid,
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
