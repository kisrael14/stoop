'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UserPlus, UserCheck, Flame, Swords, Handshake, Trophy, Star, Newspaper, Settings } from 'lucide-react';
import { getUserById, DEBATES, BETS, HOT_TAKES, ANALYSES, CHATS, ME } from '@/lib/mock-data';
import { timeAgo, totalReactions } from '@/lib/utils';
import type { FandomLevel } from '@/lib/types';
import { computeBadges } from '@/lib/badges';
import TeamLogo from '@/components/TeamLogo';
import BadgeChip from '@/components/BadgeChip';

const FANDOM_STYLES: Record<FandomLevel, { label: string; bg: string; text: string }> = {
  diehard:        { label: 'Diehard',      bg: 'bg-[#b8860b]', text: 'text-white' },
  supporter:      { label: 'Supporter',    bg: 'bg-ink-muted',  text: 'text-paper' },
  'fair-weather': { label: 'Fair Weather', bg: 'bg-rule-dark',  text: 'text-paper' },
  casual:         { label: 'Casual',       bg: 'bg-ink-faint',  text: 'text-paper' },
};

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = getUserById(id);
  const [following, setFollowing] = useState(ME.followingIds.includes(id));

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-ink-faint">
        <p className="font-display text-3xl mb-2">👤</p>
        <p className="font-bold text-ink">User not found</p>
      </div>
    );
  }

  const isMe = user.id === 'me';
  const { stats } = user;
  const badges = computeBadges(user.id);

  // Neighborhoods this user belongs to, sorted by most recent message
  const userChats = CHATS.filter((c) => c.memberIds.includes(user.id));
  const userNeighborhoods = [...userChats].sort((a, b) => {
    const aTime = a.messages[a.messages.length - 1]?.timestamp ?? '0';
    const bTime = b.messages[b.messages.length - 1]?.timestamp ?? '0';
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  // Their neighbors (people who follow them)
  const userNeighbors = user.followerIds
    .map((fid) => getUserById(fid))
    .filter(Boolean);

  // Activity feed
  const userDebates = DEBATES.filter(
    (d) => d.side1UserIds.includes(user.id) || d.side2UserIds.includes(user.id)
  ).slice(0, 3);
  const userBets = BETS.filter((b) => b.participantIds.includes(user.id)).slice(0, 2);
  const userHotTakes = HOT_TAKES.filter((h) => h.authorId === user.id).slice(0, 2);

  // From The Streets — public content filtered to this user's teams
  const userTeamIds = user.fanTeams.map((ft) => ft.team.id);
  const streetsHotTakes = HOT_TAKES.filter((h) => h.isPublic && h.teamIds.some((t) => userTeamIds.includes(t)));
  const streetsDebates = DEBATES.filter((d) => d.isPublic && d.teamIds.some((t) => userTeamIds.includes(t)));
  const streetsBets = BETS.filter((b) => b.isPublic && b.teamIds.some((t) => userTeamIds.includes(t)));
  const streetsAnalyses = ANALYSES.filter((a) => a.isPublic && a.teamIds.some((t) => userTeamIds.includes(t)));
  const streetsFeed = [
    ...streetsHotTakes.map((ht) => ({ type: 'take' as const, time: ht.createdAt, item: ht })),
    ...streetsDebates.map((d) => ({ type: 'debate' as const, time: d.createdAt, item: d })),
    ...streetsBets.map((b) => ({ type: 'bet' as const, time: b.createdAt, item: b })),
    ...streetsAnalyses.map((a) => ({ type: 'analysis' as const, time: a.createdAt, item: a })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 6);

  return (
    <div className="flex flex-col bg-paper min-h-full pb-4">

      {/* Back header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b-2 border-ink bg-ink">
        <button onClick={() => router.back()} className="text-paper/60 hover:text-paper p-1">
          <ArrowLeft size={20} />
        </button>
        <p className="font-bold text-paper font-mono">@{user.username}</p>
        {isMe && (
          <Link href="/onboarding" className="ml-auto h-8 w-8 flex items-center justify-center rounded-full bg-paper/10 text-paper/70 hover:bg-paper/20 transition-colors">
            <Settings size={16} />
          </Link>
        )}
      </div>

      {/* ── MASTHEAD ──────────────────────────────────────── */}
      <div className="bg-ink px-5 pt-6 pb-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-paper/15 text-4xl ring-2 ring-press shrink-0">
            {user.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-black text-paper leading-tight">{user.displayName}</h1>
            <p className="text-[11px] font-mono text-paper/50">@{user.username}</p>
            {user.bio && <p className="text-xs text-paper/70 italic mt-0.5 line-clamp-2">{user.bio}</p>}
          </div>
          {!isMe && (
            <button
              onClick={() => setFollowing((f) => !f)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors rounded-sm ${
                following
                  ? 'bg-paper/15 text-paper/70 hover:bg-paper/25'
                  : 'bg-press text-paper hover:bg-press/80'
              }`}
            >
              {following ? <UserCheck size={13} /> : <UserPlus size={13} />}
              {following ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-4 border border-paper/20">
          {[
            { label: 'Neighbors', value: user.followerIds.length },
            { label: 'Following', value: user.followingIds.length },
            { label: 'Groups',    value: userNeighborhoods.length },
            { label: 'Hot Takes', value: stats.hotTakesPosted, accent: true },
          ].map(({ label, value, accent }, i) => (
            <div
              key={label}
              className={`flex flex-col items-center py-2.5 ${i > 0 ? 'border-l border-paper/20' : ''}`}
            >
              <p className={`font-display text-xl font-bold ${accent ? 'text-press' : 'text-paper'}`}>{value}</p>
              <p className="text-[8px] font-bold uppercase tracking-wider text-paper/50">{label}</p>
            </div>
          ))}
        </div>

        {/* Bragging Rights — inside masthead */}
        <div className="mt-4 border border-paper/20">
          <div className="px-3 py-1.5 border-b border-paper/20">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-paper/60">Bragging Rights</p>
          </div>
          <div className="grid grid-cols-4 divide-x divide-paper/20">
            <div className="p-3 flex flex-col items-center">
              <div className="flex items-center gap-1 mb-1"><Swords size={11} className="text-paper/50" /></div>
              <p className="font-display text-base font-black text-paper">{stats.debatesWon}W</p>
              <p className="font-display text-xs text-paper/40">{stats.debatesLost}L</p>
              <p className="text-[8px] font-bold uppercase tracking-wide text-paper/40 mt-0.5">Debates</p>
            </div>
            <div className="p-3 flex flex-col items-center">
              <div className="flex items-center gap-1 mb-1"><Handshake size={11} className="text-paper/50" /></div>
              <p className="font-display text-base font-black text-paper">{stats.betsWon}W</p>
              <p className="font-display text-xs text-paper/40">{stats.betsLost}L</p>
              <p className="text-[8px] font-bold uppercase tracking-wide text-paper/40 mt-0.5">Bets</p>
            </div>
            <div className="p-3 flex flex-col items-center">
              <div className="flex items-center gap-1 mb-1"><Flame size={11} className="text-press" /></div>
              <p className="font-display text-base font-black text-press">{stats.hotTakesPosted}</p>
              <p className="font-display text-xs text-paper/40">&nbsp;</p>
              <p className="text-[8px] font-bold uppercase tracking-wide text-paper/40 mt-0.5">Takes</p>
            </div>
            <div className="p-3 flex flex-col items-center">
              <div className="flex items-center gap-1 mb-1"><Trophy size={11} className="text-paper/50" /></div>
              <p className="font-display text-base font-black text-paper">{stats.hotTakeReactions}</p>
              <p className="font-display text-xs text-paper/40">&nbsp;</p>
              <p className="text-[8px] font-bold uppercase tracking-wide text-paper/40 mt-0.5">Reactions</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── BADGES ─────────────────────────────────────────── */}
      <section className="mx-4 mt-4 border border-rule bg-paper px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">Badges</h2>
          <span className="text-[9px] text-ink-faint italic">Tap to learn more</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <BadgeChip key={badge.type} badge={badge} />
          ))}
        </div>
      </section>

      {/* ── SHARED NEIGHBORHOODS (other users only) ──────────── */}
      {!isMe && (() => {
        const shared = CHATS.filter(
          (c) => c.memberIds.includes('me') && c.memberIds.includes(user.id)
        );
        if (shared.length === 0) return null;
        return (
          <div className="mx-4 mt-4 border border-rule bg-paper-dark px-4 py-3">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-ink-muted mb-2">Shared Neighborhoods</p>
            <div className="flex gap-2 flex-wrap">
              {shared.map((c) => (
                <Link
                  key={c.id}
                  href={`/neighborhoods/${c.id}`}
                  className="flex items-center gap-2 border border-rule bg-paper px-3 py-1.5 text-xs font-semibold text-ink hover:bg-paper-deeper transition-colors"
                >
                  <span>{c.emoji}</span>
                  <span>{c.name}</span>
                </Link>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── 2-COLUMN: NEIGHBORS + NEIGHBORHOODS ─────────────── */}
      <div className="mx-4 mt-4 grid grid-cols-2 gap-0 border-2 border-ink">
        {/* LEFT: Neighbors */}
        <div className="col-rule p-3">
          <div className="section-header mb-3">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-ink">Neighbors</p>
          </div>
          <div className="flex flex-col gap-2">
            {userNeighbors.slice(0, 4).map((neighbor) => (
              <Link key={neighbor!.id} href={`/users/${neighbor!.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-dark border border-rule text-base shrink-0">
                  {neighbor!.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-ink truncate">{neighbor!.displayName.split(' ')[0]}</p>
                  <p className="text-[9px] text-ink-faint font-mono truncate">@{neighbor!.username}</p>
                </div>
              </Link>
            ))}
            {userNeighbors.length === 0 && (
              <p className="text-[10px] text-ink-faint italic">No neighbors yet</p>
            )}
          </div>
        </div>

        {/* RIGHT: Neighborhoods */}
        <div className="p-3">
          <div className="section-header mb-3">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-ink">Neighborhoods</p>
          </div>
          <div className="flex flex-col gap-2">
            {userNeighborhoods.slice(0, 4).map((chat) => (
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
            {userNeighborhoods.length === 0 && (
              <p className="text-[10px] text-ink-faint italic">No neighborhoods yet</p>
            )}
          </div>
        </div>
      </div>

      {/* ── FANDOM ─────────────────────────────────────────── */}
      <div className="mx-4 mt-4 border-2 border-ink">
        <div className="px-3 py-2 bg-ink">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-paper">Fandom</p>
        </div>
        <div className="divide-y divide-rule/60">
          {user.fanTeams.map((ft) => {
            const style = FANDOM_STYLES[ft.fandomLevel];
            return (
              <Link
                key={ft.team.id}
                href={`/teams/${ft.team.id}`}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-paper-dark transition-colors"
              >
                <span
                  className="flex h-6 w-6 items-center justify-center text-[10px] font-black text-paper rounded-full shrink-0"
                  style={{ backgroundColor: ft.team.color }}
                >
                  {ft.rank}
                </span>
                <TeamLogo team={ft.team} size={24} />
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

      {/* ── NEIGHBORHOOD ACTIVITY ──────────────────────────── */}
      {(userDebates.length > 0 || userBets.length > 0 || userHotTakes.length > 0) && (
        <div className="mx-4 mt-4 border-2 border-ink">
          <div className="flex items-center justify-between px-3 py-2 bg-ink">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-paper">
              {isMe ? 'My Neighborhood' : 'Their Neighborhood'}
            </p>
            <Link href="/neighborhoods" className="text-[10px] font-bold text-press hover:text-press/80">See all →</Link>
          </div>
          <div className="divide-y divide-rule/60">
            {userDebates.map((debate) => {
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
            {userBets.map((bet) => {
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
            {userHotTakes.map((ht) => {
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
      )}

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
          <p className="px-3 py-1.5 text-[9px] text-ink-faint italic border-b border-rule/40">
            Public posts from {isMe ? 'your' : `${user.displayName.split(' ')[0]}'s`} teams
          </p>
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
