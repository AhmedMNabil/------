import React, { useState } from 'react';
import { LogoLockup, LogoMark } from './Logo';
import { CheckCircleIcon, EyeIcon, EyeOffIcon, SparkleIcon, VideoIcon } from './icons';
import { login, signup } from '../services/api';
import { User } from '../types';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const field =
  'w-full rounded-xl border border-line bg-elevated px-4 py-3 text-sm text-ink placeholder:text-faint transition-colors focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/15 disabled:opacity-60';

const FEATURES = [
  { Icon: SparkleIcon, text: 'إجابات مستخرجة من محتوى الكورس نفسه' },
  { Icon: VideoIcon, text: 'مقاطع فيديو مرتبطة بكل سؤال' },
  { Icon: CheckCircleIcon, text: 'محادثاتك محفوظة على حسابك' },
];

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('من فضلك املأ كل الحقول.');
      setIsLoading(false);
      return;
    }
    if (!isLogin && !name) {
      setError('من فضلك اكتب اسمك.');
      setIsLoading(false);
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      setIsLoading(false);
      return;
    }

    try {
      const user = isLogin ? await login(email, password) : await signup(name, email, password);
      onLogin(user);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حصل خطأ غير متوقع.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-canvas">
      {/* Brand panel — sits on the start edge (right in RTL). */}
      <aside className="relative hidden w-[46%] flex-col justify-between overflow-hidden px-10 py-10 lg:flex">
        <div className="auth-mesh pointer-events-none absolute inset-0" />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -end-16 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
        />

        <div className="relative">
          <LogoLockup inverted markSize={44} />
        </div>

        <div className="relative flex flex-1 flex-col items-center justify-center py-8">
          <LogoMark size={168} className="drop-shadow-2xl" />
          <h2 className="mt-8 max-w-sm text-center text-2xl font-extrabold leading-snug tracking-tight text-white">
            تعلّم أسرع.
            <br />
            اسأل المحتوى نفسه.
          </h2>
          <p className="mt-3 max-w-sm text-center text-sm leading-6 text-white/55">
            مساعدك الذكي لكورس «التعليم هو الحل» — إجابات واضحة، ورجوع مباشر للمقطع الأصلي.
          </p>
        </div>

        <ul className="relative space-y-3">
          {FEATURES.map(({ Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-white/75">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/8 text-accent">
                <Icon className="h-4 w-4" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </aside>

      {/* Compact brand bar on small screens */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="relative flex items-center gap-3 bg-nav px-5 py-3.5 lg:hidden">
          <div className="auth-mesh pointer-events-none absolute inset-0 opacity-90" />
          <LogoLockup inverted compact className="relative" />
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-4 py-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 start-1/2 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]"
          />

          <div className="relative w-full max-w-[400px] animate-fade-up">
            <div className="mb-7 hidden text-center lg:block">
              <h1 className="text-2xl font-extrabold tracking-tight text-ink">
                {isLogin ? 'أهلاً بعودتك' : 'أنشئ حسابك'}
              </h1>
              <p className="mt-1.5 text-sm text-muted">
                {isLogin ? 'سجّل دخولك لتكمل مذاكرتك من حيث توقفت.' : 'ابدأ رحلتك مع كورس «التعليم هو الحل».'}
              </p>
            </div>
            <div className="mb-6 text-center lg:hidden">
              <h1 className="text-xl font-extrabold text-ink">
                {isLogin ? 'أهلاً بعودتك' : 'إنشاء حساب جديد'}
              </h1>
              <p className="mt-1 text-sm text-muted">
                {isLogin ? 'سجّل دخولك لتكمل مذاكرتك.' : 'ابدأ رحلتك مع الكورس.'}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-3.5 rounded-2xl border border-line bg-elevated/85 p-5 shadow-composer backdrop-blur-md"
            >
              {!isLogin && (
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-muted">الاسم</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="اسمك الكامل"
                    autoComplete="name"
                    className={field}
                    disabled={isLoading}
                  />
                </label>
              )}
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-muted">البريد الإلكتروني</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  autoComplete="email"
                  dir="ltr"
                  className={`${field} font-latin text-start`}
                  disabled={isLoading}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-muted">كلمة المرور</span>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    className={`${field} pe-11`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    className="absolute top-1/2 -translate-y-1/2 rounded-md p-1.5 text-faint transition-colors hover:text-ink ltr:right-2 rtl:left-2"
                  >
                    {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
              </label>
              {!isLogin && (
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-muted">تأكيد كلمة المرور</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد كتابة كلمة المرور"
                    autoComplete="new-password"
                    className={field}
                    disabled={isLoading}
                  />
                </label>
              )}

              {error && (
                <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-xs leading-5 text-danger">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="mt-1 flex w-full items-center justify-center rounded-xl bg-brand py-3 text-sm font-bold text-brand-ink shadow-brand transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-ink border-t-transparent" />
                ) : isLogin ? (
                  'تسجيل الدخول'
                ) : (
                  'إنشاء الحساب'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              {isLogin ? 'معندكش حساب؟' : 'عندك حساب بالفعل؟'}{' '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="font-bold text-brand hover:underline"
                disabled={isLoading}
              >
                {isLogin ? 'أنشئ حساب' : 'سجّل دخول'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
