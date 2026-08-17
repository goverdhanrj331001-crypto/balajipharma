'use client';

import { CrudPage, StatusPill, type Column, type FieldDef, type CrudPageConfig } from '@/components/admin/crud-page';
import type { HealthConcern } from '@/types';

const columns: Column<HealthConcern>[] = [
  {
    key: 'name',
    label: 'Health Concern',
    render: (h) => (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded" style={{ background: h.tint }}>
          <span className="material-symbols-outlined text-[18px] text-[#006872]">{h.icon}</span>
        </div>
        <span className="font-bold">{h.name}</span>
      </div>
    ),
  },
  { key: 'visibility', label: 'Visibility', render: (h) => <StatusPill value={h.visibility === 'active' || !h.visibility ? 'Active' : 'Hidden'} /> },
];

const fields: FieldDef[] = [
  { name: 'name', label: 'Name', type: 'text', wide: true, placeholder: 'Diabetes care' },
  { name: 'icon', label: 'Icon (Material Symbol)', type: 'text', placeholder: 'bloodtype' },
  { name: 'tint', label: 'Tint Color', type: 'text', placeholder: '#eadff3' },
  { name: 'visibility', label: 'Visibility', type: 'toggle' },
];

const config: CrudPageConfig<HealthConcern> = {
  title: 'Health Concerns',
  description: 'Manage the "Shop by health concerns" section on the storefront home page.',
  endpoint: '/api/admin/health-concerns',
  columns,
  fields,
  searchKeys: ['name'],
  makeDefault: () => ({ name: '', icon: 'favorite', tint: '#d9eeee', visibility: 'active' }),
  stats: (items) => [
    { label: 'Total Concerns', value: items.length, icon: 'health_and_safety', tone: 'teal' },
  ],
};

export default function AdminHealthConcernsPage() {
  return <CrudPage config={config} />;
}
