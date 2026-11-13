/**
 * تنها منبع حقیقت برای تنظیمات محیطی.
 * آدرس بک‌اند از فایل .env خوانده می‌شود (VITE_API_URL) تا بین محیط توسعه و
 * سرور واقعی جابه‌جایی، بدون تغییر کد انجام شود.
 */
const rawApiUrl = (import.meta.env.VITE_API_URL ?? '').trim() || 'https://localhost:7168/api';

const apiUrl = rawApiUrl.replace(/\/+$/, '');
const assetBaseUrl = apiUrl.replace(/\/api$/i, '');

export const environment = {
  apiUrl,
  /** ریشه‌ی میزبان فایل‌ها/تصاویر (بدون /api) */
  assetBaseUrl,
  appName: 'زیزی کیدز',
  version: '1.0.0',
  /** مهلت هر درخواست شبکه (میلی‌ثانیه) تا UI در حالت لودینگ گیر نکند */
  requestTimeout: 20_000,
  /** هزینه ارسال پستی (تومان) */
  postShippingCost: 130_000,
  /** نرخ مالیات بر ارزش افزوده */
  vatRate: 0.08,
} as const;
