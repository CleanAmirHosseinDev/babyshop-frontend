import { endpoints } from '../config/api-endpoints';
import { http } from './http';

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

interface TokenResponse {
  accessToken?: string;
  token?: string;
}

function normalizePhone(phone: string): string {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';

  return phone
    .replace(/[۰-۹]/g, (d) => String(persianDigits.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(arabicDigits.indexOf(d)))
    .replace(/[^\d+]/g, '');
}

export const authService = {
  normalizePhone,

  async login({ phoneNumber, password }: LoginPayload): Promise<string> {
    const data = await http.post<TokenResponse>(
      endpoints.auth.login,
      { PhoneNumber: normalizePhone(phoneNumber), Password: password },
      { auth: false },
    );

    const token = data?.accessToken ?? data?.token;

    if (!token) {
      throw new Error('پاسخ سرور توکن معتبری نداشت. لطفاً با پشتیبانی تماس بگیرید.');
    }

    return token;
  },

  async register(payload: RegisterPayload): Promise<void> {
    await http.post(
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
  },

  async verifyPhone(phoneNumber: string, code: string): Promise<string | null> {
    const data = await http.post<TokenResponse | null>(
      endpoints.auth.verifyPhone,
      { PhoneNumber: normalizePhone(phoneNumber), Code: code.trim() },
      { auth: false },
    );

    // اگر بک‌اند بعد از تایید، توکن برگرداند همان را ذخیره می‌کنیم
    return data?.accessToken ?? data?.token ?? null;
  },

  async forgotPassword(phoneNumber: string): Promise<void> {
    await http.post(
      endpoints.auth.forgotPassword,
      { PhoneNumber: normalizePhone(phoneNumber) },
      { auth: false },
    );
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
