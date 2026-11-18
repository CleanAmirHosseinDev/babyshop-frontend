import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, MessageSquarePlus, Package, Ticket } from 'lucide-react';
import StoreHeader from '../../../shared/components/StoreHeader';
import StoreFooter from '../../../shared/components/StoreFooter';
import { useAuth } from '../../../shared/hooks/useAuth';
import { useWishlist } from '../../../shared/context/WishlistContext';
import { useOrders } from '../../order/hooks/useOrders';
import { useTickets } from '../../../shared/hooks/useTickets';
import { formatDate, formatNumber } from '../../../shared/utils/format';
import { PLACEHOLDER_IMAGE, getFirstImageUrl } from '../../../shared/utils/imageUrl';
import type { OrderSummary, Ticket as TicketModel } from '../../../shared/types/models';

type Tab = 'orders' | 'wishlist' | 'tickets';

const TABS: Array<{ id: Tab; label: string; icon: string }> = [
  { id: 'orders', label: 'سفارش‌های من', icon: '📦' },
  { id: 'wishlist', label: 'علاقه‌مندی‌ها', icon: '💖' },
  { id: 'tickets', label: 'پشتیبانی', icon: '✉️' },
];

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار پرداخت',
  paid: 'پرداخت شده',
  shipped: 'ارسال شده',
  delivered: 'تحویل داده شده',
  cancelled: 'لغو شده',
};

const TICKET_STATUS_LABELS: Record<string, string> = {
  open: 'در انتظار پاسخ',
  inprogress: 'در حال بررسی',
  resolved: 'حل شده',
  closed: 'بسته شده',
};

