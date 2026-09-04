import { browser } from '$app/environment';

/**
 * Motion foundation. prefers-reduced-motion is honoured HERE, once, so no
 * component has to remember (spec task 2.6: "respected globally, at the
 * foundation, not per-component").
 *
 * Lane assignment, per spec section 4.1 correction 3:
 *   svelte/transition + svelte/animate  enter/exit, list reordering  (zero bytes)
 *   motion                              gestures, layout transitions
 *   gsap                                multi-step timelines, the mesh viz
 */

export function prefersReducedMotion(): boolean {
  if (!browser) return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/** Duration gate: returns 0 when the user has asked for reduced motion. */
export function dur(ms: number): number {
  return prefersReducedMotion() ? 0 : ms;
}

/** Stagger gate, for list entrances. */
export function stagger(index: number, step = 40, max = 320): number {
  return prefersReducedMotion() ? 0 : Math.min(index * step, max);
}

export const EASE = {
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  inOut: 'cubic-bezier(0.65, 0, 0.35, 1)'
} as const;
