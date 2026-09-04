import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge conditional class lists, with later Tailwind utilities winning over
 * earlier conflicting ones. Every component takes a `class` prop and passes it
 * through this last, so callers can always override.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
