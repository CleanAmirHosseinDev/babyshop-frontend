import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, CreditCard, ShieldCheck, XCircle } from 'lucide-react';
import { formatNumber } from '../../../../shared/utils/format';

/**
 * درگاه پرداخت شبیه‌ساز (Sandbox).
 *
 * نکته‌ی امنیتی مهم: این صفحه عمداً هیچ فیلدی برای شماره کارت، CVV2 یا رمز پویا
 * ندارد. دریافت اطلاعات واقعی کارت بانکی خارج از درگاه بانک، خلاف استانداردهای
 * پرداخت (PCI-DSS) است و ریسک امنیتی جدی ایجاد می‌کند. در محیط واقعی، کاربر باید
 * به صفحه‌ی بانک هدایت شود.
 */
const BankGateway: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const paymentId = Number(searchParams.get('paymentId'));
  const amount = Number(searchParams.get('amount'));

  if (!Number.isFinite(paymentId) || paymentId <= 0) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#FFFAFB] p-4 text-center">
        <div className="w-full max-w-md rounded-none border border-brand-100 bg-white p-8 shadow-none">
          <AlertTriangle className="mx-auto text-amber-500" size={40} aria-hidden="true" />
          <h1 className="mt-4 text-lg font-black text-ink">تراکنشی برای پرداخت پیدا نشد</h1>
          <p className="mt-2 text-sm leading-7 text-ink-soft">
            لطفاً از صفحه‌ی سبد خرید، فرآیند پرداخت را دوباره شروع کنید.
          </p>
          <button type="button" onClick={() => navigate('/cart')} className="btn-primary mt-6 w-full">
            بازگشت به سبد خرید
          </button>
        </div>
      </div>
    );
  }

  const finish = (status: 'OK' | 'NOK') => {
    const reference = `ZIZI-${paymentId}-${Date.now().toString().slice(-6)}`;
    navigate(`/payment/callback?paymentId=${paymentId}&status=${status}&ref=${reference}`, { replace: true });
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-brand-50 via-white to-lavender-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-none border border-brand-100 bg-white shadow-none">
        <header className="flex items-center justify-between gap-3 border-b border-brand-50 bg-brand-50/60 px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-black text-brand-700">
            <CreditCard size={20} aria-hidden="true" />
            درگاه پرداخت اینترنتی
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-ink-soft">محیط آزمایشی</span>
        </header>

        <div className="p-6 text-right">
          <div className="rounded-none border border-brand-100 bg-brand-50/60 p-4">
            <div className="flex items-center justify-between text-xs font-bold text-ink-soft">
              <span>شناسه تراکنش</span>
              <span className="font-mono" dir="ltr">
                {paymentId}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-brand-100 pt-3">
              <span className="text-xs font-bold text-ink-soft">مبلغ قابل پرداخت</span>
              <span className="text-lg font-black text-brand-700">
                {formatNumber(amount)} <span className="text-[10px] font-medium">تومان</span>
              </span>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-2 rounded-none bg-amber-50 p-4 text-[11px] leading-6 text-amber-800">
            <ShieldCheck size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <p>
              این درگاه آزمایشی است و به شبکه‌ی شاپرک متصل نیست. اطلاعات کارت بانکی خود را در هیچ صفحه‌ای جز
              درگاه رسمی بانک وارد نکنید.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => finish('OK')}
              className="flex w-full items-center justify-center gap-2 rounded-none bg-emerald-600 py-4 text-sm font-black text-white shadow-none shadow-emerald-100 transition-all hover:bg-emerald-700 active:scale-95"
            >
              <CheckCircle2 size={20} aria-hidden="true" /> شبیه‌سازی پرداخت موفق
            </button>

            <button
              type="button"
              onClick={() => finish('NOK')}
              className="flex w-full items-center justify-center gap-2 rounded-none border border-gray-200 py-4 text-sm font-bold text-ink-soft transition-all hover:bg-gray-50"
            >
              <XCircle size={20} aria-hidden="true" /> انصراف از پرداخت
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankGateway;
