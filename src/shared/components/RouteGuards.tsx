import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface GuardProps {
  children: React.ReactElement;
}

function Forbidden({ title, message }: { title: string; message: string }) {
  return (
    <div className="container-shop flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="grid h-16 w-16 place-items-center rounded-none bg-red-50 text-red-500">
        <ShieldAlert size={32} aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-xl font-black text-ink">{title}</h1>
      <p className="mt-2 max-w-sm text-sm leading-7 text-ink-soft">{message}</p>
      <Link
        to="/"
        className="mt-6 rounded-none bg-brand-500 px-6 py-3 text-sm font-bold text-white shadow-none shadow-brand-200 transition-colors hover:bg-brand-600"
      >
        بازگشت به فروشگاه
      </Link>
    </div>
  );
}

/** مسیرهای نیازمند ورود */
export const RequireAuth: React.FC<GuardProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return children;
};

/** مسیرهای مخصوص Admin (سیاست AdminOnly در بک‌اند) */
export const RequireAdmin: React.FC<GuardProps> = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (!isAdmin) {
    return (
      <Forbidden
        title="دسترسی غیرمجاز"
        message="این بخش فقط برای مدیر کل (Admin) در دسترس است. اگر فکر می‌کنید اشتباهی رخ داده با پشتیبانی تماس بگیرید."
      />
    );
  }

  return children;
};

/** مسیرهای مدیریت فروشگاه (سیاست ManagerOnly در بک‌اند: Admin یا Manager) */
export const RequireManager: React.FC<GuardProps> = ({ children }) => {
  const { isAuthenticated, isManager } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (!isManager) {
    return (
      <Forbidden
        title="دسترسی غیرمجاز"
        message="این بخش مخصوص مدیران فروشگاه است. اگر فکر می‌کنید اشتباهی رخ داده با پشتیبانی تماس بگیرید."
      />
    );
  }

  return children;
};

/** بازگرداندن اسکرول به بالای صفحه در هر تغییر مسیر */
export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
};

/** اسکلت لودینگ بین صفحه‌ها (code splitting) */
export const PageLoader: React.FC = () => (
  <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
    <span className="h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-500" />
    <span className="sr-only">در حال بارگذاری...</span>
  </div>
);
