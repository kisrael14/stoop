'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Flame, Swords, Handshake, Trophy, Star, Bell, BellOff, Compass, PenLine, Newspaper } from 'lucide-react';
import { ME, DEBATES, BETS, HOT_TAKES, ANALYSES, getUserById, CHATS } from '@/lib/mock-data';
import { timeAgo, totalReactions } from '@/lib/utils';
import { FANDOM_LABELS } from '@/lib/types';
import type { FandomLevel } from '@/lib/types';
import { requestNotificationPermission, startSimulatedNotifications } from '@/lib/notifications';

const FANDOM_STYLES: Record<FandomLevel, { label: string; bg: string; text: string; border: string }> = {
  diehard:       { label: 'Diehard',      bg: 'bg-[#b8860b]', text: 'text-white',    border: 'border-[#b8860b]' },
  supporter:     { label: 'Supporter',    bg: 'bg-ink-muted',  text: 'text-paper',   border: 'border-ink-muted' },
  'fair-weather':{ label: 'Fair Weather', bg: 'bg-rule-dark',  text: 'text-paper',   border: 'border-rule-dark' },
  casual:        { label: 'Casual',       bg: 'bg-ink-faint',  text: 'text-paper',   border: 'border-ink-faint' },
};

export default function StoopPage() {
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

  const myTeamIds = ME.fanTeams.map((ft) => ft.team.id);
  const myDebates = DEBATES.filter((d) => d.side1UserIds.includes('me') || d.side2UserIds.includes('me')).slice(0, 3);
  const myBets = BETS.filter((b) => b.participantIds.includes('me')).slice(0, 2);
  const myHotTakes = HOT_TAKES.filter((h) => h.authorId === 'me' || h.teamIds.some((t) => myTeamIds.includes(t))).slice(0, 2);

  // Sort neighbors by message frequency in shared chats
  const myChats = CHATS.filter((c) => c.memberIds.includes('me'));
  const msgCounts: Record<string, number> = {};
  myChats.forEach((chat) => {
    chat.messages.forEach((msg) => {
      if (msg.userId !== 'me' && msg.userId !== 'ai') {
        msgCounts[msg.userId] = (msgCounts[msg.userId] ?? 0) + 1;
      }
    });
  });
  const myNeighbors = ME.followingIds
    .map((id) => getUserById(id))
    .filter(Boolean)
    .sort((a, b) => (msgCounts[b!.id] ?? 0) - (msgCounts[a!.id] ?? 0));

  // Sort neighborhoods by most recent message
  const myNeighborhoods = myChats.sort((a, b) => {
    const aTime = a.messages[a.messages.length - 1]?.timestamp ?? '0';
    const bTime = b.messages[b.messages.length - 1]?.timestamp ?? '0';
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

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
  const { stats } = ME;

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
              {ME.avatar}
            </div>
          </Link>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-black text-paper leading-tight">{ME.displayName}</h1>
            <p className="text-[11px] font-mono text-paper/50">@{ME.username}</p>
            {ME.bio && <p className="text-xs text-paper/70 italic mt-0.5 line-clamp-2">{ME.bio}</p>}
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-4 border border-paper/20">
          {[
            { label: 'Neighbors', value: ME.followerIds.length, href: '/discover?filter=followers' },
            { label: 'Following', value: ME.followingIds.length, href: '/discover?filter=following' },
            { label: 'Groups', value: myNeighborhoods.length, href: '/neighborhoods' },
            { label: 'Hot Takes', value: stats.hotTakesPosted, href: '#', accent: true },
          ].map(({ label, value, href, accent }, i) => (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center py-2.5 hover:bg-paper/10 transition-colors ${i > 0 ? 'border-l border-paper/20' : ''}`}
            >
              <p className={`font-display text-xl font-bold ${accent ? 'text-press' : 'text-paper'}`}>{value}</p>
              <p className="text-[8px] font-bold uppercase tracking-wider text-paper/50">{label}</p>
            </Link>
          ))}
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

      {/* ── BRAGGING RIGHTS ────────────────────────────────── */}
      <div className="mx-4 mt-4 border-2 border-ink">
        <div className="px-3 py-2 bg-ink">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-paper">Bragging Rights</p>
        </div>
        <div className="grid grid-cols-4 divide-x divide-rule/60">
          <Link href="/neighborhoods" className="p-3 hover:bg-paper-dark transition-colors flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1"><Swords size={11} className="text-navy" /></div>
            <p className="font-display text-base font-black text-ink">{stats.debatesWon}W</p>
            <p className="font-display text-xs text-ink-faint">{stats.debatesLost}L</p>
            <p className="text-[8px] font-bold uppercase tracking-wide text-ink-faint mt-0.5">Debates</p>
          </Link>
          <Link href="/neighborhoods" className="p-3 hover:bg-paper-dark transition-colors flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1"><Handshake size={11} className="text-field" /></div>
            <p className="font-display text-base font-black text-ink">{stats.betsWon}W</p>
            <p className="font-display text-xs text-ink-faint">{stats.betsLost}L</p>
            <p className="text-[8px] font-bold uppercase tracking-wide text-ink-faint mt-0.5">Bets</p>
          </Link>
          <div className="p-3 flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1"><Flame size={11} className="text-press" /></div>
            <p className="font-display text-base font-black text-press">{stats.hotTakesPosted}</p>
            <p className="font-display text-xs text-ink-faint">&nbsp;</p>
            <p className="text-[8px] font-bold uppercase tracking-wide text-ink-faint mt-0.5">Takes</p>
          </div>
          <div className="p-3 flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1"><Trophy size={11} className="text-rule-dark" /></div>
            <p className="font-display text-base font-black text-ink">{stats.hotTakeReactions}</p>
            <p className="font-display text-xs text-ink-faint">&nbsp;</p>
            <p className="text-[8px] font-bold uppercase tracking-wide text-ink-faint mt-0.5">Reactions</p>
          </div>
        </div>
      </div>

      {/* ── 2-COLUMN: NEIGHBORS + NEIGHBORHOODS ─────────────── */}
      <div className="mx-4 mt-4 grid grid-cols-2 gap-0 border-2 border-ink">
        {/* LEFT: Neighbors */}
        <div className="col-rule p-3">
          <div className="section-header mb-3">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-ink">Neighbors</p>
          </div>
          <div className="flex flex-col gap-2">
            {myNeighbors.slice(0, 4).map((user) => (
              <Link key={user!.id} href={`/users/${user!.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-dark border border-rule text-base shrink-0">
                  {user!.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-ink truncate">{user!.displayName.split(' ')[0]}</p>
                  <p className="text-[9px] text-ink-faint font-mono truncate">@{user!.username}</p>
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
            {myNeighborhoods.slice(0, 4).map((chat) => (
              <Link key={chat.id} href={`/neighborhoods/${chat.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="flex h-8 w-8 items-center justify-center bg-ink text-base shrink-0 rounded-sm">
                  {chat.emoji}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-ink truncate">{chat.name}</p>
                  <p className="text-[9px] text-ink-faint">{chat.memberIds.length} members</p>
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
          {ME.fanTeams.map((ft) => {
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
                <span className="text-lg">{ft.team.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-ink">{ft.team.city} {ft.team.name}</p>
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
                <Link key={a.id} href={`/neighborhoods/${a.chatId}?tab=analysts`} className="flex gap-3 px-3 py-2.5 hover:bg-paper-dark transition-colors">
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
