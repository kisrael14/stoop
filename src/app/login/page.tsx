'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, User, Lock, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { requestNotificationPermission, startSimulatedNotifications } from '@/lib/notifications';

type Mode = 'signin' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isPhone = /^\+?[\d\s\-()]{7,}$/.test(identifier.replace(/\s/g, ''));
  const identifierType = identifier.length > 0 ? (isPhone ? 'phone' : 'username') : null;

  const handleSubmit = async () => {
    if (!identifier.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    await new Promise((r) => setTimeout(r, 800));

    const granted = await requestNotificationPermission();
    if (granted) startSimulatedNotifications();

    if (mode === 'signup') {
      router.push('/onboarding');
    } else {
      router.push('/stoop');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {/* Masthead */}
      <div className="flex flex-col items-center pt-14 pb-8 px-6">
        <div className="border-b-2 border-t-2 border-ink py-2 px-8 mb-4 w-full text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink-muted">Est. 2024 · Sports Edition</p>
        </div>
        <h1 className="font-display text-5xl font-black text-ink tracking-tight text-center leading-tight">
          Stoop<br />Sports
        </h1>
        <div className="border-b border-ink w-full mt-3 mb-2" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted text-center">
          Your Neighborhood Sports Desk
        </p>
      </div>

      {/* Tab switcher */}
      <div className="px-6 mb-6">
        <div className="flex gap-0 border border-ink overflow-hidden rounded-none">
          {(['signin', 'signup'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors border-r last:border-r-0 border-ink ${
                mode === m ? 'bg-ink text-paper' : 'bg-paper text-ink-muted hover:bg-paper-dark'
              }`}
            >
              {m === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 flex flex-col gap-4">
        {/* Identifier field */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
            {mode === 'signin' ? 'Phone or Username' : 'Phone Number'}
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint">
              {identifierType === 'phone' ? <Phone size={15} /> : <User size={15} />}
            </div>
            <input
              type="text"
              value={identifier}
              onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
              placeholder={mode === 'signin' ? '+1 (555) 000-0000 or @username' : '+1 (555) 000-0000'}
              className="w-full rounded-none border border-rule bg-paper-dark py-3 pl-9 pr-4 text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors text-sm"
            />
            {identifierType && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wide text-ink-muted">
                {identifierType === 'phone' ? '📱' : '@'}
              </span>
            )}
          </div>
          {mode === 'signin' && (
            <p className="mt-1 text-[11px] text-ink-faint italic">
              Friends can find you by your phone number or @username
            </p>
          )}
        </div>

        {/* Username field (signup only) */}
        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted text-sm font-bold">@</span>
              <input
                type="text"
                placeholder="jhayes23"
                className="w-full rounded-none border border-rule bg-paper-dark py-3 pl-7 pr-4 text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors text-sm"
              />
            </div>
          </div>
        )}

        {/* Password field */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="••••••••"
              className="w-full rounded-none border border-rule bg-paper-dark py-3 pl-9 pr-12 text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors text-sm"
            />
            <button
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="border border-masthead/40 bg-masthead/10 px-4 py-2.5 text-sm text-masthead">
            {error}
          </p>
        )}

        {/* Notification note */}
        <div className="border-l-4 border-rule bg-paper-dark px-4 py-3 flex items-start gap-3">
          <span className="text-base mt-0.5">🔔</span>
          <p className="text-xs text-ink-muted leading-relaxed italic">
            We&apos;ll request notification permission so you never miss a message, debate, or bet in your neighborhoods.
          </p>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-ink py-4 font-bold text-paper hover:bg-ink/80 disabled:opacity-60 transition-colors mt-1 uppercase tracking-widest text-sm"
        >
          {loading ? (
            <span className="flex gap-1.5">
              {[0, 150, 300].map((d) => (
                <span key={d} className="h-1.5 w-1.5 rounded-full bg-paper animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </span>
          ) : (
            <>
              {mode === 'signin' ? 'Enter the Stoop' : 'Claim Your Spot'}
              <ChevronRight size={18} />
            </>
          )}
        </button>

        {mode === 'signin' && (
          <p className="text-center text-sm text-ink-muted pb-4">
            New to the stoop?{' '}
            <button onClick={() => setMode('signup')} className="text-masthead font-bold hover:underline">
              Sign up
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
