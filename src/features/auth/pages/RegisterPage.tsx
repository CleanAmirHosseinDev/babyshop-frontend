import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import AuthShell from '../../../shared/components/AuthShell';
import { useAuth } from '../../../shared/hooks/useAuth';
import { digitsOnly, isValidIranMobile } from '../../../shared/utils/format';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (fullName.trim().length < 3) {
      setFormError('نام و نام خانوادگی را کامل وارد کنید.');
      return;
    }

    if (!isValidIranMobile(phoneNumber)) {
      setFormError('شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.');
      return;
    }

    if (password.length < 6) {
      setFormError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('رمز عبور و تکرار آن یکسان نیستند.');
      return;
    }

    const result = await register({ fullName, phoneNumber, email, password, confirmPassword });

    if (result.success) {
      navigate('/verify-phone', { state: { phoneNumber } });
    }
  };

  const message = formError ?? error;

  return (
    <AuthShell
      title="ثبت‌نام در زیزی کیدز"
      subtitle="برای پیگیری سفارش‌ها و خرید سریع‌تر عضو شوید"
      icon="🧸"
      footer={
        <>
          قبلاً عضو شده‌اید؟{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:underline">
            وارد شوید
          </Link>
        </>
      }
    >
      {message && (
        <div role="alert" className="mb-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-center text-xs font-bold text-red-600">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="register-name" className="mb-1.5 block text-xs font-bold text-ink-soft">
            نام و نام خانوادگی
          </label>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="مثلاً سارا محمدی"
            className="field"
            required
          />
        </div>

        <div>
          <label htmlFor="register-phone" className="mb-1.5 block text-xs font-bold text-ink-soft">
            شماره موبایل
          </label>
          <input
            id="register-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(digitsOnly(event.target.value, 11))}
            placeholder="09123456789"
            className="field font-mono"
            dir="ltr"
            maxLength={11}
            required
          />
        </div>

        <div>
          <label htmlFor="register-email" className="mb-1.5 block text-xs font-bold text-ink-soft">
            ایمیل (اختیاری)
          </label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="field"
            dir="ltr"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="register-password" className="mb-1.5 block text-xs font-bold text-ink-soft">
              رمز عبور
            </label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="حداقل ۶ کاراکتر"
              className="field"
              required
              minLength={6}
            />
          </div>

          <div>
            <label htmlFor="register-confirm" className="mb-1.5 block text-xs font-bold text-ink-soft">
              تکرار رمز عبور
            </label>
            <input
              id="register-confirm"
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
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-4">
          {loading ? (
            'در حال ثبت‌نام…'
          ) : (
            <>
              <UserPlus size={18} aria-hidden="true" /> ثبت‌نام
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
};

export default RegisterPage;
