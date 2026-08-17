// ─── Generic CRUD factory for /api/admin/<collection> ───────────
// All admin collection routes share the same shape:
//   GET    → list
//   POST   → create
//   PATCH  → update (with ?id=)
//   DELETE → delete (with ?id=)

import { NextRequest, NextResponse } from 'next/server';
import { repo, type Collection } from '@/lib/store/repo';
import { requireAdmin } from '@/lib/auth/session';

export function makeCrudHandler(col: Collection) {
  return async function handler(req: NextRequest) {
    try {
      try {
        await requireAdmin();
      } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const url = new URL(req.url);
      const id = url.searchParams.get('id');

      if (req.method === 'GET') {
        const whereField = url.searchParams.get('whereField');
        const whereOp = url.searchParams.get('whereOp') as '==' | '!=' | 'in' | null;
        const whereValue = url.searchParams.get('whereValue');
        const orderBy = url.searchParams.get('orderBy') ?? undefined;
        const orderDir = (url.searchParams.get('orderDir') as 'asc' | 'desc') ?? undefined;
        const limit = url.searchParams.get('limit');

        const opts: any = {};
        if (whereField && whereOp && whereValue !== null) {
          let val: any = whereValue;
          if (whereOp === 'in') val = whereValue.split(',');
          opts.where = [{ field: whereField, op: whereOp, value: val }];
        }
        if (orderBy) {
          opts.orderBy = orderBy;
          opts.orderDir = orderDir ?? 'asc';
        }
        if (limit) opts.limit = Number(limit);

        const items = await repo.list(col, opts);
        return NextResponse.json({ items, count: items.length });
      }

      if (req.method === 'POST') {
        const body = await req.json();
        const created = await repo.create(col, body);
        return NextResponse.json({ item: created }, { status: 201 });
      }

      if (req.method === 'PATCH') {
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        const body = await req.json();
        const updated = await repo.update(col, id, body);
        return NextResponse.json({ item: updated });
      }

      if (req.method === 'DELETE') {
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        await repo.delete(col, id);
        return NextResponse.json({ ok: true });
      }

      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    } catch (e: any) {
      console.error(`[api/${col}]`, e);
      return NextResponse.json({ error: e.message ?? 'Server error' }, { status: 500 });
    }
  };
}

export const dynamic = 'force-dynamic';
