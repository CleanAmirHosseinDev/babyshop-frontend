import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, MessageCircle, MessageSquare, RefreshCw, Send, ShieldCheck, Truck } from 'lucide-react';

/** آیکون‌های برند در این نسخه‌ی lucide-react حذف شده‌اند؛ اینستاگرام را خودمان تعریف می‌کنیم */
const InstagramIcon: React.FC<{ size?: number; className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }> = ({
  size = 24,
  className,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const socials = [
  { label: 'اینستاگرام', icon: InstagramIcon, href: 'https://instagram.com/zizikids' },
  { label: 'کانال تلگرام', icon: Send, href: 'https://t.me/zizikids' },
  { label: 'بله', icon: MessageSquare, href: 'https://bale.dev/zizikids' },
  { label: 'واتس‌اپ', icon: MessageCircle, href: 'https://wa.me/989120000000' },
];

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
        <div className="container-shop flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <div className="text-center sm:text-right">
            <p className="text-sm font-black text-ink">ارتباط با ما</p>
            <p className="mt-1 text-xs text-ink-light">در شبکه‌های اجتماعی با ما همراه باشید 🧸</p>
          </div>
          <div className="flex items-center gap-3">
            {socials.map(({ label, icon: Icon, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={label}
                aria-label={label}
                className="grid h-11 w-11 place-items-center rounded-full border border-brand-200 text-ink-soft transition-all hover:border-ink hover:bg-ink hover:text-white"
              >
                <Icon size={19} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
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
