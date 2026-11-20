import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Check, Package, Phone, RefreshCw, Truck, User, X } from 'lucide-react';
import { useOrders } from '../../order/hooks/useOrders';
import { endpoints } from '../../../shared/config/api-endpoints';
import { http } from '../../../shared/services/http';
import { formatDate, formatNumber } from '../../../shared/utils/format';
import type { OrderSummary } from '../../../shared/types/models';

const STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار',
  paid: 'پرداخت شده',
  shipped: 'ارسال شده',
  delivered: 'تحویل شده',
  cancelled: 'لغو شده',
};

const AdminOrdersPage: React.FC = () => {
  const { getAllOrdersAdmin, updateStatus, loading } = useOrders();

  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('شرکت پست جمهوری اسلامی ایران');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setOrders(await getAllOrdersAdmin());
  }, [getAllOrdersAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    if (!newStatus) return;

    if (newStatus === 'Shipped') {
      setSelectedOrderId(orderId);
      setTrackingNumber('');
      setIsDeliveryModalOpen(true);
      return;
    }

    const result = await updateStatus(orderId, newStatus);

    if (result.success) {
      toast.success('وضعیت سفارش به‌روزرسانی شد.');
      await loadData();
    } else {
      toast.error(result.message ?? 'تغییر وضعیت انجام نشد.');
    }
  };

  /** ثبت اطلاعات ارسال و سپس تغییر وضعیت سفارش به «ارسال شده» */
  const submitDeliveryInfo = async () => {
    if (!selectedOrderId) return;

    if (trackingNumber.trim().length < 5) {
      toast.error('کد رهگیری معتبر وارد کنید.');
      return;
    }

    const currentOrder = orders.find((order) => order.id === selectedOrderId);
    setSaving(true);

    try {
      // آدرس کامل در OrderDto است (خلاصه‌ی سفارش آدرس ندارد)؛ آدرس در فاکتور سفارش ثبت شده است.
      const delivery = await http.post<{ id: number }>(endpoints.delivery.base, {
        OrderId: selectedOrderId,
        Address: 'ثبت‌شده در فاکتور سفارش',
        PhoneNumber: currentOrder?.phoneNumber ?? '00000000000',
        PostalCode: '0000000000',
        Carrier: carrier,
      });

      if (delivery?.id) {
        await http.put(endpoints.delivery.status, {
          DeliveryId: delivery.id,
          Status: 'Shipped',
          TrackingNumber: trackingNumber.trim(),
        });
      }

      const statusResult = await updateStatus(selectedOrderId, 'Shipped');

      if (!statusResult.success) {
        toast.error(statusResult.message ?? 'وضعیت سفارش تغییر نکرد.');
        return;
      }

      toast.success('کد رهگیری ثبت و سفارش به «ارسال شده» تغییر کرد 🚚');
      setIsDeliveryModalOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'خطا در ثبت اطلاعات ارسال.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFAFB] text-right">
      <div className="container-shop py-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-none border border-brand-50 bg-white p-6 shadow-none">
          <h1 className="flex items-center gap-2 text-lg font-black text-ink">
            <Package className="text-lavender-500" size={22} aria-hidden="true" /> مدیریت سفارش‌ها
          </h1>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              className="flex items-center gap-2 rounded-none bg-brand-50 px-4 py-2 text-xs font-bold text-brand-600 transition-colors hover:bg-brand-100"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden="true" /> بروزرسانی
            </button>
            <Link
              to="/dashboard"
              className="rounded-none px-3 py-2 text-xs font-bold text-ink-soft transition-colors hover:bg-brand-50"
            >
              ← حساب کاربری
            </Link>
          </div>
        </header>

        <div className="overflow-hidden rounded-none border border-brand-50 bg-white shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-brand-50 bg-brand-50/50 text-[11px] font-black text-ink-soft">
                  <th className="p-4">شماره سفارش</th>
                  <th className="p-4">مشتری</th>
                  <th className="p-4">تماس</th>
                  <th className="p-4">تاریخ</th>
                  <th className="p-4 text-center">مبلغ</th>
                  <th className="p-4 text-center">وضعیت</th>
                  <th className="p-4">تغییر وضعیت</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-brand-50">
                {orders.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-xs text-ink-light">
                      هنوز سفارشی ثبت نشده است.
                    </td>
                  </tr>
                )}

                {orders.map((order) => (
                  <tr key={order.id} className="text-xs transition-colors hover:bg-brand-50/30">
                    <td className="p-4 font-mono font-bold text-ink-soft" dir="ltr">
                      {order.orderNumber ?? order.id}
                    </td>

                    <td className="p-4">
                      <span className="flex items-center gap-1.5 font-bold text-ink">
                        <User size={13} className="text-lavender-400" aria-hidden="true" />
                        {order.userName || '—'}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="flex items-center gap-1.5 font-mono text-ink-soft" dir="ltr">
                        <Phone size={13} className="text-emerald-400" aria-hidden="true" />
                        {order.phoneNumber || '—'}
                      </span>
                    </td>

                    <td className="p-4 text-[11px] text-ink-light">{formatDate(order.createdAt)}</td>

                    <td className="p-4 text-center font-black text-brand-600">
                      {formatNumber(order.totalAmount)}
                    </td>

                    <td className="p-4 text-center">
                      <span className="rounded-full bg-brand-50 px-3 py-1 text-[10px] font-black text-brand-600">
                        {STATUS_LABELS[String(order.status ?? '').toLowerCase()] ?? order.status}
                      </span>
                    </td>

                    <td className="p-4">
                      <label className="sr-only" htmlFor={`status-${order.id}`}>
                        تغییر وضعیت سفارش {order.orderNumber ?? order.id}
                      </label>
                      <select
                        id={`status-${order.id}`}
                        value=""
                        onChange={(event) => handleStatusChange(order.id, event.target.value)}
                        className="w-full cursor-pointer rounded-none border border-brand-100 bg-white p-2 text-[11px] font-bold text-ink-soft outline-none focus:border-brand-300"
                      >
                        <option value="">انتخاب کنید…</option>
                        <option value="Paid">پرداخت شده ✅</option>
                        <option value="Shipped">ارسال شده 🚚</option>
                        <option value="Delivered">تحویل داده شده 🎁</option>
                        <option value="Cancelled">لغو سفارش ❌</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* مودال ثبت کد رهگیری */}
      {isDeliveryModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delivery-modal-title"
            className="w-full max-w-md rounded-none bg-white p-6 shadow-none animate-fade-in-up"
          >
            <div className="mb-5 flex items-center justify-between border-b border-brand-50 pb-4">
              <h2 id="delivery-modal-title" className="flex items-center gap-2 text-sm font-black text-ink">
                <Truck className="text-lavender-500" size={20} aria-hidden="true" /> ثبت اطلاعات ارسال
              </h2>
              <button
                type="button"
                onClick={() => setIsDeliveryModalOpen(false)}
                aria-label="بستن"
                className="grid h-8 w-8 place-items-center rounded-full bg-brand-50 text-ink-soft transition-colors hover:text-red-500"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="carrier" className="mb-1.5 block text-xs font-bold text-ink-soft">
                  شرکت پستی
                </label>
                <select id="carrier" value={carrier} onChange={(event) => setCarrier(event.target.value)} className="field">
                  <option value="شرکت پست جمهوری اسلامی ایران">شرکت پست (پیشتاز)</option>
                  <option value="تیپاکس">تیپاکس</option>
                  <option value="پیک موتوری">پیک موتوری (تهران)</option>
                </select>
              </div>

              <div>
                <label htmlFor="tracking" className="mb-1.5 block text-xs font-bold text-ink-soft">
                  کد رهگیری / بارنامه
                </label>
                <input
                  id="tracking"
                  type="text"
                  value={trackingNumber}
                  onChange={(event) => setTrackingNumber(event.target.value)}
                  className="field font-mono tracking-widest"
                  placeholder="12345678901234567890"
                  dir="ltr"
                  maxLength={40}
                  required
                />
                <p className="mt-2 text-[10px] text-ink-light">این کد در پنل مشتری نمایش داده می‌شود.</p>
              </div>

              <button type="button" onClick={submitDeliveryInfo} disabled={saving} className="btn-primary w-full py-3.5">
                <Check size={18} aria-hidden="true" /> {saving ? 'در حال ثبت…' : 'تایید و ثبت ارسال'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
