import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CheckCircle2, Copy, Package, Truck } from 'lucide-react';
import StoreHeader from '../../../shared/components/StoreHeader';
import StoreFooter from '../../../shared/components/StoreFooter';
import { useOrders } from '../../order/hooks/useOrders';
import { formatDate, formatNumber } from '../../../shared/utils/format';
import type { Delivery, Order } from '../../../shared/types/models';

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار پرداخت',
  paid: 'پرداخت شده',
  shipped: 'ارسال شده',
  delivered: 'تحویل داده شده',
  cancelled: 'لغو شده',
};

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getOrderDetails, getDeliveryDetails } = useOrders();

  const [order, setOrder] = useState<Order | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;

    const loadOrder = async () => {
      const orderId = Number(id);
      if (!Number.isFinite(orderId)) {
        setLoading(false);
        return;
      }

      const data = await getOrderDetails(orderId);
      if (!active) return;

      setOrder(data);

      if (data?.status?.toLowerCase() === 'shipped') {
        const deliveryData = await getDeliveryDetails(orderId);
        if (active) setDelivery(deliveryData);
      }

      if (active) setLoading(false);
    };

    loadOrder();

    return () => {
      active = false;
    };
  }, [getDeliveryDetails, getOrderDetails, id]);

  const copyTrackingNumber = async () => {
    if (!delivery?.trackingNumber) return;

    try {
      await navigator.clipboard.writeText(delivery.trackingNumber);
      setCopied(true);
      toast.success('کد رهگیری کپی شد.');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.info(`کد رهگیری: ${delivery.trackingNumber}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFAFB]">
        <StoreHeader backTo="/dashboard" backLabel="حساب کاربری" />
        <div className="container-shop flex min-h-[50vh] items-center justify-center">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-500" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FFFAFB]">
        <StoreHeader backTo="/dashboard" backLabel="حساب کاربری" />
        <div className="container-shop flex min-h-[50vh] flex-col items-center justify-center text-center">
          <p className="text-4xl" aria-hidden="true">
            🎈
          </p>
          <h1 className="mt-4 text-lg font-black text-ink">این سفارش پیدا نشد</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-ink-soft">
            ممکن است این سفارش متعلق به حساب دیگری باشد یا حذف شده باشد.
          </p>
          <Link to="/dashboard" className="btn-primary mt-6 text-sm">
            بازگشت به حساب کاربری
          </Link>
        </div>
      </div>
    );
  }

  const status = String(order.status ?? '').toLowerCase();
  const items = order.items ?? [];

  return (
    <div className="min-h-screen bg-[#FFFAFB] text-right">
      <StoreHeader backTo="/dashboard" backLabel="حساب کاربری" />

      <main className="container-shop py-8">
        <header className="mb-6 rounded-[2rem] border border-brand-50 bg-white p-6 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-black text-ink">
                سفارش <span className="text-brand-500">#{order.orderNumber ?? order.id}</span>
              </h1>
              <p className="mt-1 text-xs text-ink-light">تاریخ ثبت: {formatDate(order.createdAt)}</p>
            </div>
            <span className="rounded-full bg-brand-50 px-4 py-1.5 text-xs font-black text-brand-600">
              {ORDER_STATUS_LABELS[status] ?? order.status ?? 'نامشخص'}
            </span>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {status === 'shipped' && (
              <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-l from-lavender-500 to-lavender-400 p-6 text-white shadow-xl">
                <Truck className="absolute -left-4 -top-4 opacity-20" size={120} aria-hidden="true" />

                <div className="relative">
                  <h2 className="text-base font-black">بسته‌ی شما ارسال شد 🎉</h2>

                  {!delivery ? (
                    <p className="mt-3 text-xs text-white/80">در حال دریافت اطلاعات پستی…</p>
                  ) : (
                    <>
                      <p className="mt-2 text-xs text-white/85">
                        تحویل به <span className="font-bold">{delivery.carrier || 'اداره پست'}</span>
                      </p>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/20 p-4 backdrop-blur">
                        <div>
                          <p className="text-[10px] text-white/80">کد رهگیری / بارنامه</p>
                          <p className="font-mono text-base font-bold tracking-widest" dir="ltr">
                            {delivery.trackingNumber || 'ثبت نشده'}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={copyTrackingNumber}
                          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-lavender-500"
                        >
                          {copied ? (
                            <>
                              <CheckCircle2 size={16} aria-hidden="true" /> کپی شد
                            </>
                          ) : (
                            <>
                              <Copy size={16} aria-hidden="true" /> کپی کد
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}

            <section className="rounded-[2rem] border border-brand-50 bg-white p-6 shadow-card">
              <h2 className="mb-5 flex items-center gap-2 border-r-4 border-brand-500 pr-3 text-sm font-black text-ink">
                <Package size={16} aria-hidden="true" /> اقلام سفارش
              </h2>

              <ul className="space-y-3">
                {items.length === 0 && <li className="py-6 text-center text-xs text-ink-light">قلمی ثبت نشده است.</li>}

                {items.map((item, index) => (
                  <li
                    key={item.id ?? `${item.productName}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-brand-50/40 p-4"
                  >
                    <div>
                      <p className="text-sm font-bold text-ink">{item.productName}</p>
                      <p className="mt-1 text-[11px] text-ink-light">تعداد: {formatNumber(item.quantity)} عدد</p>
                    </div>
                    <p className="text-sm font-black text-brand-600">
                      {formatNumber(item.unitPrice * item.quantity)}{' '}
                      <span className="text-[10px] font-medium text-ink-light">تومان</span>
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-brand-50 bg-white p-6 shadow-card">
              <h2 className="mb-3 text-sm font-black text-ink">📍 آدرس تحویل</h2>
              <p className="text-xs leading-7 text-ink-soft">{order.shippingAddress || 'ثبت نشده'}</p>
            </section>

            {order.customerNote && (
              <section className="rounded-[2rem] border border-brand-50 bg-white p-6 shadow-card">
                <h2 className="mb-3 text-sm font-black text-ink">📝 توضیحات سفارش</h2>
                <p className="text-xs leading-7 text-ink-soft">{order.customerNote}</p>
              </section>
            )}

            <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-card">
              <dl className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-ink-soft">
                  <dt>جمع اقلام</dt>
                  <dd className="font-bold text-ink">{formatNumber(order.subTotal)}</dd>
                </div>

                {!!order.shippingCost && (
                  <div className="flex items-center justify-between text-ink-soft">
                    <dt>هزینه ارسال</dt>
                    <dd className="font-bold text-ink">{formatNumber(order.shippingCost)}</dd>
                  </div>
                )}

                {!!order.tax && (
                  <div className="flex items-center justify-between text-ink-soft">
                    <dt>مالیات</dt>
                    <dd className="font-bold text-ink">{formatNumber(order.tax)}</dd>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-dashed border-brand-100 pt-3">
                  <dt className="text-sm font-black text-ink">مبلغ نهایی</dt>
                  <dd className="text-base font-black text-brand-600">{formatNumber(order.totalAmount)} تومان</dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
};

export default OrderDetailsPage;
