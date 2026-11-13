import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, RefreshCw, ShieldCheck, Truck } from 'lucide-react';

const features = [
  { icon: Truck, title: 'ارسال سریع', description: 'پست پیشتاز به سراسر کشور' },
  { icon: ShieldCheck, title: 'پرداخت امن', description: 'از طریق درگاه‌های بانکی' },
  { icon: RefreshCw, title: '۷ روز ضمانت بازگشت', description: 'در صورت عدم رضایت' },
  { icon: BadgeCheck, title: 'تضمین کیفیت', description: 'پارچه‌های مناسب پوست کودک' },
];

/** پاورقی یکسان تمام صفحات فروشگاه */
const StoreFooter: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-brand-100 bg-white">
      <div className="container-shop grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
        {features.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-500">
              <Icon size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-ink">{title}</p>
              <p className="mt-0.5 text-xs text-ink-light">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-brand-50">
        <div className="container-shop flex flex-col items-center justify-between gap-3 py-5 text-xs text-ink-light sm:flex-row">
          <p>© {new Date().getFullYear()} زیزی کیدز — تمامی حقوق محفوظ است.</p>
          <nav className="flex items-center gap-4">
            <Link to="/" className="transition-colors hover:text-brand-600">
              خانه
            </Link>
            <Link to="/cart" className="transition-colors hover:text-brand-600">
              سبد خرید
            </Link>
            <Link to="/dashboard/tickets/create" className="transition-colors hover:text-brand-600">
              پشتیبانی
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default StoreFooter;
