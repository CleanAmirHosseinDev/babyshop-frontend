import { AUTH_EXPIRED_EVENT } from '../services/http';
import {
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
  clearSession,
  persistSession,
  readSession,
  type AuthUser,
  type SessionState,
} from '../services/session';

/**
 * استور کوچک و بدون وابستگی برای وضعیت احراز هویت.
 * همه‌ی کامپوننت‌ها (هدر، گاردها، داشبورد) با هم به‌روز می‌شوند و بین تب‌ها هم
 * با رویداد storage همگام می‌مانند.
 */
let state: SessionState = readSession();
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAuthSnapshot(): SessionState {
  return state;
}

export function refreshAuthState(): void {
  const next = readSession();

  const changed =
    next.token !== state.token ||
    next.isAuthenticated !== state.isAuthenticated ||
    next.isAdmin !== state.isAdmin ||
    next.isManager !== state.isManager ||
    next.user?.id !== state.user?.id ||
    next.user?.fullName !== state.user?.fullName ||
    next.user?.phoneNumber !== state.user?.phoneNumber;

  if (!changed) return;

  state = next;
  notify();
}

export function setSession(accessToken: string, user?: AuthUser | null): void {
  persistSession(accessToken, user);
  refreshAuthState();
}

export function endSession(): void {
  clearSession();
  refreshAuthState();
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === null || event.key === TOKEN_STORAGE_KEY || event.key === USER_STORAGE_KEY) {
      refreshAuthState();
    }
  });

  // توکن منقضی/رد شده توسط سرور
  window.addEventListener(AUTH_EXPIRED_EVENT, refreshAuthState);
}
