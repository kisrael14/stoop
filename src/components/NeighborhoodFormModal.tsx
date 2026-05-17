'use client';

/**
 * SQL required before all features work:
 *   ALTER TABLE neighborhood_members ADD COLUMN IF NOT EXISTS nickname TEXT;
 *   ALTER TABLE neighborhoods ADD COLUMN IF NOT EXISTS photo_url TEXT;
 *   ALTER TABLE neighborhoods ADD COLUMN IF NOT EXISTS description TEXT;
 * Storage: create a Supabase bucket named "neighborhood-photos" (public).
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search, Check, UserPlus, Camera, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { markHoodSeen } from '@/components/PersistentSidebar';

const EMOJI_OPTIONS = ['🏘️','🏟️','🏈','🏀','⚾','⚽','🏒','🔥','⚡','🎯','🏆','🎪','🌆','🌃'];

interface MemberEntry {
  id: string;
  displayName: string;
  username: string | null;
  avatar: string | null;
  nickname: string;
}

interface SearchProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar: string | null;
}

interface Props {
  mode: 'create' | 'edit';
  neighborhoodId?: string;
  onClose: () => void;
  onSaved?: () => void;
}

export default function NeighborhoodFormModal({ mode, neighborhoodId, onClose, onSaved }: Props) {
  const router = useRouter();
  const { user: authUser, refreshProfile } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('🏘️');
  const [iconMode, setIconMode] = useState<'emoji' | 'photo'>('emoji');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Members
  const [members, setMembers] = useState<MemberEntry[]>([]);
  const [originalMemberIds, setOriginalMemberIds] = useState<Set<string>>(new Set());
  const [loadingData, setLoadingData] = useState(mode === 'edit');

  // People search
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchProfile[]>([]);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Form state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Load data ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (mode === 'create') {
      if (!authUser) return;
      setMembers([{
        id: authUser.id,
        displayName: authUser.profile?.display_name ?? authUser.profile?.username ?? 'You',
        username: authUser.profile?.username ?? null,
        avatar: authUser.profile?.avatar ?? null,
        nickname: '',
      }]);
      return;
    }

    if (!neighborhoodId) return;
    const load = async () => {
      setLoadingData(true);

      // Fetch neighborhood metadata — try with optional columns, fall back without
      const { data: hoodFull, error: hoodFullErr } = await supabase
        .from('neighborhoods')
        .select('name, emoji, photo_url, description')
        .eq('id', neighborhoodId)
        .single();

      if (!hoodFullErr && hoodFull) {
        setName(hoodFull.name ?? '');
        setEmoji(hoodFull.emoji ?? '🏘️');
        setDescription(hoodFull.description ?? '');
        if (hoodFull.photo_url) {
          setPhotoPreview(hoodFull.photo_url);
          setIconMode('photo');
        } else {
          setIconMode('emoji');
        }
      } else {
        const { data: hoodBasic } = await supabase
          .from('neighborhoods')
          .select('name, emoji')
          .eq('id', neighborhoodId)
          .single();
        if (hoodBasic) {
          setName(hoodBasic.name ?? '');
          setEmoji(hoodBasic.emoji ?? '🏘️');
        }
        setIconMode('emoji');
      }

      // Fetch members — try with nickname column, fall back without
      let memberRows: Array<{ user_id: string; nickname: string | null }> = [];
      const { data: withNick, error: nickErr } = await supabase
        .from('neighborhood_members')
        .select('user_id, nickname')
        .eq('neighborhood_id', neighborhoodId);

      if (!nickErr) {
        memberRows = withNick ?? [];
      } else {
        const { data: withoutNick } = await supabase
          .from('neighborhood_members')
          .select('user_id')
          .eq('neighborhood_id', neighborhoodId);
        memberRows = (withoutNick ?? []).map((m: { user_id: string }) => ({ ...m, nickname: null }));
      }

      if (memberRows.length > 0) {
        const userIds = memberRows.map((m) => m.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar')
          .in('id', userIds);

        const profileMap = new Map(
          (profiles ?? []).map((p: SearchProfile) => [p.id, p])
        );

        const loaded: MemberEntry[] = memberRows.map((m) => {
          const p = profileMap.get(m.user_id) as SearchProfile | undefined;
          return {
            id: m.user_id,
            displayName: p?.display_name ?? p?.username ?? 'Unknown',
            username: p?.username ?? null,
            avatar: p?.avatar ?? null,
            nickname: m.nickname ?? '',
          };
        });

        setMembers(loaded);
        setOriginalMemberIds(new Set(loaded.map((m) => m.id)));
      }

      setLoadingData(false);
    };
    load();
  }, [mode, neighborhoodId, authUser?.id]);

  // ── People search ──────────────────────────────────────────────────────────

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
        .limit(8);
      const memberIds = new Set(members.map((m) => m.id));
      setResults((data ?? []).filter((p: SearchProfile) => !memberIds.has(p.id)));
      setSearching(false);
    }, 250);
  }, [query, members]);

  const addMember = (p: SearchProfile) => {
    setMembers((prev) => [
      ...prev,
      {
        id: p.id,
        displayName: p.display_name ?? p.username ?? 'Unknown',
        username: p.username ?? null,
        avatar: p.avatar ?? null,
        nickname: '',
      },
    ]);
    setResults((prev) => prev.filter((r) => r.id !== p.id));
    setQuery('');
  };

  const removeMember = (id: string) => setMembers((prev) => prev.filter((m) => m.id !== id));

  const updateNickname = (id: string, nickname: string) =>
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, nickname } : m)));

  // ── Photo handling ─────────────────────────────────────────────────────────

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (hoodId: string): Promise<string | null> => {
    if (!photoFile) return null;
    try {
      const ext = photoFile.name.split('.').pop() ?? 'jpg';
      const { data: up, error: upErr } = await supabase.storage
        .from('neighborhood-photos')
        .upload(`${hoodId}/avatar.${ext}`, photoFile, { upsert: true });
      if (upErr || !up) return null;
      const { data: urlData } = supabase.storage
        .from('neighborhood-photos')
        .getPublicUrl(up.path);
      return urlData?.publicUrl ?? null;
    } catch {
      return null;
    }
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  const save = async () => {
    if (!name.trim() || !authUser) return;
    setError(null);
    setSaving(true);

    if (mode === 'create') {
      const { data: hood, error: hoodErr } = await supabase
        .from('neighborhoods')
        .insert({ name: name.trim(), emoji, description: description.trim() || null, created_by: authUser.id })
        .select()
        .single();

      if (hoodErr || !hood) {
        setError(hoodErr?.message ?? 'Could not create neighborhood');
        setSaving(false);
        return;
      }

      if (iconMode === 'photo') {
        const photoUrl = await uploadPhoto(hood.id);
        if (photoUrl) {
          await supabase.from('neighborhoods').update({ photo_url: photoUrl }).eq('id', hood.id);
        }
      }

      const allMembers = members.some((m) => m.id === authUser.id)
        ? members
        : [{ id: authUser.id, displayName: 'You', username: null, avatar: null, nickname: '' }, ...members];

      await supabase.from('neighborhood_members').insert(
        allMembers.map((m) => ({
          neighborhood_id: hood.id,
          user_id: m.id,
          nickname: m.nickname.trim() || null,
        }))
      );

      markHoodSeen(hood.id);
      await refreshProfile();
      onClose();
      router.push(`/neighborhoods/${hood.id}`);
      return;
    }

    // ── Edit mode ────────────────────────────────────────────────────────────
    if (!neighborhoodId) { setSaving(false); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = { name: name.trim(), emoji, description: description.trim() || null };

    if (iconMode === 'photo') {
      const photoUrl = await uploadPhoto(neighborhoodId);
      if (photoUrl) {
        updates.photo_url = photoUrl;
      }
      // if no new file but photoPreview still set, existing photo_url is unchanged — don't touch it
    } else {
      // emoji mode — clear any stored photo so the emoji becomes the icon
      updates.photo_url = null;
    }

    const { error: updateErr } = await supabase
      .from('neighborhoods')
      .update(updates)
      .eq('id', neighborhoodId);

    if (updateErr) {
      setError(updateErr.message ?? 'Could not update neighborhood');
      setSaving(false);
      return;
    }

    const newIds = new Set(members.map((m) => m.id));

    const toRemove = [...originalMemberIds].filter(
      (id) => !newIds.has(id) && id !== authUser.id
    );
    if (toRemove.length) {
      await supabase
        .from('neighborhood_members')
        .delete()
        .eq('neighborhood_id', neighborhoodId)
        .in('user_id', toRemove);
    }

    const toAdd = members.filter((m) => !originalMemberIds.has(m.id));
    if (toAdd.length) {
      await supabase.from('neighborhood_members').insert(
        toAdd.map((m) => ({
          neighborhood_id: neighborhoodId,
          user_id: m.id,
          nickname: m.nickname.trim() || null,
        }))
      );
    }

    await Promise.all(
      members
        .filter((m) => originalMemberIds.has(m.id))
        .map((m) =>
          supabase
            .from('neighborhood_members')
            .update({ nickname: m.nickname.trim() || null })
            .eq('neighborhood_id', neighborhoodId)
            .eq('user_id', m.id)
        )
    );

    await refreshProfile();
    setSaving(false);
    onSaved?.();
    onClose();
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const isMe = (id: string) => id === authUser?.id;

  const iconPreview = iconMode === 'photo' && photoPreview
    ? <img src={photoPreview} alt="Group" className="w-full h-full object-cover" />
    : <span className="text-3xl">{emoji}</span>;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-nav-bg/80 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-x-4 top-[5%] z-50 bg-paper-dark border border-rule shadow-2xl max-w-sm mx-auto max-h-[90vh] flex flex-col rounded-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-nav-bg shrink-0">
          <p className="font-display font-bold text-ink text-base">
            {mode === 'create' ? '🏘️ New Neighborhood' : '✏️ Edit Neighborhood'}
          </p>
          <button onClick={onClose} className="text-ink/60 hover:text-ink transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-5 flex flex-col gap-5">
          {loadingData ? (
            <div className="flex items-center justify-center py-12 text-ink-faint text-sm italic">
              Loading…
            </div>
          ) : (
            <>
              {/* Preview + Name row */}
              <div className="flex items-center gap-4">
                {/* Live icon preview — read-only, shows result of current selection */}
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl border-2 border-rule overflow-hidden shrink-0 bg-paper">
                  {iconPreview}
                </div>

                <div className="flex-1 min-w-0">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ink-faint block mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && save()}
                    placeholder="e.g. Sunday Crew"
                    autoFocus={mode === 'create'}
                    className="w-full border border-rule focus:border-masthead bg-paper py-2.5 px-3 text-sm text-ink placeholder-ink-faint outline-none transition-colors rounded-lg"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-faint block mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this group about? Who's in it?"
                  maxLength={280}
                  rows={3}
                  className="w-full border border-rule focus:border-masthead bg-paper py-2.5 px-3 text-sm text-ink placeholder-ink-faint outline-none transition-colors rounded-lg resize-none leading-relaxed"
                />
                {description.length > 200 && (
                  <p className="text-right text-[10px] text-ink-faint mt-0.5">{280 - description.length} left</p>
                )}
              </div>

              {/* Icon mode toggle */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-faint block mb-2">
                  Group Icon
                </label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setIconMode('emoji')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                      iconMode === 'emoji'
                        ? 'border-masthead bg-masthead/10 text-masthead'
                        : 'border-rule text-ink-faint hover:border-ink-muted hover:text-ink'
                    }`}
                  >
                    Emoji
                  </button>
                  <button
                    type="button"
                    onClick={() => setIconMode('photo')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                      iconMode === 'photo'
                        ? 'border-masthead bg-masthead/10 text-masthead'
                        : 'border-rule text-ink-faint hover:border-ink-muted hover:text-ink'
                    }`}
                  >
                    Photo
                  </button>
                </div>

                {/* Emoji picker */}
                {iconMode === 'emoji' && (
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_OPTIONS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => setEmoji(e)}
                        className={`flex items-center justify-center h-9 w-9 text-xl rounded-lg border transition-all ${
                          emoji === e
                            ? 'border-masthead bg-paper-dark scale-110'
                            : 'border-rule hover:border-ink-muted'
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}

                {/* Photo upload */}
                {iconMode === 'photo' && (
                  <label className="block cursor-pointer">
                    <div className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors overflow-hidden ${
                      photoPreview ? 'border-masthead/40 h-32' : 'border-rule hover:border-masthead h-24'
                    }`}>
                      {photoPreview ? (
                        <img src={photoPreview} alt="Group" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Camera size={22} className="text-ink-faint" />
                          <span className="text-xs text-ink-faint">Tap to upload a photo</span>
                        </>
                      )}
                    </div>
                    {photoPreview && (
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setPhotoPreview(null); setPhotoFile(null); }}
                        className="mt-1.5 text-[11px] text-ink-faint hover:text-masthead transition-colors w-full text-center"
                      >
                        Remove photo
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Members */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-faint block mb-2">
                  Members
                </label>

                <div className="flex flex-col gap-2 mb-3">
                  {members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-2.5 bg-paper rounded-lg border border-rule px-3 py-2"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-paper-dark shrink-0 text-sm overflow-hidden">
                        {m.avatar && m.avatar.startsWith('http') ? (
                          <img src={m.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span>{m.avatar ?? m.displayName.slice(0, 1).toUpperCase()}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <p className="text-xs font-semibold text-ink truncate leading-none">
                          {m.displayName}
                          {isMe(m.id) && (
                            <span className="ml-1 text-[9px] text-ink/40 font-normal">(you)</span>
                          )}
                        </p>
                        <input
                          type="text"
                          value={m.nickname}
                          onChange={(e) => updateNickname(m.id, e.target.value)}
                          placeholder="Group nickname…"
                          maxLength={32}
                          className="w-full bg-transparent border-b border-rule/40 focus:border-field text-[11px] text-field placeholder-ink/25 outline-none pb-0.5 transition-colors"
                        />
                      </div>

                      {!isMe(m.id) && (
                        <button
                          type="button"
                          onClick={() => removeMember(m.id)}
                          className="shrink-0 text-ink/25 hover:text-masthead transition-colors"
                          title="Remove from group"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Search to add */}
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 pointer-events-none"
                  />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search people to add…"
                    className="w-full border border-rule focus:border-field bg-paper pl-9 pr-3 py-2 text-sm text-ink placeholder-ink-faint outline-none transition-colors rounded-lg"
                  />
                </div>

                {(results.length > 0 || searching) && (
                  <div className="mt-1 border border-rule rounded-lg bg-paper overflow-hidden">
                    {searching && (
                      <p className="px-3 py-2.5 text-xs text-ink-faint italic">Searching…</p>
                    )}
                    {results.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => addMember(p)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-paper-dark transition-colors border-b border-rule/40 last:border-0 text-left"
                      >
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-paper-dark shrink-0 text-sm overflow-hidden">
                          {p.avatar && p.avatar.startsWith('http') ? (
                            <img src={p.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span>
                              {p.avatar ??
                                (p.display_name ?? p.username ?? '?')
                                  .slice(0, 1)
                                  .toUpperCase()}
                            </span>
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
                        <UserPlus size={14} className="text-ink-faint shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                {query.trim().length >= 2 && !searching && results.length === 0 && (
                  <p className="mt-1.5 text-[11px] text-ink-faint italic px-1">
                    No users found for &ldquo;{query}&rdquo;
                  </p>
                )}
              </div>

              {error && (
                <p className="text-xs text-red-400 px-2 py-1.5 bg-red-400/10 border border-red-400/30 rounded-lg">
                  {error}
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-rule bg-paper-dark px-5 py-4">
          <button
            type="button"
            onClick={save}
            disabled={!name.trim() || saving || loadingData}
            className="w-full flex items-center justify-center gap-2 bg-masthead text-[#12111a] py-3 text-xs font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed rounded-full btn-3d hover:bg-masthead/90 transition-colors"
          >
            <Check size={14} />
            {saving
              ? mode === 'create' ? 'Creating…' : 'Saving…'
              : mode === 'create'
              ? `Create${members.length > 1 ? ` with ${members.length} people` : ''}`
              : 'Save Changes'}
          </button>
        </div>
      </div>
    </>
  );
}
