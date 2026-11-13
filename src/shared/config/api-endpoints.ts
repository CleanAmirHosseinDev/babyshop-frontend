/**
 * مسیرهای API که فرانت‌اند استفاده می‌کند — منطبق با کنترلرهای بک‌اند (BabyShop-backend).
 */
export const endpoints = {
  auth: {
    login: '/Auth/login',
    register: '/Auth/register',
    verifyPhone: '/Auth/verify-phone',
    forgotPassword: '/Auth/forgot-password',
    resetPassword: '/Auth/reset-password',
  },
  products: {
    base: '/Product',
    byId: (id: number | string) => `/Product/${id}`,
  },
  categories: {
    base: '/Category',
    byId: (id: number) => `/Category/${id}`,
  },
  inventory: {
    base: '/Inventory',
    byId: (id: number) => `/Inventory/${id}`,
    changeStock: (type: 'increase' | 'decrease', productId: number, ageRange: string, quantity: number) =>
      `/Inventory/${type}?productId=${productId}&ageRange=${encodeURIComponent(ageRange)}&quantity=${quantity}`,
  },
  orders: {
    base: '/Order',
    byId: (id: number | string) => `/Order/${id}`,
    my: '/Order/my',
    status: '/Order/status',
  },
  delivery: {
    base: '/Delivery',
    status: '/Delivery/status',
    byOrder: (orderId: number | string) => `/Delivery/order/${orderId}`,
  },
  payment: {
    base: '/Payment',
    verify: (paymentId: number, referenceNumber: string) =>
      `/Payment/verify?paymentId=${paymentId}&referenceNumber=${encodeURIComponent(referenceNumber)}`,
  },
  tickets: {
    base: '/Ticket',
    byId: (id: number | string) => `/Ticket/${id}`,
    reply: '/Ticket/reply',
    adminAll: '/admin/AdminTicket',
    adminStatus: '/admin/AdminTicket/status',
    adminStats: '/admin/AdminTicket/dashboard/stats',
  },
} as const;
