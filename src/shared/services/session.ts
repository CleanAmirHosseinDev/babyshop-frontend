/**
 * مدیریت نشست کاربر: خواندن/نوشتن توکن و استخراج مشخصات از JWT.
 * توجه: این اطلاعات فقط برای نمایش و کنترل UI است؛ اعتبار واقعی توکن
 * همیشه در سمت سرور بررسی می‌شود.
 */

export const TOKEN_STORAGE_KEY = 'ziizii_token';

export interface AuthUser {
  id?: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
}

export interface SessionState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const EMPTY_SESSION: SessionState = {
  token: null,
  user: null,
  isAuthenticated: false,
  isAdmin: false,
};

const CLAIM = {
  role: [
    'role',
    'roles',
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
  ],
  name: [
    'unique_name',
    'name',
    'fullName',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  ],
  phone: [
    'mobilephone',
    'phone_number',
    'phoneNumber',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone',
  ],
  email: ['email', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
  id: [
    'nameid',
    'sub',
    'userId',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  ],
} as const;

/** دیکد امن payload توکن JWT (بدون اعتبارسنجی امضا) */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;

    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder('utf-8').decode(bytes);
    const parsed = JSON.parse(json);

    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function pickClaim(payload: Record<string, unknown>, keys: readonly string[]): unknown {
  for (const key of keys) {
    const value = payload[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
}

function asString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

/** توکن منقضی‌شده نباید کاربر را لاگین‌شده نگه دارد */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  const exp = payload?.['exp'];
  if (typeof exp !== 'number') return false;
  return exp * 1000 <= Date.now();
}

export function getStoredToken(): string | null {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) return null;
    if (isTokenExpired(token)) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // حافظه‌ی مرورگر در دسترس نیست (حالت خصوصی/سهمیه پر) - نشست فقط برای همین تب است
  }
}

export function clearStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function userFromToken(token: string): AuthUser | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const name = asString(pickClaim(payload, CLAIM.name));
  const phone = asString(pickClaim(payload, CLAIM.phone));
  const email = asString(pickClaim(payload, CLAIM.email));
  const id = asString(pickClaim(payload, CLAIM.id));

  if (!name && !phone) return null;

  return {
    id: id || undefined,
    fullName: name || 'کاربر عزیز',
    phoneNumber: phone,
    email: email || undefined,
  };
}

export function isAdminToken(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload) return false;

  const roles = pickClaim(payload, CLAIM.role);
  if (Array.isArray(roles)) {
    return roles.some((role) => asString(role).toLowerCase() === 'admin');
  }
  return asString(roles).toLowerCase() === 'admin';
}

export function readSession(): SessionState {
  const token = getStoredToken();
  if (!token) return EMPTY_SESSION;

  return {
    token,
    user: userFromToken(token),
    isAuthenticated: true,
    isAdmin: isAdminToken(token),
  };
}
