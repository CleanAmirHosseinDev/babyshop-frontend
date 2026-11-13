import { environment } from '../config/environment';
import { clearStoredToken, getStoredToken } from './session';

/** رویدادی که هنگام منقضی/نامعتبر شدن توکن منتشر می‌شود */
export const AUTH_EXPIRED_EVENT = 'ziizii:auth-expired';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestOptions {
  method?: HttpMethod;
  /** بدنه‌ی JSON */
  body?: unknown;
  /** بدنه‌ی multipart (برای آپلود عکس) */
  formData?: FormData;
  /** ارسال هدر Authorization (پیش‌فرض: بله) */
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
}

const MESSAGES = {
  network: 'ارتباط با سرور برقرار نشد. اتصال اینترنت یا وضعیت سرور را بررسی کنید.',
  timeout: 'درخواست بیش از حد طول کشید. لطفاً دوباره تلاش کنید.',
  unauthorized: 'نشست شما منقضی شده است. لطفاً دوباره وارد شوید.',
  forbidden: 'شما به این بخش دسترسی ندارید.',
  notFound: 'موردی با این مشخصات پیدا نشد.',
  server: 'خطای غیرمنتظره‌ای در سرور رخ داد. لطفاً بعداً تلاش کنید.',
  unknown: 'خطای نامشخصی رخ داد.',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** پیام خطای بک‌اند را از ساختارهای مختلف (ProblemDetails / errors / message) بیرون می‌کشد */
function extractErrorMessage(payload: unknown): string | null {
  if (!isRecord(payload)) return null;

  const { message, title, detail, errors } = payload;
  if (typeof message === 'string' && message.trim()) return message;
  if (typeof detail === 'string' && detail.trim()) return detail;
  if (typeof title === 'string' && title.trim()) return title;

  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors[0];
    if (typeof first === 'string') return first;
    if (isRecord(first) && typeof first.message === 'string') return first.message;
  }

  if (isRecord(errors)) {
    for (const value of Object.values(errors)) {
      if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
      if (typeof value === 'string') return value;
    }
  }

  return null;
}

function statusMessage(status: number): string {
  if (status === 401) return MESSAGES.unauthorized;
  if (status === 403) return MESSAGES.forbidden;
  if (status === 404) return MESSAGES.notFound;
  if (status >= 500) return MESSAGES.server;
  return MESSAGES.unknown;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const base = environment.apiUrl.replace(/\/+$/, '');
  const url = new URL(`${base}${path.startsWith('/') ? path : `/${path}`}`, window.location.origin);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

/**
 * لایه‌ی واحد ارتباط با API:
 * - هدر توکن، timeout، پارس JSON و پیام خطای یکدست
 * - در صورت 401 توکن پاک و رویداد انقضا منتشر می‌شود
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, formData, auth = true, query, signal } = options;

  const headers: Record<string, string> = { Accept: 'application/json' };

  if (auth) {
    const token = getStoredToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let payloadBody: BodyInit | undefined;
  if (formData) {
    payloadBody = formData; // Content-Type را مرورگر تنظیم می‌کند (boundary)
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payloadBody = JSON.stringify(body);
  }

  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, environment.requestTimeout);

  const abortFromParent = () => controller.abort();
  signal?.addEventListener('abort', abortFromParent, { once: true });

  try {
    const response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: payloadBody,
      signal: controller.signal,
      credentials: 'same-origin',
    });

    if (response.status === 401 && auth) {
      clearStoredToken();
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }

    const contentType = response.headers.get('content-type') ?? '';
    let payload: unknown = null;

    if (response.status !== 204) {
      if (contentType.includes('application/json')) {
        payload = await response.json().catch(() => null);
      } else {
        const text = await response.text().catch(() => '');
        payload = text || null;
      }
    }

    const apiSucceeded = !isRecord(payload) || payload.success !== false;

    if (!response.ok || !apiSucceeded) {
      const message = extractErrorMessage(payload) ?? statusMessage(response.status);
      throw new ApiError(message, response.status);
    }

    // اکثر endpointها { success, data } برمی‌گردانند؛ بقیه خود پاسخ را می‌دهند
    if (isRecord(payload) && 'data' in payload && payload.data !== undefined && payload.data !== null) {
      return payload.data as T;
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(timedOut ? MESSAGES.timeout : MESSAGES.unknown, 0);
    }
    throw new ApiError(MESSAGES.network, 0);
  } finally {
    window.clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortFromParent);
  }
}

export const http = {
  get: <T>(path: string, options: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    request<T>(path, { ...options, method: 'POST', body }),

  put: <T>(path: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    request<T>(path, { ...options, method: 'PUT', body }),

  patch: <T>(path: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    request<T>(path, { ...options, method: 'PATCH', body }),

  delete: <T>(path: string, options: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    request<T>(path, { ...options, method: 'DELETE' }),

  postForm: <T>(path: string, formData: FormData, options: Omit<RequestOptions, 'method' | 'body' | 'formData'> = {}) =>
    request<T>(path, { ...options, method: 'POST', formData }),

  putForm: <T>(path: string, formData: FormData, options: Omit<RequestOptions, 'method' | 'body' | 'formData'> = {}) =>
    request<T>(path, { ...options, method: 'PUT', formData }),
};
