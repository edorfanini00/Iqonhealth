// Supabase client for IQON Health
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// ═══════════════════════════════════════════════════════════════
// SUPABASE CONFIGURATION
// ═══════════════════════════════════════════════════════════════
// Go to https://supabase.com → Create a project → Settings → API
// Copy your Project URL and anon/public key below.
// ═══════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://pkmewannomgivudbmseq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrbWV3YW5ub21naXZ1ZGJtc2VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMTMzNjYsImV4cCI6MjA5MTc4OTM2Nn0.QFAwNTQX00tEh-1eSBHf44hvISunetNmidx_xwRLbNg';

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
