'use client';

import { useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ALL_TEAMS } from '@/lib/teams-data';
import CreateNeighborhoodModal from '@/components/CreateNeighborhoodModal';
import FindNeighborsModal from '@/components/FindNeighborsModal';
import FollowTeamsModal from '@/components/FollowTeamsModal';

const HIDDEN_ON = ['/login', '/onboarding'];

interface TooltipInfo {
  emoji?: string;
  label: string;
  sub1?: string;
  sub2?: string;
  y: number;
}

export default function PersistentSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showFindNeighbors, setShowFindNeighbors] = useState(false);
  const [showFollowTeams, setShowFollowTeams] = useState(false);

  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;
  if (!authUser) return null;

  const showTip = (e: React.MouseEvent, info: Omit<TooltipInfo, 'y'>) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltip({ ...info, y: rect.top + rect.height / 2 });
  };
  const hideTip = () => {
    hideTimer.current = setTimeout(() => setTooltip(null), 80);
  };

  const avatar = authUser.profile?.avatar;
  const displayName = authUser.profile?.display_name ?? authUser.profile?.username ?? '';
  const initials = displayName.slice(0, 2).toUpperCase() || '?';

  const neighborhoods = authUser.neighborhoodMemberships ?? [];
  const teams = authUser.teams ?? [];
  const leagues = authUser.leagues ?? [];

  return (
    <>
      <aside className="w-[68px] shrink-0 bg-nav-bg border-r border-rule flex flex-col items-center py-4 gap-2 overflow-y-auto overflow-x-visible">
        {/* User avatar */}
        <button
          onClick={() => router.push('/stoop')}
          onMouseEnter={(e) => showTip(e, { label: displayName || 'Your Stoop', sub1: 'View your profile' })}
          onMouseLeave={hideTip}
          className="flex items-center justify-center w-11 h-11 rounded-full overflow-hidden border-2 border-rule hover:border-masthead transition-colors shrink-0"
        >
          {avatar && avatar.startsWith('http') ? (
            <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-base leading-none">{avatar || initials}</span>
          )}
        </button>

        {/* Find neighbors + button — below avatar */}
        <button
          onClick={() => setShowFindNeighbors(true)}
          onMouseEnter={(e) => showTip(e, { label: 'Find Neighbors', sub1: 'Follow people' })}
          onMouseLeave={hideTip}
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
          return (
            <button
              key={hood.id}
              onClick={() => router.push(`/neighborhoods/${hood.id}`)}
              onMouseEnter={(e) => showTip(e, { emoji: hood.emoji, label: hood.name, sub1: 'Neighborhood' })}
              onMouseLeave={hideTip}
              className={`flex items-center justify-center w-11 h-11 rounded-2xl text-xl shrink-0 transition-all hover:rounded-[14px] ${
                isActive ? 'ring-2 ring-masthead rounded-[14px]' : ''
              }`}
              style={{ background: 'var(--color-paper-dark)' }}
            >
              {hood.emoji}
            </button>
          );
        })}

        {/* Create neighborhood + button — sits at end of Groups section */}
        <button
          onClick={() => setShowCreate(true)}
          onMouseEnter={(e) => showTip(e, { label: 'New Neighborhood', sub1: 'Create a group' })}
          onMouseLeave={hideTip}
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
              onMouseEnter={(e) => showTip(e, {
                emoji: team?.emoji ?? '🏅',
                label: team ? `${team.city} ${team.name}` : t.team_id,
                sub1: team?.league,
              })}
              onMouseLeave={hideTip}
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
              onMouseEnter={(e) => showTip(e, { label: leagueId, sub1: 'League' })}
              onMouseLeave={hideTip}
              className="flex items-center justify-center w-11 h-11 rounded-full shrink-0 text-[10px] font-bold text-ink-muted transition-all hover:opacity-90"
              style={{ background: 'var(--color-paper-dark)' }}
            >
              {leagueTeam?.emoji ?? initial}
            </button>
          );
        })}

        {/* Follow teams/leagues + button — sits at end of Leagues section */}
        <button
          onClick={() => setShowFollowTeams(true)}
          onMouseEnter={(e) => showTip(e, { label: 'Follow Teams & Leagues', sub1: 'Browse & search' })}
          onMouseLeave={hideTip}
          className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 border border-dashed border-rule text-ink-faint hover:text-field hover:border-field transition-colors"
        >
          <Plus size={14} />
        </button>
      </aside>

      {showCreate && <CreateNeighborhoodModal onClose={() => setShowCreate(false)} />}
      {showFindNeighbors && <FindNeighborsModal onClose={() => setShowFindNeighbors(false)} />}
      {showFollowTeams && <FollowTeamsModal onClose={() => setShowFollowTeams(false)} />}

      {/* Hover tooltip */}
      {tooltip && (
        <div
          className="fixed left-[76px] z-50 pointer-events-none"
          style={{ top: tooltip.y, transform: 'translateY(-50%)' }}
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full border-4 border-transparent border-r-rule" />
          <div className="bg-nav-bg border border-rule shadow-2xl rounded-lg px-3 py-2.5 flex items-center gap-2.5 min-w-[140px] max-w-[220px]">
            {tooltip.emoji && <span className="text-2xl shrink-0 leading-none">{tooltip.emoji}</span>}
            <div className="min-w-0">
              <p className="font-display font-bold text-ink text-sm leading-tight whitespace-nowrap truncate">
                {tooltip.label}
              </p>
              {tooltip.sub1 && (
                <p className="text-[10px] text-ink-faint whitespace-nowrap">{tooltip.sub1}</p>
              )}
              {tooltip.sub2 && (
                <p className="text-[10px] text-ink-faint/70 whitespace-nowrap">{tooltip.sub2}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
