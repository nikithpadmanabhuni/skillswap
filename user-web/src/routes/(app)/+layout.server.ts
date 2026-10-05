import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  // If no user is logged in, redirect to login page.
  if (!locals.user) {
    throw redirect(303, '/login');
  }

  // If the user exists but needs onboarding (missing name or skills),
  // they should be handled here or in the individual pages.
  // For now, simply return the user to the client.
  return {
    user: locals.user
  };
};
