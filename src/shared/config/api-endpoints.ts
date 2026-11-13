/**
 * تمام مسیرهای API در یک جا؛ در صورت تغییر بک‌اند فقط همین فایل اصلاح می‌شود.
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
    search: '/Product/search',
    byGender: (genderId: number) => `/Product/by-gender/${genderId}`,
    byCategory: (categoryId: number) => `/Product/category/${categoryId}`,
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
  },
} as const;
