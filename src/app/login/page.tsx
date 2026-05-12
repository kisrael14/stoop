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
    // Simulate auth — any credentials work in the prototype
    await new Promise((r) => setTimeout(r, 800));

    // Request notification permission after login
    const granted = await requestNotificationPermission();
    if (granted) startSimulatedNotifications();

    if (mode === 'signup') {
      router.push('/onboarding');
    } else {
      router.push('/stoop');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      {/* Brand header */}
      <div className="flex flex-col items-center pt-16 pb-10 px-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-5xl">🏟️</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Stoop Sports</h1>
        <p className="mt-2 text-slate-400 text-sm text-center">
          Your neighborhood sports group chat
        </p>
      </div>

      {/* Tab switcher */}
      <div className="px-6 mb-6">
        <div className="flex gap-1 bg-slate-900 rounded-xl p-1">
          {(['signin', 'signup'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                mode === m ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {m === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 flex flex-col gap-4">
        {/* Phone or username field */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            {mode === 'signin' ? 'Phone number or username' : 'Phone number'}
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              {identifierType === 'phone' ? <Phone size={16} /> : <User size={16} />}
            </div>
            <input
              type="text"
              value={identifier}
              onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
              placeholder={mode === 'signin' ? '+1 (555) 000-0000 or @username' : '+1 (555) 000-0000'}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3.5 pl-10 pr-4 text-white placeholder-slate-500 outline-none focus:border-orange-500 transition-colors"
            />
            {identifierType && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
                {identifierType === 'phone' ? '📱 Phone' : '@ Username'}
              </span>
            )}
          </div>
          {mode === 'signin' && (
            <p className="mt-1 text-xs text-slate-500">
              Friends can find you by your phone number or @username
            </p>
          )}
        </div>

        {/* Username field (signup only) */}
        {mode === 'signup' && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">@</span>
              <input
                type="text"
                placeholder="jhayes23"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3.5 pl-8 pr-4 text-white placeholder-slate-500 outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Password field */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3.5 pl-10 pr-12 text-white placeholder-slate-500 outline-none focus:border-orange-500 transition-colors"
            />
            <button
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-red-950/40 border border-red-900/40 px-4 py-2.5 text-sm text-red-400">
            {error}
          </p>
        )}

        {/* Notification permission note */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 flex items-start gap-3">
          <span className="text-lg mt-0.5">🔔</span>
          <p className="text-xs text-slate-400 leading-relaxed">
            After signing in we&apos;ll ask to enable push notifications so you never miss a message, debate, or bet in your neighborhoods.
          </p>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-bold text-white hover:bg-orange-600 disabled:opacity-60 transition-colors mt-1"
        >
          {loading ? (
            <span className="flex gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          ) : (
            <>
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
              <ChevronRight size={18} />
            </>
          )}
        </button>

        {mode === 'signin' && (
          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <button onClick={() => setMode('signup')} className="text-orange-400 font-semibold hover:text-orange-300">
              Sign up
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
