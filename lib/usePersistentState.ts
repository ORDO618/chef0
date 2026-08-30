'use client';

import { useSyncExternalStore, useCallback } from 'react';

// In-memory subscriber registry for localStorage keys
const listeners = new Map<string, Set<() => void>>();

function emitChange(key: string) {
  const set = listeners.get(key);
  if (set) {
    set.forEach((listener) => {
      try {
        listener();
      } catch { /* empty */ }
    });
  }
}

function subscribe(key: string, callback: () => void) {
  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }
  listeners.get(key)!.add(callback);

  const handleStorage = (e: StorageEvent) => {
    if (e.key === key || e.key === null) {
      callback();
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }

  return () => {
    listeners.get(key)?.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}

/**
 * Hook to synchronize state with localStorage safely without SSR hydration mismatches
 * using React 18/19's canonical useSyncExternalStore.
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const defaultJson = JSON.stringify(initialValue);

  const getSnapshot = useCallback(() => {
    try {
      if (typeof window === 'undefined') return defaultJson;
      const val = window.localStorage.getItem(key);
      return val !== null ? val : defaultJson;
    } catch {
      return defaultJson;
    }
  }, [key, defaultJson]);

  const getServerSnapshot = useCallback(() => defaultJson, [defaultJson]);

  const subscribeKey = useCallback((callback: () => void) => subscribe(key, callback), [key]);

  const rawJson = useSyncExternalStore(subscribeKey, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        if (typeof window === 'undefined') return;
        const currentVal = window.localStorage.getItem(key);
        let parsedCurrent: T;
        try {
          parsedCurrent = currentVal !== null ? JSON.parse(currentVal) : initialValue;
        } catch {
          parsedCurrent = initialValue;
        }

        const nextValue = typeof value === 'function' ? (value as (prev: T) => T)(parsedCurrent) : value;
        window.localStorage.setItem(key, JSON.stringify(nextValue));
        emitChange(key);
      } catch (e) {
        console.warn(`Error writing localStorage key "${key}":`, e);
      }
    },
    [key, initialValue]
  );

  let parsed: T;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    parsed = initialValue;
  }

  return [parsed, setValue];
}
