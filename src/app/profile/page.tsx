'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StoreHeader } from '@/components/layout/store-header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/lib/auth/auth-context';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const userId = user?.uid;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetch('/api/public/orders', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setOrders(d.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="app-root min-h-screen pb-16">
        <StoreHeader search={false} />
        <div className="flex h-96 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-root min-h-screen pb-16">
        <StoreHeader search={false} />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Icon name="person" className="text-[64px] text-[#bdc9ca]" />
          <p className="mt-3 text-[14px] font-bold">You are not logged in</p>
          <p className="text-[12px] text-[#6e797b]">Login to view your profile and orders.</p>
          <Link href="/login?redirect=/profile" className="mt-4 rounded-lg bg-[#006872] px-4 py-2 text-[12px] font-bold text-white">
            Login
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  const recentOrders = orders.slice(0, 3);

  return (
    <div className="app-root min-h-screen pb-16">
      <StoreHeader search={false} />
      <main className="desktop-canvas px-4 py-4 md:px-8">
        <div className="soft-card flex items-center gap-4 rounded-xl p-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#006872] text-[24px] font-bold text-white">
            {user.name?.slice(0, 1).toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1">
            <h1 className="text-[20px] font-extrabold">{user.name}</h1>
            <p className="text-[12px] text-[#6e797b]">{user.email}</p>
            <span className="mt-1 inline-block rounded-full bg-[#d9eeee] px-2 py-0.5 text-[10px] font-bold uppercase text-[#006872]">
              {user.role}
            </span>
          </div>
          <button
            type="button"
            onClick={async () => {
              await logout();
              window.location.href = '/';
            }}
            className="rounded-lg border border-[#bdc9ca] px-3 py-2 text-[11px] font-bold text-[#910816] hover:bg-[#ffdad7]"
          >
            <Icon name="logout" className="mr-1 text-[14px]" /> Logout
          </button>
        </div>

        {/* Quick stats */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="soft-card rounded-xl p-4 text-center">
            <p className="text-[24px] font-extrabold">{orders.length}</p>
            <p className="text-[11px] text-[#6e797b]">Total Orders</p>
          </div>
          <div className="soft-card rounded-xl p-4 text-center">
            <p className="text-[24px] font-extrabold">{orders.filter((o) => o.status === 'Delivered' || o.status === 'Completed').length}</p>
            <p className="text-[11px] text-[#6e797b]">Delivered</p>
          </div>
          <div className="soft-card rounded-xl p-4 text-center">
            <p className="text-[24px] font-extrabold">{orders.filter((o) => o.status === 'Pending' || o.status === 'Processing' || o.status === 'In Transit').length}</p>
            <p className="text-[11px] text-[#6e797b]">In Progress</p>
          </div>
        </div>

        {/* Recent orders */}
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[16px] font-bold">Recent Orders</h2>
            <Link href="/orders" className="text-[12px] font-bold text-[#006872]">View All →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="soft-card rounded-xl p-6 text-center">
              <Icon name="receipt_long" className="text-[36px] text-[#bdc9ca]" />
              <p className="mt-2 text-[12px] font-bold">No orders yet</p>
              <Link href="/products" className="mt-2 inline-block text-[12px] font-bold text-[#006872]">Start shopping →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((o) => (
                <Link
                  key={o.id}
                  href="/orders"
                  className="soft-card flex items-center justify-between rounded-xl p-3 hover:bg-[#fbf9f8]"
                >
                  <div>
                    <p className="text-[13px] font-bold">#{o.id}</p>
                    <p className="text-[11px] text-[#6e797b]">{o.items?.length ?? 0} items · {new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-bold">${Number(o.total).toFixed(2)}</p>
                    <span className={`text-[10px] font-bold ${o.status === 'Delivered' || o.status === 'Completed' ? 'text-[#006872]' : 'text-[#835400]'}`}>
                      {o.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link href="/prescriptions" className="soft-card flex items-center gap-3 rounded-xl p-4 hover:bg-[#fbf9f8]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fff3e0]">
              <Icon name="description" className="text-[#a46a00]" />
            </div>
            <div>
              <p className="text-[12px] font-bold">My Prescriptions</p>
              <p className="text-[10px] text-[#6e797b]">Upload & view</p>
            </div>
          </Link>
          <Link href="/admin/dashboard" className="soft-card flex items-center gap-3 rounded-xl p-4 hover:bg-[#fbf9f8]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#d9eeee]">
              <Icon name="admin_panel_settings" className="text-[#006872]" />
            </div>
            <div>
              <p className="text-[12px] font-bold">Admin Portal</p>
              <p className="text-[10px] text-[#6e797b]">Manage store</p>
            </div>
          </Link>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
