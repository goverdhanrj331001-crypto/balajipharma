'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { StoreHeader } from '@/components/layout/store-header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Icon } from '@/components/ui/icon';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth/auth-context';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postal, setPostal] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionUrl, setPrescriptionUrl] = useState('');
  const [uploadingRx, setUploadingRx] = useState(false);
  const [placing, setPlacing] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  // Pre-fill if user is logged in.
  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setEmail(user.email ?? '');
    }
  }, [user]);

  // Redirect if cart is empty.
  useEffect(() => {
    if (cart.length === 0) {
      router.replace('/cart');
    }
  }, [cart, router]);

  const needsPrescription = cart.some((i) => i.prescriptionRequired);

  const shipping = cartTotal >= 50 ? 0 : 5;
  const grandTotal = cartTotal + shipping;

  const onUploadRx = async (file: File) => {
    setUploadingRx(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/public/upload-prescription', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      setPrescriptionUrl(data.url);
      toast.success('Prescription uploaded');
    } catch (e: any) {
      toast.error(e.message ?? 'Upload failed');
    } finally {
      setUploadingRx(false);
    }
  };

  const onPlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to place an order');
      router.push('/login?redirect=/checkout');
      return;
    }
    if (needsPrescription && !prescriptionUrl) {
      toast.error('Please upload a prescription for the prescription-required items');
      return;
    }
    if (!name || !email || !address || !city || !postal) {
      toast.error('Please fill in all required fields');
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch('/api/public/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((i) => ({
            productId: i.id,
            name: i.shortName,
            qty: i.quantity,
            price: i.price,
          })),
          total: grandTotal,
          shippingAddress: `${address}, ${city}, ${postal}`,
          type: 'medicine',
          paymentMethod,
          prescriptionUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Order failed');
      clearCart();
      toast.success('Order placed successfully!');
      router.push('/orders');
    } catch (e: any) {
      toast.error(e.message ?? 'Order failed');
    } finally {
      setPlacing(false);
    }
  };

  if (cart.length === 0) return null;

  return (
    <div className="app-root min-h-screen pb-16">
      <StoreHeader search={false} />
      <main className="desktop-canvas px-4 py-4 md:px-8">
        <Link href="/cart" className="mb-3 inline-flex items-center gap-1 text-[12px] font-bold text-[#006872]">
          <Icon name="arrow_back" className="text-[16px]" /> Back to Cart
        </Link>
        <h1 className="text-[24px] font-extrabold tracking-tight">Checkout</h1>

        <form onSubmit={onPlaceOrder} className="mt-5 grid gap-5 md:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            {/* Contact */}
            <div className="soft-card rounded-xl p-4">
              <h2 className="text-[14px] font-bold">Contact Information</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">Full Name *</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">Email *</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">Phone *</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+1 555-0100"
                    className="w-full rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                  />
                </label>
              </div>
            </div>

            {/* Shipping */}
            <div className="soft-card rounded-xl p-4">
              <h2 className="text-[14px] font-bold">Shipping Address</h2>
              <div className="mt-3 grid gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">Street Address *</span>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="min-h-16 w-full resize-y rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                  />
                </label>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">City *</span>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="w-full rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">Postal Code *</span>
                    <input
                      type="text"
                      value={postal}
                      onChange={(e) => setPostal(e.target.value)}
                      required
                      className="w-full rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Prescription (if needed) */}
            {needsPrescription && (
              <div className="soft-card rounded-xl p-4">
                <h2 className="text-[14px] font-bold">Prescription Upload *</h2>
                <p className="mt-1 text-[11px] text-[#6e797b]">
                  Your cart contains prescription-required items. Please upload a valid prescription.
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onUploadRx(f);
                  }}
                />
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadingRx}
                    className="rounded-lg border border-[#bdc9ca] bg-white px-3 py-2 text-[11px] font-bold text-[#3e494a] hover:bg-[#f5f3f3] disabled:opacity-60"
                  >
                    {uploadingRx ? 'Uploading…' : 'Upload Prescription'}
                  </button>
                  {prescriptionUrl && (
                    <a
                      href={prescriptionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] font-bold text-[#006872]"
                    >
                      <Icon name="check_circle" className="text-[16px]" /> View uploaded file
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Payment */}
            <div className="soft-card rounded-xl p-4">
              <h2 className="text-[14px] font-bold">Payment Method</h2>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                {[
                  { id: 'COD', label: 'Cash on Delivery', icon: 'payments' },
                  { id: 'Card', label: 'Credit / Debit Card', icon: 'credit_card' },
                  { id: 'UPI', label: 'UPI / Wallet', icon: 'account_balance_wallet' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPaymentMethod(p.id)}
                    className={`flex items-center gap-2 rounded-lg border p-3 text-left text-[12px] font-bold transition ${
                      paymentMethod === p.id
                        ? 'border-[#006872] bg-[#d9eeee] text-[#006872]'
                        : 'border-[#bdc9ca] bg-white text-[#3e494a] hover:bg-[#f5f3f3]'
                    }`}
                  >
                    <Icon name={p.icon} className="text-[18px]" />
                    {p.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-[#6e797b]">
                Note: Payment will be collected at delivery for COD orders. Card/UPI payments are processed securely.
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-3">
            <div className="soft-card rounded-xl p-4">
              <h2 className="text-[14px] font-bold">Order Summary</h2>
              <div className="mt-3 max-h-64 space-y-2 overflow-y-auto fancy-scroll">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-[12px]">
                    <span className="text-[#3e494a]">{item.shortName} × {item.quantity}</span>
                    <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-1 border-t border-[#f0eded] pt-3 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-[#6e797b]">Subtotal</span>
                  <span className="font-bold">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6e797b]">Shipping</span>
                  {shipping === 0 ? (
                    <span className="font-bold text-[#006872]">FREE</span>
                  ) : (
                    <span className="font-bold">${shipping.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between border-t border-[#f0eded] pt-2">
                  <span className="font-bold">Total</span>
                  <span className="text-[18px] font-extrabold">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={placing}
                className="mt-4 w-full rounded-lg bg-[#006872] py-3 text-[13px] font-bold text-white hover:bg-[#00535b] disabled:opacity-60"
              >
                {placing ? 'Placing Order…' : `Place Order · $${grandTotal.toFixed(2)}`}
              </button>
            </div>
          </div>
        </form>
      </main>
      <BottomNav />
    </div>
  );
}