const DashboardPage: React.FC = () => {
  const { logout, isAdmin, isManager, user } = useAuth();
  const { wishlist } = useWishlist();
  const { getMyOrders } = useOrders();
  const { getMyTickets, getAdminStats } = useTickets();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [tickets, setTickets] = useState<TicketModel[]>([]);
  const [openAdminTickets, setOpenAdminTickets] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadTickets = useCallback(async () => {
    const data = await getMyTickets();
    setTickets(data);
  }, [getMyTickets]);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === 'orders') {
          const data = await getMyOrders();
          if (active) setOrders(data);
        } else if (activeTab === 'tickets') {
          await loadTickets();
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [activeTab, getMyOrders, loadTickets]);

  // بارگذاری تیکت‌ها و اعلان‌های ادمین در اولین ورود (برای شمارنده‌ی منو)
  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      if (isManager) {
        // آمار سبک‌تر از دریافت کل تیکت‌هاست (GET /api/admin/AdminTicket/dashboard/stats)
        const stats = await getAdminStats();
        if (active) setOpenAdminTickets(stats?.open ?? 0);
      } else {
        const data = await getMyTickets();
        if (active) setTickets(data);
      }
    };

    loadNotifications();

    return () => {
      active = false;
    };
  }, [getAdminStats, getMyTickets, isManager]);

  const answeredTickets = tickets.filter((ticket) =>
    ['inprogress', 'resolved'].includes(ticket.status?.toLowerCase() ?? ''),
  ).length;

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-white text-right">
      <StoreHeader backTo="/" backLabel="فروشگاه" />

      <main className="container-shop py-8">
        <h1 className="mb-6 text-xl font-black text-ink md:text-2xl">حساب کاربری من</h1>

        <div className="grid gap-6 md:grid-cols-4">
          {/* منوی کنار */}
          <aside className="space-y-4 md:col-span-1">
            <div className="rounded-[2rem] border border-brand-50 bg-white p-6 text-center shadow-card">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-3xl" aria-hidden="true">
                👤
              </span>
              <p className="mt-3 text-sm font-black text-ink">{user?.fullName || 'کاربر عزیز زیزی'}</p>
              {user?.phoneNumber && (
                <p className="mt-1 font-mono text-xs text-ink-light" dir="ltr">
                  {user.phoneNumber}
                </p>
              )}
              {isManager && (
                <span className="mt-3 inline-block rounded-full bg-lavender-100 px-3 py-1 text-[10px] font-black text-lavender-500">
                  {isAdmin ? 'مدیر کل 🛡️' : 'مدیر فروشگاه 🛡️'}
                </span>
              )}
            </div>

            <nav className="rounded-[2rem] border border-brand-50 bg-white p-2 shadow-card" aria-label="منوی حساب کاربری">
              {TABS.map((tab) => {
                const badgeCount =
                  tab.id === 'wishlist' ? wishlist.length : tab.id === 'tickets' && !isAdmin ? answeredTickets : 0;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    aria-current={activeTab === tab.id}
                    className={`mb-1 flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-xs font-bold transition-all ${
                      activeTab === tab.id
                        ? 'bg-brand-500 text-white shadow-lg shadow-brand-200'
                        : 'text-ink-soft hover:bg-brand-50'
                    }`}
                  >
                    <span>
                      {tab.icon} {tab.label}
                    </span>
                    {badgeCount > 0 && (
                      <span
                        className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] ${
                          activeTab === tab.id ? 'bg-white text-brand-600' : 'bg-brand-50 text-brand-500'
                        }`}
                      >
                        {formatNumber(badgeCount)}
                      </span>
                    )}
                  </button>
                );
              })}

              {isManager && (
                <div className="mt-3 space-y-1 border-t border-brand-50 pt-3">
                  <p className="px-4 pb-1 text-[10px] font-bold text-ink-light">مدیریت فروشگاه</p>

                  {/* لیست کل سفارش‌ها در بک‌اند فقط برای Admin مجاز است */}
                  {isAdmin && (
                    <Link
                      to="/admin/orders"
                      className="block rounded-2xl px-4 py-3 text-xs font-bold text-lavender-500 transition-colors hover:bg-lavender-50"
                    >
                      🛒 سفارش‌ها
                    </Link>
                  )}

                  <Link
                    to="/admin/tickets"
                    className="flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-bold text-lavender-500 transition-colors hover:bg-lavender-50"
                  >
                    🎧 پیام‌های مشتریان
                    {openAdminTickets > 0 && (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] text-white">
                        {formatNumber(openAdminTickets)}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/admin/inventory"
                    className="block rounded-2xl px-4 py-3 text-xs font-bold text-lavender-500 transition-colors hover:bg-lavender-50"
                  >
                    📦 موجودی انبار
                  </Link>
                  <Link
                    to="/admin/categories"
                    className="block rounded-2xl px-4 py-3 text-xs font-bold text-lavender-500 transition-colors hover:bg-lavender-50"
                  >
                    🏷️ دسته‌بندی‌ها
                  </Link>
                  <Link
                    to="/products"
                    className="block rounded-2xl px-4 py-3 text-xs font-bold text-lavender-500 transition-colors hover:bg-lavender-50"
                  >
                    🛍️ لیست محصولات
                  </Link>
                </div>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 flex w-full items-center gap-2 rounded-2xl px-4 py-3.5 text-xs font-bold text-red-500 transition-colors hover:bg-red-50"
              >
                <LogOut size={16} aria-hidden="true" /> خروج از حساب
              </button>
            </nav>
          </aside>

          {/* محتوا */}
          <section className="rounded-[2rem] border border-brand-50 bg-white p-6 shadow-card md:col-span-3 md:p-8">
            {activeTab === 'orders' && (
              <>
                <h2 className="mb-6 border-r-4 border-brand-500 pr-3 text-sm font-black text-ink">سفارش‌های اخیر</h2>

                {isLoading ? (
                  <p className="py-16 text-center text-sm text-ink-light">در حال بارگذاری…</p>
                ) : orders.length === 0 ? (
                  <div className="rounded-[1.5rem] border-2 border-dashed border-brand-100 bg-brand-50/30 py-16 text-center">
                    <Package className="mx-auto text-brand-300" size={32} aria-hidden="true" />
                    <p className="mt-3 text-sm text-ink-soft">هنوز سفارشی ثبت نکرده‌اید.</p>
                    <Link to="/" className="btn-primary mt-5 text-xs">
                      شروع خرید
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {orders.map((order) => {
                      const status = String(order.status ?? '').toLowerCase();

                      return (
                        <li key={order.id}>
                          <Link
                            to={`/dashboard/order/${order.id}`}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-50 p-4 transition-all hover:border-brand-200 hover:shadow-md"
                          >
                            <div>
                              <p className="text-sm font-black text-ink">سفارش #{order.orderNumber ?? order.id}</p>
                              <p className="mt-1 text-[11px] text-ink-light">{formatDate(order.createdAt)}</p>
                            </div>

                            <div className="text-left">
                              <p className="text-sm font-black text-brand-600">{formatNumber(order.totalAmount)} تومان</p>
                              <span className="mt-1 inline-block rounded-full bg-brand-50 px-3 py-0.5 text-[10px] font-black text-brand-600">
                                {ORDER_STATUS_LABELS[status] ?? order.status ?? 'نامشخص'}
                              </span>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}

            {activeTab === 'wishlist' && (
              <>
                <h2 className="mb-6 border-r-4 border-brand-500 pr-3 text-sm font-black text-ink">لباس‌های مورد علاقه</h2>

                {wishlist.length === 0 ? (
                  <p className="py-16 text-center text-sm text-ink-light">لیست علاقه‌مندی‌ها خالی است 💔</p>
                ) : (
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {wishlist.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-3 rounded-2xl border border-brand-50 p-3 transition-shadow hover:shadow-md"
                      >
                        <img
                          src={getFirstImageUrl(item.imageUrl)}
                          alt={item.name}
                          width={80}
                          height={80}
                          loading="lazy"
                          decoding="async"
                          className="h-20 w-20 shrink-0 rounded-xl object-cover"
                          onError={(event) => {
                            const image = event.currentTarget;
                            if (image.dataset.fallbackApplied === 'true') return;
                            image.dataset.fallbackApplied = 'true';
                            image.src = PLACEHOLDER_IMAGE;
                          }}
                        />
                        <div className="flex-1">
                          <p className="line-clamp-2 text-xs font-bold text-ink">{item.name}</p>
                          <p className="mt-1 text-xs font-black text-brand-600">{formatNumber(item.price)} تومان</p>
                        </div>
                        <Link
                          to={`/product/${item.id}`}
                          className="rounded-xl bg-brand-50 px-3 py-2 text-[11px] font-bold text-brand-600 transition-colors hover:bg-brand-500 hover:text-white"
                        >
                          مشاهده
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {activeTab === 'tickets' && (
              <>
                <div className="mb-6 flex items-center justify-between gap-3">
                  <h2 className="border-r-4 border-brand-500 pr-3 text-sm font-black text-ink">تیکت‌های پشتیبانی</h2>
                  <Link to="/dashboard/tickets/create" className="btn-primary px-4 py-2.5 text-xs">
                    <MessageSquarePlus size={16} aria-hidden="true" /> تیکت جدید
                  </Link>
                </div>

                {isLoading ? (
                  <p className="py-16 text-center text-sm text-ink-light">در حال بارگذاری…</p>
                ) : tickets.length === 0 ? (
                  <div className="rounded-[1.5rem] border-2 border-dashed border-brand-100 bg-brand-50/30 py-16 text-center">
                    <Ticket className="mx-auto text-brand-300" size={32} aria-hidden="true" />
                    <p className="mt-3 text-sm text-ink-soft">تیکتی ثبت نکرده‌اید.</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {tickets.map((ticket) => {
                      const status = String(ticket.status ?? '').toLowerCase();

                      return (
                        <li key={ticket.id}>
                          <Link
                            to={`/dashboard/tickets/${ticket.id}`}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-50 p-4 transition-all hover:border-brand-200 hover:shadow-md"
                          >
                            <div>
                              <p className="text-sm font-bold text-ink">{ticket.subject}</p>
                              <p className="mt-1 font-mono text-[11px] text-ink-light" dir="ltr">
                                #{ticket.ticketNumber ?? ticket.id}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-[10px] font-black ${
                                status === 'open'
                                  ? 'bg-amber-50 text-amber-600'
                                  : status === 'inprogress'
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {TICKET_STATUS_LABELS[status] ?? ticket.status}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
};

export default DashboardPage;
