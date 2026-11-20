import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowRight, SendHorizontal } from 'lucide-react';
import { useTickets } from '../../../shared/hooks/useTickets';
import { formatTime } from '../../../shared/utils/format';
import type { Ticket } from '../../../shared/types/models';

const TicketDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getTicketDetails, sendReply, loading } = useTickets();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadTicket = useCallback(async () => {
    const ticketId = Number(id);
    if (!Number.isFinite(ticketId)) {
      setNotFound(true);
      return;
    }

    const data = await getTicketDetails(ticketId);
    setTicket(data);
    setNotFound(!data);
  }, [getTicketDetails, id]);

  useEffect(() => {
    // داده‌خوانی در زمان mount؛ این rule برای افکت‌های همگام با DOM است
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTicket();
  }, [loadTicket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [ticket]);

  const handleSendReply = async () => {
    const message = replyMessage.trim();
    if (!message || sending) return;

    setSending(true);
    const result = await sendReply(Number(id), message);
    setSending(false);

    if (result.success) {
      setReplyMessage('');
      await loadTicket();
    } else {
      toast.error(result.message ?? 'ارسال پیام انجام نشد.');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendReply();
    }
  };

  if (loading && !ticket) {
    return (
      <div className="grid min-h-screen place-items-center bg-white">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-500" />
      </div>
    );
  }

  if (notFound || !ticket) {
    return (
      <div className="grid min-h-screen place-items-center bg-white p-4 text-center">
        <div>
          <p className="text-4xl" aria-hidden="true">
            🎈
          </p>
          <h1 className="mt-4 text-lg font-black text-ink">این گفتگو پیدا نشد</h1>
          <Link to="/dashboard" className="btn-primary mt-6 text-sm">
            بازگشت به حساب کاربری
          </Link>
        </div>
      </div>
    );
  }

  const status = String(ticket.status ?? '').toLowerCase();
  const isClosed = status === 'closed' || status === 'resolved';
  const replies = ticket.replies ?? [];

  return (
    <div className="min-h-screen bg-white p-4 text-right">
      <div className="mx-auto flex h-[85vh] max-w-3xl flex-col overflow-hidden rounded-none border border-brand-100 bg-white shadow-none">
        <header className="flex items-center justify-between gap-3 bg-brand-500 px-5 py-4 text-white">
          <Link
            to="/dashboard"
            className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-[11px] font-bold transition-colors hover:bg-white/30"
          >
            <ArrowRight size={14} aria-hidden="true" /> بازگشت
          </Link>

          <div className="min-w-0 text-center">
            <h1 className="truncate text-sm font-black">{ticket.subject}</h1>
            <span className="font-mono text-[10px] opacity-80" dir="ltr">
              #{ticket.ticketNumber ?? ticket.id}
            </span>
          </div>

          <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-black">
            {isClosed ? 'بسته شده' : status === 'open' ? 'در انتظار پاسخ' : 'در حال بررسی'}
          </span>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto bg-brand-50/20 p-5">
          {replies.length === 0 && (
            <p className="py-10 text-center text-xs text-ink-light">هنوز پیامی در این گفتگو وجود ندارد.</p>
          )}

          {replies.map((reply) => (
            <div key={reply.id} className={`flex ${reply.isAdminReply ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`max-w-[85%] rounded-none px-4 py-3 text-xs leading-7 shadow-none ${
                  reply.isAdminReply
                    ? 'bg-lavender-500 text-white'
                    : 'border border-brand-100 bg-white text-ink'
                }`}
              >
                <p className={`mb-1 text-[10px] font-black ${reply.isAdminReply ? 'text-white/80' : 'text-brand-500'}`}>
                  {reply.isAdminReply ? '🎧 پشتیبانی زیزی' : '👤 شما'}
                </p>
                <p className="whitespace-pre-wrap">{reply.message}</p>
                <p className={`mt-1 text-left text-[9px] ${reply.isAdminReply ? 'text-white/70' : 'text-ink-light'}`}>
                  {formatTime(reply.createdAt)}
                </p>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {isClosed ? (
          <div className="border-t border-brand-50 bg-brand-50/40 p-4 text-center text-xs font-bold text-ink-soft">
            این گفتگو بسته شده است. برای ادامه، تیکت جدیدی ثبت کنید. 🔒
          </div>
        ) : (
          <div className="flex items-end gap-2 border-t border-brand-50 bg-white p-4">
            <label htmlFor="reply-message" className="sr-only">
              متن پاسخ
            </label>
            <textarea
              id="reply-message"
              rows={1}
              value={replyMessage}
              onChange={(event) => setReplyMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="پاسخ خود را بنویسید… (Enter برای ارسال)"
              className="field min-h-14 flex-1 resize-none py-3 text-xs"
              maxLength={1000}
            />
            <button
              type="button"
              onClick={handleSendReply}
              disabled={!replyMessage.trim() || sending}
              aria-label="ارسال پاسخ"
              className="btn-primary h-14 w-14 shrink-0 rounded-none p-0"
            >
              <SendHorizontal size={20} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetailsPage;
