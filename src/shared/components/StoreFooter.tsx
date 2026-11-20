import React from 'react';
import { Link } from 'react-router-dom';

const COLUMNS = [
  {
    title: 'خرید',
    links: [
      { label: 'همه محصولات', to: '/' },
      { label: 'نوزاد', to: '/?gender=1' },
      { label: 'دخترانه', to: '/?gender=2' },
      { label: 'پسرانه', to: '/?gender=3' },
    ],
  },
  {
    title: 'حساب کاربری',
    links: [
      { label: 'ورود / ثبت‌نام', to: '/login' },
      { label: 'سفارش‌های من', to: '/dashboard' },
      { label: 'سبد خرید', to: '/cart' },
    ],
  },
  {
    title: 'پشتیبانی',
    links: [
      { label: 'ثبت تیکت جدید', to: '/dashboard/tickets/create' },
      { label: 'پیگیری سفارش', to: '/dashboard' },
      { label: 'وضعیت ارسال', to: '/dashboard' },
    ],
  },
  {
    title: 'زیزی کیدز',
    links: [
      { label: 'درباره ما', to: '/' },
      { label: 'شرایط بازگشت کالا', to: '/' },
      { label: 'حریم خصوصی', to: '/' },
    ],
  },
];

/** پاورقی مینیمال فروشگاه با ستون‌های لینک و نوار حقوقی */
const StoreFooter: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-line bg-white">
      <div className="container-shop grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="mb-4 text-[10px] uppercase tracking-label text-ink">{column.title}</h2>
            <ul className="space-y-2.5">
              {column.links.map((link) => (
                <li key={`${column.title}-${link.label}`}>
                  <Link to={link.to} className="text-[12px] font-light text-ink-soft hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="container-shop flex flex-col items-center justify-between gap-3 py-5 text-[10px] uppercase tracking-label text-ink-light sm:flex-row">
          <p>© {new Date().getFullYear()} ZIIZII KIDS — تمامی حقوق محفوظ است.</p>
          <p>ایران / فارسی</p>
        </div>
      </div>
    </footer>
  );
};

export default StoreFooter;
