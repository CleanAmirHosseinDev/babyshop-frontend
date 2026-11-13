/**
 * مدل‌های مشترک دامنه — دقیقاً منطبق با DTO های بک‌اند (BabyShop-backend).
 */

export type Role = 'Admin' | 'Manager' | 'User';

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  categoryId: number;
  categoryName: string;
  isActive: boolean;
  viewCount: number;
  soldCount: number;
  /** مقدار عددی جنسیت: ۱ پسرانه، ۲ دخترانه، ۳ یونیسکس */
  genderValue: number;
  genderName: string;
  gender: string;
  ageRangeCode: string;
  ageRangeDisplay: string;
  currentStock: number;
  createdAt: string;
  imageUrl?: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parentCategoryId?: number | null;
  parentCategoryName?: string | null;
  imageUrl?: string | null;
  displayOrder: number;
  isActive: boolean;
  productsCount: number;
  createdAt: string;
  subCategories: Category[];
}

export interface InventoryItem {
  id: number;
  productId: number;
  productName: string;
  ageRange: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  minimumStockLevel: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  createdAt: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  userName: string;
  shippingAddress: string;
  phoneNumber: string;
  email?: string | null;
  status: string;
  subTotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  totalAmount: number;
  customerNote?: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderSummary {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  itemsCount: number;
  userName: string;
  phoneNumber: string;
}

export interface Delivery {
  id: number;
  orderId: number;
  address: string;
  phoneNumber: string;
  postalCode: string;
  status: string;
  trackingNumber?: string | null;
  carrier?: string | null;
  estimatedDeliveryDate?: string | null;
  actualDeliveryDate?: string | null;
  createdAt: string;
}

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  status: string;
  authority?: string | null;
  referenceNumber?: string | null;
  paymentMethod: string;
}

export interface TicketReply {
  id: number;
  ticketId: number;
  userId: number;
  userName: string;
  message: string;
  isAdminReply: boolean;
  createdAt: string;
}

export interface Ticket {
  id: number;
  ticketNumber: string;
  subject: string;
  message: string;
  userId: number;
  userName: string;
  userPhone: string;
  orderId?: number | null;
  productId?: number | null;
  productName: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  updatedAt?: string | null;
  replies: TicketReply[];
}

/** وضعیت‌های سفارش در بک‌اند (Order.MarkAs...) */
export const ORDER_STATUS = {
  Pending: 'Pending',
  Paid: 'Paid',
  Shipped: 'Shipped',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
} as const;

/** آمار تیکت‌ها (GET /api/admin/AdminTicket/dashboard/stats) */
export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

/** وضعیت‌های تیکت در بک‌اند */
export const TICKET_STATUS = {
  Open: 'Open',
  InProgress: 'InProgress',
  Resolved: 'Resolved',
  Closed: 'Closed',
} as const;

/** رده‌های سنی مجاز در بک‌اند (AgeRange) */
export const AGE_RANGES = [
  { code: '0-3', label: '۰ تا ۳ ماه' },
  { code: '3-6', label: '۳ تا ۶ ماه' },
  { code: '6-12', label: '۶ تا ۱۲ ماه' },
  { code: '12-24', label: '۱۲ تا ۲۴ ماه' },
  { code: '24+', label: 'بالای ۲۴ ماه' },
] as const;

/** جنسیت‌ها در بک‌اند (Gender): 1=پسرانه، 2=دخترانه، 3=یونیسکس */
export const GENDERS = [
  { value: 1, label: 'پسرانه', emoji: '👦' },
  { value: 2, label: 'دخترانه', emoji: '👧' },
  { value: 3, label: 'یونیسکس', emoji: '🌈' },
] as const;
