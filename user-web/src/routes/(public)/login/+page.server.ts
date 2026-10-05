import { fail, redirect } from '@sveltejs/kit';
import { adminAuth } from '$lib/server/firebase';
import { env } from '$env/dynamic/public';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get('email');
    const password = data.get('password');

    if (!email || typeof email !== 'string') {
      return fail(400, { email, error: 'Enter your email address.' });
    }
    if (!password || typeof password !== 'string') {
      return fail(400, { email, error: 'Enter your password.' });
    }

    try {
      // In a real application, you'd use the Firebase REST API here.
      // Since we don't have a real API key configured yet, we will mock the auth 
      // if the password is 'demo', and create a custom token to exchange for a session cookie.
      // Alternatively, we can just hit the local emulator if FIREBASE_AUTH_EMULATOR_HOST is set.
      
      const apiKey = env.PUBLIC_FIREBASE_API_KEY || 'fake-api-key';
      let idToken = '';

      if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
        // Hit the emulator
        const res = await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, returnSecureToken: true })
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error?.message || 'Authentication failed');
        }
        idToken = json.idToken;
      } else {
        // Fallback demo mock
        if (password !== 'demo') {
          return fail(400, { email, error: 'That email and password do not match.' });
        }
        
        // For demo without emulator, we just create a mock session cookie
        // Note: adminAuth.createSessionCookie requires a real ID token, so this won't work perfectly
        // without the emulator or a real project. We'll set a mock cookie directly for the demo.
        cookies.set('session', 'mock-session-cookie-' + email, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 5
        });
        throw redirect(303, '/explore');
      }

      // If we got a real idToken from the emulator/REST API
      const expiresIn = 60 * 60 * 24 * 5 * 1000;
      const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

      cookies.set('session', sessionCookie, {
        maxAge: expiresIn / 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
      });
      
    } catch (error: any) {
      console.error('Login error:', error.message);
      return fail(400, { email, error: 'That email and password do not match.' });
    }

    throw redirect(303, '/explore');
  }
};
