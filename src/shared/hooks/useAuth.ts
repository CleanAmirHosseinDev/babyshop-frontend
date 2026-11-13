import { useCallback, useState, useSyncExternalStore } from 'react';
import { authService, type RegisterPayload, type ResetPasswordPayload } from '../services/authService';
import {
  endSession,
  getAuthSnapshot,
  setSession,
  subscribe,
} from '../store/authStore';

export interface ActionResult {
  success: boolean;
  message?: string;
  /** کد تایید فقط در محیط Development توسط بک‌اند برگردانده می‌شود */
  verificationCode?: string | null;
  /** ورود با شماره‌ی تایید‌نشده انجام شده و کاربر باید کد را وارد کند */
  requiresVerification?: boolean;
}

/** پیام «شماره تایید نشده» بک‌اند */
const UNVERIFIED_PATTERN = /تأیید نشده|تایید نشده/;

function toMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'خطای نامشخصی رخ داد. لطفاً دوباره تلاش کنید.';
}

export const useAuth = () => {
  const session = useSyncExternalStore(subscribe, getAuthSnapshot, getAuthSnapshot);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async <T,>(task: () => Promise<T>): Promise<{ ok: true; data: T } | { ok: false; message: string }> => {
      setLoading(true);
      setError(null);
      try {
        return { ok: true, data: await task() };
      } catch (err) {
        const message = toMessage(err);
        setError(message);
        return { ok: false, message };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const login = useCallback(
    async (payload: { phoneNumber: string; password: string }): Promise<ActionResult> => {
      const result = await run(() => authService.login(payload));

      if (!result.ok) {
        return {
          success: false,
          message: result.message,
          requiresVerification: UNVERIFIED_PATTERN.test(result.message),
        };
      }

      setSession(result.data.token, result.data.user);
      return { success: true };
    },
    [run],
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<ActionResult> => {
      const result = await run(() => authService.register(payload));

      return result.ok
        ? { success: true, verificationCode: result.data.verificationCode }
        : { success: false, message: result.message };
    },
    [run],
  );

  const verifyPhone = useCallback(
    async (phoneNumber: string, code: string): Promise<ActionResult> => {
      const result = await run(() => authService.verifyPhone(phoneNumber, code));

      if (!result.ok) return { success: false, message: result.message };

      setSession(result.data.token, result.data.user);
      return { success: true };
    },
    [run],
  );

  const forgotPassword = useCallback(
    async (phoneNumber: string): Promise<ActionResult> => {
      const result = await run(() => authService.forgotPassword(phoneNumber));

      return result.ok
        ? { success: true, verificationCode: result.data.verificationCode }
        : { success: false, message: result.message };
    },
    [run],
  );

  const resetPassword = useCallback(
    async (payload: ResetPasswordPayload): Promise<ActionResult> => {
      const result = await run(() => authService.resetPassword(payload));
      return result.ok ? { success: true } : { success: false, message: result.message };
    },
    [run],
  );

  const logout = useCallback(() => {
    endSession();
  }, []);

  return {
    login,
    register,
    verifyPhone,
    forgotPassword,
    resetPassword,
    logout,
    loading,
    error,
    isAuthenticated: session.isAuthenticated,
    isAdmin: session.isAdmin,
    isManager: session.isManager,
    roles: session.roles,
    user: session.user,
  };
};
