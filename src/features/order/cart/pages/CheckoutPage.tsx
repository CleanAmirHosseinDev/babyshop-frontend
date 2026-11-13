import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Hash, Mail, MapPin, PenTool, Phone, ShieldCheck, Truck } from 'lucide-react';
import StoreHeader from '../../../../shared/components/StoreHeader';
import StoreFooter from '../../../../shared/components/StoreFooter';
import { useCart } from '../../../../shared/context/CartContext';
import { useOrders } from '../../hooks/useOrders';
import { usePayment } from '../../../../shared/hooks/usePayment';
import { environment } from '../../../../shared/config/environment';
import { digitsOnly, formatNumber, isValidIranMobile } from '../../../../shared/utils/format';

type ShippingMethod = 'post' | 'peyk';

const CheckoutPage: React.FC = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { createOrder, loading: orderLoading } = useOrders();
  const { startPayment, loading: paymentLoading } = usePayment();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [email, setEmail] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('post');
  const [submitting, setSubmitting] = useState(false);
  const leavingRef = useRef(false);

  // اگر کاربر مستقیم وارد این صفحه شده و سبد خالی است، به سبد برگردد
  useEffect(() => {
    if (!leavingRef.current && cartItems.length === 0) navigate('/cart', { replace: true });
  }, [cartItems.length, navigate]);

  const shippingCost = shippingMethod === 'post' ? environment.postShippingCost : 0;
  const tax = useMemo(() => Math.round(totalPrice * environment.vatRate), [totalPrice]);
  const totalAmount = totalPrice + tax + shippingCost;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isValidIranMobile(phone)) {
      toast.error('شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.');
      return;
    }

    if (postalCode.length !== 10) {
      toast.error('کد پستی باید ۱۰ رقم باشد.');
      return;
    }

    if (submitting || orderLoading || paymentLoading) return;

    setSubmitting(true);

    const shippingLabel = shippingMethod === 'post' ? 'پست پیشتاز' : 'پیک موتوری (پس‌کرایه)';

    const orderResult = await createOrder({
      ShippingAddress: `${shippingLabel} | ${address.trim()} | کد پستی: ${postalCode}`,
      PhoneNumber: phone,
      Email: email.trim() || undefined,
      CustomerNote: [customerNote.trim(), `هزینه ارسال: ${shippingMethod === 'post' ? shippingCost : 'پس‌کرایه'}`, `مالیات: ${tax}`]
        .filter(Boolean)
        .join(' | '),
      Items: cartItems.map((item) => ({
        ProductId: item.id,
        ProductName: item.name,
        Quantity: item.quantity,
        UnitPrice: item.price,
        AgeRange: item.sizeCode,
      })),
    });

    if (!orderResult.success || !orderResult.data?.id) {
      toast.error(orderResult.message ?? 'ثبت سفارش انجام نشد. لطفاً اطلاعات را بررسی کنید.');
      setSubmitting(false);
      return;
    }

    const paymentResult = await startPayment(orderResult.data.id, totalAmount);

    if (!paymentResult.success || !paymentResult.data?.id) {
      toast.error(paymentResult.message ?? 'اتصال به درگاه پرداخت برقرار نشد.');
      setSubmitting(false);
      return;
    }

    leavingRef.current = true;
    clearCart();
    navigate(`/bank-gateway?paymentId=${paymentResult.data.id}&amount=${totalAmount}`, { replace: true });
  };

  const isBusy = submitting || orderLoading || paymentLoading;

  return (
    <div className="min-h-screen bg-[#FFFAFB] text-right">
      <StoreHeader backTo="/cart" backLabel="سبد خرید" />

      <main className="container-shop py-8">
        <h1 className="mb-6 text-xl font-black text-ink md:text-2xl">تکمیل سفارش و پرداخت</h1>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* اطلاعات گیرنده */}
            <section className="rounded-[2rem] border border-brand-50 bg-white p-6 shadow-card">
              <h2 className="mb-5 flex items-center gap-2 text-sm font-black text-ink">
                <MapPin size={18} className="text-brand-500" aria-hidden="true" />
                اطلاعات گیرنده
              </h2>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="mb-2 flex items-center gap-1 text-xs font-bold text-ink-soft">
                    <Phone size={14} aria-hidden="true" /> شماره تماس *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="09123456789"
                    value={phone}
                    onChange={(event) => setPhone(digitsOnly(event.target.value, 11))}
                    className="field font-mono"
                    dir="ltr"
                    required
                    maxLength={11}
                  />
                </div>

                <div>
                  <label htmlFor="postalCode" className="mb-2 flex items-center gap-1 text-xs font-bold text-ink-soft">
                    <Hash size={14} aria-hidden="true" /> کد پستی *
                  </label>
                  <input
                    id="postalCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    placeholder="۱۲۳۴۵۶۷۸۹۰"
                    value={postalCode}
                    onChange={(event) => setPostalCode(digitsOnly(event.target.value, 10))}
                    className="field font-mono"
                    dir="ltr"
                    required
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="address" className="mb-2 block text-xs font-bold text-ink-soft">
                  آدرس دقیق پستی *
                </label>
                <textarea
                  id="address"
                  autoComplete="street-address"
                  placeholder="استان، شهر، خیابان، کوچه، پلاک، واحد…"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className="field min-h-24 leading-7"
                  required
                  minLength={10}
                />
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="mb-2 flex items-center gap-1 text-xs font-bold text-ink-soft">
                    <Mail size={14} aria-hidden="true" /> ایمیل (اختیاری)
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="field"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label htmlFor="note" className="mb-2 flex items-center gap-1 text-xs font-bold text-ink-soft">
                    <PenTool size={14} aria-hidden="true" /> توضیحات سفارش (اختیاری)
                  </label>
                  <input
                    id="note"
                    type="text"
                    placeholder="مثلاً کادوپیچ شود 🎁"
                    value={customerNote}
                    onChange={(event) => setCustomerNote(event.target.value)}
                    className="field"
                    maxLength={200}
                  />
                </div>
              </div>
            </section>

            {/* روش ارسال */}
            <section className="rounded-[2rem] border border-brand-50 bg-white p-6 shadow-card">
              <h2 className="mb-5 flex items-center gap-2 text-sm font-black text-ink">
                <Truck size={18} className="text-brand-500" aria-hidden="true" />
                روش ارسال
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    id: 'post' as const,
                    title: 'پست پیشتاز',
                    description: 'ارسال به سراسر کشور (۳ تا ۵ روز کاری)',
                    price: `${formatNumber(environment.postShippingCost)} تومان`,
                  },
                  {
                    id: 'peyk' as const,
                    title: 'پیک موتوری (تهران)',
                    description: 'هزینه پیک درب منزل توسط مشتری پرداخت می‌شود.',
                    price: 'پس‌کرایه',
                  },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setShippingMethod(option.id)}
                    aria-pressed={shippingMethod === option.id}
                    className={`rounded-[1.5rem] border-2 p-5 text-right transition-all ${
                      shippingMethod === option.id
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-100 hover:border-brand-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-ink">{option.title}</span>
                      <span
                        className={`h-4 w-4 rounded-full border-2 ${
                          shippingMethod === option.id ? 'border-brand-500 bg-brand-500' : 'border-gray-300'
                        }`}
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-2 text-[11px] leading-6 text-ink-soft">{option.description}</p>
                    <p className="mt-2 text-xs font-black text-brand-600">{option.price}</p>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* فاکتور */}
          <aside className="h-fit rounded-[2rem] border border-brand-100 bg-white p-6 shadow-card lg:sticky lg:top-24">
            <h2 className="text-sm font-black text-ink">خلاصه فاکتور</h2>

            <dl className="mt-5 space-y-3 border-b border-brand-50 pb-5 text-xs">
              <div className="flex items-center justify-between text-ink-soft">
                <dt>مبلغ کالاها</dt>
                <dd className="font-bold text-ink">{formatNumber(totalPrice)} تومان</dd>
              </div>
              <div className="flex items-center justify-between text-ink-soft">
                <dt>مالیات بر ارزش افزوده (۸٪)</dt>
                <dd className="font-bold text-ink">{formatNumber(tax)} تومان</dd>
              </div>
              <div className="flex items-center justify-between text-ink-soft">
                <dt>هزینه ارسال</dt>
                <dd className="font-bold text-ink">
                  {shippingMethod === 'post' ? `${formatNumber(shippingCost)} تومان` : 'پس‌کرایه'}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex items-center justify-between">
              <span className="text-sm font-black text-ink">قابل پرداخت</span>
              <span className="text-lg font-black text-brand-600">
                {formatNumber(totalAmount)}{' '}
                <span className="text-[10px] font-medium text-ink-light">تومان</span>
              </span>
            </div>

            <button type="submit" disabled={isBusy} className="btn-primary mt-6 w-full py-4">
              {isBusy ? (
                'در حال اتصال…'
              ) : (
                <>
                  <ShieldCheck size={20} aria-hidden="true" /> پرداخت امن
                </>
              )}
            </button>

            <p className="mt-4 text-center text-[10px] leading-5 text-ink-light">
              پرداخت از طریق درگاه‌های امن بانکی انجام می‌شود و اطلاعات کارت شما در فروشگاه ذخیره نمی‌گردد.
            </p>
          </aside>
        </form>
      </main>

      <StoreFooter />
    </div>
  );
};

export default CheckoutPage;
