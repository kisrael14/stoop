'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Flame, Swords, Handshake, Bell, BellOff, PenLine, Newspaper } from 'lucide-react';
import { ME, DEBATES, BETS, HOT_TAKES, ANALYSES, getUserById, CHATS } from '@/lib/mock-data';
import { timeAgo, totalReactions, teamDisplayName } from '@/lib/utils';
import type { FandomLevel, FanTeam } from '@/lib/types';
import { requestNotificationPermission, startSimulatedNotifications } from '@/lib/notifications';
import { computeBadges } from '@/lib/badges';
import BadgeChip from '@/components/BadgeChip';
import TeamLogo from '@/components/TeamLogo';
import { useAuth } from '@/lib/auth-context';
import { ALL_TEAMS } from '@/lib/teams-data';

function mapFandomLevel(level: string | null): FandomLevel {
  if (!level) return 'casual';
  if (level === 'die-hard' || level === 'diehard') return 'diehard';
  if (level === 'super-fan' || level === 'supporter') return 'supporter';
  if (level === 'fan') return 'supporter';
  if (level === 'fair-weather') return 'fair-weather';
  return 'casual';
}

export default function StoopPage() {
  const { user: authUser } = useAuth();
  const [notifStatus, setNotifStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifStatus(Notification.permission === 'granted' ? 'granted' : Notification.permission === 'denied' ? 'denied' : 'unknown');
    }
  }, []);

  const enableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotifStatus(granted ? 'granted' : 'denied');
    if (granted) startSimulatedNotifications();
  };

  // ── Profile data: real auth user when available, mock ME as fallback ──
  const isRealUser = !!authUser?.profile;
  const displayName  = authUser?.profile?.display_name ?? ME.displayName;
  const username     = authUser?.profile?.username     ?? ME.username;
  const avatar       = authUser?.profile?.avatar       ?? ME.avatar;
  const bio          = authUser?.profile?.bio          ?? ME.bio;

  // Teams: map from auth user's Supabase user_teams, fall back to mock
  const fanTeams: FanTeam[] = (() => {
    if (isRealUser && authUser?.teams) {
      return authUser.teams
        .map((ut, i): FanTeam | null => {
          const team = ALL_TEAMS.find((t) => t.id === ut.team_id);
          if (!team) return null;
          return { team, rank: i + 1, fandomLevel: mapFandomLevel(ut.fandom_level) };
        })
        .filter((x): x is FanTeam => x !== null);
    }
    return ME.fanTeams;
  })();

  // Counts from Supabase for real users, mock counts as fallback
  const followerCount  = isRealUser ? (authUser.followerCount  ?? 0) : ME.followerIds.length;
  const followingCount = isRealUser ? (authUser.followingCount ?? 0) : ME.followingIds.length;

  // Stats: real users start at 0 until a stats DB is wired up
  const stats = isRealUser ? {
    debatesWon: 0, debatesLost: 0, debatesDrew: 0,
    betsWon: 0, betsLost: 0, betsPending: 0,
    hotTakesPosted: 0, hotTakeReactions: 0,
  } : ME.stats;

  const myTeamIds = fanTeams.map((ft) => ft.team.id);
  const myDebates = DEBATES.filter((d) => d.side1UserIds.includes('me') || d.side2UserIds.includes('me')).slice(0, 3);
  const myBets = BETS.filter((b) => b.participantIds.includes('me')).slice(0, 2);
  const myHotTakes = HOT_TAKES.filter((h) => h.authorId === 'me' || h.teamIds.some((t) => myTeamIds.includes(t))).slice(0, 2);

  type NeighborhoodDisplay = { id: string; name: string; emoji: string; memberCount?: number };

  const myNeighborhoods: NeighborhoodDisplay[] = (() => {
    if (isRealUser && authUser?.neighborhoodMemberships != null) {
      return authUser.neighborhoodMemberships;
    }
    return CHATS.filter((c) => c.memberIds.includes('me'))
      .sort((a, b) => {
        const aTime = a.messages[a.messages.length - 1]?.timestamp ?? '0';
        const bTime = b.messages[b.messages.length - 1]?.timestamp ?? '0';
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      })
      .map((c) => ({ id: c.id, name: c.name, emoji: c.emoji, memberCount: c.memberIds.length }));
  })();

  // "From The Streets" — public content filtered to user's followed teams
  const streetsHotTakes = HOT_TAKES.filter((h) => h.isPublic && h.teamIds.some((t) => myTeamIds.includes(t)));
  const streetsDebates = DEBATES.filter((d) => d.isPublic && d.teamIds.some((t) => myTeamIds.includes(t)));
  const streetsAnalyses = ANALYSES.filter((a) => a.isPublic && a.teamIds.some((t) => myTeamIds.includes(t)));
  const streetsFeed = [
    ...streetsHotTakes.map((ht) => ({ type: 'take' as const, time: ht.createdAt, item: ht })),
    ...streetsDebates.map((d) => ({ type: 'debate' as const, time: d.createdAt, item: d })),
    ...streetsAnalyses.map((a) => ({ type: 'analysis' as const, time: a.createdAt, item: a })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 6);

  const badges = computeBadges('me');
  const debatePct = (stats.debatesWon + stats.debatesLost) > 0
    ? Math.round((stats.debatesWon / (stats.debatesWon + stats.debatesLost)) * 100)
    : 0;
  const betPct = (stats.betsWon + stats.betsLost) > 0
    ? Math.round((stats.betsWon / (stats.betsWon + stats.betsLost)) * 100)
    : 0;

  return (
    <div className="flex flex-col bg-paper min-h-full pb-4">

      {/* ── MASTHEAD ──────────────────────────────────────── */}
      {/* nav-bg stays dark in both themes — all text explicitly white-based for legibility */}
      <div className="bg-nav-bg px-5 pt-12 pb-5">
        {/* Top controls */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/onboarding" className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-colors" title="Edit profile">
            <Settings size={16} />
          </Link>
          {/* Spacer for TopChatButton (top-right area) */}
          <div className="w-10" />
        </div>

        {/* Profile row */}
        <div className="flex items-center gap-4 mb-4">
          <Link href="/users/me" className="relative shrink-0">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-4xl ring-2 ring-masthead hover:ring-masthead/60 transition-all">
              {avatar}
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-black text-white leading-tight">{displayName}</h1>
            <p className="text-[11px] font-mono text-white/55">@{username}</p>
            {bio && <p className="text-xs text-white/70 italic mt-0.5 line-clamp-2">{bio}</p>}
          </div>
        </div>

        {/* Trophy Room — 4-col grid, full width */}
        {badges.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {badges.map((badge) => (
              <BadgeChip key={badge.type} badge={badge} size="xs" />
            ))}
          </div>
        )}

        {/* Unified stats + bragging rights grid */}
        <div className="mt-4 border border-white/20">
          {/* Row 1 — social stats */}
          <div className="grid grid-cols-4 divide-x divide-white/20">
            <Link href="/neighbors" className="flex flex-col items-center py-2 hover:bg-white/10 transition-colors">
              <p className="font-display text-lg font-bold leading-none text-white">{followingCount}</p>
              <p className="text-[7px] font-bold uppercase tracking-wider text-white/60 mt-0.5">Neighbors</p>
            </Link>
            <Link href="/followers" className="flex flex-col items-center py-2 hover:bg-white/10 transition-colors">
              <p className="font-display text-lg font-bold leading-none text-white">{followerCount}</p>
              <p className="text-[7px] font-bold uppercase tracking-wider text-white/60 mt-0.5">Following</p>
            </Link>
            <Link href="/neighborhoods" className="flex flex-col items-center py-2 hover:bg-white/10 transition-colors">
              <p className="font-display text-lg font-bold leading-none text-white">{myNeighborhoods.length}</p>
              <p className="text-[7px] font-bold uppercase tracking-wider text-white/60 mt-0.5">Neighborhoods</p>
            </Link>
            <div className="flex flex-col items-center py-2">
              <p className="font-display text-lg font-bold leading-none text-white">{stats.hotTakeReactions}</p>
              <p className="text-[7px] font-bold uppercase tracking-wider text-white/60 mt-0.5">Reactions</p>
            </div>
          </div>
          {/* Row 2 — activity stats */}
          <div className="grid grid-cols-3 divide-x divide-white/20 border-t border-white/20">
            <Link href="/neighborhoods" className="flex flex-col items-center py-2 gap-0.5 hover:bg-white/10 transition-colors">
              <Swords size={10} className="text-white/60" />
              <p className="font-display text-base font-black text-masthead leading-none">{debatePct}%</p>
              <p className="text-[7px] font-bold text-white/60 leading-none">{stats.debatesWon}W · {stats.debatesLost}L</p>
              <p className="text-[7px] font-bold uppercase tracking-wide text-white/70">Debates</p>
            </Link>
            <Link href="/neighborhoods" className="flex flex-col items-center py-2 gap-0.5 hover:bg-white/10 transition-colors">
              <Handshake size={10} className="text-white/60" />
              <p className="font-display text-base font-black text-masthead leading-none">{betPct}%</p>
              <p className="text-[7px] font-bold text-white/60 leading-none">{stats.betsWon}W · {stats.betsLost}L</p>
              <p className="text-[7px] font-bold uppercase tracking-wide text-white/70">Bets</p>
            </Link>
            <div className="flex flex-col items-center py-2 gap-0.5">
              <Flame size={10} className="text-masthead" />
              <p className="font-display text-base font-black text-masthead leading-none">{stats.hotTakesPosted}</p>
              <p className="text-[7px] font-bold uppercase tracking-wide text-white/70">Hot Takes</p>
            </div>
          </div>
        </div>

      </div>

      {/* Notification banner */}
      {notifStatus === 'unknown' && (
        <div className="mx-4 mt-3 flex items-center gap-3 border border-rule bg-paper-dark px-4 py-2.5 rounded-xl">
          <Bell size={15} className="text-press shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-ink">Enable notifications</p>
            <p className="text-[10px] text-ink-muted">Never miss a debate or bet</p>
          </div>
          <button onClick={enableNotifications} className="shrink-0 bg-nav-bg text-ink rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide hover:bg-paper-dark transition-colors btn-3d">
            Enable
          </button>
        </div>
      )}
      {notifStatus === 'granted' && (
        <div className="mx-4 mt-3 flex items-center gap-2 border border-field/40 bg-field/5 px-4 py-2 rounded-xl">
          <Bell size={12} className="text-field" />
          <p className="text-[10px] text-field font-bold">Notifications enabled</p>
        </div>
      )}
      {notifStatus === 'denied' && (
        <div className="mx-4 mt-3 flex items-center gap-2 border border-rule bg-paper-dark px-4 py-2 rounded-xl">
          <BellOff size={12} className="text-ink-faint" />
          <p className="text-[10px] text-ink-faint">Notifications blocked — enable in browser settings</p>
        </div>
      )}

      {/* ── MY NEIGHBORHOOD ────────────────────────────────── */}
      <div className="mx-4 mt-4 border border-rule">
        <div className="flex items-center justify-between px-3 py-2 bg-nav-bg">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-masthead">My Neighborhood</p>
          <Link href="/neighborhoods" className="text-[10px] font-bold text-press hover:text-press/80">See all →</Link>
        </div>

        <div className="divide-y divide-rule/60">
          {myDebates.map((debate) => {
            const side1First = getUserById(debate.side1UserIds[0]);
            const side2First = getUserById(debate.side2UserIds[0]);
            return (
              <Link
                key={debate.id}
                href={`/neighborhoods/${debate.chatId}?tab=debates`}
                className="flex gap-3 px-3 py-3 hover:bg-paper-dark transition-colors"
              >
                <div className="shrink-0 mt-0.5">
                  <div className="h-8 w-8 flex items-center justify-center bg-navy text-ink text-base rounded-sm">⚔️</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-navy mb-0.5">Debate · {debate.chatName}</p>
                  <p className="text-xs font-medium text-ink leading-snug line-clamp-2 italic">&ldquo;{debate.claim}&rdquo;</p>
                  <p className="text-[9px] text-ink-faint mt-1">
                    <span className="font-bold">{debate.side1Label ?? 'Side 1'}</span> {side1First?.displayName.split(' ')[0]}
                    {' '}<span className="text-rule-dark">vs</span>{' '}
                    <span className="font-bold">{debate.side2Label ?? 'Side 2'}</span> {side2First?.displayName.split(' ')[0]}
                    {' · '}{debate.votes.length} votes
                  </p>
                </div>
              </Link>
            );
          })}

          {myBets.map((bet) => {
            const p1 = getUserById(bet.participantIds[0]);
            const p2 = getUserById(bet.participantIds[1]);
            return (
              <Link
                key={bet.id}
                href={`/neighborhoods/${bet.chatId}?tab=bets`}
                className="flex gap-3 px-3 py-3 hover:bg-paper-dark transition-colors"
              >
                <div className="shrink-0 mt-0.5">
                  <div className="h-8 w-8 flex items-center justify-center bg-field text-ink text-base rounded-sm">🤝</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-field mb-0.5">Bet · {bet.chatName}</p>
                    <span className={`text-[9px] font-bold uppercase ml-auto ${bet.status === 'awaiting-resolution' ? 'text-rule-dark' : 'text-field'}`}>{bet.status}</span>
                  </div>
                  <p className="text-xs font-medium text-ink leading-snug line-clamp-2 italic">&ldquo;{bet.claim}&rdquo;</p>
                  <p className="text-[9px] text-ink-faint mt-1">{p1?.displayName.split(' ')[0]} 🤝 {p2?.displayName.split(' ')[0]}</p>
                </div>
              </Link>
            );
          })}

          {myHotTakes.map((ht) => {
            const author = getUserById(ht.authorId);
            return (
              <Link
                key={ht.id}
                href={`/neighborhoods/${ht.chatId}?tab=hot-takes`}
                className="flex gap-3 px-3 py-3 hover:bg-paper-dark transition-colors"
              >
                <div className="shrink-0 mt-0.5">
                  <div className="h-8 w-8 flex items-center justify-center bg-press text-ink text-base rounded-sm">🔥</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-press mb-0.5">Hot Take · {ht.chatName}</p>
                  <p className="text-xs font-medium text-ink leading-snug line-clamp-2 italic">&ldquo;{ht.content}&rdquo;</p>
                  <p className="text-[9px] text-ink-faint mt-1">{author?.displayName} · {totalReactions(ht.reactions)} reactions · {timeAgo(ht.createdAt)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── FROM THE STREETS ───────────────────────────────── */}
      {streetsFeed.length > 0 && (
        <div className="mx-4 mt-4 border border-rule">
          <div className="flex items-center justify-between px-3 py-2 bg-nav-bg">
            <div className="flex items-center gap-1.5">
              <Newspaper size={11} className="text-ink/60" />
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-masthead">From The Streets</p>
            </div>
            <Link href="/streets" className="text-[10px] font-bold text-press hover:text-press/80">The Streets →</Link>
          </div>
          <p className="px-3 py-1.5 text-[9px] text-ink-faint italic border-b border-rule/40">Public posts from your teams</p>
          <div className="divide-y divide-rule/60">
            {streetsFeed.map(({ type, item }) => {
              if (type === 'take') {
                const ht = item as typeof streetsHotTakes[0];
                const author = getUserById(ht.authorId);
                return (
                  <Link key={ht.id} href={`/neighborhoods/${ht.chatId}?tab=hot-takes`} className="flex gap-3 px-3 py-2.5 hover:bg-paper-dark transition-colors">
                    <div className="h-7 w-7 flex items-center justify-center bg-press/10 border border-press/30 text-sm rounded-sm shrink-0 mt-0.5">🔥</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-press mb-0.5">Hot Take · {ht.chatName}</p>
                      <p className="text-xs text-ink leading-snug line-clamp-2 italic">&ldquo;{ht.content}&rdquo;</p>
                      <p className="text-[9px] text-ink-faint mt-0.5">{author?.displayName} · {timeAgo(ht.createdAt)}</p>
                    </div>
                  </Link>
                );
              }
              if (type === 'debate') {
                const d = item as typeof streetsDebates[0];
                return (
                  <Link key={d.id} href={`/debates/${d.id}`} className="flex gap-3 px-3 py-2.5 hover:bg-paper-dark transition-colors">
                    <div className="h-7 w-7 flex items-center justify-center bg-navy/10 border border-navy/30 text-sm rounded-sm shrink-0 mt-0.5">⚔️</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-navy mb-0.5">Debate · {d.chatName}</p>
                      <p className="text-xs text-ink leading-snug line-clamp-2 italic">&ldquo;{d.claim}&rdquo;</p>
                      <p className="text-[9px] text-ink-faint mt-0.5">{d.votes.length} votes · {timeAgo(d.createdAt)}</p>
                    </div>
                  </Link>
                );
              }
              // analysis
              const a = item as typeof streetsAnalyses[0];
              const author = getUserById(a.authorId);
              return (
                <Link key={a.id} href={`/analyses/${a.id}`} className="flex gap-3 px-3 py-2.5 hover:bg-paper-dark transition-colors">
                  <div className="h-7 w-7 flex items-center justify-center bg-rule border border-rule-dark text-sm rounded-sm shrink-0 mt-0.5">📊</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-ink-muted mb-0.5">Analysis · {a.chatName}</p>
                    <p className="text-xs font-bold text-ink leading-snug line-clamp-1">{a.title}</p>
                    <p className="text-[9px] text-ink-faint mt-0.5">{author?.displayName} · {timeAgo(a.createdAt)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
