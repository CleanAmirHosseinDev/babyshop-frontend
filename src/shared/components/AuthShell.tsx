import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface AuthShellProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** قالب یکسان همه‌ی صفحات ورود/ثبت‌نام (یکدستی بصری + دسترس‌پذیری) */
const AuthShell: React.FC<AuthShellProps> = ({ title, subtitle, icon, children, footer }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-lavender-50 p-4 text-right">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-ink-soft transition-colors hover:text-brand-600"
        >
          <ArrowRight size={14} aria-hidden="true" /> بازگشت به فروشگاه
        </Link>

        <main className="rounded-none border border-brand-100 bg-white p-6 shadow-none shadow-brand-100/60 sm:p-8">
          <div className="mb-6 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-none bg-brand-50 text-3xl" aria-hidden="true">
              {icon ?? '🧸'}
            </span>
            <h1 className="mt-4 text-xl font-black text-ink">{title}</h1>
            {subtitle && <p className="mt-1.5 text-xs leading-6 text-ink-soft">{subtitle}</p>}
          </div>

          {children}
        </main>

        {footer && <div className="mt-5 text-center text-xs text-ink-soft">{footer}</div>}
      </div>
    </div>
  );
};

export default AuthShell;
