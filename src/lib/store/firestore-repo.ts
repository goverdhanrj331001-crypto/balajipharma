// ─── Firestore repository ────────────────────────────────────────
// Used when real Firebase credentials are configured.
// Mirrors the in-memory store's API.

import { getAdminFirestore } from '@/lib/firebase/admin';
import type { QueryOpts } from './repo';

const colNames: Record<string, string> = {
  products: 'products',
  categories: 'categories',
  brands: 'brands',
  offers: 'offers',
  banners: 'banners',
  healthConcerns: 'health_concerns',
  labPackages: 'lab_packages',
  labTests: 'lab_tests',
  orders: 'orders',
  users: 'users',
  employees: 'employees',
  supportTickets: 'support_tickets',
  transactions: 'transactions',
  settings: 'settings',
};

export const firestoreRepo = {
  async list(col: string, opts?: QueryOpts) {
    const fs = await getAdminFirestore();
    if (!fs) return [];
    const { collection, getDocs, query, where, orderBy, limit } = await import('firebase-admin/firestore');
    const constraints: any[] = [];
    if (opts?.where) {
      for (const c of opts.where) constraints.push(where(c.field, c.op, c.value));
    }
    if (opts?.orderBy) constraints.push(orderBy(opts.orderBy, opts.orderDir ?? 'asc'));
    if (opts?.limit) constraints.push(limit(opts.limit));
    const snap = await getDocs(query(collection(fs as any, colNames[col] ?? col), ...constraints));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
  async get(col: string, id: string) {
    const fs = await getAdminFirestore();
    if (!fs) return null;
    const { doc, getDoc } = await import('firebase-admin/firestore');
    const snap = await getDoc(doc(fs as any, colNames[col] ?? col, id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },
  async create(col: string, data: any) {
    const fs = await getAdminFirestore();
    if (!fs) throw new Error('Firestore not configured');
    const { collection, addDoc, doc, setDoc } = await import('firebase-admin/firestore');
    const payload = { ...data, createdAt: Date.now(), updatedAt: Date.now() };
    if (data.id) {
      await setDoc(doc(fs as any, colNames[col] ?? col, String(data.id)), payload);
      return { ...payload, id: data.id };
    }
    const ref = await addDoc(collection(fs as any, colNames[col] ?? col), payload);
    return { ...payload, id: ref.id };
  },
  async update(col: string, id: string, patch: any) {
    const fs = await getAdminFirestore();
    if (!fs) throw new Error('Firestore not configured');
    const { doc, updateDoc } = await import('firebase-admin/firestore');
    await updateDoc(doc(fs as any, colNames[col] ?? col, id), { ...patch, updatedAt: Date.now() });
    return this.get(col, id);
  },
  async delete(col: string, id: string) {
    const fs = await getAdminFirestore();
    if (!fs) throw new Error('Firestore not configured');
    const { doc, deleteDoc } = await import('firebase-admin/firestore');
    await deleteDoc(doc(fs as any, colNames[col] ?? col, id));
    return true;
  },
  async count(col: string) {
    const list = await this.list(col);
    return list.length;
  },
};
