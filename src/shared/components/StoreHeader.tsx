import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LogOut, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import { formatNumber } from '../utils/format';

interface StoreHeaderProps {
  /** لینک بازگشت (اختیاری) */
  backTo?: string;
  backLabel?: string;
  /** محتوای اضافی مثل نوار جستجو یا دسته‌بندی‌ها */
  children?: React.ReactNode;
}

/**
 * هدر یکسان فروشگاه؛ در همه‌ی صفحات خرید استفاده می‌شود تا تجربه‌ی کاربر
 * یکدست بماند (لوگو، سبد خرید، حساب کاربری و خروج).
 */
const StoreHeader: React.FC<StoreHeaderProps> = ({ backTo, backLabel = 'بازگشت', children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/90 backdrop-blur-md">
      <div className="container-shop flex h-16 items-center gap-3">
        <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="زیزی کیدز - صفحه اصلی">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-100 text-2xl" aria-hidden="true">
            🧸
          </span>
          <span className="hidden text-lg font-black text-brand-600 sm:block">زیزی کیدز</span>
        </Link>

        {backTo && (
          <Link
            to={backTo}
            className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-bold text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-600"
          >
            <ArrowRight size={16} aria-hidden="true" />
            {backLabel}
          </Link>
        )}

        <div className="ms-auto flex items-center gap-2">
          <Link
            to="/cart"
            className="relative flex items-center gap-2 rounded-xl border border-brand-100 bg-brand-50 px-4 py-2 text-sm font-bold text-brand-600 transition-colors hover:bg-brand-100"
          >
            <ShoppingBag size={18} aria-hidden="true" />
            <span className="hidden sm:inline">سبد خرید</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -start-2 grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[11px] font-black text-white shadow">
                {formatNumber(totalItems)}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="hidden items-center gap-2 rounded-xl border border-brand-100 bg-white px-4 py-2 text-sm font-bold text-ink-soft transition-colors hover:border-brand-300 hover:text-brand-600 md:flex"
              >
                <User size={18} aria-hidden="true" />
                {user?.fullName ? user.fullName.split(' ')[0] : 'حساب من'}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                title="خروج از حساب"
                aria-label="خروج از حساب"
                className="grid h-10 w-10 place-items-center rounded-xl border border-transparent text-ink-light transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-500"
              >
                <LogOut size={18} aria-hidden="true" />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-brand-200 transition-colors hover:bg-brand-600"
            >
              <User size={18} aria-hidden="true" />
              ورود / ثبت‌نام
            </Link>
          )}
        </div>
      </div>

      {children && <div className="container-shop pb-3">{children}</div>}
    </header>
  );
};

export default StoreHeader;
