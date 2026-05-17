'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Search, UserPlus, UserCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';

interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar: string | null;
}

interface Props {
  onClose: () => void;
}

export default function FindNeighborsModal({ onClose }: Props) {
  const { user: authUser, refreshProfile } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Profile[]>([]);
  const [pending, setPending] = useState<Set<string>>(new Set());
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const followingIds = new Set((authUser?.followingProfiles ?? []).map((p) => p.id));

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) { setResults([]); return; }
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      const q = query.trim();
      const { data } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar')
        .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
        .neq('id', authUser?.id ?? '')
        .limit(10);
      setResults(data ?? []);
      setSearching(false);
    }, 250);
  }, [query]);

  const toggle = async (p: Profile) => {
    if (!authUser || pending.has(p.id)) return;
    setPending((prev) => new Set(prev).add(p.id));
    if (followingIds.has(p.id)) {
      await supabase.from('follows').delete().eq('follower_id', authUser.id).eq('following_id', p.id);
    } else {
      await supabase.from('follows').insert({ follower_id: authUser.id, following_id: p.id });
    }
    await refreshProfile();
    setPending((prev) => { const s = new Set(prev); s.delete(p.id); return s; });
  };

  const displayList: Profile[] = results.length > 0
    ? results
    : (authUser?.followingProfiles ?? []).map((fp) => ({
        id: fp.id,
        username: fp.username,
        display_name: fp.display_name,
        avatar: fp.avatar,
      }));

  const showingFollowing = results.length === 0 && query.trim().length < 2;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-nav-bg/80 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-4 top-[10%] z-50 bg-paper-dark border border-rule shadow-2xl max-w-sm mx-auto max-h-[80vh] flex flex-col rounded-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-nav-bg shrink-0">
          <p className="font-display font-bold text-ink text-base">👥 Find Neighbors</p>
          <button onClick={onClose} className="text-ink/60 hover:text-ink transition-colors"><X size={18} /></button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-rule shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or username…"
              autoFocus
              className="w-full border border-rule focus:border-masthead bg-paper pl-9 pr-3 py-2.5 text-sm text-ink placeholder-ink-faint outline-none transition-colors rounded-lg"
            />
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1">
          {showingFollowing && displayList.length === 0 && (
            <div className="px-4 py-10 text-center">
              <p className="text-ink-faint text-sm italic">Search for people to follow</p>
            </div>
          )}

          {showingFollowing && displayList.length > 0 && (
            <p className="px-4 pt-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-ink-faint">Following</p>
          )}

          {searching && (
            <p className="px-4 py-3 text-xs text-ink-faint italic">Searching…</p>
          )}

          {!searching && query.trim().length >= 2 && results.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-ink-faint italic">No users found for &ldquo;{query}&rdquo;</p>
          )}

          {displayList.map((p) => {
            const isFollowing = followingIds.has(p.id);
            const isBusy = pending.has(p.id);
            return (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3 border-b border-rule/40 last:border-0">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-paper-dark shrink-0 text-base overflow-hidden">
                  {p.avatar && p.avatar.startsWith('http') ? (
                    <img src={p.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{p.avatar ?? (p.display_name ?? p.username ?? '?').slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{p.display_name ?? p.username ?? 'Unknown'}</p>
                  {p.username && p.display_name && (
                    <p className="text-[10px] text-ink-faint">@{p.username}</p>
                  )}
                </div>
                <button
                  onClick={() => toggle(p)}
                  disabled={isBusy}
                  className={`shrink-0 flex items-center justify-center h-8 w-8 rounded-full border-2 transition-all disabled:opacity-40 ${
                    isFollowing
                      ? 'bg-paper-dark border-rule text-ink-muted hover:border-masthead hover:text-masthead'
                      : 'bg-masthead border-transparent text-[#12111a] hover:bg-masthead/80'
                  }`}
                  title={isFollowing ? 'Unfollow' : 'Follow'}
                >
                  {isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
