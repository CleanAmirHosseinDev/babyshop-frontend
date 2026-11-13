/** ابزارهای قالب‌بندی مشترک تا اعداد و مبالغ در کل سایت یکدست باشند. */

const numberFormatter = new Intl.NumberFormat('fa-IR');

const dateFormatter = new Intl.DateTimeFormat('fa-IR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

/** ۱۲۳۴۵۶۷ → ۱٬۲۳۴٬۵۶۷ */
export function formatNumber(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '۰';
  return numberFormatter.format(value);
}

/** مبلغ همراه واحد پول */
export function formatPrice(value?: number | null): string {
  return `${formatNumber(value)} تومان`;
}

export function formatDate(value?: string | Date | null): string {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return dateFormatter.format(date);
}

export function formatTime(value?: string | Date | null): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(date);
}

/** شماره موبایل ایرانی: 09xxxxxxxxx (با تبدیل ارقام فارسی) */
export function isValidIranMobile(value: string): boolean {
  const normalized = toEnglishDigits(value).replace(/[\s-]/g, '');
  return /^09\d{9}$/.test(normalized);
}

export function toEnglishDigits(value: string): string {
  return value.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

/** فقط ارقام (برای شماره کارت/کد پستی/کد تایید) */
export function digitsOnly(value: string, maxLength?: number): string {
  const digits = toEnglishDigits(value).replace(/\D/g, '');
  return maxLength ? digits.slice(0, maxLength) : digits;
}
