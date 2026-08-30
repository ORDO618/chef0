'use client';

import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import {
  Ingredient,
  ShoppingItem,
  Recipe,
  ChefDiaryEntry,
  ZeroWasteStats,
  CloudUserProfile,
  CloudSyncEvent,
  CloudSyncState,
} from './types';

// Storage keys
const SUPABASE_CUSTOM_URL_KEY = 'sefsifir_custom_supabase_url';
const SUPABASE_CUSTOM_KEY_KEY = 'sefsifir_custom_supabase_anon_key';
const DEVICE_ID_KEY = 'sefsifir_device_id';
const DEVICE_NAME_KEY = 'sefsifir_device_name';
const CLOUD_USER_PROFILE_KEY = 'sefsifir_cloud_user_profile';
const LAST_SYNC_KEY = 'sefsifir_last_cloud_sync';

let cachedClient: SupabaseClient | null = null;
let currentClientKey: string = '';

/**
 * Detect or generate unique Device ID & Device Name
 */
export function getDeviceInfo(): { deviceId: string; deviceName: string } {
  if (typeof window === 'undefined') {
    return { deviceId: 'server-env', deviceName: 'Server' };
  }

  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  let deviceName = localStorage.getItem(DEVICE_NAME_KEY);
  if (!deviceName) {
    const ua = navigator.userAgent;
    if (/iPhone/i.test(ua)) {
      deviceName = 'iPhone (Safari Mobile)';
    } else if (/iPad/i.test(ua)) {
      deviceName = 'iPad Pro (Mobile)';
    } else if (/Android/i.test(ua)) {
      deviceName = 'Android Device';
    } else if (/Macintosh|Mac OS X/i.test(ua)) {
      deviceName = 'MacBook Pro (Chrome/Safari)';
    } else if (/Windows/i.test(ua)) {
      deviceName = 'Windows PC (Desktop)';
    } else {
      deviceName = 'Cihaz ' + deviceId.slice(-4).toUpperCase();
    }
    localStorage.setItem(DEVICE_NAME_KEY, deviceName);
  }

  return { deviceId, deviceName };
}

export function setCustomDeviceName(name: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DEVICE_NAME_KEY, name.trim());
  }
}

/**
 * Check if valid Supabase Credentials exist (either in env or in localStorage)
 */
export function getSupabaseCredentials(): { url: string; anonKey: string } {
  if (typeof window === 'undefined') {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    };
  }

  const customUrl = localStorage.getItem(SUPABASE_CUSTOM_URL_KEY) || '';
  const customKey = localStorage.getItem(SUPABASE_CUSTOM_KEY_KEY) || '';
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const url = customUrl.trim() || envUrl.trim();
  const anonKey = customKey.trim() || envKey.trim();

  return { url, anonKey };
}

export function saveCustomSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    if (url.trim()) {
      localStorage.setItem(SUPABASE_CUSTOM_URL_KEY, url.trim());
    } else {
      localStorage.removeItem(SUPABASE_CUSTOM_URL_KEY);
    }

    if (anonKey.trim()) {
      localStorage.setItem(SUPABASE_CUSTOM_KEY_KEY, anonKey.trim());
    } else {
      localStorage.removeItem(SUPABASE_CUSTOM_KEY_KEY);
    }

    // Invalidate cached client
    cachedClient = null;
    currentClientKey = '';
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey && url.startsWith('http'));
}

/**
 * Get or initialize Supabase Client with graceful fallback
 */
export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey || !url.startsWith('http')) {
    return null;
  }

  const keySignature = `${url}::${anonKey}`;
  if (cachedClient && currentClientKey === keySignature) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    currentClientKey = keySignature;
    return cachedClient;
  } catch (err) {
    console.warn('[Supabase] Client init failed, fallback to local offline mode:', err);
    return null;
  }
}

/**
 * Local Cloud User Profile Helpers
 */
export function getStoredCloudProfile(): CloudUserProfile {
  if (typeof window === 'undefined') {
    return {
      id: 'usr_kursad_master',
      email: 'kursad@sefsifir.internal',
      fullName: 'Kürşad Şef',
      role: 'admin',
      createdAt: '2026-08-01',
      lastSyncAt: new Date().toISOString(),
      connectedDevices: ['MacBook Pro (M3 Max)', 'iPhone 15 Pro (Safari)'],
    };
  }

  const stored = localStorage.getItem(CLOUD_USER_PROFILE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }

  const { deviceName } = getDeviceInfo();
  const defaultProfile: CloudUserProfile = {
    id: 'usr_kursad_master',
    email: 'kursad@sefsifir.internal',
    fullName: 'Kürşad (ŞefSıfır Master)',
    role: 'admin',
    createdAt: '2026-08-01',
    lastSyncAt: new Date().toISOString(),
    connectedDevices: [deviceName, 'iPhone 15 Pro (Safari)', 'MacBook Pro M3'],
  };

  localStorage.setItem(CLOUD_USER_PROFILE_KEY, JSON.stringify(defaultProfile));
  return defaultProfile;
}

