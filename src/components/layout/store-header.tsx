'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth/auth-context';

interface StoreHeaderProps {
  search?: boolean;
}

export function StoreHeader({ search = true }: StoreHeaderProps) {
  const { cartCount } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [q, setQ] = useState('');

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/products?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header
      className="sticky top-0 z-50 w-full text-white"
      style={{ background: 'linear-gradient(180deg, #006872 0%, #00838f 100%)' }}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="rounded-full p-2 opacity-90 transition hover:bg-white/10 active:scale-95"
          aria-label="Menu"
        >
          <Icon name="menu" />
        </Link>
        <Link href="/" className="text-[20px] font-bold leading-7">
          MediDemo
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href={user ? '/profile' : '/login'}
            className="rounded-full p-2 transition hover:bg-white/10 active:scale-95"
            aria-label="Profile"
          >
            <Icon name="person" />
          </Link>
          <Link
            href="/cart"
            className="relative rounded-full p-2 transition hover:bg-white/10 active:scale-95"
            aria-label="Shopping cart"
          >
            <Icon name="shopping_cart" />
            {cartCount > 0 && (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#b3272a] px-1 text-[10px] font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
      {search && (
        <div className="px-4 pb-4">
          <form onSubmit={onSearch} className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-full border-none bg-white py-2 pl-4 pr-10 text-[14px] text-[#1b1c1c] outline-none ring-0 placeholder:text-[#6e797b] focus:ring-2 focus:ring-[#75d5e2]"
              placeholder="Search for Medicine and Health Products"
            />
            <button type="submit" aria-label="Search">
              <Icon name="search" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6e797b]" />
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
