import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/store/repo';
import { getSessionUser } from '@/lib/auth/session';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

// Customer-facing: list user's own orders OR place a new order.
export async function GET(_req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ items: [] });
  const all = await repo.list('orders');
  const mine = all.filter(
    (o) => o.userId === user.uid || (user.email && o.customerEmail?.toLowerCase() === user.email.toLowerCase()),
  );
  return NextResponse.json({ items: mine });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const body = await req.json();
    const { items, total, shippingAddress, type = 'medicine', paymentMethod = 'COD', scheduledAt, prescriptionUrl } = body;

    if (!items?.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });

    const order = await repo.create('orders', {
      id: 'MD-' + randomUUID().slice(0, 6).toUpperCase(),
      userId: user?.uid,
      customerName: user?.name ?? body.customerName ?? 'Guest',
      customerEmail: user?.email ?? body.customerEmail ?? 'guest@medidemo.com',
      items,
      total,
      shippingAddress,
      status: 'Pending' as const,
      type,
      paymentMethod,
      paymentStatus: 'Pending' as const,
      scheduledAt,
      prescriptionUrl,
      prescriptionVerified: false,
      createdAt: Date.now(),
    });

    // Also create a matching transaction record.
    await repo.create('transactions', {
      id: 'TXN-' + randomUUID().slice(0, 6).toUpperCase(),
      orderId: order.id,
      customerName: order.customerName,
      method: paymentMethod,
      amount: total,
      status: 'Pending',
      createdAt: Date.now(),
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (e: any) {
    console.error('[orders POST]', e);
    return NextResponse.json({ error: e.message ?? 'Failed to place order' }, { status: 500 });
  }
}
