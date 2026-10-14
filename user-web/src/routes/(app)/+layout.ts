import { redirect } from '@sveltejs/kit';
import { session } from '$lib/session.svelte';
import type { LayoutLoad } from './$types';

/**
 * THE AUTH GUARD. One file protects every route beneath (app)/.
 *
 * Spec 5.2: "A +layout.server.ts under (app) that throws redirect(303,'/login')
 * when locals.user is null protects every route beneath it. That single file is
 * the structural fix for P0-1."
 *
 * In this UI-only build it is +layout.ts (universal) reading the mock session
 * rather than +layout.server.ts reading a verified cookie, so it is a
 * navigation guard and NOT a security boundary — a determined user can flip the
 * cookie. That is the one thing the real build must change, and it changes here
 * and nowhere else: rename the file and read event.locals.user instead.
 */
export const load: LayoutLoad = () => {
  session.init();
  if (!session.signedIn) {
    redirect(303, '/login');
  }
  return { user: session.user };
};
