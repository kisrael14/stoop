'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Flame, Swords, Handshake, Trophy, Star, Bell, BellOff, Compass, PenLine, Newspaper } from 'lucide-react';
import { ME, DEBATES, BETS, HOT_TAKES, ANALYSES, getUserById, CHATS } from '@/lib/mock-data';
import { timeAgo, totalReactions, teamDisplayName } from '@/lib/utils';
import { FANDOM_LABELS } from '@/lib/types';
import type { FandomLevel, FanTeam } from '@/lib/types';
import { requestNotificationPermission, startSimulatedNotifications } from '@/lib/notifications';
import { computeBadges } from '@/lib/badges';
import BadgeChip from '@/components/BadgeChip';
import TeamLogo from '@/components/TeamLogo';
import { useAuth } from '@/lib/auth-context';
import { ALL_TEAMS } from '@/lib/teams-data';
import { ALL_LEAGUES } from '@/lib/leagues-data';

function mapFandomLevel(level: string | null): FandomLevel {
  if (!level) return 'casual';
  if (level === 'die-hard' || level === 'diehard') return 'diehard';
  if (level === 'super-fan' || level === 'supporter') return 'supporter';
  if (level === 'fan') return 'supporter';
  if (level === 'fair-weather') return 'fair-weather';
  return 'casual';
}

