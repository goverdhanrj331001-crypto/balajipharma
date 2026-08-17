'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StoreHeader } from '@/components/layout/store-header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { ProductBand } from '@/components/store/product-band';
import { Icon } from '@/components/ui/icon';
import type { Product, Category, HealthConcern, Brand, Offer, Banner, LabPackage } from '@/types';

interface Catalog {
  products: Product[];
  categories: Category[];
  healthConcerns: HealthConcern[];
  brands: Brand[];
  offers: Offer[];
  banners: Banner[];
  labPackages: LabPackage[];
  settings: any;
}

export default function HomePage() {
  const [data, setData] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/catalog', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="app-root min-h-screen">
        <StoreHeader />
        <div className="flex h-96 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
        </div>
        <BottomNav />
      </div>
    );
  }

  const hero = data.banners.find((b) => b.slot === 'hero');
  const prescription = data.banners.find((b) => b.slot === 'prescription');
  const essentials = data.banners.find((b) => b.slot === 'essentials');
  const call = data.banners.find((b) => b.slot === 'call');

  const healthcareProducts = data.products.slice(0, 6);
  const winterCare = data.products.slice(0, 3);
  const immunityBoosters = data.products.slice(2, 5);

  return (
    <div className="app-root page-fade pb-16">
      <StoreHeader />
      <main className="desktop-canvas">
        {/* Hero */}
        {hero && (
          <section className="hero-art relative flex h-48 items-center justify-between overflow-hidden px-6 md:h-80 md:px-16">
            <div className="relative z-10 max-w-[58%]">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#643f00]">
                {hero.badge ?? data.settings?.heroBadgeText ?? 'Everyday wellness'}
              </p>
              <h2 className="mt-1 text-[24px] font-bold leading-8 text-[#2a1800] md:text-[34px]">
                {hero.title ?? data.settings?.heroTitle ?? 'Boost your immunity'}
              </h2>
              <p className="mt-1 text-[14px] text-[#643f00]">
                {hero.subtitle ?? data.settings?.heroSubtitle ?? 'Health essentials for brighter days.'}
              </p>
              <Link
                href={hero.ctaHref ?? '/products'}
                className="mt-4 inline-block rounded-full bg-[#006872] px-4 py-2 text-[12px] font-bold text-white"
              >
                {hero.ctaText ?? 'CLICK TO SHOP'}
              </Link>
            </div>
            <div className="hero-bottle relative mr-8 mt-5 md:mr-28" aria-hidden="true" />
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              <i className="h-2 w-2 rounded-full bg-white" />
              <i className="h-2 w-2 rounded-full bg-white/50" />
              <i className="h-2 w-2 rounded-full bg-white/50" />
            </div>
          </section>
        )}

        {/* Prescription order */}
        {prescription && (
          <section className="px-4 py-8 md:px-8">
            <div className="soft-card flex items-center justify-between rounded-xl p-4">
              <div className="max-w-[60%]">
                <h2 className="text-[18px] font-semibold leading-6">{prescription.title}</h2>
                <p className="mt-2 text-[14px] leading-5 text-[#3e494a]">{prescription.subtitle}</p>
                {prescription.note && (
                  <p className="mt-1 text-[12px] font-bold text-[#006872]">{prescription.note}</p>
                )}
                <Link
                  href={prescription.ctaHref ?? '/prescriptions'}
                  className="mt-4 inline-block rounded-lg bg-[#00838f] px-5 py-2 text-[12px] font-bold text-white"
                >
                  {prescription.ctaText ?? 'Order Now'}
                </Link>
              </div>
              <div className="asset-art flex h-24 w-24 items-center justify-center rounded-xl bg-[#fff3e0]">
                <Icon name="description" className="text-[54px] text-[#a46a00]" />
              </div>
            </div>
          </section>
        )}

        {/* Popular categories */}
        <section className="bg-[#f5f3f3] px-4 py-4 md:px-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[18px] font-semibold leading-6">Popular categories</h2>
            <Link href="/categories" className="rounded bg-[#006872] px-3 py-1 text-[12px] font-bold text-white">
              VIEW ALL
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
            {data.categories.slice(0, 12).map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.id}`}
                className="soft-card rounded-lg p-2 transition hover:shadow-md active:scale-95"
              >
                <div
                  className="flex aspect-square items-center justify-center rounded-md"
                  style={{ background: c.tint }}
                >
                  <Icon name={c.icon} className="text-[34px] text-[#006872]" />
                </div>
                <span className="mt-2 block truncate text-center text-[11px] font-medium">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Daily essentials banner */}
        {essentials && (
          <section className="px-4 py-4 md:px-8">
            <div className="relative flex h-32 items-center overflow-hidden rounded-xl bg-[#4caf50] px-6 text-white md:h-48">
              <div className="relative z-10">
                <p className="text-[11px] uppercase tracking-wider">{essentials.subtitle ?? 'Daily health'}</p>
                <h3 className="text-[24px] font-bold leading-8">{essentials.title}</h3>
                {essentials.note && <p className="text-[14px]">{essentials.note}</p>}
                <Link href={essentials.ctaHref ?? '/products'} className="mt-2 flex items-center gap-2 text-[12px] font-bold">
                  {essentials.ctaText ?? 'SHOP NOW'}
                  <Icon name="arrow_forward" className="rounded-full bg-white p-1 text-[16px] text-[#4caf50]" />
                </Link>
              </div>
              <Icon name="medication" className="absolute right-12 text-[100px] text-white/25" />
            </div>
          </section>
        )}

        {/* Call banner */}
        {call && (
          <section className="border-y border-[#bdc9ca]/30 bg-white px-4 py-4 md:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[18px] font-semibold">{call.title}</h2>
                <p className="text-[14px] text-[#3e494a]">{call.subtitle}</p>
              </div>
              <a
                href={`tel:${data.settings?.supportPhone ?? ''}`}
                className="rounded bg-[#006872] px-4 py-2 text-[12px] font-bold text-white"
              >
                {call.ctaText ?? 'Call Now'}
              </a>
            </div>
          </section>
        )}

        {/* Product bands */}
        <ProductBand title="Healthcare Products" color="#ef5350" products={healthcareProducts} />
        <ProductBand title="Winter Care" color="#1976d2" products={winterCare} />
        <ProductBand title="Immunity Boosters" color="#26a69a" products={immunityBoosters} />

        {/* Offers */}
        <section className="px-4 py-4 md:px-8">
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {data.offers.map((offer) => (
              <div key={offer.id} className="soft-card flex min-w-[280px] items-center gap-3 rounded-lg p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffddb5] text-lg font-bold text-[#835400]">
                  %
                </div>
                <div>
                  <p className="text-[11px] font-semibold">{offer.text}</p>
                  <p className="text-[11px] text-[#3e494a]">Code: <b>{offer.code}</b></p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Health concerns */}
        <section className="px-4 py-4 md:px-8">
          <h2 className="mb-4 text-[18px] font-semibold">Shop by health concerns</h2>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
            {data.healthConcerns.map((hc) => (
              <Link key={hc.id} href="/products" className="group text-center">
                <div
                  className="asset-art flex aspect-square items-center justify-center rounded-xl"
                  style={{ background: hc.tint }}
                >
                  <Icon
                    name={hc.icon}
                    className="text-[34px] text-[#006872] transition group-hover:scale-110"
                  />
                </div>
                <span className="mt-2 block text-[11px] font-medium">{hc.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured brands */}
        <section className="px-4 py-6 md:px-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[18px] font-semibold">Featured brands</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
            {data.brands.map((brand) => (
              <div
                key={brand.id}
                className="soft-card flex aspect-[4/3] items-center justify-center rounded-lg p-2 text-center text-[12px] font-bold text-[#006872]"
              >
                {brand.name}
              </div>
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
