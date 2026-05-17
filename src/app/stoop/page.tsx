'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Home, Pencil, Camera, Check, X, Flame, Swords, Handshake, Bell, BellOff, PenLine, Newspaper } from 'lucide-react';
import { ME, DEBATES, BETS, HOT_TAKES, ANALYSES, getUserById, CHATS } from '@/lib/mock-data';
import { timeAgo, totalReactions, teamDisplayName, cropImageToSquare } from '@/lib/utils';
import type { FandomLevel, FanTeam } from '@/lib/types';
import { requestNotificationPermission, startSimulatedNotifications } from '@/lib/notifications';
import { computeBadges } from '@/lib/badges';
import BadgeChip from '@/components/BadgeChip';
import TeamLogo from '@/components/TeamLogo';
import { useAuth } from '@/lib/auth-context';
import { ALL_TEAMS } from '@/lib/teams-data';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

const AVATAR_EMOJIS = ['👋','🏈','🏀','⚾','⚽','🏒','🎯','🔥','⚡','🏆','🦁','🐺','🦅','🐉','💪','🫡'];

function mapFandomLevel(level: string | null): FandomLevel {
  if (!level) return 'casual';
  if (level === 'die-hard' || level === 'diehard') return 'diehard';
  if (level === 'super-fan' || level === 'supporter') return 'supporter';
  if (level === 'fan') return 'supporter';
  if (level === 'fair-weather') return 'fair-weather';
  return 'casual';
}

