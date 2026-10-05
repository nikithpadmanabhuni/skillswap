import { fail, redirect } from '@sveltejs/kit';
import { adminAuth, adminDb } from '$lib/server/firebase';
import { env } from '$env/dynamic/public';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const name = data.get('name');
    const email = data.get('email');
    const password = data.get('password');

    const errors: Record<string, string> = {};
    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.name = 'We need something to call you.';
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      errors.email = 'That does not look like an email address.';
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      errors.password = 'Use at least 8 characters.';
    }

    if (Object.keys(errors).length > 0) {
      return fail(400, { name, email, errors });
    }

    try {
      let idToken = '';

      if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
        const apiKey = env.PUBLIC_FIREBASE_API_KEY || 'fake-api-key';
        const res = await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, returnSecureToken: true })
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error?.message || 'Signup failed');
        }
        idToken = json.idToken;
        
        // Also update profile with display name
        await adminAuth.updateUser(json.localId, { displayName: name as string });
        
        // Create initial user doc
        await adminDb.collection('users').doc(json.localId).set({
          id: json.localId,
          name,
          email,
          campus: '',
          major: '',
          bio: '',
          karmaBalance: 60,
          rating: 0,
          reviewCount: 0,
          hoursTaught: 0,
          hoursLearned: 0,
          skillsOffered: [],
          skillsWanted: [],
          status: 'active'
        });
        
      } else {
        // Fallback demo mock
        cookies.set('session', 'mock-session-cookie-' + email, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 5
        });
        throw redirect(303, '/onboarding');
      }

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
      console.error('Signup error:', error.message);
      errors.email = 'Account creation failed. Email might be taken.';
      return fail(400, { name, email, errors });
    }

    throw redirect(303, '/onboarding');
  }
};
