/** مدل‌های مشترک دامنه (مطابق پاسخ بک‌اند) */

export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  slug?: string;
  imageUrl?: string;
  categoryId?: number;
  categoryName?: string;
  gender?: number | string;
  isActive?: boolean;
  currentStock?: number;
}

export interface Category {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

export interface InventoryItem {
  id: number;
  productId: number;
  productName?: string;
  ageRange?: string;
  currentStock: number;
}

export interface OrderItem {
  id?: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  orderNumber?: string | number;
  userId?: string;
  userName?: string;
  phoneNumber?: string;
  status?: string;
  totalAmount?: number;
  subTotal?: number;
  shippingCost?: number;
  tax?: number;
  discountAmount?: number;
  createdAt?: string;
  shippingAddress?: string;
  customerNote?: string;
  items?: OrderItem[];
}

export interface Delivery {
  id?: number;
  carrier?: string;
  trackingNumber?: string;
  status?: string;
}

export interface TicketReply {
  id: number;
  message: string;
  isAdminReply: boolean;
  createdAt: string;
}

export interface Ticket {
  id: number;
  ticketNumber?: string | number;
  subject: string;
  status?: string;
  category?: string;
  userName?: string;
  userPhone?: string;
  createdAt?: string;
  replies?: TicketReply[];
}

export interface PaymentResult {
  id: number;
  status?: string;
}
