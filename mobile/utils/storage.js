import AsyncStorage from '@react-native-async-storage/async-storage';

// ═══════════════════════════════════════════════════════════════
// Async Storage Helpers — replaces localStorage from the web app
// ═══════════════════════════════════════════════════════════════

export async function getProtocols() {
  try {
    const raw = await AsyncStorage.getItem('protocols');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function saveProtocols(protocols) {
  await AsyncStorage.setItem('protocols', JSON.stringify(protocols));
}

export async function getDoseLogs() {
  try {
    const raw = await AsyncStorage.getItem('doseLogs');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export async function saveDoseLogs(logs) {
  await AsyncStorage.setItem('doseLogs', JSON.stringify(logs));
}

export async function isOnboardingComplete() {
  const val = await AsyncStorage.getItem('onboardingComplete');
  return val === 'true';
}

export async function setOnboardingComplete() {
  await AsyncStorage.setItem('onboardingComplete', 'true');
}

export async function saveUserPlan(plan) {
  await AsyncStorage.setItem('userPlan', JSON.stringify(plan));
}

export async function getUserPlan() {
  try {
    const raw = await AsyncStorage.getItem('userPlan');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ═══════════════════════════════════════════════════════════════
// Vial Inventory — per-compound stock tracking
// ═══════════════════════════════════════════════════════════════

export async function getVialInventory() {
  try {
    const raw = await AsyncStorage.getItem('vialInventory');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export async function saveVialInventory(inventory) {
  await AsyncStorage.setItem('vialInventory', JSON.stringify(inventory));
}

// ═══════════════════════════════════════════════════════════════
// Auth Persistence
// ═══════════════════════════════════════════════════════════════

const AUTH_KEY = '@iqon_auth_user';

export async function getAuthUser() {
  try {
    const raw = await AsyncStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export async function saveAuthUser(user) {
  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export async function clearAuthUser() {
  await AsyncStorage.removeItem(AUTH_KEY);
}
