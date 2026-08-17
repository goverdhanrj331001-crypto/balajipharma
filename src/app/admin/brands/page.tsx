'use client';

import { CrudPage, StatusPill, type Column, type FieldDef, type CrudPageConfig } from '@/components/admin/crud-page';
import type { Brand } from '@/types';

const columns: Column<Brand>[] = [
  { key: 'name', label: 'Brand', render: (b) => <span className="font-bold">{b.name}</span> },
  { key: 'visibility', label: 'Visibility', render: (b) => <StatusPill value={b.visibility === 'active' ? 'Active' : 'Hidden'} /> },
];

const fields: FieldDef[] = [
  { name: 'name', label: 'Brand Name', type: 'text', wide: true, placeholder: 'Himalaya' },
  { name: 'logo', label: 'Logo', type: 'image' },
  { name: 'visibility', label: 'Visibility', type: 'toggle' },
];

const config: CrudPageConfig<Brand> = {
  title: 'Brands',
  description: 'Manage featured brands shown on the storefront home page.',
  endpoint: '/api/admin/brands',
  columns,
  fields,
  searchKeys: ['name'],
  makeDefault: () => ({ name: '', logo: '', visibility: 'active' }),
  stats: (items) => [
    { label: 'Total Brands', value: items.length, icon: 'storefront', tone: 'teal' },
    { label: 'Active', value: items.filter((i) => i.visibility === 'active').length, icon: 'check_circle', tone: 'blue' },
  ],
};

export default function AdminBrandsPage() {
  return <CrudPage config={config} />;
}
