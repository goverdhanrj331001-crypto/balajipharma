// ─── Auth API (server-side) ──────────────────────────────────────
// Handles login, signup, and logout. Uses Firebase Auth when
// configured, otherwise falls back to a mock in-memory auth.

import { isFirebaseConfigured } from '@/lib/firebase/config';
import { mem } from '@/lib/store/mem-store';
import { repo } from '@/lib/store/repo';
import { randomUUID } from 'crypto';
import type { SessionUser, UserRole } from '@/types';

export interface LoginResult {
  token: string;
  user: SessionUser;
}

export async function loginWithEmail(email: string, password: string): Promise<LoginResult> {
  if (!email || !password) throw new Error('Email and password are required');

  if (isFirebaseConfigured) {
    // Real Firebase: client SDK handles this; here we just verify via Admin.
    const { getAdminAuth } = await import('@/lib/firebase/admin');
    const adminAuth = await getAdminAuth();
    if (!adminAuth) throw new Error('Auth not initialized');
    const userRecord = await (adminAuth as any).getUserByEmail(email);
    const role = (userRecord.customClaims?.role ?? 'patient') as UserRole;
    const status = userRecord.customClaims?.status ?? 'active';
    // Client should mint a real ID token and exchange it; for server-only
    // logins we issue a custom token.
    const token = await (adminAuth as any).createCustomToken(userRecord.uid);
    return {
      token,
      user: { uid: userRecord.uid, email: userRecord.email ?? '', name: userRecord.displayName ?? email, role, status },
    };
  }

  // Mock auth: match against seeded users.
  const users = await mem.authUsers.list();
  const u = users.find((x: any) => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
  if (!u) throw new Error('Invalid email or password');
  if (u.status !== 'active') throw new Error('Account is ' + u.status);
  const token = Buffer.from(JSON.stringify({ uid: u.id, email: u.email, ts: Date.now() }), 'utf-8').toString('base64');
  return {
    token,
    user: { uid: u.id, email: u.email, name: u.name, role: u.role as UserRole, status: u.status },
  };
}

export async function signupWithEmail(
  email: string,
  password: string,
  name: string,
): Promise<LoginResult> {
  if (!email || !password || !name) throw new Error('All fields are required');
  if (password.length < 6) throw new Error('Password must be at least 6 characters');

  if (isFirebaseConfigured) {
    const { getAdminAuth } = await import('@/lib/firebase/admin');
    const adminAuth = await getAdminAuth();
    if (!adminAuth) throw new Error('Auth not initialized');
    const userRecord = await (adminAuth as any).createUser({ email, password, displayName: name });
    await (adminAuth as any).setCustomUserClaims(userRecord.uid, { role: 'patient', status: 'active' });
    const token = await (adminAuth as any).createCustomToken(userRecord.uid);
    // Persist minimal user record in Firestore.
    await repo.create('users', {
      id: userRecord.uid,
      name,
      email,
      role: 'patient',
      status: 'active',
      lastLogin: Date.now(),
      createdAt: Date.now(),
    });
    return {
      token,
      user: { uid: userRecord.uid, email, name, role: 'patient' as UserRole, status: 'active' },
    };
  }

  // Mock: create user in mem store.
  const existing = (await mem.authUsers.list()).find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) throw new Error('Email already registered');
  const id = 'u-' + randomUUID().slice(0, 8);
  const newUser = {
    id,
    email,
    password,
    name,
    role: 'patient' as UserRole,
    status: 'active' as const,
  };
  await mem.authUsers.create(newUser);
  await repo.create('users', { id, name, email, role: 'patient', status: 'active', lastLogin: Date.now() });
  const token = Buffer.from(JSON.stringify({ uid: id, email, ts: Date.now() }), 'utf-8').toString('base64');
  return {
    token,
    user: { uid: id, email, name, role: 'patient' as UserRole, status: 'active' },
  };
}