export function saveStoredCloudProfile(profile: CloudUserProfile): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CLOUD_USER_PROFILE_KEY, JSON.stringify(profile));
  }
}

/**
 * Cross-Tab and Multi-Device Realtime Broadcast Engine
 * Uses BroadcastChannel + Web Storage Event + Supabase Realtime Channels
 */
let broadcastChannel: BroadcastChannel | null = null;

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!broadcastChannel && 'BroadcastChannel' in window) {
    try {
      broadcastChannel = new BroadcastChannel('sefsifir_realtime_cloud_sync');
    } catch (e) {
      console.warn('BroadcastChannel not supported', e);
    }
  }
  return broadcastChannel;
}

/**
 * Broadcast an event to other open tabs, iframe previews, and Supabase cloud channels
 */
export function broadcastSyncEvent(event: Omit<CloudSyncEvent, 'sourceDeviceId' | 'sourceDeviceName' | 'timestamp'>): void {
  if (typeof window === 'undefined') return;

  const { deviceId, deviceName } = getDeviceInfo();
  const fullEvent: CloudSyncEvent = {
    ...event,
    sourceDeviceId: deviceId,
    sourceDeviceName: deviceName,
    timestamp: new Date().toISOString(),
  };

  // 1. Broadcast via local BroadcastChannel
  try {
    const channel = getBroadcastChannel();
    if (channel) {
      channel.postMessage(fullEvent);
    }
  } catch (e) {
    console.warn('BroadcastChannel error', e);
  }

  // 2. Broadcast via localStorage timestamp for cross-window sync
  try {
    localStorage.setItem('sefsifir_sync_event_pulse', JSON.stringify({
      ...fullEvent,
      _rand: Math.random(),
    }));
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  } catch {
    // ignore
  }

  // 3. Broadcast to Supabase Realtime Channel if configured
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const realtimeChannel = supabase.channel('sefsifir_realtime_stream');
      realtimeChannel.send({
        type: 'broadcast',
        event: fullEvent.type,
        payload: fullEvent,
      });
    } catch (err) {
      console.warn('[Supabase Realtime Broadcast] Error:', err);
    }
  }
}

/**
 * Subscribe to realtime sync events from other tabs / paired devices / Supabase
 */
export function subscribeToSyncEvents(onEvent: (event: CloudSyncEvent) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const { deviceId } = getDeviceInfo();

  // 1. Listen via BroadcastChannel
  const channel = getBroadcastChannel();
  const handleBcMessage = (msg: MessageEvent<CloudSyncEvent>) => {
    if (msg.data && msg.data.sourceDeviceId !== deviceId) {
      onEvent(msg.data);
    }
  };

  if (channel) {
    channel.addEventListener('message', handleBcMessage);
  }

  // 2. Listen via Storage Event (Cross-Tab/Window)
  const handleStorage = (e: StorageEvent) => {
    if (e.key === 'sefsifir_sync_event_pulse' && e.newValue) {
      try {
        const parsed: CloudSyncEvent = JSON.parse(e.newValue);
        if (parsed.sourceDeviceId !== deviceId) {
          onEvent(parsed);
        }
      } catch {
        // ignore
      }
    }
  };
  window.addEventListener('storage', handleStorage);

  // 3. Listen via Supabase Realtime Channel if configured
  const supabase = getSupabaseClient();
  let supabaseChannel: RealtimeChannel | null = null;

  if (supabase) {
    try {
      supabaseChannel = supabase.channel('sefsifir_realtime_stream')
        .on('broadcast', { event: '*' }, (payload: { payload: CloudSyncEvent }) => {
          if (payload && payload.payload && payload.payload.sourceDeviceId !== deviceId) {
            onEvent(payload.payload);
          }
        })
        .subscribe();
    } catch (err) {
      console.warn('[Supabase Realtime Listen] Error:', err);
    }
  }

  // Unsubscribe cleanup
  return () => {
    if (channel) {
      channel.removeEventListener('message', handleBcMessage);
    }
    window.removeEventListener('storage', handleStorage);
    if (supabase && supabaseChannel) {
      try {
        supabase.removeChannel(supabaseChannel);
      } catch {
        // ignore
      }
    }
  };
}

/**
 * Smart Merge local state with cloud state
 */
