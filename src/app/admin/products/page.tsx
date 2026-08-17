'use client';

import { CrudPage, StatusPill, type Column, type FieldDef, type CrudPageConfig } from '@/components/admin/crud-page';
import type { Product } from '@/types';

const columns: Column<Product>[] = [
  {
    key: 'name',
    label: 'Product',
    render: (p) => (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded" style={{ background: p.tint }}>
          <span className="material-symbols-outlined text-[18px] text-[#006872]">{p.icon}</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-[12px] font-bold">{p.shortName}</p>
          <p className="truncate text-[10px] text-[#6e797b]">{p.brand} · {p.sku}</p>
        </div>
      </div>
    ),
  },
  { key: 'price', label: 'Price', render: (p) => <span className="font-bold">${Number(p.price).toFixed(2)}</span> },
  { key: 'stock', label: 'Stock', render: (p) => <span>{p.stock}</span> },
  {
    key: 'status',
    label: 'Status',
    render: (p) => {
      const stockStatus = p.stock === 0 ? 'Out of Stock' : p.stock <= p.reorderLevel ? 'Low Stock' : 'In Stock';
      return <StatusPill value={stockStatus} />;
    },
  },
  {
    key: 'visibility',
    label: 'Visibility',
    render: (p) => <StatusPill value={p.status === 'active' ? 'Active' : 'Hidden'} />,
  },
];

const fields: FieldDef[] = [
  { name: 'name', label: 'Full Name', type: 'text', wide: true, placeholder: 'Multivitamin Complex 60s' },
  { name: 'shortName', label: 'Short Name', type: 'text', placeholder: 'Multivitamin' },
  { name: 'brand', label: 'Brand', type: 'text', placeholder: 'MediPharma' },
  { name: 'sku', label: 'SKU', type: 'text', placeholder: 'MED-001' },
  { name: 'price', label: 'Price ($)', type: 'number', placeholder: '24.99' },
  { name: 'oldPrice', label: 'Old Price ($)', type: 'number', placeholder: '29.99', hint: 'Optional — shows strikethrough' },
  { name: 'stock', label: 'Stock Qty', type: 'number', placeholder: '100' },
  { name: 'reorderLevel', label: 'Reorder Level', type: 'number', placeholder: '30' },
  {
    name: 'categoryId',
    label: 'Category',
    type: 'select',
    options: [
      { value: 'cat-prescription', label: 'Prescription Meds' },
      { value: 'cat-vitamins', label: 'Vitamins & Supplements' },
      { value: 'cat-ayurveda', label: 'Ayurveda' },
      { value: 'cat-homeopathy', label: 'Homeopathy' },
      { value: 'cat-healthcare', label: 'Healthcare Devices' },
      { value: 'cat-sexual-wellness', label: 'Sexual Wellness' },
      { value: 'cat-winter-care', label: 'Winter Care' },
      { value: 'cat-diabetes', label: 'Diabetes Care' },
      { value: 'cat-skin-care', label: 'Skin Care' },
      { value: 'cat-elderly-care', label: 'Elderly Care' },
      { value: 'cat-supplements', label: 'Supplements' },
      { value: 'cat-health-food', label: 'Health Food' },
    ],
  },
  { name: 'icon', label: 'Icon (Material Symbol)', type: 'text', placeholder: 'medication', hint: 'e.g. medication, spa, pill, monitor_heart' },
  { name: 'tint', label: 'Tint Color', type: 'text', placeholder: '#d9eeee' },
  { name: 'note', label: 'Note', type: 'text', placeholder: '60 Capsules' },
  { name: 'badge', label: 'Badge', type: 'text', placeholder: '15% OFF', hint: 'Optional' },
  { name: 'description', label: 'Description', type: 'textarea', wide: true, placeholder: 'Detailed product description...' },
  { name: 'prescriptionRequired', label: 'Prescription Required', type: 'toggle' },
  { name: 'status', label: 'Visibility', type: 'toggle' },
  { name: 'imageUrl', label: 'Image', type: 'image', wide: true },
];

const config: CrudPageConfig<Product> = {
  title: 'Products',
  description: 'Manage medicines, healthcare devices, supplements, and wellness products in your catalog.',
  endpoint: '/api/admin/products',
  columns,
  fields,
  searchKeys: ['name', 'shortName', 'brand', 'sku'],
  makeDefault: () => ({
    name: '',
    shortName: '',
    brand: '',
    price: 0,
    stock: 0,
    reorderLevel: 10,
    sku: 'MED-' + Math.floor(Math.random() * 1000),
    icon: 'medication',
    tint: '#d9eeee',
    note: '',
    badge: '',
    description: '',
    status: 'active',
    prescriptionRequired: false,
    categoryId: 'cat-vitamins',
    imageUrl: '',
  }),
  stats: (items) => [
    { label: 'Total Products', value: items.length, icon: 'inventory_2', tone: 'teal' },
    { label: 'Active', value: items.filter((i) => i.status === 'active').length, icon: 'check_circle', tone: 'blue' },
    { label: 'Low Stock', value: items.filter((i) => i.stock > 0 && i.stock <= i.reorderLevel).length, icon: 'warning', tone: 'gold' },
    { label: 'Out of Stock', value: items.filter((i) => i.stock === 0).length, icon: 'error', tone: 'red' },
  ],
};

export default function AdminProductsPage() {
  return <CrudPage config={config} />;
}
