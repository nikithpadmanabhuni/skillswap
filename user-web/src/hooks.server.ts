import type { Handle } from '@sveltejs/kit';
import { adminAuth, adminDb } from '$lib/server/firebase';
import type { User } from '$shared/types';
import { users as mockUsers } from '$shared/mock'; // Fallback for demo purposes

export const handle: Handle = async ({ event, resolve }) => {
  const sessionCookie = event.cookies.get('session');

  if (!sessionCookie) {
    event.locals.user = null;
    event.locals.decodedIdToken = null;
    return resolve(event);
  }

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    event.locals.decodedIdToken = decodedClaims;

    const uid = decodedClaims.uid;
    
    // Attempt to fetch from Firestore
    const userDoc = await adminDb.collection('users').doc(uid).get();
    
    if (userDoc.exists) {
      event.locals.user = userDoc.data() as User;
    } else {
      // For demo/development: if not in Firestore, try to match by email with mock data
      // This ensures the demo app still works before we fully seed Firestore
      const email = decodedClaims.email;
      const mockUser = mockUsers.find(u => u.email === email);
      if (mockUser) {
        event.locals.user = mockUser;
      } else {
        event.locals.user = null;
      }
    }
  } catch (error) {
    // Session cookie is invalid or expired
    event.locals.user = null;
    event.locals.decodedIdToken = null;
    event.cookies.delete('session', { path: '/' });
  }

  return resolve(event);
};
