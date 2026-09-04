import type { Icon } from 'lucide-svelte';

/**
 * The type of a lucide icon, for components that take one as a prop.
 *
 * lucide-svelte 1.0 still ships legacy SvelteComponentTyped classes rather than
 * Svelte 5 function components, so the `Component` type from 'svelte' does not
 * match them. Deriving the alias from a real icon keeps this correct through
 * whichever shape the library lands on next.
 */
export type IconComponent = typeof Icon;