const FANDOM_STYLES: Record<FandomLevel, { label: string; bg: string; text: string; border: string }> = {
  diehard:       { label: 'Diehard',      bg: 'bg-[#b8860b]', text: 'text-white',    border: 'border-[#b8860b]' },
  supporter:     { label: 'Supporter',    bg: 'bg-ink-muted',  text: 'text-paper',   border: 'border-ink-muted' },
  'fair-weather':{ label: 'Fair Weather', bg: 'bg-rule-dark',  text: 'text-paper',   border: 'border-rule-dark' },
  casual:        { label: 'Casual',       bg: 'bg-ink-faint',  text: 'text-paper',   border: 'border-ink-faint' },
};

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

  const fanLeagues = isRealUser && authUser?.leagues
    ? authUser.leagues.map((lid) => ALL_LEAGUES.find((l) => l.id === lid)).filter(Boolean)
    : [];

  const myTeamIds = fanTeams.map((ft) => ft.team.id);
  const myDebates = DEBATES.filter((d) => d.side1UserIds.includes('me') || d.side2UserIds.includes('me')).slice(0, 3);
  const myBets = BETS.filter((b) => b.participantIds.includes('me')).slice(0, 2);
  const myHotTakes = HOT_TAKES.filter((h) => h.authorId === 'me' || h.teamIds.some((t) => myTeamIds.includes(t))).slice(0, 2);

  type NeighborDisplay = { id: string; displayName: string; username: string; avatar: string };
  type NeighborhoodDisplay = { id: string; name: string; emoji: string; memberCount?: number };

  const myNeighbors: NeighborDisplay[] = (() => {
    if (isRealUser && authUser?.followingProfiles != null) {
      return authUser.followingProfiles.map((fp) => ({
        id: fp.id,
        displayName: fp.display_name,
        username: fp.username,
        avatar: fp.avatar,
      }));
    }
    const mockChats = CHATS.filter((c) => c.memberIds.includes('me'));
    const msgCounts: Record<string, number> = {};
    mockChats.forEach((chat) => {
      chat.messages.forEach((msg) => {
        if (msg.userId !== 'me' && msg.userId !== 'ai') {
          msgCounts[msg.userId] = (msgCounts[msg.userId] ?? 0) + 1;
        }
      });
    });
    return ME.followingIds
      .map((id) => getUserById(id))
      .filter((u): u is NonNullable<ReturnType<typeof getUserById>> => u != null)
      .sort((a, b) => (msgCounts[b.id] ?? 0) - (msgCounts[a.id] ?? 0))
      .map((u) => ({ id: u.id, displayName: u.displayName, username: u.username, avatar: u.avatar }));
  })();

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
  const streetsBets = BETS.filter((b) => b.isPublic && b.teamIds.some((t) => myTeamIds.includes(t)));
  const streetsAnalyses = ANALYSES.filter((a) => a.isPublic && a.teamIds.some((t) => myTeamIds.includes(t)));
  const streetsFeed = [
    ...streetsHotTakes.map((ht) => ({ type: 'take' as const, time: ht.createdAt, item: ht })),
    ...streetsDebates.map((d) => ({ type: 'debate' as const, time: d.createdAt, item: d })),
    ...streetsBets.map((b) => ({ type: 'bet' as const, time: b.createdAt, item: b })),
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
      <div className="bg-ink px-5 pt-12 pb-5">
        {/* Top controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <Link href="/discover" className="h-8 w-8 flex items-center justify-center rounded-full bg-paper/10 text-paper/70 hover:bg-paper/20 transition-colors" title="Discover">
              <Compass size={16} />
            </Link>
            <Link href="/onboarding" className="h-8 w-8 flex items-center justify-center rounded-full bg-paper/10 text-paper/70 hover:bg-paper/20 transition-colors" title="Edit profile">
              <Settings size={16} />
            </Link>
          </div>
          {/* Spacer for TopChatButton (top-right area) */}
          <div className="w-10" />
        </div>

        {/* Profile row */}
        <div className="flex items-center gap-4 mb-4">
          <Link href="/users/me" className="relative shrink-0">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-paper/15 text-4xl ring-2 ring-press hover:ring-press/60 transition-all">
              {avatar}
            </div>
          </Link>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-black text-paper leading-tight">{displayName}</h1>
            <p className="text-[11px] font-mono text-paper/50">@{username}</p>
            {bio && <p className="text-xs text-paper/70 italic mt-0.5 line-clamp-2">{bio}</p>}
          </div>
        </div>

        {/* Unified stats + bragging rights grid */}
        <div className="mt-4 border border-paper/20">
          {/* Row 1 — social stats */}
          <div className="grid grid-cols-4 divide-x divide-paper/20">
            <Link href="/discover?filter=followers" className="flex flex-col items-center py-2 hover:bg-paper/10 transition-colors">
              <p className="font-display text-lg font-bold leading-none text-paper">{followerCount}</p>
              <p className="text-[7px] font-bold uppercase tracking-wider text-paper/70 mt-0.5">Neighbors</p>
            </Link>
            <Link href="/discover?filter=following" className="flex flex-col items-center py-2 hover:bg-paper/10 transition-colors">
              <p className="font-display text-lg font-bold leading-none text-paper">{followingCount}</p>
              <p className="text-[7px] font-bold uppercase tracking-wider text-paper/70 mt-0.5">Following</p>
            </Link>
            <Link href="/neighborhoods" className="flex flex-col items-center py-2 hover:bg-paper/10 transition-colors">
              <p className="font-display text-lg font-bold leading-none text-paper">{myNeighborhoods.length}</p>
              <p className="text-[7px] font-bold uppercase tracking-wider text-paper/70 mt-0.5">Groups</p>
            </Link>
            <div className="flex flex-col items-center py-2">
              <p className="font-display text-lg font-bold leading-none text-paper">{stats.hotTakeReactions}</p>
              <p className="text-[7px] font-bold uppercase tracking-wider text-paper/70 mt-0.5">Reactions</p>
            </div>
          </div>
          {/* Row 2 — activity stats */}
          <div className="grid grid-cols-3 divide-x divide-paper/20 border-t border-paper/20">
            <Link href="/neighborhoods" className="flex flex-col items-center py-2 gap-0.5 hover:bg-paper/10 transition-colors">
              <Swords size={10} className="text-paper/60" />
              <p className="font-display text-base font-black text-press leading-none">{debatePct}%</p>
              <p className="text-[7px] font-bold text-paper/60 leading-none">{stats.debatesWon}W · {stats.debatesLost}L</p>
              <p className="text-[7px] font-bold uppercase tracking-wide text-paper/70">Debates</p>
            </Link>
            <Link href="/neighborhoods" className="flex flex-col items-center py-2 gap-0.5 hover:bg-paper/10 transition-colors">
              <Handshake size={10} className="text-paper/60" />
              <p className="font-display text-base font-black text-press leading-none">{betPct}%</p>
              <p className="text-[7px] font-bold text-paper/60 leading-none">{stats.betsWon}W · {stats.betsLost}L</p>
              <p className="text-[7px] font-bold uppercase tracking-wide text-paper/70">Bets</p>
            </Link>
            <div className="flex flex-col items-center py-2 gap-0.5">
              <Flame size={10} className="text-press" />
              <p className="font-display text-base font-black text-press leading-none">{stats.hotTakesPosted}</p>
              <p className="text-[7px] font-bold uppercase tracking-wide text-paper/70">Hot Takes</p>
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
          <button onClick={enableNotifications} className="shrink-0 bg-ink text-paper rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide hover:bg-ink/80 transition-colors btn-3d">
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

      {/* ── BADGES ─────────────────────────────────────────── */}
      <section className="mx-4 mt-4 border border-rule bg-paper px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">Trophy Room</h2>
          <span className="text-[9px] text-ink-faint italic">Tap to learn more</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {badges.map((badge) => (
            <BadgeChip key={badge.type} badge={badge} />
          ))}
        </div>
      </section>

      {/* ── 2-COLUMN: NEIGHBORS + NEIGHBORHOODS ─────────────── */}
      <div className="mx-4 mt-4 grid grid-cols-2 gap-0 border-2 border-ink">
        {/* LEFT: Neighbors */}
        <div className="col-rule p-3">
          <div className="section-header mb-3">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-ink">Neighbors</p>
          </div>
          <div className="flex flex-col gap-2">
            {myNeighbors.slice(0, 4).map((user) => (
              <Link key={user.id} href={`/users/${user.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-dark border border-rule text-base shrink-0">
                  {user.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-ink truncate">{user.displayName.split(' ')[0]}</p>
                  <p className="text-[9px] text-ink-faint font-mono truncate">@{user.username}</p>
                </div>
              </Link>
            ))}
            <Link href="/discover" className="mt-1 text-[10px] font-bold uppercase tracking-wider text-masthead hover:underline">
              Find more →
            </Link>
          </div>
        </div>

        {/* RIGHT: Neighborhoods */}
        <div className="p-3">
          <div className="section-header mb-3">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-ink">Neighborhoods</p>
          </div>
          <div className="flex flex-col gap-2">
            {myNeighborhoods.slice(0, 4).map((n) => (
              <Link key={n.id} href={`/neighborhoods/${n.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="flex h-8 w-8 items-center justify-center bg-ink text-base shrink-0 rounded-sm">
                  {n.emoji}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-ink truncate">{n.name}</p>
                  {n.memberCount != null && <p className="text-[9px] text-ink-faint">{n.memberCount} members</p>}
                </div>
              </Link>
            ))}
            <Link href="/neighborhoods" className="mt-1 text-[10px] font-bold uppercase tracking-wider text-masthead hover:underline">
              See all →
            </Link>
          </div>
        </div>
      </div>

      {/* ── FANDOM ─────────────────────────────────────────── */}
      <div className="mx-4 mt-4 border-2 border-ink">
        <div className="flex items-center justify-between px-3 py-2 bg-ink">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-paper">Fandom</p>
          <Link href="/discover?mode=teams" className="text-[10px] font-bold text-press hover:text-press/80">+ Add teams</Link>
        </div>
        <div className="divide-y divide-rule/60">
          {fanTeams.map((ft) => {
            const style = FANDOM_STYLES[ft.fandomLevel];
            return (
              <Link
                key={ft.team.id}
                href={`/teams/${ft.team.id}`}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-paper-dark transition-colors"
              >
                <span className="flex h-6 w-6 items-center justify-center text-[10px] font-black text-paper rounded-full shrink-0" style={{ backgroundColor: ft.team.color }}>
                  {ft.rank}
                </span>
                <TeamLogo team={ft.team} size={24} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-ink">{teamDisplayName(ft.team)}</p>
                    {ft.rank === 1 && <Star size={10} className="text-[#b8860b]" fill="currentColor" />}
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-ink-faint">{ft.team.league}</p>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                  {style.label}
                </span>
              </Link>
            );
          })}
          {fanLeagues.map((league) => (
            <Link
              key={league!.id}
              href={`/leagues/${league!.id}`}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-paper-dark transition-colors"
            >
              <div
                className="flex h-6 w-6 items-center justify-center text-sm rounded-full shrink-0"
                style={{ backgroundColor: league!.color + '30', border: `1.5px solid ${league!.color}60` }}
              >
                {league!.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-ink">{league!.name}</p>
                <p className="text-[9px] font-bold uppercase tracking-wide text-ink-faint">{league!.sport} · {league!.country}</p>
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: league!.color + '20', color: league!.color }}>
                League
              </span>
            </Link>
          ))}
          {fanTeams.length === 0 && fanLeagues.length === 0 && (
            <Link href="/discover?mode=teams" className="flex items-center justify-center px-3 py-4 text-[10px] text-ink-faint italic hover:bg-paper-dark transition-colors">
              Follow teams and leagues to fill your fandom →
            </Link>
          )}
        </div>
      </div>

      {/* ── MY NEIGHBORHOOD ────────────────────────────────── */}
      <div className="mx-4 mt-4 border-2 border-ink">
        <div className="flex items-center justify-between px-3 py-2 bg-ink">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-paper">My Neighborhood</p>
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
                  <div className="h-8 w-8 flex items-center justify-center bg-navy text-paper text-base rounded-sm">⚔️</div>
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
                  <div className="h-8 w-8 flex items-center justify-center bg-field text-paper text-base rounded-sm">🤝</div>
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
                  <div className="h-8 w-8 flex items-center justify-center bg-press text-paper text-base rounded-sm">🔥</div>
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
        <div className="mx-4 mt-4 border-2 border-ink">
          <div className="flex items-center justify-between px-3 py-2 bg-ink">
            <div className="flex items-center gap-1.5">
              <Newspaper size={11} className="text-paper/60" />
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-paper">From The Streets</p>
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
              if (type === 'bet') {
                const b = item as typeof streetsBets[0];
                return (
                  <Link key={b.id} href={`/neighborhoods/${b.chatId}?tab=bets`} className="flex gap-3 px-3 py-2.5 hover:bg-paper-dark transition-colors">
                    <div className="h-7 w-7 flex items-center justify-center bg-field/10 border border-field/30 text-sm rounded-sm shrink-0 mt-0.5">🤝</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-field mb-0.5">Bet · {b.chatName}</p>
                      <p className="text-xs text-ink leading-snug line-clamp-2 italic">&ldquo;{b.claim}&rdquo;</p>
                      {b.stakes && <p className="text-[9px] text-ink-faint mt-0.5">Stakes: {b.stakes}</p>}
                    </div>
                  </Link>
                );
              }
              // analysis
              const a = item as typeof streetsAnalyses[0];
              const author = getUserById(a.authorId);
              return (
                <Link key={a.id} href={`/analyses/${a.id}`} className="flex gap-3 px-3 py-2.5 hover:bg-paper-dark transition-colors">
                  <div className="h-7 w-7 flex items-center justify-center bg-ink/5 border border-ink/20 text-sm rounded-sm shrink-0 mt-0.5">📊</div>
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
