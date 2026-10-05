import { json } from '@sveltejs/kit';
import { adminAuth } from '$lib/server/firebase';
import type { RequestHandler } from './$types';

// The session cookie expiration (e.g. 5 days)
const expiresIn = 60 * 60 * 24 * 5 * 1000;

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { idToken } = await request.json();

    // Verify the ID token first (ensure it's valid and recently issued)
    const decodedIdToken = await adminAuth.verifyIdToken(idToken);
    
    // Only process if the user signed in recently.
    if (new Date().getTime() / 1000 - decodedIdToken.auth_time > 5 * 60) {
      return json({ error: 'Recent sign in required' }, { status: 401 });
    }

    // Create the session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    // Set the cookie
    cookies.set('session', sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });

    return json({ status: 'success' });
  } catch (error) {
    console.error('Session cookie error:', error);
    return json({ error: 'Unauthorized request' }, { status: 401 });
  }
};

export const DELETE: RequestHandler = async ({ cookies }) => {
  cookies.delete('session', { path: '/' });
  return json({ status: 'success' });
};
