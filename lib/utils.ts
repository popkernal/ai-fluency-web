import { clsx, type ClassValue } from 'clsx'

/**
 * Utility for merging class names.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/**
 * Format a date as a human-readable string (e.g., "Jan 5, 2025").
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Format a duration in seconds as "Xm Ys".
 */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}s`
  return `${m}m ${s > 0 ? `${s}s` : ''}`
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
