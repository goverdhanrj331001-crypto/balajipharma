'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { SectionCard, StatusRow } from '@/components/admin/admin-ui';
import { Field, TextInput, PrimaryButton } from '@/components/admin/ui/form';
import { Icon } from '@/components/ui/icon';
import { toast } from 'sonner';
import { isFirebaseConfigured, isR2Configured } from '@/lib/firebase/config';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setSettings(d.items?.[0] ?? null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/settings?id=${settings.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Save failed');
      setSettings(json.item);
      toast.success('Settings saved');
    } catch (e: any) {
      toast.error(e.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="System Settings">
      <div className="mb-6">
        <h2 className="text-[24px] font-extrabold tracking-tight">System Settings</h2>
        <p className="mt-1 text-[13px] text-[#3e494a]">Configure storefront branding, contact info, and operational thresholds.</p>
      </div>

      {loading || !settings ? (
        <div className="flex justify-center py-12">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
        </div>
      ) : (
        <form onSubmit={onSave} className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <SectionCard title="Storefront Branding">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Site Name">
                  <TextInput value={settings.siteName ?? ''} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} />
                </Field>
                <Field label="Tagline">
                  <TextInput value={settings.tagline ?? ''} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} />
                </Field>
                <Field label="Hero Badge Text">
                  <TextInput value={settings.heroBadgeText ?? ''} onChange={(e) => setSettings({ ...settings, heroBadgeText: e.target.value })} />
                </Field>
                <Field label="Hero Title">
                  <TextInput value={settings.heroTitle ?? ''} onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })} />
                </Field>
                <Field label="Hero Subtitle" wide>
                  <TextInput value={settings.heroSubtitle ?? ''} onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })} />
                </Field>
              </div>
            </SectionCard>

            <SectionCard title="Contact Information">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Support Phone">
                  <TextInput value={settings.supportPhone ?? ''} onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })} />
                </Field>
                <Field label="Support Email">
                  <TextInput value={settings.supportEmail ?? ''} onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })} />
                </Field>
              </div>
            </SectionCard>

            <SectionCard title="Commerce">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Currency Code">
                  <TextInput value={settings.currency ?? ''} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} />
                </Field>
                <Field label="Currency Symbol">
                  <TextInput value={settings.currencySymbol ?? ''} onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })} />
                </Field>
                <Field label="Free Shipping Threshold ($)">
                  <TextInput type="number" value={settings.freeShippingThreshold ?? 0} onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })} />
                </Field>
                <Field label="Prescription Discount (%)">
                  <TextInput type="number" value={settings.prescriptionDiscountPct ?? 0} onChange={(e) => setSettings({ ...settings, prescriptionDiscountPct: Number(e.target.value) })} />
                </Field>
              </div>
            </SectionCard>

            <div className="flex justify-end gap-2">
              <PrimaryButton type="submit" loading={saving}>
                <Icon name="save" className="text-[18px]" /> Save Settings
              </PrimaryButton>
            </div>
          </div>

          <div className="space-y-5">
            <SectionCard title="Backend Status">
              <StatusRow label="Firebase Firestore" status={isFirebaseConfigured ? 'Connected' : 'Mock mode'} good={isFirebaseConfigured} />
              <StatusRow label="Firebase Auth" status={isFirebaseConfigured ? 'Connected' : 'Mock mode'} good={isFirebaseConfigured} />
              <StatusRow label="Cloudflare R2" status={isR2Configured ? 'Connected' : 'Local fallback'} good={isR2Configured} />
            </SectionCard>

            <SectionCard title="Configuration Help">
              <div className="space-y-3 text-[12px] text-[#3e494a]">
                <p>
                  To enable real Firebase, add these env vars in your hosting provider:
                </p>
                <pre className="overflow-x-auto rounded bg-[#f5f3f3] p-2 text-[10px] leading-relaxed">
{`NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY=...`}
                </pre>
                <p>For Cloudflare R2:</p>
                <pre className="overflow-x-auto rounded bg-[#f5f3f3] p-2 text-[10px] leading-relaxed">
{`R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=...
R2_PUBLIC_URL=...`}
                </pre>
                <p className="text-[11px] text-[#6e797b]">
                  Until configured, the app runs in mock mode with in-memory data and local file uploads. All admin CRUD operations work identically.
                </p>
              </div>
            </SectionCard>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
