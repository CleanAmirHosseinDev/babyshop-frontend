import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface GuardProps {
  children: React.ReactElement;
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

/** مسیرهای مخصوص مدیر */
export const RequireAdmin: React.FC<GuardProps> = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (!isAdmin) {
    return (
      <div className="container-shop flex min-h-[60vh] flex-col items-center justify-center text-center">
        <span className="grid h-16 w-16 place-items-center rounded-3xl bg-red-50 text-red-500">
          <ShieldAlert size={32} aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-xl font-black text-ink">دسترسی غیرمجاز</h1>
        <p className="mt-2 max-w-sm text-sm leading-7 text-ink-soft">
          این بخش مخصوص مدیر فروشگاه است. اگر فکر می‌کنید اشتباهی رخ داده، با پشتیبانی تماس بگیرید.
        </p>
        <Link
          to="/"
          className="mt-6 rounded-2xl bg-brand-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-200 transition-colors hover:bg-brand-600"
        >
          بازگشت به فروشگاه
        </Link>
      </div>
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
