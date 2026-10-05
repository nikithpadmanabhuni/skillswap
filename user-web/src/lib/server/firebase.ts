import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { env } from '$env/dynamic/private';

const serviceAccount = env.FIREBASE_SERVICE_ACCOUNT_JSON
  ? JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON)
  : { projectId: 'skillswap-campus-dev' }; // fallback for emulator

if (!getApps().length) {
  initializeApp({
    credential: env.FIREBASE_SERVICE_ACCOUNT_JSON ? cert(serviceAccount) : undefined,
    projectId: serviceAccount.projectId || 'skillswap-campus-dev',
  });
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
