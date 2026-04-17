// Supabase client for IQON Health
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// ═══════════════════════════════════════════════════════════════
// SUPABASE CONFIGURATION
// ═══════════════════════════════════════════════════════════════
// Go to https://supabase.com → Create a project → Settings → API
// Copy your Project URL and anon/public key below.
// ═══════════════════════════════════════════════════════════════

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Safe storage adapter that won't crash during SSR/web builds
const createStorageAdapter = () => {
  let AsyncStorage: any = null;

  const getStorage = async () => {
    if (!AsyncStorage) {
      try {
        const mod = require('@react-native-async-storage/async-storage');
        AsyncStorage = mod.default || mod;
      } catch {
        // Fallback for web/SSR where AsyncStorage may not be available
        return null;
      }
    }
    return AsyncStorage;
  };

  return {
    getItem: async (key: string) => {
      const storage = await getStorage();
      if (!storage) return null;
      try {
        return await storage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: async (key: string, value: string) => {
      const storage = await getStorage();
      if (!storage) return;
      try {
        await storage.setItem(key, value);
      } catch {}
    },
    removeItem: async (key: string) => {
      const storage = await getStorage();
      if (!storage) return;
      try {
        await storage.removeItem(key);
      } catch {}
    },
  };
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: createStorageAdapter(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !SUPABASE_URL.includes('YOUR_PROJECT') && !SUPABASE_ANON_KEY.includes('YOUR_ANON_KEY');
};
