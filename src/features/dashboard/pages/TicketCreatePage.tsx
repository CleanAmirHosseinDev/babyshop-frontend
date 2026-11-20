import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Send } from 'lucide-react';
import StoreHeader from '../../../shared/components/StoreHeader';
import StoreFooter from '../../../shared/components/StoreFooter';
import { useTickets } from '../../../shared/hooks/useTickets';

const CATEGORIES = [
  { value: 'General', label: 'سوال عمومی' },
  { value: 'Order', label: 'پیگیری سفارش' },
  { value: 'Technical', label: 'مشکل فنی در سایت' },
  { value: 'Suggestion', label: 'انتقاد یا پیشنهاد' },
];

const TicketCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { createTicket, loading, error } = useTickets();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('General');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (subject.trim().length < 3) {
      setFormError('موضوع پیام را کامل‌تر بنویسید.');
      return;
    }

    if (message.trim().length < 10) {
      setFormError('متن پیام باید حداقل ۱۰ کاراکتر باشد.');
      return;
    }

    const result = await createTicket({
      Subject: subject.trim(),
      Message: message.trim(),
      Category: category,
      OrderId: null,
      ProductId: null,
    });

    if (result.success) {
      toast.success('تیکت شما ثبت شد. به‌زودی پاسخ می‌دهیم 🧸');
      navigate('/dashboard', { replace: true });
    }
  };

  const feedback = formError ?? error;

  return (
    <div className="min-h-screen bg-[#FFFAFB] text-right">
      <StoreHeader backTo="/dashboard" backLabel="حساب کاربری" />

      <main className="container-shop py-8">
        <div className="mx-auto max-w-2xl rounded-none border border-brand-50 bg-white p-6 shadow-none sm:p-8">
          <h1 className="flex items-center gap-2 text-lg font-black text-ink">
            <span className="grid h-10 w-10 place-items-center rounded-none bg-brand-50 text-brand-500">
              <Send size={20} aria-hidden="true" />
            </span>
            ارسال پیام به پشتیبانی
          </h1>

          {feedback && (
            <div role="alert" className="mt-5 rounded-none border border-red-100 bg-red-50 p-3 text-xs font-bold text-red-600">
              {feedback}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            <div>
              <label htmlFor="ticket-subject" className="mb-1.5 block text-xs font-bold text-ink-soft">
                موضوع
              </label>
              <input
                id="ticket-subject"
                type="text"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="مثلاً سوال در مورد سایز لباس"
                className="field"
                maxLength={120}
                required
              />
            </div>

            <div>
              <label htmlFor="ticket-category" className="mb-1.5 block text-xs font-bold text-ink-soft">
                دسته‌بندی
              </label>
              <select
                id="ticket-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="field appearance-none"
              >
                {CATEGORIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ticket-message" className="mb-1.5 block text-xs font-bold text-ink-soft">
                متن پیام
              </label>
              <textarea
                id="ticket-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="سلام، می‌خواستم بدانم…"
                className="field min-h-36 leading-7"
                rows={6}
                maxLength={2000}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-4">
              {loading ? 'در حال ارسال…' : 'ارسال پیام'}
            </button>
          </form>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
};

export default TicketCreatePage;
