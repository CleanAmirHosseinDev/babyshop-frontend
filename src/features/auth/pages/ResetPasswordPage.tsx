import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { KeyRound } from 'lucide-react';
import AuthShell from '../../../shared/components/AuthShell';
import { useAuth } from '../../../shared/hooks/useAuth';
import { digitsOnly } from '../../../shared/utils/format';

interface LocationState {
  phoneNumber?: string;
}

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword, loading, error } = useAuth();

  const phoneNumber = (location.state as LocationState | null)?.phoneNumber ?? '';
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (code.length !== 6) {
      setFormError('کد بازیابی ۶ رقمی است.');
      return;
    }

    if (newPassword.length < 6) {
      setFormError('رمز جدید باید حداقل ۶ کاراکتر باشد.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('رمز جدید و تکرار آن یکسان نیستند.');
      return;
    }

    const result = await resetPassword({ phoneNumber, code, newPassword, confirmPassword });

    if (result.success) {
      toast.success('رمز عبور با موفقیت تغییر کرد. حالا وارد شوید.');
      navigate('/login', { replace: true });
    }
  };

  const message = formError ?? error;

  return (
    <AuthShell
      title="تعیین رمز عبور جدید"
      subtitle={phoneNumber ? `شماره موبایل: ${phoneNumber}` : 'کد بازیابی و رمز جدید را وارد کنید'}
      icon="🔒"
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

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="reset-code" className="mb-1.5 block text-xs font-bold text-ink-soft">
            کد بازیابی
          </label>
          <input
            id="reset-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => setCode(digitsOnly(event.target.value, 6))}
            placeholder="──────"
            className="field text-center tracking-[0.5em]"
            dir="ltr"
            maxLength={6}
            required
          />
        </div>

        <div>
          <label htmlFor="reset-password" className="mb-1.5 block text-xs font-bold text-ink-soft">
            رمز عبور جدید
          </label>
          <input
            id="reset-password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="حداقل ۶ کاراکتر"
            className="field"
            required
            minLength={6}
          />
        </div>

        <div>
          <label htmlFor="reset-confirm" className="mb-1.5 block text-xs font-bold text-ink-soft">
            تکرار رمز جدید
          </label>
          <input
            id="reset-confirm"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="••••••••"
            className="field"
            required
            minLength={6}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-4">
          {loading ? (
            'در حال ذخیره…'
          ) : (
            <>
              <KeyRound size={18} aria-hidden="true" /> تغییر رمز عبور
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
};

export default ResetPasswordPage;
