import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ShieldCheck } from 'lucide-react';
import AuthShell from '../../../shared/components/AuthShell';
import { useAuth } from '../../../shared/hooks/useAuth';
import { digitsOnly } from '../../../shared/utils/format';

interface LocationState {
  phoneNumber?: string;
  /** کد تایید فقط در محیط Development توسط بک‌اند برگردانده می‌شود */
  code?: string;
  notice?: string;
}

const VerifyPhonePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? {};

  const { verifyPhone, loading, error } = useAuth();

  const [code, setCode] = useState(state.code ?? '');
  const [formError, setFormError] = useState<string | null>(null);

  const phoneNumber = state.phoneNumber ?? '';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!phoneNumber) {
      setFormError('شماره موبایل مشخص نیست. لطفاً از صفحه ورود یا ثبت‌نام شروع کنید.');
      return;
    }

    if (code.length !== 6) {
      setFormError('کد تایید ۶ رقمی است.');
      return;
    }

    const result = await verifyPhone(phoneNumber, code);

    if (result.success) {
      toast.success('شماره موبایل تایید شد. خوش آمدید 🎉');
      navigate('/', { replace: true });
    }
  };

  const message = formError ?? error;

  return (
    <AuthShell
      title="تایید شماره موبایل"
      subtitle={
        phoneNumber ? `کد ۶ رقمی ارسال‌شده به ${phoneNumber} را وارد کنید` : 'کد ۶ رقمی پیامک‌شده را وارد کنید'
      }
      icon="📩"
      footer={
        <Link to="/login" className="font-bold text-brand-600 hover:underline">
          بازگشت به صفحه ورود
        </Link>
      }
    >
      {state.notice && (
        <div className="mb-4 rounded-none border border-amber-100 bg-amber-50 p-3 text-center text-[11px] font-bold leading-6 text-amber-700">
          {state.notice}
        </div>
      )}

      {state.code && (
        <div className="mb-4 rounded-none border border-lavender-100 bg-lavender-50 p-3 text-center text-[11px] font-bold text-lavender-500">
          کد تایید (محیط توسعه): <span className="font-mono tracking-[0.3em]">{state.code}</span>
        </div>
      )}

      {message && (
        <div
          role="alert"
          className="mb-4 rounded-none border border-red-100 bg-red-50 p-3 text-center text-xs font-bold text-red-600"
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="verify-code" className="mb-1.5 block text-xs font-bold text-ink-soft">
            کد تایید
          </label>
          <input
            id="verify-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => setCode(digitsOnly(event.target.value, 6))}
            placeholder="──────"
            className="field text-center text-xl tracking-[0.6em]"
            dir="ltr"
            maxLength={6}
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-4">
          {loading ? (
            'در حال بررسی…'
          ) : (
            <>
              <ShieldCheck size={18} aria-hidden="true" /> تایید و ورود
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
};

export default VerifyPhonePage;
