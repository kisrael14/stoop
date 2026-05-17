'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

const EMOJI_OPTIONS = ['🏘️','🏟️','🏈','🏀','⚾','⚽','🏒','🔥','⚡','🎯','🏆','🎪','🌆','🌃'];

type DbNeighborhood = {
  id: string;
  name: string;
  emoji: string;
  memberCount: number;
  created_by: string | null;
};

// ── Create Neighborhood Modal ────────────────────────────────────────────────

interface CreateModalProps {
  authUserId: string;
  onClose: () => void;
  onCreated: (hood: DbNeighborhood) => void;
}

function CreateNeighborhoodModal({ authUserId, onClose, onCreated }: CreateModalProps) {
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🏘️');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const router = useRouter();

  const createNeighborhood = async () => {
    if (!newName.trim()) return;
    setCreateError(null);
    setCreating(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any;
    try {
      const { data: hood, error: hoodErr } = await supabase
        .from('neighborhoods')
        .insert({ name: newName.trim(), emoji: newEmoji, created_by: authUserId })
        .select()
        .single();
      if (hoodErr) {
        setCreateError(hoodErr.message ?? 'Could not create neighborhood');
        setCreating(false);
        return;
      }
      if (hood) {
        const { error: memberErr } = await supabase
          .from('neighborhood_members')
          .insert({ neighborhood_id: hood.id, user_id: authUserId });
        if (memberErr) {
          setCreateError(memberErr.message ?? 'Neighborhood created but could not add you as member');
          setCreating(false);
          return;
        }
        onCreated({ id: hood.id, name: hood.name, emoji: hood.emoji, memberCount: 1, created_by: authUserId });
        router.push(`/neighborhoods/${hood.id}`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unexpected error';
      setCreateError(msg);
    }
    setCreating(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-nav-bg/80 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/4 z-50 bg-paper-dark border border-rule shadow-2xl max-w-sm mx-auto">
        <div className="flex items-center justify-between px-5 py-4 bg-nav-bg">
          <p className="font-display font-bold text-ink text-base">New Neighborhood</p>
          <button onClick={onClose} className="text-ink/60 hover:text-ink">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-5 flex flex-col gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-ink-faint block mb-1.5">Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createNeighborhood()}
              placeholder="e.g. Sunday Crew"
              autoFocus
              className="w-full border border-rule focus:border-masthead bg-paper py-2.5 px-3 text-sm text-ink placeholder-ink-faint outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-ink-faint block mb-1.5">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setNewEmoji(e)}
                  className={`flex items-center justify-center h-9 w-9 text-xl rounded-lg border transition-all ${
                    newEmoji === e ? 'border-masthead bg-paper-dark' : 'border-rule hover:border-ink-muted'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          {createError && (
            <p className="text-xs text-red-400 text-center px-2 py-1.5 bg-red-400/10 border border-red-400/30 rounded">{createError}</p>
          )}
          <button
            onClick={createNeighborhood}
            disabled={!newName.trim() || creating}
            className="w-full bg-masthead text-[#12111a] py-3 font-bold uppercase tracking-widest text-xs btn-3d disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating…' : 'Create Neighborhood'}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Main Home Feed ────────────────────────────────────────────────────────────

interface HomeFeedProps {
  authUser: ReturnType<typeof useAuth>['user'];
  neighborhoods: DbNeighborhood[];
  loading: boolean;
  onCreateClick: () => void;
}

function HomeFeed({ authUser, neighborhoods, loading, onCreateClick }: HomeFeedProps) {
  const recentNeighborhoods = [...neighborhoods].slice(0, 3);

  if (!authUser) return null;

  return (
    <div className="flex flex-col pb-24">
      {/* Masthead */}
      <div className="px-4 pt-6 pb-4 border-b border-rule">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-ink/40 mb-1">Stoop Sports</p>
        <h1 className="font-display text-2xl font-black text-ink leading-none">🏘 Neighborhoods</h1>
      </div>

      {/* Neighborhood grid */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-ink-faint text-sm">Loading…</div>
        ) : neighborhoods.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <p className="text-4xl">🏘️</p>
            <p className="font-display font-bold text-ink text-lg">No neighborhoods yet</p>
            <p className="text-sm text-ink-muted italic">Create or join a neighborhood to start chatting</p>
            <button
              onClick={onCreateClick}
              className="mt-2 flex items-center gap-1.5 bg-masthead text-[#12111a] px-5 py-2.5 text-xs font-bold uppercase tracking-wider btn-3d rounded-full"
            >
              <Plus size={14} />
              Create One
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 border-l border-t border-rule">
            {neighborhoods.map((hood) => (
              <Link
                key={hood.id}
                href={`/neighborhoods/${hood.id}`}
                className="border-r border-b border-rule bg-paper-dark hover:bg-paper-deeper transition-colors block"
              >
                <div className="bg-nav-bg px-3 py-3">
                  <div className="flex items-start gap-2">
                    <span className="text-2xl leading-none mt-0.5 shrink-0">{hood.emoji}</span>
                    <div className="min-w-0">
                      <p className="font-display font-bold text-ink text-sm leading-tight">{hood.name}</p>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-ink/50 mt-0.5">
                        {hood.memberCount} member{hood.memberCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-rule/60 px-3 py-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-masthead">Open Chat →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Jump Back In section */}
      {recentNeighborhoods.length > 0 && (
        <div className="px-4 pb-4">
          <div className="border-t border-rule pt-4 mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-faint">Jump Back In</p>
          </div>
          <div className="flex flex-col gap-2">
            {recentNeighborhoods.map((hood) => (
              <Link
                key={hood.id}
                href={`/neighborhoods/${hood.id}`}
                className="flex items-center gap-3 px-3 py-2.5 bg-paper-dark border border-rule hover:bg-paper-deeper transition-colors"
              >
                <span className="text-xl shrink-0">{hood.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink text-sm leading-tight truncate">{hood.name}</p>
                  <p className="text-[10px] text-ink-faint">{hood.memberCount} member{hood.memberCount !== 1 ? 's' : ''}</p>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-masthead shrink-0">Chat →</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* + New Neighborhood row */}
      {neighborhoods.length > 0 && (
        <div className="px-4 pb-4">
          <button
            onClick={onCreateClick}
            className="w-full flex items-center justify-center gap-2 border border-dashed border-rule py-3 text-xs font-bold uppercase tracking-wider text-ink-faint hover:text-masthead hover:border-masthead transition-colors"
          >
            <Plus size={14} />
            New Neighborhood
          </button>
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const [neighborhoods, setNeighborhoods] = useState<DbNeighborhood[]>([]);
  const [hoodsLoading, setHoodsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Redirect unauthenticated users to /login
  useEffect(() => {
    if (!authLoading && !authUser && !isSupabaseConfigured()) {
      router.push('/login');
    }
  }, [authLoading, authUser, router]);

  // Also redirect if Supabase is configured but no user after loading
  useEffect(() => {
    if (!authLoading && !authUser && isSupabaseConfigured()) {
      router.push('/login');
    }
  }, [authLoading, authUser, router]);

  // Load neighborhoods
  useEffect(() => {
    if (!authUser || !isSupabaseConfigured()) return;
    setHoodsLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any;
    const load = async () => {
      try {
        const { data: memberRows, error: memberErr } = await supabase
          .from('neighborhood_members')
          .select('neighborhood_id')
          .eq('user_id', authUser.id);
        if (memberErr || !memberRows?.length) { setHoodsLoading(false); return; }

        const hoodIds = memberRows.map((m: { neighborhood_id: string }) => m.neighborhood_id);
        const [{ data: hoodData, error: hoodErr }, { data: allMembers }] = await Promise.all([
          supabase.from('neighborhoods').select('id, name, emoji, created_by').in('id', hoodIds),
          supabase.from('neighborhood_members').select('neighborhood_id').in('neighborhood_id', hoodIds),
        ]);
        if (hoodErr) { setHoodsLoading(false); return; }

        const countMap: Record<string, number> = {};
        (allMembers ?? []).forEach((m: { neighborhood_id: string }) => {
          countMap[m.neighborhood_id] = (countMap[m.neighborhood_id] ?? 0) + 1;
        });

        setNeighborhoods(
          (hoodData ?? []).map((h: { id: string; name: string; emoji: string; created_by: string | null }) => ({
            id: h.id, name: h.name, emoji: h.emoji,
            memberCount: countMap[h.id] ?? 0,
            created_by: h.created_by ?? null,
          }))
        );
      } catch (e) {
        console.error('Home neighborhoods load error:', e);
      }
      setHoodsLoading(false);
    };
    load();
  }, [authUser?.id]);

  if (authLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-paper">
        <div className="flex gap-1.5">
          {[0, 150, 300].map((d) => (
            <span
              key={d}
              className="h-1.5 w-1.5 rounded-full bg-masthead animate-bounce"
              style={{ animationDelay: `${d}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!authUser) return null;

  return (
    <main className="flex-1 overflow-y-auto">
      <HomeFeed
        authUser={authUser}
        neighborhoods={neighborhoods}
        loading={hoodsLoading}
        onCreateClick={() => setShowCreateModal(true)}
      />

      {showCreateModal && authUser && (
        <CreateNeighborhoodModal
          authUserId={authUser.id}
          onClose={() => setShowCreateModal(false)}
          onCreated={(hood) => {
            setNeighborhoods((prev) => [hood, ...prev]);
            setShowCreateModal(false);
          }}
        />
      )}
    </main>
  );
}