export function mergePantryItems(localItems: Ingredient[], cloudItems: Ingredient[]): Ingredient[] {
  const map = new Map<string, Ingredient>();
  // Cloud items first
  cloudItems.forEach((item) => map.set(item.id, item));
  // Local items overwrite if newer or present
  localItems.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

export function mergeShoppingItems(localItems: ShoppingItem[], cloudItems: ShoppingItem[]): ShoppingItem[] {
  const map = new Map<string, ShoppingItem>();
  cloudItems.forEach((item) => map.set(item.id, item));
  localItems.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

export function mergeDiaries(localDiaries: ChefDiaryEntry[], cloudDiaries: ChefDiaryEntry[]): ChefDiaryEntry[] {
  const map = new Map<string, ChefDiaryEntry>();
  cloudDiaries.forEach((d) => map.set(d.id, d));
  localDiaries.forEach((d) => map.set(d.id, d));
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function mergeRecipes(localRecipes: Recipe[], cloudRecipes: Recipe[]): Recipe[] {
  const map = new Map<string, Recipe>();
  cloudRecipes.forEach((r) => map.set(r.id, r));
  localRecipes.forEach((r) => map.set(r.id, r));
  return Array.from(map.values());
}

/**
 * Cloud Sync Data Operations with Graceful Fallback
 */
export async function syncPantryToSupabase(items: Ingredient[]): Promise<boolean> {
  broadcastSyncEvent({ type: 'PANTRY_SYNC', data: items });
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const profile = getStoredCloudProfile();
    // Batch upsert to pantry_items table
    const rows = items.map((item) => ({
      id: item.id,
      user_id: profile.id,
      name: item.name,
      amount: item.amount,
      unit: item.unit,
      category: item.category,
      days_until_expiry: item.daysUntilExpiry ?? 7,
      is_priority: item.isPriority ?? false,
      notes: item.notes ?? '',
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('pantry_items').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('[Supabase Sync Pantry] Table upsert error:', err);
    return false;
  }
}

export async function syncShoppingToSupabase(items: ShoppingItem[]): Promise<boolean> {
  broadcastSyncEvent({ type: 'SHOPPING_SYNC', data: items });
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const profile = getStoredCloudProfile();
    const rows = items.map((item) => ({
      id: item.id,
      user_id: profile.id,
      name: item.name,
      amount: item.amount ?? 1,
      unit: item.unit ?? 'adet',
      category: item.category,
      checked: item.checked,
      source: item.source,
      estimated_price_tl: item.estimatedPrice ?? 0,
      created_at: item.addedAt,
    }));

    const { error } = await supabase.from('shopping_items').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('[Supabase Sync Shopping] Table upsert error:', err);
    return false;
  }
}

export async function syncDiariesToSupabase(diaries: ChefDiaryEntry[]): Promise<boolean> {
  broadcastSyncEvent({ type: 'DIARY_SYNC', data: diaries });
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const profile = getStoredCloudProfile();
    const rows = diaries.map((d) => ({
      id: d.id,
      user_id: profile.id,
      log_date: d.date,
      title: d.title,
      notes: d.content,
      meal_tags: d.tags,
      mood: d.mood,
      shopping_action_items: d.shoppingTodos ?? [],
      created_at: d.createdAt,
    }));

    const { error } = await supabase.from('chef_diaries').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('[Supabase Sync Diary] Table upsert error:', err);
    return false;
  }
}

export async function syncRecipesToSupabase(recipes: Recipe[]): Promise<boolean> {
  broadcastSyncEvent({ type: 'RECIPES_SYNC', data: recipes });
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const profile = getStoredCloudProfile();
    const rows = recipes.map((r) => ({
      id: r.id,
      user_id: profile.id,
      title: r.title,
      category: r.category,
      prep_time_minutes: r.prepTimeMinutes,
      cook_time_minutes: r.cookTimeMinutes,
      is_favorite: r.isFavorite ?? false,
      is_cooked: r.isCooked ?? false,
      recipe_data: r,
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('recipes').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('[Supabase Sync Recipes] Table upsert error:', err);
    return false;
  }
}

export async function syncStatsToSupabase(stats: ZeroWasteStats): Promise<boolean> {
  broadcastSyncEvent({ type: 'STATS_SYNC', data: stats });
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const profile = getStoredCloudProfile();
    const { error } = await supabase.from('zero_waste_stats').upsert({
      user_id: profile.id,
      meals_cooked: stats.mealsCooked,
      ingredients_saved: stats.ingredientsSaved,
      approx_money_saved_tl: stats.approxMoneySavedTl,
      co2_saved_kg: stats.co2SavedKg,
      water_saved_liters: stats.waterSavedLiters ?? 4850,
      streak_days: stats.streakDays,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('[Supabase Sync Stats] Table upsert error:', err);
    return false;
  }
}

/**
 * Generate a 6-digit sync pairing code for quick iPhone / MacBook pairing
 */
export function generatePairingCode(): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  if (typeof window !== 'undefined') {
    localStorage.setItem('sefsifir_pairing_code', code);
    localStorage.setItem('sefsifir_pairing_code_created', Date.now().toString());
  }
  return code;
}
