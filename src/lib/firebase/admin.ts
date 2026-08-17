// ─── Firebase Admin SDK (server-side) ────────────────────────────
// Used in API routes / server components for privileged operations.
// Falls back to a no-op when credentials are missing.

import { isFirebaseConfigured } from './config';

let adminApp: unknown = null;
let adminAuth: unknown = null;
let adminFirestore: unknown = null;

export async function getAdminApp() {
  if (!isFirebaseConfigured) return null;
  if (adminApp) return adminApp;
  // Lazy import so the SDK is not bundled when credentials are missing.
  const { getApps, initializeApp, cert } = await import('firebase-admin/app');
  if (getApps().length) {
    adminApp = getApps()[0];
  } else {
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
      }),
    });
  }
  return adminApp;
}

export async function getAdminAuth() {
  if (!isFirebaseConfigured) return null;
  if (adminAuth) return adminAuth;
  const app = await getAdminApp();
  if (!app) return null;
  const { getAuth } = await import('firebase-admin/auth');
  adminAuth = getAuth(app as never);
  return adminAuth;
}

export async function getAdminFirestore() {
  if (!isFirebaseConfigured) return null;
  if (adminFirestore) return adminFirestore;
  const app = await getAdminApp();
  if (!app) return null;
  const { getFirestore } = await import('firebase-admin/firestore');
  adminFirestore = getFirestore(app as never);
  return adminFirestore;
}
