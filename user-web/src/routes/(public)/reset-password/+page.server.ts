import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const email = data.get('email');

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return fail(400, { email, error: 'Enter the email you signed up with.' });
    }

    try {
      if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
        const apiKey = env.PUBLIC_FIREBASE_API_KEY || 'fake-api-key';
        const res = await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, requestType: 'PASSWORD_RESET' })
        });
        
        if (!res.ok) {
          const json = await res.json();
          console.warn('Password reset failed on emulator (might not exist):', json);
          // We still return success to not leak email existence, standard security practice
        }
      }
      
      // We always pretend it worked.
      return { success: true };
    } catch (error: any) {
      console.error('Password reset error:', error.message);
      // Don't leak error
      return { success: true };
    }
  }
};
