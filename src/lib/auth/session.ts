// ─── Session / Auth helpers (server-side) ────────────────────────
// Verifies the user's ID token (sent from the client) and resolves
// the matching user record. Falls back to a mock session when
// Firebase Admin SDK is not configured.

import { cookies } from 'next/headers';
import { isAdminSdkConfigured } from '@/lib/firebase/admin';
import { mem } from '@/lib/store/mem-store';
import { getAdminAuth } from '@/lib/firebase/admin';
import type { SessionUser, UserRole } from '@/types';

// Reads the bearer token from cookies.
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('medidemo-session')?.value;

  if (!token) {
    // Default admin bypass only in mock mode.
    if (!isAdminSdkConfigured) {
      const admin = (await mem.authUsers.list()).find((u: any) => u.role === 'admin');
      if (admin) {
        return {
          uid: admin.id,
          email: admin.email,
          name: admin.name,
          role: 'admin' as UserRole,
          status: admin.status,
        };
      }
    }
    return null;
  }

  if (isAdminSdkConfigured) {
    const adminAuth = await getAdminAuth();
    if (!adminAuth) return null;
    try {
      const decoded = await (adminAuth as any).verifyIdToken(token);
      const userRecord = await (adminAuth as any).getUser(decoded.uid);
      const role = (userRecord.customClaims?.role ?? 'patient') as UserRole;
      const status = userRecord.customClaims?.status ?? 'active';
      const name = userRecord.displayName ?? decoded.email ?? 'User';
      return { uid: decoded.uid, email: decoded.email ?? '', name, role, status };
    } catch {
      return null;
    }
  }

  // Mock mode: token is a base64-encoded JSON of the user.
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    const found = (await mem.authUsers.list()).find((u: any) => u.id === decoded.uid);
    if (!found) return null;
    return {
      uid: found.id,
      email: found.email,
      name: found.name,
      role: found.role as UserRole,
      status: found.status,
    };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    throw new Error('Unauthorized: admin role required');
  }
  return user;
}

export async function requireCustomer(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized: login required');
  return user;
}
