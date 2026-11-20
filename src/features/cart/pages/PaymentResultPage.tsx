import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import StoreHeader from '../../../shared/components/StoreHeader';
import StoreFooter from '../../../shared/components/StoreFooter';
import { usePayment } from '../../../shared/hooks/usePayment';

type Status = 'loading' | 'success' | 'error';

const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { verifyPayment } = usePayment();

  const paymentId = Number(searchParams.get('paymentId'));
  const isOk = searchParams.get('status') === 'OK';
  const reference = searchParams.get('ref') ?? `ZIZI-${paymentId}`;
  const isValidRequest = isOk && Number.isFinite(paymentId) && paymentId > 0;

  const [verification, setVerification] = useState<{ status: 'success' | 'error'; message?: string } | null>(null);
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!isValidRequest || hasVerified.current) return;
    hasVerified.current = true;

    verifyPayment(paymentId, reference).then((result) => {
      setVerification(
        result.success
          ? { status: 'success' }
          : { status: 'error', message: result.message ?? 'تایید نهایی پرداخت انجام نشد.' },
      );
    });
  }, [isValidRequest, paymentId, reference, verifyPayment]);

  // وضعیت از روی پارامترهای آدرس استنتاج می‌شود (بدون setState اضافه در افکت)
  const status: Status = !isValidRequest ? 'error' : (verification?.status ?? 'loading');
  const message = !isValidRequest
    ? isOk
      ? 'شناسه‌ی تراکنش معتبر نیست.'
      : 'پرداخت لغو شد یا از سمت بانک تایید نشد.'
    : (verification?.message ?? null);

  return (
    <div className="min-h-screen bg-white text-right">
      <StoreHeader />

      <main className="container-shop grid min-h-[55vh] place-items-center py-12">
        <div className="w-full max-w-md rounded-none border border-brand-100 bg-white p-8 text-center shadow-none">
          {status === 'loading' && (
            <>
              <Loader2 className="mx-auto animate-spin text-brand-500" size={44} aria-hidden="true" />
              <h1 className="mt-4 text-lg font-black text-ink">در حال تایید پرداخت…</h1>
              <p className="mt-2 text-sm text-ink-soft">لطفاً صفحه را نبندید.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="mx-auto text-emerald-500" size={52} aria-hidden="true" />
              <h1 className="mt-4 text-xl font-black text-ink">پرداخت با موفقیت انجام شد</h1>
              <p className="mt-2 text-sm leading-7 text-ink-soft">
                سفارش شما ثبت شد و پس از آماده‌سازی برای شما ارسال می‌شود. 🧸
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Link to="/dashboard" className="btn-primary flex-1 text-sm">
                  پیگیری سفارش‌ها
                </Link>
                <Link to="/" className="btn-ghost flex-1 text-sm">
                  ادامه خرید
                </Link>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="mx-auto text-red-500" size={52} aria-hidden="true" />
              <h1 className="mt-4 text-xl font-black text-ink">پرداخت انجام نشد</h1>
              <p className="mt-2 text-sm leading-7 text-ink-soft">{message}</p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Link to="/cart" className="btn-primary flex-1 text-sm">
                  بازگشت به سبد خرید
                </Link>
                <Link to="/dashboard" className="btn-ghost flex-1 text-sm">
                  سفارش‌های من
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <StoreFooter />
    </div>
  );
};

export default PaymentResultPage;
