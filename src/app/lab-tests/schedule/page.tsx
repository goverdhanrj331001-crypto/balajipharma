'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StoreHeader } from '@/components/layout/store-header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/lib/auth/auth-context';
import { toast } from 'sonner';
import type { LabPackage, LabTest } from '@/types';

export const dynamic = 'force-dynamic';

function ScheduleLabTestContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();
  const pkgId = params.get('pkg');
  const testId = params.get('test');

  const [packages, setPackages] = useState<LabPackage[]>([]);
  const [tests, setTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/public/catalog', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        setPackages(d.labPackages ?? []);
        setTests(d.labTests ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const selectedPkg = packages.find((p) => p.id === pkgId);
  const selectedTest = tests.find((t) => t.id === testId);
  const selectedItem = selectedPkg ?? selectedTest;
  const totalPrice = selectedPkg ? Number(selectedPkg.price) : selectedTest ? Number(selectedTest.price) : 0;
  const itemName = selectedPkg?.name ?? selectedTest?.name ?? '';

  const onBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to book a lab test');
      router.push('/login?redirect=/lab-tests/schedule');
      return;
    }
    if (!selectedItem) {
      toast.error('No test or package selected');
      return;
    }
    if (!date || !address) {
      toast.error('Please select a date and enter your address');
      return;
    }
    setSubmitting(true);
    try {
      const scheduledAt = new Date(`${date}T${time}`).getTime();
      const res = await fetch('/api/public/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ name: itemName, qty: 1, price: totalPrice }],
          total: totalPrice,
          shippingAddress: address,
          type: 'lab',
          paymentMethod: 'COD',
          scheduledAt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Booking failed');
      toast.success('Lab test booked successfully');
      router.push('/orders');
    } catch (e: any) {
      toast.error(e.message ?? 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-root min-h-screen pb-16">
      <StoreHeader search={false} />
      <main className="desktop-canvas px-4 py-4 md:px-8">
        <h1 className="text-[24px] font-extrabold tracking-tight">Schedule Lab Test</h1>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
          </div>
        ) : !selectedItem ? (
          <div className="mt-6 rounded-lg bg-[#fff4f2] p-4 text-center">
            <Icon name="error" className="text-[#910816]" />
            <p className="mt-2 text-[13px] font-bold text-[#910816]">No test or package selected.</p>
            <a href="/lab-tests" className="mt-2 inline-block text-[12px] font-bold text-[#006872]">Browse lab tests →</a>
          </div>
        ) : (
          <div className="mt-5 grid gap-5 md:grid-cols-[1fr_320px]">
            <form onSubmit={onBook} className="space-y-4">
              <div className="soft-card rounded-xl p-4">
                <h2 className="text-[14px] font-bold">Sample Collection Details</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">Preferred Date</span>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 10)}
                      required
                      className="w-full rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">Preferred Time</span>
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                    >
                      <option value="07:00">07:00 AM — 08:00 AM</option>
                      <option value="08:00">08:00 AM — 09:00 AM</option>
                      <option value="09:00">09:00 AM — 10:00 AM</option>
                      <option value="10:00">10:00 AM — 11:00 AM</option>
                      <option value="11:00">11:00 AM — 12:00 PM</option>
                      <option value="16:00">04:00 PM — 05:00 PM</option>
                      <option value="17:00">05:00 PM — 06:00 PM</option>
                    </select>
                  </label>
                </div>
                <label className="mt-3 block">
                  <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">Collection Address</span>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Full address with city and postal code"
                    required
                    className="min-h-20 w-full resize-y rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                  />
                </label>
                <label className="mt-3 block">
                  <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">Notes (optional)</span>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special instructions for the phlebotomist"
                    className="min-h-16 w-full resize-y rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-[#006872] py-3 text-[13px] font-bold text-white shadow-sm hover:bg-[#00535b] disabled:opacity-60"
              >
                {submitting ? 'Booking…' : `Confirm Booking · $${totalPrice.toFixed(2)}`}
              </button>
            </form>

            <div className="space-y-3">
              <div className="soft-card rounded-xl p-4">
                <p className="text-[11px] font-bold uppercase text-[#6e797b]">Booking Summary</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#d9eeee]">
                    <Icon name={selectedPkg?.icon ?? 'biotech'} className="text-[24px] text-[#006872]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold">{itemName}</p>
                    <p className="text-[11px] text-[#6e797b]">{selectedPkg?.detail ?? selectedTest?.detail}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1 border-t border-[#f0eded] pt-3 text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-[#6e797b]">Subtotal</span>
                    <span className="font-bold">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6e797b]">Home collection</span>
                    <span className="font-bold text-[#006872]">FREE</span>
                  </div>
                  <div className="flex justify-between border-t border-[#f0eded] pt-1">
                    <span className="font-bold">Total</span>
                    <span className="text-[16px] font-extrabold">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="soft-card rounded-xl p-4">
                <p className="text-[12px] font-bold">What happens next?</p>
                <ul className="mt-2 space-y-2 text-[11px] text-[#3e494a]">
                  <li className="flex gap-2">
                    <Icon name="check_circle" className="text-[16px] text-[#006872]" /> Receive confirmation SMS/email
                  </li>
                  <li className="flex gap-2">
                    <Icon name="check_circle" className="text-[16px] text-[#006872]" /> Phlebotomist arrives at scheduled time
                  </li>
                  <li className="flex gap-2">
                    <Icon name="check_circle" className="text-[16px] text-[#006872]" /> Get digital report in 24–48 hours
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}

export default function ScheduleLabTestPage() {
  return (
    <Suspense fallback={
      <div className="app-root min-h-screen pb-16">
        <StoreHeader search={false} />
        <main className="desktop-canvas px-4 py-4 md:px-8">
          <div className="flex h-64 items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
          </div>
        </main>
        <BottomNav />
      </div>
    }>
      <ScheduleLabTestContent />
    </Suspense>
  );
}
