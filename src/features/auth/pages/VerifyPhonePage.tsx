import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ShieldCheck } from 'lucide-react';
import AuthShell from '../../../shared/components/AuthShell';
import { useAuth } from '../../../shared/hooks/useAuth';
import { digitsOnly } from '../../../shared/utils/format';

interface LocationState {
  phoneNumber?: string;
}

const VerifyPhonePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyPhone, loading, error, isAuthenticated } = useAuth();

  const phoneNumber = (location.state as LocationState | null)?.phoneNumber ?? '';
  const [code, setCode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (code.length !== 6) {
      setFormError('کد تایید ۶ رقمی است.');
      return;
    }

    const result = await verifyPhone(phoneNumber, code);

    if (result.success) {
      toast.success('شماره موبایل با موفقیت تایید شد 🎉');
      navigate(isAuthenticated ? '/' : '/login', { replace: true });
    }
  };

  const message = formError ?? error;

  return (
    <AuthShell
      title="تایید شماره موبایل"
      subtitle={
        phoneNumber
          ? `کد تایید به شماره ${phoneNumber} ارسال شد`
          : 'کد تاییدی که برای شما پیامک شده را وارد کنید'
      }
      icon="📩"
      footer={
        <Link to="/login" className="font-bold text-brand-600 hover:underline">
          بازگشت به صفحه ورود
        </Link>
      }
    >
      {message && (
        <div role="alert" className="mb-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-center text-xs font-bold text-red-600">
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
              <ShieldCheck size={18} aria-hidden="true" /> تایید شماره
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
};

export default VerifyPhonePage;
