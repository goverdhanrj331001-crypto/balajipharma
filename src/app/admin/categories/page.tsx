'use client';

import { CrudPage, StatusPill, type Column, type FieldDef, type CrudPageConfig } from '@/components/admin/crud-page';
import type { Category } from '@/types';

const columns: Column<Category>[] = [
  {
    key: 'name',
    label: 'Category',
    render: (c) => (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded" style={{ background: c.tint }}>
          <span className="material-symbols-outlined text-[18px] text-[#006872]">{c.icon}</span>
        </div>
        <span className="text-[12px] font-bold">{c.name}</span>
      </div>
    ),
  },
  { key: 'visibility', label: 'Visibility', render: (c) => <StatusPill value={c.visibility === 'active' ? 'Active' : 'Hidden'} /> },
];

const fields: FieldDef[] = [
  { name: 'name', label: 'Category Name', type: 'text', wide: true, placeholder: 'Vitamins & Supplements' },
  { name: 'icon', label: 'Icon (Material Symbol)', type: 'text', placeholder: 'pill', hint: 'e.g. pill, spa, medication, monitor_heart' },
  { name: 'tint', label: 'Tint Color', type: 'text', placeholder: '#f3e5f5' },
  { name: 'visibility', label: 'Visibility', type: 'toggle' },
];

const config: CrudPageConfig<Category> = {
  title: 'Categories',
  description: 'Organize the store catalog into customer-facing categories.',
  endpoint: '/api/admin/categories',
  columns,
  fields,
  searchKeys: ['name'],
  makeDefault: () => ({
    name: '',
    icon: 'category',
    tint: '#d9eeee',
    visibility: 'active',
  }),
  stats: (items) => [
    { label: 'Total Categories', value: items.length, icon: 'category', tone: 'teal' },
    { label: 'Active', value: items.filter((i) => i.visibility === 'active').length, icon: 'check_circle', tone: 'blue' },
  ],
};

export default function AdminCategoriesPage() {
  return <CrudPage config={config} />;
}
