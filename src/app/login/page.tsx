'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, User, Lock, ChevronRight, Eye, EyeOff, Mail, CheckCircle } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

type Mode = 'signin' | 'signup';

function Spinner({ light }: { light?: boolean }) {
  return (
    <span className="flex gap-1.5">
      {[0, 150, 300].map((d) => (
        <span
          key={d}
          className={`h-1.5 w-1.5 rounded-full animate-bounce ${light ? 'bg-paper' : 'bg-ink'}`}
          style={{ animationDelay: `${d}ms` }}
        />
      ))}
    </span>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const SUPABASE_CONFIGURED = isSupabaseConfigured();

  const [mode, setMode] = useState<Mode>('signin');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);
  const [error, setError] = useState('');
  const [emailConfirmSent, setEmailConfirmSent] = useState(false);

  const isPhone = /^\+?[\d\s\-()]{7,}$/.test(identifier.replace(/\s/g, ''));
  const isEmailType = identifier.includes('@') && !isPhone;
  const identifierType = identifier.length > 0 ? (isPhone ? 'phone' : isEmailType ? 'email' : 'username') : null;

  const signInWithOAuth = async (provider: 'google' | 'apple') => {
    if (!SUPABASE_CONFIGURED) { router.push('/onboarding'); return; }
    setOauthLoading(provider);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (err) { setError(err.message); setOauthLoading(null); }
  };

  const handleSignUp = async () => {
    if (!email.trim() || !username.trim() || !password.trim()) {
      setError('Please fill in all fields.'); return;
    }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (!SUPABASE_CONFIGURED) { router.push('/onboarding'); return; }

    setLoading(true); setError('');
    const { error: err } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { username: username.trim().toLowerCase() },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setEmailConfirmSent(true);
  };

  const handleSignIn = async () => {
    if (!identifier.trim() || !password.trim()) {
      setError('Please fill in all fields.'); return;
    }
    if (!SUPABASE_CONFIGURED) { router.push('/stoop'); return; }

    setLoading(true); setError('');

    if (identifierType === 'phone') {
      const { error: err } = await supabase.auth.signInWithOtp({ phone: identifier.trim() });
      setLoading(false);
      if (err) { setError(err.message); return; }
      router.push(`/login/otp?phone=${encodeURIComponent(identifier.trim())}`);
      return;
    }

    const { error: err } = await supabase.auth.signInWithPassword({
      email: identifier.trim().toLowerCase(),
      password,
    });
    setLoading(false);
    if (err) { setError('Incorrect email or password.'); return; }
    router.push('/stoop');
  };

  const handleSubmit = () => mode === 'signup' ? handleSignUp() : handleSignIn();

  if (emailConfirmSent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-8 text-center gap-6">
        <div className="border-b-2 border-t-2 border-ink py-2 px-8 w-full text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink-muted">Est. 2024 · Sports Edition</p>
        </div>
        <h1 className="font-display text-4xl font-black text-ink tracking-tight leading-tight">
          Stoop<br />Sports
        </h1>
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-field/10 border-2 border-field">
            <CheckCircle size={32} className="text-field" />
          </div>
          <div>
            <h2 className="font-display text-xl font-black text-ink mb-2">Check Your Email</h2>
            <p className="text-sm text-ink-muted leading-relaxed">
              We sent a confirmation link to<br />
              <span className="font-bold text-ink">{email}</span>
            </p>
            <p className="text-sm text-ink-muted leading-relaxed mt-3">
              Click the link in your email to activate your account and set up your stoop.
            </p>
          </div>
        </div>
        <button
          onClick={() => setEmailConfirmSent(false)}
          className="text-xs text-ink-faint hover:text-ink-muted underline"
        >
          ← Back to sign in
        </button>
      </div>
    );
  }

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
      <div className="px-6 mb-5">
        <div className="flex gap-0 border border-ink overflow-hidden">
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

      <div className="px-6 flex flex-col gap-4 pb-10">
        {/* OAuth */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => signInWithOAuth('google')}
            disabled={oauthLoading !== null}
            className="flex items-center justify-center gap-3 border-2 border-ink py-3 font-bold text-sm text-ink hover:bg-paper-dark transition-colors disabled:opacity-50"
          >
            {oauthLoading === 'google' ? <Spinner /> : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>
          <button
            onClick={() => signInWithOAuth('apple')}
            disabled={oauthLoading !== null}
            className="flex items-center justify-center gap-3 border-2 border-ink py-3 font-bold text-sm text-ink hover:bg-paper-dark transition-colors disabled:opacity-50"
          >
            {oauthLoading === 'apple' ? <Spinner /> : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            )}
            Continue with Apple
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-rule" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink-faint">or</span>
          <div className="flex-1 border-t border-rule" />
        </div>

        {mode === 'signup' ? (
          <>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com"
                  className="w-full border border-rule bg-paper-dark py-3 pl-9 pr-4 text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted text-sm font-bold">@</span>
                <input type="text" value={username} onChange={(e) => { setUsername(e.target.value.replace(/\s/g, '').toLowerCase()); setError(''); }}
                  placeholder="jhayes23"
                  className="w-full border border-rule bg-paper-dark py-3 pl-7 pr-4 text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors text-sm" />
              </div>
            </div>
          </>
        ) : (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">Email or Phone</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint">
                {identifierType === 'phone' ? <Phone size={15} /> : identifierType === 'email' ? <Mail size={15} /> : <User size={15} />}
              </div>
              <input type="text" value={identifier} onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                placeholder="you@example.com or +1 555 000 0000"
                className="w-full border border-rule bg-paper-dark py-3 pl-9 pr-4 text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors text-sm" />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input type={showPassword ? 'text' : 'password'} value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="••••••••"
              className="w-full border border-rule bg-paper-dark py-3 pl-9 pr-12 text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors text-sm" />
            <button onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink">
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {mode === 'signup' && <p className="mt-1 text-[11px] text-ink-faint italic">At least 6 characters</p>}
        </div>

        {error && (
          <p className="border border-masthead/40 bg-masthead/10 px-4 py-2.5 text-sm text-masthead">{error}</p>
        )}

        <button onClick={handleSubmit} disabled={loading}
          className="flex items-center justify-center gap-2 bg-ink py-4 font-bold text-paper hover:bg-ink/80 disabled:opacity-60 transition-colors mt-1 uppercase tracking-widest text-sm">
          {loading ? <Spinner light /> : <>{mode === 'signin' ? 'Enter the Stoop' : 'Join the Stoop'}<ChevronRight size={18} /></>}
        </button>

        {mode === 'signin' && (
          <p className="text-center text-sm text-ink-muted pb-4">
            New here?{' '}
            <button onClick={() => setMode('signup')} className="text-masthead font-bold hover:underline">Sign up</button>
          </p>
        )}
      </div>
    </div>
  );
}
