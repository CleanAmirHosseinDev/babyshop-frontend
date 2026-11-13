/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** آدرس پایه‌ی API بک‌اند (در فایل .env تنظیم می‌شود) */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
