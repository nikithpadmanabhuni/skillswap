import { prefersReducedMotion } from './index';

/**
 * GSAP is loaded on demand — it is only needed by the mesh visualisation and
 * the celebration sequence, so it should not sit in the initial bundle of every
 * route. Returns null when the user prefers reduced motion, which lets callers
 * skip the timeline entirely rather than building one and then killing it.
 */
export async function loadGsap() {
  if (prefersReducedMotion()) return null;
  const { gsap } = await import('gsap');
  return gsap;
}
