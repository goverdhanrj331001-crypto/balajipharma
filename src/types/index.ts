// ─── Domain Types (single source of truth) ──────────────────────

export type Visibility = 'active' | 'hidden';
export type AdminRole = 'admin' | 'manager' | 'editor' | 'viewer';
export type UserRole = 'patient' | 'doctor' | 'lab_tech' | 'admin';
export type OrderStatus = 'Delivered' | 'In Transit' | 'Processing' | 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
export type OrderType = 'medicine' | 'lab';
export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';
export type TicketStatus = 'Open' | 'In Progress' | 'Pending' | 'Closed';
export type TicketPriority = 'High' | 'Medium' | 'Low';
export type TxnStatus = 'Completed' | 'Pending' | 'Refunded' | 'Failed';

export interface Product {
  id: string;
  name: string;
  shortName: string;
  brand: string;
  price: number;
  oldPrice?: number;
  note: string;
  icon: string;
  tint: string;
  badge?: string;
  categoryId?: string;
  stock: number;
  reorderLevel: number;
  sku: string;
  status: Visibility;
  description?: string;
  prescriptionRequired?: boolean;
  imageUrl?: string;
  images?: string[];
  createdAt?: number;
  updatedAt?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  tint: string;
  productCount?: number;
  visibility: Visibility;
  updatedAt?: number;
}

export interface HealthConcern {
  id: string;
  name: string;
  icon: string;
  tint: string;
  visibility?: Visibility;
}

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  visibility: Visibility;
}

export interface Offer {
  id: string;
  text: string;
  code: string;
  visibility: Visibility;
}

export interface Banner {
  id: string;
  slot: 'hero' | 'prescription' | 'essentials' | 'call' | string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  note?: string;
  badge?: string;
  imageUrl?: string;
  visibility: Visibility;
}

export interface LabPackage {
  id: string;
  name: string;
  detail: string;
  price: number;
  icon: string;
  badge?: string;
  visibility: Visibility;
}

export interface LabTest {
  id: string;
  name: string;
  detail: string;
  price: number;
  visibility: Visibility;
}

export interface OrderItem {
  productId?: string;
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  shippingAddress?: string;
  status: OrderStatus;
  type: OrderType;
  prescriptionVerified?: boolean;
  prescriptionUrl?: string;
  scheduledAt?: number;
  paymentMethod?: string;
  paymentStatus?: TxnStatus;
  createdAt: number;
  updatedAt?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'blocked' | 'pending';
  phone?: string;
  lastLogin?: number;
  address?: string;
  createdAt?: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: 'Pharmacists' | 'Lab Technicians' | 'Delivery Partners' | 'Admin' | string;
  status: 'active' | 'pending' | 'inactive';
  joinedAt: string;
  phone?: string;
}

export interface SupportTicket {
  id: string;
  userId?: string;
  customerName: string;
  subject: string;
  message?: string;
  priority: TicketPriority;
  status: TicketStatus;
  response?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface Transaction {
  id: string;
  orderId: string;
  customerName: string;
  method: string;
  amount: number;
  status: TxnStatus;
  createdAt: number;
}

export interface SiteSettings {
  id: string;
  siteName: string;
  tagline: string;
  supportPhone: string;
  supportEmail: string;
  currency: string;
  currencySymbol: string;
  freeShippingThreshold: number;
  prescriptionDiscountPct: number;
  heroBadgeText: string;
  heroTitle: string;
  heroSubtitle: string;
  maintenanceMode: boolean;
}

// ─── Admin Data Kind (for shared table component) ───────────────
export type AdminDataKind =
  | 'users'
  | 'employees'
  | 'orders'
  | 'medicine'
  | 'lab-orders'
  | 'inventory'
  | 'categories'
  | 'transactions'
  | 'support';

// ─── Auth session ────────────────────────────────────────────────
export interface SessionUser {
  uid: string;
  email: string;
  name: string;
  role: UserRole | AdminRole;
  status?: string;
}
