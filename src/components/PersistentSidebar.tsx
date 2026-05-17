'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ALL_TEAMS } from '@/lib/teams-data';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import NeighborhoodFormModal from '@/components/NeighborhoodFormModal';
import FindNeighborsModal from '@/components/FindNeighborsModal';
import FollowTeamsModal from '@/components/FollowTeamsModal';

const HIDDEN_ON = ['/login', '/onboarding'];

export function markHoodSeen(hoodId: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`hood-seen-${hoodId}`, new Date().toISOString());
  }
}

export default function PersistentSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [showFindNeighbors, setShowFindNeighbors] = useState(false);
  const [showFollowTeams, setShowFollowTeams] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const loadUnreads = useCallback(async () => {
    if (!authUser || !isSupabaseConfigured()) return;
    const hoods = authUser.neighborhoodMemberships ?? [];
    if (!hoods.length) return;

    const hoodIds = hoods.map((h) => h.id);
    const lastSeenMap: Record<string, string> = {};
    hoodIds.forEach((id) => {
      lastSeenMap[id] = localStorage.getItem(`hood-seen-${id}`) ?? new Date(0).toISOString();
    });

    const oldest = Object.values(lastSeenMap).reduce((min, v) => (v < min ? v : min));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any;
    const { data } = await supabase
      .from('messages')
      .select('neighborhood_id, created_at')
      .in('neighborhood_id', hoodIds)
      .gt('created_at', oldest)
      .neq('user_id', authUser.id);

    const counts: Record<string, number> = {};
    (data ?? []).forEach((msg: { neighborhood_id: string; created_at: string }) => {
      if (msg.created_at > lastSeenMap[msg.neighborhood_id]) {
        counts[msg.neighborhood_id] = (counts[msg.neighborhood_id] ?? 0) + 1;
      }
    });
    setUnreadCounts(counts);
  }, [authUser?.id, (authUser?.neighborhoodMemberships ?? []).map((h) => h.id).join(',')]);

  useEffect(() => {
    loadUnreads();
  }, [pathname, loadUnreads]);

  const hidden = HIDDEN_ON.some((p) => pathname.startsWith(p));
  if (hidden || !authUser) return null;

  const avatar = authUser.profile?.avatar;
  const displayName = authUser.profile?.display_name ?? authUser.profile?.username ?? '';
  const initials = displayName.slice(0, 2).toUpperCase() || '?';

  const neighborhoods = authUser.neighborhoodMemberships ?? [];
  const teams = authUser.teams ?? [];
  const leagues = authUser.leagues ?? [];

  return (
    <>
      <aside className="w-[68px] shrink-0 h-full bg-nav-bg border-r border-rule flex flex-col items-center pt-4 pb-20 gap-2 overflow-y-auto">
        {/* User avatar */}
        <button
          onClick={() => router.push('/stoop')}
          className="flex items-center justify-center w-11 h-11 rounded-full overflow-hidden border-2 border-rule hover:border-masthead transition-colors shrink-0"
        >
          {avatar && avatar.startsWith('http') ? (
            <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-base leading-none">{avatar || initials}</span>
          )}
        </button>

        {/* Find neighbors + button */}
        <button
          onClick={() => setShowFindNeighbors(true)}
          className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 border border-dashed border-rule text-ink-faint hover:text-masthead hover:border-masthead transition-colors"
        >
          <Plus size={14} />
        </button>

        {/* Groups section */}
        <div className="w-full flex flex-col items-center gap-1 shrink-0 pt-1">
          <div className="w-8 h-px bg-rule" />
          <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-ink/35">Groups</p>
        </div>

        {neighborhoods.map((hood) => {
          const isActive = pathname.includes(hood.id);
          const unread = isActive ? 0 : (unreadCounts[hood.id] ?? 0);
          return (
            <button
              key={hood.id}
              onClick={() => router.push(`/neighborhoods/${hood.id}`)}
              className={`relative flex items-center justify-center w-11 h-11 rounded-2xl text-xl shrink-0 transition-all hover:rounded-[14px] overflow-hidden ${
                isActive ? 'ring-2 ring-masthead rounded-[14px]' : ''
              }`}
              style={{ background: 'var(--color-paper-dark)' }}
            >
              {hood.photo_url ? (
                <img src={hood.photo_url} alt={hood.name} className="w-full h-full object-cover" />
              ) : (
                hood.emoji
              )}
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-masthead text-[#12111a] text-[9px] font-black leading-none shadow-md">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </button>
          );
        })}

        {/* Create neighborhood + button */}
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 border border-dashed border-rule text-ink-faint hover:text-masthead hover:border-masthead transition-colors"
        >
          <Plus size={14} />
        </button>

        {/* Teams section */}
        <div className="w-full flex flex-col items-center gap-1 shrink-0 pt-1">
          <div className="w-8 h-px bg-rule" />
          <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-ink/35">Teams</p>
        </div>

        {teams.map((t) => {
          const team = ALL_TEAMS.find((tm) => tm.id === t.team_id);
          return (
            <button
              key={t.team_id}
              onClick={() => router.push(`/teams/${t.team_id}`)}
              className="flex items-center justify-center w-11 h-11 rounded-full shrink-0 transition-all hover:opacity-90"
              style={{ background: 'var(--color-paper-dark)' }}
            >
              <span className="text-lg leading-none">{team?.emoji ?? '🏅'}</span>
            </button>
          );
        })}

        {/* Leagues section */}
        <div className="w-full flex flex-col items-center gap-1 shrink-0 pt-1">
          <div className="w-8 h-px bg-rule" />
          <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-ink/35">Leagues</p>
        </div>

        {leagues.map((leagueId) => {
          const leagueTeam = ALL_TEAMS.find((tm) => tm.league === leagueId);
          const initial = leagueId.slice(0, 2).toUpperCase();
          return (
            <button
              key={leagueId}
              onClick={() => router.push(`/leagues/${leagueId}`)}
              className="flex items-center justify-center w-11 h-11 rounded-full shrink-0 text-[10px] font-bold text-ink-muted transition-all hover:opacity-90"
              style={{ background: 'var(--color-paper-dark)' }}
            >
              {leagueTeam?.emoji ?? initial}
            </button>
          );
        })}

        {/* Follow teams/leagues + button */}
        <button
          onClick={() => setShowFollowTeams(true)}
          className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 border border-dashed border-rule text-ink-faint hover:text-field hover:border-field transition-colors"
        >
          <Plus size={14} />
        </button>
      </aside>

      {showCreate && (
        <NeighborhoodFormModal mode="create" onClose={() => setShowCreate(false)} />
      )}
      {showFindNeighbors && <FindNeighborsModal onClose={() => setShowFindNeighbors(false)} />}
      {showFollowTeams && <FollowTeamsModal onClose={() => setShowFollowTeams(false)} />}
    </>
  );
}