export default function StoopPage() {
  const { user: authUser, refreshProfile } = useAuth();
  const router = useRouter();
  const [notifStatus, setNotifStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');

  // Avatar edit modal
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarMode, setAvatarMode] = useState<'emoji' | 'photo'>('emoji');
  const [avatarEmoji, setAvatarEmoji] = useState('👋');
  const [avatarPhotoPreview, setAvatarPhotoPreview] = useState<string | null>(null);
  const [avatarPhotoFile, setAvatarPhotoFile] = useState<File | null>(null);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarPosX, setAvatarPosX] = useState(50);
  const [avatarPosY, setAvatarPosY] = useState(50);
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const avatarDragRef = useRef<{ x: number; y: number } | null>(null);

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

  const openAvatarModal = () => {
    const current = authUser?.profile?.avatar ?? ME.avatar;
    if (typeof current === 'string' && current.startsWith('http')) {
      setAvatarMode('photo');
      setAvatarPhotoPreview(current);
      setAvatarPhotoFile(null);
    } else {
      setAvatarMode('emoji');
      setAvatarEmoji(typeof current === 'string' ? current : '👋');
      setAvatarPhotoPreview(null);
      setAvatarPhotoFile(null);
    }
    setAvatarPosX(50);
    setAvatarPosY(50);
    setShowAvatarModal(true);
  };

  const onAvatarDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const point = 'touches' in e ? e.touches[0] : e;
    avatarDragRef.current = { x: point.clientX, y: point.clientY };
  };
  const onAvatarDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!avatarDragRef.current) return;
    const point = 'touches' in e ? e.touches[0] : e;
    const dx = point.clientX - avatarDragRef.current.x;
    const dy = point.clientY - avatarDragRef.current.y;
    avatarDragRef.current = { x: point.clientX, y: point.clientY };
    setAvatarPosX((p) => Math.max(0, Math.min(100, p - dx * 0.4)));
    setAvatarPosY((p) => Math.max(0, Math.min(100, p - dy * 0.4)));
  };
  const onAvatarDragEnd = () => { avatarDragRef.current = null; };

  const saveAvatar = async () => {
    if (!authUser || !isSupabaseConfigured()) return;
    setAvatarSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any;
    let newAvatar: string = avatarEmoji;

    if (avatarMode === 'photo' && avatarPhotoFile && avatarPhotoPreview) {
      const cropped = await cropImageToSquare(avatarPhotoPreview, avatarPosX, avatarPosY);
      const { data: up } = await supabase.storage
        .from('profile-photos')
        .upload(`${authUser.id}/avatar.jpg`, cropped, { upsert: true });
      if (up) {
        const { data: urlData } = supabase.storage.from('profile-photos').getPublicUrl(up.path);
        if (urlData?.publicUrl) newAvatar = urlData.publicUrl;
      }
    } else if (avatarMode === 'photo' && avatarPhotoPreview?.startsWith('http')) {
      // No new file — keep existing photo URL unchanged
      setShowAvatarModal(false);
      setAvatarSaving(false);
      return;
    }

    await supabase.from('profiles').update({ avatar: newAvatar }).eq('id', authUser.id);
    await refreshProfile();
    setShowAvatarModal(false);
    setAvatarSaving(false);
  };

  return (
    <div className="flex flex-col bg-paper min-h-full pb-4">

      {/* ── MASTHEAD ──────────────────────────────────────── */}
      <div className="bg-nav-bg">
        {/* Compact header */}
        <div className="px-4 py-3 flex items-center gap-2.5">
          <button onClick={() => router.back()} className="text-ink/60 hover:text-ink p-1 shrink-0">
            <ArrowLeft size={20} />
          </button>
          <Link href="/users/me" className="flex items-center gap-2.5 flex-1 min-w-0 hover:opacity-80 transition-opacity">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-xl shrink-0 ring-2 ring-masthead overflow-hidden">
              {avatar && typeof avatar === 'string' && avatar.startsWith('http')
                ? <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
                : <span className="leading-none">{avatar}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-white truncate leading-tight">{displayName}</p>
              <p className="text-[10px] font-mono text-white/55 truncate">@{username}</p>
            </div>
          </Link>
          <Link
            href="/"
            className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-ink/10 hover:bg-ink/20 text-ink/70 hover:text-ink transition-all"
            aria-label="Home"
          >
            <Home size={14} />
          </Link>
          <button
            onClick={openAvatarModal}
            className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-ink/10 hover:bg-ink/20 text-ink/70 hover:text-ink transition-all"
            aria-label="Edit profile picture"
          >
            <Pencil size={14} />
          </button>
        </div>
        {bio && <p className="px-5 pb-3 text-sm text-white/70 italic">{bio}</p>}

        <div className="px-5 pb-5">
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
            <Link href="/" className="flex flex-col items-center py-2 hover:bg-white/10 transition-colors">
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
            <Link href="/" className="flex flex-col items-center py-2 gap-0.5 hover:bg-white/10 transition-colors">
              <Swords size={10} className="text-white/60" />
              <p className="font-display text-base font-black text-masthead leading-none">{debatePct}%</p>
              <p className="text-[7px] font-bold text-white/60 leading-none">{stats.debatesWon}W · {stats.debatesLost}L</p>
              <p className="text-[7px] font-bold uppercase tracking-wide text-white/70">Debates</p>
            </Link>
            <Link href="/" className="flex flex-col items-center py-2 gap-0.5 hover:bg-white/10 transition-colors">
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
          <Link href="/" className="text-[10px] font-bold text-press hover:text-press/80">See all →</Link>
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
      {/* ── Avatar edit modal ──────────────────────────────────────── */}
      {showAvatarModal && (
        <>
          <div className="fixed inset-0 z-50 bg-nav-bg/80 backdrop-blur-sm" onClick={() => setShowAvatarModal(false)} />
          <div className="fixed inset-x-4 top-[10%] z-50 bg-paper-dark border border-rule shadow-2xl max-w-sm mx-auto max-h-[80vh] flex flex-col rounded-xl overflow-hidden">

            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 bg-nav-bg shrink-0">
              <p className="font-display font-bold text-ink text-base">Edit Profile Picture</p>
              <button onClick={() => setShowAvatarModal(false)} className="text-ink/60 hover:text-ink transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-5 flex flex-col gap-5">

              {/* Live preview */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-4xl ring-2 ring-masthead overflow-hidden shrink-0">
                  {avatarMode === 'photo' && avatarPhotoPreview
                    ? <img src={avatarPhotoPreview} alt="" className="w-full h-full object-cover" style={{ objectPosition: `${avatarPosX}% ${avatarPosY}%` }} />
                    : <span>{avatarEmoji}</span>
                  }
                </div>
                {avatarMode === 'photo' && avatarPhotoPreview && (
                  <p className="text-[10px] text-ink-faint">Preview — drag photo below to reposition</p>
                )}
              </div>

              {/* Mode toggle */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAvatarMode('emoji')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${avatarMode === 'emoji' ? 'border-masthead bg-masthead/10 text-masthead' : 'border-rule text-ink-faint hover:border-ink-muted hover:text-ink'}`}
                >
                  Emoji
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarMode('photo')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${avatarMode === 'photo' ? 'border-masthead bg-masthead/10 text-masthead' : 'border-rule text-ink-faint hover:border-ink-muted hover:text-ink'}`}
                >
                  Photo
                </button>
              </div>

              {/* Emoji grid */}
              {avatarMode === 'emoji' && (
                <div className="flex flex-wrap gap-2">
                  {AVATAR_EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setAvatarEmoji(e)}
                      className={`flex items-center justify-center h-10 w-10 text-2xl rounded-lg border transition-all ${avatarEmoji === e ? 'border-masthead bg-paper-dark scale-110' : 'border-rule hover:border-ink-muted'}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}

              {/* Photo upload */}
              {avatarMode === 'photo' && (
                <div className="flex flex-col gap-1.5">
                  <div className={`rounded-xl border-2 overflow-hidden relative ${avatarPhotoPreview ? 'border-masthead/40 h-44' : 'border-dashed border-rule h-28'}`}>
                    {avatarPhotoPreview ? (
                      <img
                        src={avatarPhotoPreview}
                        alt=""
                        className="w-full h-full object-cover cursor-grab active:cursor-grabbing select-none"
                        style={{ objectPosition: `${avatarPosX}% ${avatarPosY}%` }}
                        draggable={false}
                        onMouseDown={onAvatarDragStart}
                        onMouseMove={onAvatarDragMove}
                        onMouseUp={onAvatarDragEnd}
                        onMouseLeave={onAvatarDragEnd}
                        onTouchStart={onAvatarDragStart}
                        onTouchMove={onAvatarDragMove}
                        onTouchEnd={onAvatarDragEnd}
                      />
                    ) : (
                      <label className="flex flex-col items-center justify-center gap-2 w-full h-full cursor-pointer hover:bg-paper/30 transition-colors">
                        <Camera size={22} className="text-ink-faint" />
                        <span className="text-xs text-ink-faint">Tap to upload a photo</span>
                        <input ref={avatarFileRef} type="file" accept="image/*" className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setAvatarPhotoFile(file);
                            setAvatarPosX(50); setAvatarPosY(50);
                            const reader = new FileReader();
                            reader.onload = (ev) => setAvatarPhotoPreview(ev.target?.result as string);
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    )}
                  </div>
                  {avatarPhotoPreview && (
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-ink-faint italic">Drag to reposition</p>
                      <div className="flex gap-3">
                        <label className="text-[11px] text-field cursor-pointer hover:text-field/80 transition-colors">
                          Change photo
                          <input ref={avatarFileRef} type="file" accept="image/*" className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setAvatarPhotoFile(file);
                              setAvatarPosX(50); setAvatarPosY(50);
                              const reader = new FileReader();
                              reader.onload = (ev) => setAvatarPhotoPreview(ev.target?.result as string);
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                        <button type="button" onClick={() => { setAvatarPhotoPreview(null); setAvatarPhotoFile(null); }} className="text-[11px] text-ink-faint hover:text-masthead transition-colors">
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-rule bg-paper-dark px-5 py-4">
              <button
                type="button"
                onClick={saveAvatar}
                disabled={avatarSaving || (avatarMode === 'photo' && !avatarPhotoPreview)}
                className="w-full flex items-center justify-center gap-2 bg-masthead text-[#12111a] py-3 text-xs font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed rounded-full btn-3d hover:bg-masthead/90 transition-colors"
              >
                <Check size={14} />
                {avatarSaving ? 'Saving…' : 'Save Picture'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
