import { redirect } from '@sveltejs/kit';
import { admin } from '$lib/session.svelte';
import type { LayoutLoad } from './$types';

/**
 * Admin guard. One file covers every route beneath (admin)/.
 *
 * Same structural shape as the student app's guard, and the same caveat: with
 * no server this is navigation, not authorisation. A real admin panel needs the
 * session verified AND a role claim checked server-side on every request.
 */
export const load: LayoutLoad = () => {
  if (!admin.signedIn) redirect(303, '/login');
  return { admin: { name: admin.name, role: admin.role } };
};
