'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, Search, Check, UserPlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { markHoodSeen } from '@/components/PersistentSidebar';

const EMOJI_OPTIONS = ['🏘️','🏟️','🏈','🏀','⚾','⚽','🏒','🔥','⚡','🎯','🏆','🎪','🌆','🌃'];

interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar: string | null;
}

interface Props {
  onClose: () => void;
}

export default function CreateNeighborhoodModal({ onClose }: Props) {
  const router = useRouter();
  const { user: authUser } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🏘️');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Profile[]>([]);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      return;
    }
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      const q = query.trim();
      const { data } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar')
        .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
        .neq('id', authUser?.id ?? '')
        .limit(8);
      setResults((data ?? []).filter((p: Profile) => !selected.some((s) => s.id === p.id)));
      setSearching(false);
    }, 250);
  }, [query]);

  const addPerson = (p: Profile) => {
    setSelected((prev) => [...prev, p]);
    setResults((prev) => prev.filter((r) => r.id !== p.id));
    setQuery('');
  };

  const removePerson = (id: string) => {
    setSelected((prev) => prev.filter((p) => p.id !== id));
  };

  const create = async () => {
    if (!name.trim() || !authUser) return;
    setError(null);
    setCreating(true);

    const { data: hood, error: hoodErr } = await supabase
      .from('neighborhoods')
      .insert({ name: name.trim(), emoji, created_by: authUser.id })
      .select()
      .single();

    if (hoodErr || !hood) {
      setError(hoodErr?.message ?? 'Could not create neighborhood');
      setCreating(false);
      return;
    }

    const memberRows = [
      { neighborhood_id: hood.id, user_id: authUser.id },
      ...selected.map((p) => ({ neighborhood_id: hood.id, user_id: p.id })),
    ];

    const { error: memberErr } = await supabase
      .from('neighborhood_members')
      .insert(memberRows);

    if (memberErr) {
      setError(memberErr.message ?? 'Neighborhood created but could not add members');
      setCreating(false);
      return;
    }

    markHoodSeen(hood.id);
    onClose();
    router.push(`/neighborhoods/${hood.id}`);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-nav-bg/80 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-x-4 top-[10%] z-50 bg-paper-dark border border-rule shadow-2xl max-w-sm mx-auto max-h-[80vh] flex flex-col rounded-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-nav-bg shrink-0">
          <p className="font-display font-bold text-ink text-base">🏘️ New Neighborhood</p>
          <button onClick={onClose} className="text-ink/60 hover:text-ink transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-5 flex flex-col gap-5">

          {/* Name */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-ink-faint block mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && create()}
              placeholder="e.g. Sunday Crew"
              autoFocus
              className="w-full border border-rule focus:border-masthead bg-paper py-2.5 px-3 text-sm text-ink placeholder-ink-faint outline-none transition-colors rounded-lg"
            />
          </div>

          {/* Emoji */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-ink-faint block mb-1.5">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`flex items-center justify-center h-9 w-9 text-xl rounded-lg border transition-all ${
                    emoji === e ? 'border-masthead bg-paper-dark scale-110' : 'border-rule hover:border-ink-muted'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* People search */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-ink-faint block mb-1.5">
              Add People
            </label>

            {/* Selected chips */}
            {selected.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selected.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-1.5 bg-masthead/20 border border-masthead/40 text-ink rounded-full px-2.5 py-1 text-xs font-semibold"
                  >
                    {p.avatar && !p.avatar.startsWith('http') && (
                      <span className="text-sm leading-none">{p.avatar}</span>
                    )}
                    {p.display_name ?? p.username ?? 'User'}
                    <button
                      onClick={() => removePerson(p.id)}
                      className="text-ink/50 hover:text-ink ml-0.5"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Search input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or username…"
                className="w-full border border-rule focus:border-field bg-paper pl-9 pr-3 py-2.5 text-sm text-ink placeholder-ink-faint outline-none transition-colors rounded-lg"
              />
            </div>

            {/* Results */}
            {(results.length > 0 || searching) && (
              <div className="mt-1 border border-rule rounded-lg bg-paper overflow-hidden">
                {searching && (
                  <p className="px-3 py-2.5 text-xs text-ink-faint italic">Searching…</p>
                )}
                {results.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addPerson(p)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-paper-dark transition-colors border-b border-rule/40 last:border-0 text-left"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-paper-dark shrink-0 text-base overflow-hidden">
                      {p.avatar && p.avatar.startsWith('http') ? (
                        <img src={p.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{p.avatar ?? (p.display_name ?? p.username ?? '?').slice(0, 1).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">
                        {p.display_name ?? p.username ?? 'Unknown'}
                      </p>
                      {p.username && p.display_name && (
                        <p className="text-[10px] text-ink-faint">@{p.username}</p>
                      )}
                    </div>
                    <UserPlus size={15} className="text-ink-faint shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {query.trim().length >= 2 && !searching && results.length === 0 && (
              <p className="mt-1.5 text-[11px] text-ink-faint italic px-1">No users found for &ldquo;{query}&rdquo;</p>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-400 px-2 py-1.5 bg-red-400/10 border border-red-400/30 rounded-lg">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-rule bg-paper-dark px-5 py-4">
          <button
            onClick={create}
            disabled={!name.trim() || creating}
            className="w-full flex items-center justify-center gap-2 bg-masthead text-[#12111a] py-3 text-xs font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed rounded-full btn-3d hover:bg-masthead/90 transition-colors"
          >
            <Check size={14} />
            {creating ? 'Creating…' : `Create${selected.length > 0 ? ` with ${selected.length + 1} people` : ''}`}
          </button>
        </div>
      </div>
    </>
  );
}
