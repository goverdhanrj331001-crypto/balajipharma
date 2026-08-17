'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/icon';

const navItems = [
  { key: 'home', label: 'Home', href: '/', icon: 'home' },
  { key: 'categories', label: 'Categories', href: '/categories', icon: 'grid_view' },
  { key: 'orders', label: 'Orders', href: '/orders', icon: 'receipt_long' },
  { key: 'profile', label: 'Profile', href: '/profile', icon: 'person' },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  const getActive = () => {
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/categories') || pathname.startsWith('/products') || pathname.startsWith('/lab-tests')) return 'categories';
    if (pathname.startsWith('/orders')) return 'orders';
    if (pathname.startsWith('/profile') || pathname.startsWith('/prescriptions')) return 'profile';
    return 'home';
  };

  const active = getActive();

  return (
    <nav
      className="fixed bottom-0 z-50 flex h-16 w-full items-center justify-around border-t border-[#bdc9ca] bg-[#fbf9f8] px-3 shadow-[0_-2px_10px_rgba(0,0,0,.05)] md:hidden"
      aria-label="Bottom navigation"
    >
      {navItems.map(({ key, label, href, icon }) => {
        const isActive = active === key;
        return (
          <Link
            key={key}
            href={href}
            className={`flex min-w-[68px] flex-col items-center justify-center rounded-full px-4 py-1 transition active:scale-95 ${
              isActive ? 'bg-[#fc5d59] text-[#600009]' : 'text-[#3e494a] hover:text-[#006872]'
            }`}
          >
            <Icon name={icon} filled={isActive} />
            <span className="mt-1 text-[11px] font-bold leading-[14px]">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
