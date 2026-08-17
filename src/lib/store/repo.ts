// ─── Unified Data Access Layer ───────────────────────────────────
// Provides a single CRUD API surface to the rest of the app.
// - If real Firebase credentials are configured → uses Firestore.
// - Otherwise → uses the in-memory store (same shape, same methods).
//
// All API routes call this layer; they never touch Firebase or the
// memory store directly.

import { isFirebaseConfigured } from '@/lib/firebase/config';
import { mem } from '@/lib/store/mem-store';
import { firestoreRepo } from '@/lib/store/firestore-repo';

export type Collection =
  | 'products'
  | 'categories'
  | 'brands'
  | 'offers'
  | 'banners'
  | 'healthConcerns'
  | 'labPackages'
  | 'labTests'
  | 'orders'
  | 'users'
  | 'employees'
  | 'supportTickets'
  | 'transactions'
  | 'settings';

export interface QueryOpts {
  where?: { field: string; op: '==' | '!=' | 'in'; value: any }[];
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
  limit?: number;
}

// ─── In-memory backend ──────────────────────────────────────────
// Routes collection name → the right MemCollection instance.
const memBackend = {
  async list(col: string, opts?: QueryOpts) {
    const c = (mem as any)[col];
    if (!c) throw new Error('Unknown collection: ' + col);
    return c.list(opts);
  },
  async get(col: string, id: string) {
    const c = (mem as any)[col];
    if (!c) throw new Error('Unknown collection: ' + col);
    return c.get(id);
  },
  async create(col: string, data: any) {
    const c = (mem as any)[col];
    if (!c) throw new Error('Unknown collection: ' + col);
    return c.create(data);
  },
  async update(col: string, id: string, patch: any) {
    const c = (mem as any)[col];
    if (!c) throw new Error('Unknown collection: ' + col);
    return c.update(id, patch);
  },
  async delete(col: string, id: string) {
    const c = (mem as any)[col];
    if (!c) throw new Error('Unknown collection: ' + col);
    return c.delete(id);
  },
  async count(col: string) {
    const c = (mem as any)[col];
    if (!c) throw new Error('Unknown collection: ' + col);
    return c.count();
  },
};

// Pick the active backend.
const backend = isFirebaseConfigured ? firestoreRepo : memBackend;

export const repo = {
  list: (col: Collection, opts?: QueryOpts) => backend.list(col, opts) as Promise<any[]>,
  get: (col: Collection, id: string) => backend.get(col, id) as Promise<any | null>,
  create: (col: Collection, data: any) => backend.create(col, data) as Promise<any>,
  update: (col: Collection, id: string, patch: any) => backend.update(col, id, patch) as Promise<any>,
  delete: (col: Collection, id: string) => backend.delete(col, id) as Promise<boolean>,
  count: (col: Collection) => backend.count(col) as Promise<number>,
};

export { isFirebaseConfigured };
