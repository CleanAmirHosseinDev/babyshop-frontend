import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import { formatNumber } from '../utils/format';

interface StoreHeaderProps {
  /** لینک بازگشت (اختیاری) */
  backTo?: string;
  backLabel?: string;
  /** محتوای اضافی مثل نوار دسته‌بندی‌ها */
  children?: React.ReactNode;
}

const NAV_LINKS = [
  { label: 'همه محصولات', to: '/' },
  { label: 'پسرانه', to: '/?gender=1' },
  { label: 'دخترانه', to: '/?gender=2' },
  { label: 'نوزاد', to: '/?gender=3' },
  { label: 'استایل‌ها', to: '/looks' },
];

/**
 * هدر فروشگاه با زبان بصری زارا: خط نازک، لوگوی وسط‌چین با حروف‌فاصله،
 * منوی متنی ریز و آیکون‌های مینیمال. جستجو داخل هدر باز می‌شود و واقعی کار می‌کند.
 */
const StoreHeader: React.FC<StoreHeaderProps> = ({ backTo, backLabel = 'بازگشت', children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = term.trim();
    setSearchOpen(false);
    navigate(query ? `/?q=${encodeURIComponent(query)}` : '/');
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="container-shop grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-3">
        {/* سمت شروع (راست در RTL): منوی متنی ریز */}
        <nav className="hidden items-center gap-5 lg:flex" aria-label="دسته‌بندی‌های اصلی">
          {NAV_LINKS.map((link) => (
            <Link key={link.label} to={link.to} className="label-xs hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="باز کردن منو"
            className="grid h-9 w-9 place-items-center text-ink"
          >
            <Menu size={18} aria-hidden="true" />
          </button>
          {backTo && (
            <Link to={backTo} className="label-xs hover:text-ink">
              {backLabel}
            </Link>
          )}
        </div>

        {/* لوگوی وسط‌چین */}
        <Link
          to="/"
          aria-label="زیزی کیدز — صفحه اصلی"
          className="justify-self-center px-2 text-center text-[13px] uppercase tracking-editorial text-ink sm:text-sm"
        >
          ZIIZII<span className="mx-1 font-light text-ink-light">|</span>KIDS
        </Link>

        {/* سمت پایان (چپ در RTL): حساب، جستجو، سبد */}
        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <div className="hidden items-center gap-4 lg:flex">
            {backTo && (
              <Link to={backTo} className="label-xs hover:text-ink">
                {backLabel}
              </Link>
            )}
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="label-xs hover:text-ink">
                  {user?.fullName ? user.fullName.split(' ')[0] : 'حساب من'}
                </Link>
                <button type="button" onClick={handleLogout} className="label-xs hover:text-ink">
                  خروج
                </button>
              </>
            ) : (
              <Link to="/login" className="label-xs hover:text-ink">
                ورود
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-label="جستجو"
            aria-expanded={searchOpen}
            className="grid h-9 w-9 place-items-center text-ink transition-colors hover:text-ink-soft"
          >
            {searchOpen ? <X size={18} aria-hidden="true" /> : <Search size={18} aria-hidden="true" />}
          </button>

          <Link
            to={isAuthenticated ? '/dashboard' : '/login'}
            aria-label="حساب کاربری"
            className="grid h-9 w-9 place-items-center text-ink transition-colors hover:text-ink-soft lg:hidden"
          >
            <User size={18} aria-hidden="true" />
          </Link>

          <Link
            to="/cart"
            aria-label={`سبد خرید${totalItems > 0 ? ` (${totalItems} کالا)` : ''}`}
            className="relative grid h-9 w-9 place-items-center text-ink transition-colors hover:text-ink-soft"
          >
            <ShoppingBag size={18} aria-hidden="true" />
            {totalItems > 0 && (
              <span className="absolute -end-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[9px] font-medium text-white">
                {formatNumber(totalItems)}
              </span>
            )}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <form onSubmit={submitSearch} className="border-t border-line">
          <div className="container-shop flex items-center gap-3 py-3">
            <Search size={16} className="shrink-0 text-ink-light" aria-hidden="true" />
            <label htmlFor="store-search" className="sr-only">
              جستجوی محصول
            </label>
            <input
              id="store-search"
              ref={searchRef}
              type="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="نام محصول را بنویسید…"
              className="w-full border-0 bg-transparent text-sm text-ink outline-none placeholder:text-ink-light"
            />
            <button type="submit" className="label-xs shrink-0 hover:text-ink">
              جستجو
            </button>
          </div>
        </form>
      )}

      {children && <div className="border-t border-line">{children}</div>}

      {/* منوی موبایل */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-white lg:hidden" role="dialog" aria-modal="true" aria-label="منو">
          <div className="container-shop flex h-14 items-center justify-between border-b border-line">
            <span className="text-[13px] uppercase tracking-editorial">ZIIZII | KIDS</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="بستن منو"
              className="grid h-9 w-9 place-items-center text-ink"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <nav className="container-shop flex flex-col divide-y divide-line" aria-label="منوی موبایل">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="py-4 text-sm text-ink"
              >
                {link.label}
              </Link>
            ))}
            <Link to={isAuthenticated ? '/dashboard' : '/login'} onClick={() => setMenuOpen(false)} className="py-4 text-sm text-ink">
              {isAuthenticated ? 'حساب کاربری من' : 'ورود / ثبت‌نام'}
            </Link>
            <Link to="/cart" onClick={() => setMenuOpen(false)} className="py-4 text-sm text-ink">
              سبد خرید
            </Link>
            {isAuthenticated && (
              <button type="button" onClick={handleLogout} className="py-4 text-start text-sm text-ink-soft">
                خروج از حساب
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default StoreHeader;
