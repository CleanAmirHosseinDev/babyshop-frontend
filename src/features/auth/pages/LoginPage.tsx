import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import AuthShell from '../../../shared/components/AuthShell';
import { useAuth } from '../../../shared/hooks/useAuth';
import { digitsOnly, isValidIranMobile } from '../../../shared/utils/format';

interface LocationState {
  from?: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, isAuthenticated } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const redirectTo = (location.state as LocationState | null)?.from || '/';

  useEffect(() => {
    if (isAuthenticated) navigate(redirectTo, { replace: true });
  }, [isAuthenticated, navigate, redirectTo]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!isValidIranMobile(phoneNumber)) {
      setFormError('شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.');
      return;
    }

    if (password.length < 6) {
      setFormError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }

    const result = await login({ phoneNumber, password });

    if (result.success) {
      navigate(redirectTo, { replace: true });
      return;
    }

    // بک‌اند برای شماره‌ی تایید‌نشده کد جدید می‌فرستد و پیام مخصوص برمی‌گرداند
    if (result.requiresVerification) {
      navigate('/verify-phone', {
        replace: true,
        state: {
          phoneNumber,
          notice: 'شماره موبایل شما هنوز تایید نشده است؛ کد تایید جدید برای شما ارسال شد.',
        },
      });
    }
  };

  const message = formError ?? error;

  return (
    <AuthShell
      title="ورود به زیزی کیدز"
      subtitle="خوشحالیم دوباره می‌بینیمت!"
      icon="🔐"
      footer={
        <>
          هنوز عضو نیستی؟{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:underline">
            ثبت‌نام کن
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
          <label htmlFor="login-phone" className="mb-1.5 block text-xs font-bold text-ink-soft">
            شماره موبایل
          </label>
          <input
            id="login-phone"
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
          <label htmlFor="login-password" className="mb-1.5 block text-xs font-bold text-ink-soft">
            رمز عبور
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="field pe-12"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-ink-light transition-colors hover:text-brand-500"
            >
              {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div className="text-left">
          <Link to="/forgot-password" className="text-xs font-bold text-brand-500 hover:underline">
            رمز عبور را فراموش کرده‌اید؟
          </Link>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-4">
          {loading ? (
            'در حال ورود…'
          ) : (
            <>
              <LogIn size={18} aria-hidden="true" /> ورود
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
};

export default LoginPage;
