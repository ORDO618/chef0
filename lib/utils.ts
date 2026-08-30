import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Deterministic number formatting helper (e.g. 4850 -> "4.850")
 * Ensures 100% hydration consistency between Server and Client.
 */
export function formatNumber(val: number | string | undefined | null): string {
  if (val === undefined || val === null) return '0';
  const num = typeof val === 'number' ? Math.round(val) : parseInt(val, 10);
  if (isNaN(num)) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
