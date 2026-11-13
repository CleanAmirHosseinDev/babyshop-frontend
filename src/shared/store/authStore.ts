import { AUTH_EXPIRED_EVENT } from '../services/http';
import {
  TOKEN_STORAGE_KEY,
  clearStoredToken,
  readSession,
  setStoredToken,
  type SessionState,
} from '../services/session';

/**
 * استور کوچک و بدون وابستگی برای وضعیت احراز هویت.
 * به جای رفرش کل صفحه، همه‌ی کامپوننت‌ها (هدر، گاردها، داشبورد) با هم
 * به‌روز می‌شوند.
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
    next.user?.fullName !== state.user?.fullName ||
    next.user?.phoneNumber !== state.user?.phoneNumber ||
    next.user?.id !== state.user?.id;

  if (!changed) return;

  state = next;
  notify();
}

export function setSessionToken(token: string): void {
  setStoredToken(token);
  refreshAuthState();
}

export function endSession(): void {
  clearStoredToken();
  refreshAuthState();
}

// همگام‌سازی بین چند تب باز
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === null || event.key === TOKEN_STORAGE_KEY) refreshAuthState();
  });

  // توکن منقضی/رد شده توسط سرور
  window.addEventListener(AUTH_EXPIRED_EVENT, refreshAuthState);
}
