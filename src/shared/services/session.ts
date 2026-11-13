/**
 * مدیریت نشست کاربر: توکن، مشخصات کاربر و نقش‌ها.
 *
 * نقش‌ها در JWT با ClaimTypes.Role صادر می‌شوند (Admin/Manager/User) و مشخصات
 * کاربر از پاسخ TokenDto (user) ذخیره می‌شود.
 */

export const TOKEN_STORAGE_KEY = 'ziizii_token';
export const USER_STORAGE_KEY = 'ziizii_user';

export interface AuthUser {
  id: number;
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  isPhoneVerified?: boolean;
}

export interface SessionState {
  token: string | null;
  user: AuthUser | null;
  roles: string[];
  isAuthenticated: boolean;
  /** نقش Admin */
  isAdmin: boolean;
  /** نقش Admin یا Manager (دسترسی به پنل مدیریت فروشگاه) */
  isManager: boolean;
}

const EMPTY_SESSION: SessionState = {
  token: null,
  user: null,
  roles: [],
  isAuthenticated: false,
  isAdmin: false,
  isManager: false,
};

const ROLE_CLAIMS = ['role', 'roles', 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

const CLAIM = {
  name: ['unique_name', 'name', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
  phone: ['mobilephone', 'phone_number', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone'],
  email: ['email', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
  id: ['nameid', 'sub', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
} as const;

/** دیکد امن payload توکن JWT (بدون اعتبارسنجی امضا؛ فقط برای UI) */
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

function asString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

function pick(payload: Record<string, unknown>, keys: readonly string[]): unknown {
  for (const key of keys) {
    const value = payload[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
}

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
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (!parsed || typeof parsed !== 'object') return null;

    return {
      id: Number(parsed.id ?? 0),
      fullName: String(parsed.fullName ?? ''),
      phoneNumber: String(parsed.phoneNumber ?? ''),
      email: parsed.email ?? null,
      isPhoneVerified: parsed.isPhoneVerified,
    };
  } catch {
    return null;
  }
}

export function userFromToken(token: string): AuthUser | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const name = asString(pick(payload, CLAIM.name));
  const phone = asString(pick(payload, CLAIM.phone));
  const id = Number(asString(pick(payload, CLAIM.id)));

  if (!name && !phone) return null;

  return {
    id: Number.isFinite(id) ? id : 0,
    fullName: name,
    phoneNumber: phone,
    email: asString(pick(payload, CLAIM.email)) || null,
  };
}

export function rolesFromToken(token: string): string[] {
  const payload = decodeJwtPayload(token);
  if (!payload) return [];

  for (const claimKey of ROLE_CLAIMS) {
    const value = payload[claimKey];
    if (!value) continue;

    if (Array.isArray(value)) {
      return value.map((role) => asString(role)).filter(Boolean);
    }

    const single = asString(value);
    if (single) return [single];
  }

  return [];
}

export function isAdminToken(token: string): boolean {
  return rolesFromToken(token).some((role) => role.toLowerCase() === 'admin');
}

export function readSession(): SessionState {
  const token = getStoredToken();
  if (!token) return EMPTY_SESSION;

  const roles = rolesFromToken(token);
  const normalizedRoles = roles.map((role) => role.toLowerCase());

  return {
    token,
    user: readStoredUser() ?? userFromToken(token),
    roles,
    isAuthenticated: true,
    isAdmin: normalizedRoles.includes('admin'),
    isManager: normalizedRoles.includes('admin') || normalizedRoles.includes('manager'),
  };
}

/** ذخیره‌ی نشست بعد از ورود موفق */
export function persistSession(accessToken: string, user?: AuthUser | null): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // حافظه‌ی مرورگر در دسترس نیست (حالت خصوصی) - نشست فقط برای همین تب است
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
