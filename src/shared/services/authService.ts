import { endpoints } from '../config/api-endpoints';
import { http } from './http';
import type { AuthUser } from './session';

export interface LoginPayload {
  phoneNumber: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  phoneNumber: string;
  email?: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordPayload {
  phoneNumber: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

/** منطبق با TokenDto بک‌اند */
interface TokenResponse {
  accessToken?: string;
  expiresAt?: string;
  refreshToken?: string;
  user?: {
    id?: number;
    fullName?: string;
    phoneNumber?: string;
    email?: string | null;
    isPhoneVerified?: boolean;
  };
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

function normalizeUser(raw: TokenResponse['user'], fallback?: string): AuthUser {
  return {
    id: Number(raw?.id ?? 0),
    fullName: raw?.fullName?.trim() || 'کاربر عزیز',
    phoneNumber: raw?.phoneNumber || fallback || '',
    email: raw?.email ?? null,
    isPhoneVerified: raw?.isPhoneVerified,
  };
}

function toSession(data: TokenResponse | null, fallbackPhone?: string): AuthSession {
  const token = data?.accessToken;

  if (!token) {
    throw new Error('پاسخ سرور توکن معتبری نداشت. لطفاً با پشتیبانی تماس بگیرید.');
  }

  return { token, user: normalizeUser(data?.user, fallbackPhone) };
}

/** ارقام فارسی/عربی را به لاتین تبدیل می‌کند (اعتبارسنجی بک‌اند فقط 09xxxxxxxxx را می‌پذیرد) */
function normalizePhone(phone: string): string {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';

  return phone
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)))
    .replace(/[^\d+]/g, '');
}

export const authService = {
  normalizePhone,

  async login({ phoneNumber, password }: LoginPayload): Promise<AuthSession> {
    const data = await http.post<TokenResponse>(
      endpoints.auth.login,
      { PhoneNumber: normalizePhone(phoneNumber), Password: password },
      { auth: false },
    );

    return toSession(data, phoneNumber);
  },

  /** کد تایید در محیط Development توسط بک‌اند برگردانده می‌شود */
  async register(payload: RegisterPayload): Promise<{ verificationCode?: string | null }> {
    const data = await http.post<{ verificationCode?: string | null }>(
      endpoints.auth.register,
      {
        FullName: payload.fullName.trim(),
        PhoneNumber: normalizePhone(payload.phoneNumber),
        Email: payload.email?.trim() || null,
        Password: payload.password,
        ConfirmPassword: payload.confirmPassword,
      },
      { auth: false },
    );

    return { verificationCode: data?.verificationCode ?? null };
  },

  async verifyPhone(phoneNumber: string, code: string): Promise<AuthSession> {
    const data = await http.post<TokenResponse>(
      endpoints.auth.verifyPhone,
      { PhoneNumber: normalizePhone(phoneNumber), Code: code.trim() },
      { auth: false },
    );

    return toSession(data, phoneNumber);
  },

  async forgotPassword(phoneNumber: string): Promise<{ verificationCode?: string | null }> {
    const code = await http.post<string | null>(
      endpoints.auth.forgotPassword,
      { PhoneNumber: normalizePhone(phoneNumber) },
      { auth: false },
    );

    return { verificationCode: typeof code === 'string' ? code : null };
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await http.post(
      endpoints.auth.resetPassword,
      {
        PhoneNumber: normalizePhone(payload.phoneNumber),
        Code: payload.code.trim(),
        NewPassword: payload.newPassword,
        ConfirmPassword: payload.confirmPassword,
      },
      { auth: false },
    );
  },
};
