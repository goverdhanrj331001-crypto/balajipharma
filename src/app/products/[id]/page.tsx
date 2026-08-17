'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { StoreHeader } from '@/components/layout/store-header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { ProductArt } from '@/components/ui/product-art';
import { Icon } from '@/components/ui/icon';
import { useCart } from '@/lib/cart-context';
import { toast } from 'sonner';
import type { Product } from '@/types';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = useIdParam(params);
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!id) return;
    fetch('/api/public/catalog', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        const found = (d.products as Product[]).find((p) => p.id === id);
        setProduct(found ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

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

  if (!product) {
    return (
      <div className="app-root min-h-screen pb-16">
        <StoreHeader search={false} />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Icon name="error_outline" className="text-[64px] text-[#bdc9ca]" />
          <p className="mt-3 text-[14px] font-bold">Product not found</p>
          <Link href="/products" className="mt-3 rounded-lg bg-[#006872] px-4 py-2 text-[12px] font-bold text-white">
            Browse Products
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  const inStock = product.stock > 0;
  const lowStock = inStock && product.stock <= product.reorderLevel;

  const onAddToCart = () => {
    addToCart(product, qty);
    toast.success(`${product.shortName} × ${qty} added to cart`);
    router.push('/cart');
  };

  return (
    <div className="app-root min-h-screen pb-16">
      <StoreHeader search={false} />
      <main className="desktop-canvas px-4 py-4 md:px-8">
        <Link href="/products" className="mb-3 inline-flex items-center gap-1 text-[12px] font-bold text-[#006872]">
          <Icon name="arrow_back" className="text-[16px]" /> Back to Products
        </Link>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Image */}
          <div>
            <ProductArt product={product} className="aspect-square w-full rounded-2xl" />
            {product.badge && (
              <span className="mt-2 inline-block rounded bg-[#fc5d59] px-2 py-1 text-[11px] font-bold text-[#600009]">
                {product.badge}
              </span>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-[11px] font-medium uppercase text-[#3e494a]">{product.brand}</p>
            <h1 className="mt-1 text-[24px] font-extrabold leading-tight">{product.name}</h1>
            <p className="mt-1 text-[13px] text-[#3e494a]">{product.note}</p>

            <div className="mt-4 flex items-end gap-2">
              <span className="text-[28px] font-extrabold">${product.price.toFixed(2)}</span>
              {product.oldPrice && (
                <span className="mb-1 text-[14px] text-[#6e797b] line-through">
                  ${product.oldPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="mt-3">
              {!inStock ? (
                <span className="inline-block rounded-full bg-[#ffdad7] px-3 py-1 text-[11px] font-bold text-[#910816]">Out of Stock</span>
              ) : lowStock ? (
                <span className="inline-block rounded-full bg-[#ffddb5] px-3 py-1 text-[11px] font-bold text-[#835400]">Low Stock — only {product.stock} left</span>
              ) : (
                <span className="inline-block rounded-full bg-[#d9eeee] px-3 py-1 text-[11px] font-bold text-[#006872]">In Stock</span>
              )}
            </div>

            {/* Prescription warning */}
            {product.prescriptionRequired && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-[#fff4f2] p-3">
                <Icon name="warning" className="text-[#910816]" />
                <div>
                  <p className="text-[12px] font-bold text-[#910816]">Prescription Required</p>
                  <p className="text-[11px] text-[#3e494a]">A valid prescription must be uploaded at checkout.</p>
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="mt-5 flex items-center gap-3">
              <div className="flex items-center rounded-lg border border-[#bdc9ca]">
                <button
                  type="button"
                  className="px-3 py-2 text-[14px] font-bold text-[#3e494a] hover:bg-[#f5f3f3]"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span className="px-4 py-2 text-[13px] font-bold">{qty}</span>
                <button
                  type="button"
                  className="px-3 py-2 text-[14px] font-bold text-[#3e494a] hover:bg-[#f5f3f3]"
                  onClick={() => setQty((q) => q + 1)}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                disabled={!inStock}
                onClick={onAddToCart}
                className="flex-1 rounded-lg bg-[#006872] py-3 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#00535b] disabled:opacity-50"
              >
                <Icon name="add_shopping_cart" className="mr-1 align-middle text-[18px]" />
                Add to Cart
              </button>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-6">
                <h3 className="text-[14px] font-bold">About this product</h3>
                <p className="mt-2 text-[13px] leading-6 text-[#3e494a]">{product.description}</p>
              </div>
            )}

            {/* SKU */}
            <div className="mt-6 border-t border-[#e4e2e1] pt-4 text-[11px] text-[#6e797b]">
              SKU: <span className="font-bold text-[#3e494a]">{product.sku}</span>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

// Resolve params.id safely across sync/async Next.js param APIs.
function useIdParam(params: any): { id: string } {
  const [id, setId] = useState<string>(() => (params && typeof params.then !== 'function' ? params.id ?? '' : ''));
  useEffect(() => {
    let cancelled = false;
    if (params && typeof params.then === 'function') {
      params.then((p: any) => {
        if (!cancelled) setId(p.id);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [params]);
  return { id };
}
