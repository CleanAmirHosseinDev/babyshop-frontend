import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Send } from 'lucide-react';
import AuthShell from '../../../shared/components/AuthShell';
import { useAuth } from '../../../shared/hooks/useAuth';
import { digitsOnly, isValidIranMobile } from '../../../shared/utils/format';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { forgotPassword, loading, error } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!isValidIranMobile(phoneNumber)) {
      setFormError('شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.');
      return;
    }

    const result = await forgotPassword(phoneNumber);

    if (result.success) {
      toast.success('کد بازیابی ارسال شد.');
      navigate('/reset-password', {
        state: { phoneNumber, code: result.verificationCode ?? undefined },
      });
    }
  };

  const message = formError ?? error;

  return (
    <AuthShell
      title="فراموشی رمز عبور"
      subtitle="شماره موبایل خود را وارد کنید تا کد بازیابی برایتان ارسال شود"
      icon="🔑"
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
          <label htmlFor="forgot-phone" className="mb-1.5 block text-xs font-bold text-ink-soft">
            شماره موبایل
          </label>
          <input
            id="forgot-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(digitsOnly(event.target.value, 11))}
            placeholder="09123456789"
            className="field text-center font-mono"
            dir="ltr"
            maxLength={11}
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-4">
          {loading ? (
            'در حال ارسال…'
          ) : (
            <>
              <Send size={18} aria-hidden="true" /> ارسال کد بازیابی
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
};

export default ForgotPasswordPage;
