'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, X, Sun, Moon, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

const HIDDEN_ON = ['/login', '/onboarding'];
const CONTENT_LEFT = 'max(68px, calc(50vw - 156px))';
const CONTENT_WIDTH = 'min(380px, calc(100vw - 68px))';

type UserResult = {
  id: string;
  username: string;
  display_name: string;
  avatar: string | null;
};

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen || !searchQuery.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }
    if (!isSupabaseConfigured()) return;
    const q = searchQuery.trim();
    setSearching(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any;
    supabase
      .from('profiles')
      .select('id, username, display_name, avatar')
      .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
      .limit(12)
      .then(({ data }: { data: UserResult[] | null }) => {
        setResults(data ?? []);
        setSearching(false);
      });
  }, [searchQuery, searchOpen]);

  const close = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setResults([]);
  };

  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <>
      {searchOpen && <div className="fixed inset-0 z-40" onClick={close} />}

      {/* ── Top bar ─────────────────────────────────────── */}
      <div
        className="fixed top-0 h-14 z-50 bg-nav-bg flex items-center gap-2 px-4 shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
        style={{ left: CONTENT_LEFT, width: CONTENT_WIDTH }}
      >
        <button
          onClick={() => setSearchOpen(true)}
          className="flex flex-1 items-center gap-2 bg-white/10 hover:bg-white/15 rounded-full px-4 h-9 transition-colors min-w-0"
        >
          <Search size={14} className="text-ink/60 shrink-0" />
          <span className="text-ink/40 text-sm font-medium truncate">Find Neighbors…</span>
        </button>

        <button
          onClick={toggleTheme}
          className="relative shrink-0 flex items-center justify-center h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-ink transition-all"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>

      {/* ── Search panel ────────────────────────────────── */}
      {searchOpen && (
        <div
          className="fixed top-14 z-50 bg-paper-dark border-t border-rule shadow-2xl flex flex-col"
          style={{ left: CONTENT_LEFT, width: CONTENT_WIDTH, maxHeight: '70vh' }}
        >
          {/* Input row */}
          <div className="shrink-0 flex items-center gap-2 px-4 py-3 bg-nav-bg border-b border-white/10">
            <Search size={14} className="text-white/50 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name or @username…"
              className="flex-1 bg-transparent text-white text-sm placeholder-white/35 outline-none min-w-0"
            />
            {searchQuery.length > 0 && (
              <button onClick={() => setSearchQuery('')} className="text-white/40 hover:text-white shrink-0 transition-colors">
                <X size={13} />
              </button>
            )}
            <button
              onClick={close}
              className="shrink-0 text-white/50 hover:text-white text-[11px] font-bold uppercase tracking-wider ml-1 transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Results area */}
          <div className="overflow-y-auto flex-1">
            {searchQuery.trim().length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <Users size={26} className="text-ink-faint mb-2" />
                <p className="text-sm text-ink-muted italic">Type a name or @username</p>
                <p className="text-[10px] text-ink-faint mt-1">Find neighbors on Stoop Sports</p>
              </div>
            )}

            {searchQuery.trim().length > 0 && searching && results.length === 0 && (
              <p className="text-center text-ink-muted text-sm py-8 italic">Searching…</p>
            )}

            {searchQuery.trim().length > 0 && !searching && results.length === 0 && (
              <p className="text-center text-ink-muted text-sm py-8 italic">
                No neighbors found for &ldquo;{searchQuery}&rdquo;
              </p>
            )}

            {results.map((user) => (
              <button
                key={user.id}
                onClick={() => { close(); router.push(`/users/${user.id}`); }}
                className="flex w-full items-center gap-3 px-4 py-3 hover:bg-paper-deeper transition-colors text-left border-b border-rule/40 last:border-0"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-nav-bg border border-rule/50 text-xl shrink-0 overflow-hidden">
                  {user.avatar && user.avatar.startsWith('http')
                    ? <img src={user.avatar} alt={user.display_name} className="w-full h-full object-cover" />
                    : <span className="leading-none">{user.avatar || '👤'}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink text-sm truncate">{user.display_name}</p>
                  <p className="text-[11px] text-ink-faint font-mono">@{user.username}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
