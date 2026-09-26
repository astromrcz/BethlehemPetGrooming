import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts';
import { dataSource } from '../../lib/data';

// Faithful port of pages/client/sign-in.html — same markup/classes, now driven
// by AuthContext instead of scripts/auth/sign-in.js. Includes the two-step flow:
// credentials → emailed login confirmation code.

type Phase = 'credentials' | 'confirm';

export default function SignIn() {
  const { signIn, completeLoginChallenge } = useAuth();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>('credentials');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [pollToken, setPollToken] = useState('');
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const result = await signIn(identifier, password, remember);
      switch (result.code) {
        case 'login_confirmation_required':
          setPollToken(result.login_poll_token);
          setPhase('confirm');
          setMessage({
            tone: 'success',
            text: `Enter the code sent to ${result.email} to complete sign-in.`,
          });
          break;
        case 'ok':
          navigate('/');
          break;
        case 'email_not_verified':
          setMessage({ tone: 'error', text: 'Please verify your email address before signing in.' });
          break;
        case 'account_disabled':
          setMessage({ tone: 'error', text: 'Your account has been disabled. Please contact the clinic.' });
          break;
        case 'rate_limited':
          setMessage({ tone: 'error', text: `Too many attempts. Try again in ${result.retry_after}s.` });
          break;
        default:
          setMessage({ tone: 'error', text: 'Invalid credentials.' });
      }
    } catch {
      setMessage({ tone: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const user = await completeLoginChallenge(pollToken, code);
      navigate(user.role === 'customer' ? '/dashboard' : '/admin');
    } catch {
      setMessage({ tone: 'error', text: 'Invalid or expired confirmation code.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl items-center justify-center">
        <div className="w-full rounded-[1.75rem] bg-white shadow-[0_18px_48px_rgba(15,23,42,0.12)]">
          <div className="px-8 py-10 sm:px-10">
            <div className="mb-8 text-center">
              <img
                className="mx-auto mb-4 h-16 w-auto"
                src="/assets/images/clinic/Bethlehem_Logo-256.png"
                alt="Bethlehem Animal Clinic Logo"
              />
              <h2 className="text-3xl font-bold leading-tight text-slate-800">Sign In</h2>
              <p className="mt-4 text-sm leading-6 text-slate-500">
                {phase === 'credentials'
                  ? 'Enter your credentials to access your account.'
                  : 'Enter the confirmation code we emailed you.'}
              </p>
            </div>

            {message && (
              <div
                className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${
                  message.tone === 'error'
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                }`}
              >
                {message.text}
              </div>
            )}

            {phase === 'credentials' ? (
              <form className="space-y-5" onSubmit={handleCredentials}>
                <div>
                  <label htmlFor="identifier" className="mb-2 block text-base font-semibold text-[#1e3a5f]">
                    Email, username, or mobile number
                  </label>
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#315b7e] focus:ring-2 focus:ring-[#315b7e]/10"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-base font-semibold text-[#1e3a5f]">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="custom-password-input w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 pr-12 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#315b7e] focus:ring-2 focus:ring-[#315b7e]/10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition hover:text-[#315b7e]"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <svg className="h-5 w-5 fill-current" viewBox="0 0 256 256" aria-hidden="true">
                        <use href={`/assets/icons/phosphor.svg#${showPassword ? 'eye' : 'eye-slash'}`} />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                  <label className="inline-flex items-center gap-2 text-slate-600">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="m-0"
                    />
                    <span>Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-[#315b7e] transition hover:text-[#274a66]">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-[#315b7e] px-4 py-4 text-base font-semibold text-white transition hover:bg-[#274a66] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form className="space-y-5" onSubmit={handleConfirm}>
                <div>
                  <label htmlFor="code" className="mb-2 block text-base font-semibold text-[#1e3a5f]">
                    Confirmation code
                  </label>
                  <input
                    id="code"
                    name="code"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-center text-2xl tracking-[0.5em] text-slate-800 outline-none transition focus:border-[#315b7e] focus:ring-2 focus:ring-[#315b7e]/10"
                    required
                  />
                  {dataSource === 'mock' && (
                    <p className="mt-2 text-xs text-slate-400">Mock mode — the code is 123456.</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-[#315b7e] px-4 py-4 text-base font-semibold text-white transition hover:bg-[#274a66] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? 'Verifying…' : 'Complete Sign In'}
                </button>
              </form>
            )}

            <div className="mt-7 flex flex-col items-center gap-3 text-center text-sm text-slate-500">
              <p className="m-0">
                Don't have an account?{' '}
                <Link to="/signup" className="font-semibold text-[#315b7e] transition hover:text-[#274a66]">
                  Sign Up
                </Link>
              </p>
              <Link to="/" className="text-[#315b7e] transition hover:text-[#274a66]">
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
