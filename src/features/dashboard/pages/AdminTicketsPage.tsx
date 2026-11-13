import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { useTickets } from '../../../shared/hooks/useTickets';
import { formatDate } from '../../../shared/utils/format';
import type { Ticket } from '../../../shared/types/models';

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  switch (status?.toLowerCase()) {
    case 'open':
      return (
        <span className="inline-flex w-max items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-[10px] font-black text-red-600">
          <AlertCircle size={12} aria-hidden="true" /> پاسخ داده نشده
        </span>
      );
    case 'inprogress':
      return (
        <span className="inline-flex w-max items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black text-amber-600">
          <Clock size={12} aria-hidden="true" /> در حال بررسی
        </span>
      );
    case 'resolved':
    case 'closed':
      return (
        <span className="inline-flex w-max items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-600">
          <CheckCircle size={12} aria-hidden="true" /> بسته شده
        </span>
      );
    default:
      return (
        <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-black text-gray-500">{status ?? '-'}</span>
      );
  }
};

const AdminTicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const { getAllTicketsAdmin, loading } = useTickets();
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const loadTickets = useCallback(async () => {
    setTickets(await getAllTicketsAdmin());
  }, [getAllTicketsAdmin]);

  useEffect(() => {
    // داده‌خوانی در زمان mount؛ این rule برای افکت‌های همگام با DOM است
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTickets();
  }, [loadTickets]);

  return (
    <div className="min-h-screen bg-[#FFFAFB] text-right">
      <div className="container-shop py-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-brand-50 bg-white p-6 shadow-card">
          <h1 className="flex items-center gap-2 text-lg font-black text-ink">
            <MessageSquare className="text-lavender-500" size={22} aria-hidden="true" /> پیام‌های مشتریان
          </h1>
          <Link
            to="/dashboard"
            className="rounded-xl bg-brand-50 px-4 py-2 text-xs font-bold text-brand-600 transition-colors hover:bg-brand-100"
          >
            ← حساب کاربری
          </Link>
        </header>

        <div className="overflow-hidden rounded-[2rem] border border-brand-50 bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-brand-50 bg-brand-50/50 text-[11px] font-black text-ink-soft">
                  <th className="p-4">شماره تیکت</th>
                  <th className="p-4">مشتری</th>
                  <th className="p-4">موضوع</th>
                  <th className="p-4">تاریخ</th>
                  <th className="p-4 text-center">وضعیت</th>
                  <th className="p-4 text-center">عملیات</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-brand-50">
                {loading && tickets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-xs text-ink-light">
                      در حال بارگذاری…
                    </td>
                  </tr>
                )}

                {!loading && tickets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-xs text-ink-light">
                      پیامی برای نمایش وجود ندارد.
                    </td>
                  </tr>
                )}

                {tickets.map((ticket) => {
                  const isOpen = ticket.status?.toLowerCase() === 'open';

                  return (
                    <tr key={ticket.id} className="text-xs transition-colors hover:bg-brand-50/30">
                      <td className="p-4 font-mono text-ink-light" dir="ltr">
                        {ticket.ticketNumber ?? ticket.id}
                      </td>

                      <td className="p-4">
                        <p className="font-black text-ink">{ticket.userName || 'کاربر'}</p>
                        <p className="mt-1 font-mono text-[10px] text-ink-light" dir="ltr">
                          {ticket.userPhone ?? '—'}
                        </p>
                      </td>

                      <td className="p-4 font-bold text-ink-soft">{ticket.subject}</td>
                      <td className="p-4 text-[11px] text-ink-light">{formatDate(ticket.createdAt)}</td>

                      <td className="p-4 text-center">
                        <StatusBadge status={ticket.status} />
                      </td>

                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => navigate(`/dashboard/tickets/${ticket.id}`)}
                          className={`rounded-xl px-4 py-2 text-[11px] font-black transition-all ${
                            isOpen
                              ? 'bg-red-500 text-white hover:bg-red-600'
                              : 'bg-lavender-50 text-lavender-500 hover:bg-lavender-100'
                          }`}
                        >
                          {isOpen ? 'پاسخ فوری' : 'مشاهده'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTicketsPage;
