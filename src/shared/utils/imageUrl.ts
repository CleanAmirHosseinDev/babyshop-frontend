import { environment } from '../config/environment';

/** تصویر جایگزین (SVG داخلی؛ بدون درخواست شبکه و بدون شکستن چیدمان) */
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23FFF5F8'/%3E%3Ccircle cx='148' cy='150' r='34' fill='%23FFC9DC'/%3E%3Ccircle cx='252' cy='150' r='34' fill='%23FFC9DC'/%3E%3Ccircle cx='200' cy='214' r='86' fill='%23FFFFFF' stroke='%23FFE3ED' stroke-width='4'/%3E%3Ccircle cx='172' cy='198' r='10' fill='%234A4453'/%3E%3Ccircle cx='228' cy='198' r='10' fill='%234A4453'/%3E%3Cellipse cx='200' cy='238' rx='20' ry='15' fill='%23F7A7C2'/%3E%3Cpath d='M200 253v14' stroke='%23F7A7C2' stroke-width='8' stroke-linecap='round'/%3E%3C/svg%3E";

/** مسیر نسبی تصویر را به URL کامل تبدیل می‌کند */
export function getImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) return PLACEHOLDER_IMAGE;

  const path = imageUrl.trim();
  if (!path) return PLACEHOLDER_IMAGE;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;

  return `${environment.assetBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

/** بک‌اند چند عکس را با کاراکتر | جدا می‌کند؛ این تابع اولین عکس را برمی‌گرداند */
export function getFirstImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) return PLACEHOLDER_IMAGE;
  const [first] = imageUrl.split('|');
  return getImageUrl(first);
}

/** لیست کامل تصاویر یک محصول */
export function getImageList(imageUrl?: string | null): string[] {
  if (!imageUrl) return [];
  return imageUrl
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
}
