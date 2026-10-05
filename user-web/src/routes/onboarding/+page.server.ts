import { fail, redirect } from '@sveltejs/kit';
import { adminDb } from '$lib/server/firebase';
import type { Actions } from './$types';
import type { Skill } from '$shared/types';

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.user || !locals.decodedIdToken) {
      throw redirect(303, '/login');
    }

    try {
      const data = await request.formData();
      const payloadStr = data.get('payload');
      
      if (!payloadStr || typeof payloadStr !== 'string') {
        return fail(400, { error: 'Invalid payload' });
      }
      
      const payload = JSON.parse(payloadStr);
      
      const { name, campus, major, bio, offered, wanted } = payload;

      // Update user doc in Firestore
      await adminDb.collection('users').doc(locals.decodedIdToken.uid).update({
        name,
        campus,
        major,
        bio,
        skillsOffered: offered || [],
        skillsWanted: wanted || []
      });

      return { success: true };
    } catch (error: any) {
      console.error('Onboarding error:', error.message);
      return fail(500, { error: 'Failed to save profile.' });
    }
  }
};
