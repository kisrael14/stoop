'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Flame, Swords, Handshake, Trophy, Star, Bell, BellOff, Compass, Users } from 'lucide-react';
import { ME, DEBATES, BETS, HOT_TAKES, getUserById, CHATS } from '@/lib/mock-data';
import { timeAgo, totalReactions } from '@/lib/utils';
import { requestNotificationPermission, startSimulatedNotifications } from '@/lib/notifications';

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
  const myDebates = DEBATES.filter((d) => d.side1UserIds.includes('me') || d.side2UserIds.includes('me')).slice(0, 2);
  const myBets = BETS.filter((b) => b.participantIds.includes('me')).slice(0, 2);
  const myHotTakes = HOT_TAKES.filter((h) => h.authorId === 'me' || h.teamIds.some((t) => myTeamIds.includes(t))).slice(0, 2);
  const { stats } = ME;

  const myNeighborhoods = CHATS.filter((c) => c.memberIds.includes('me'));
  const myGroups = myNeighborhoods; // "My Groups" = group chats
  const myNeighbors = ME.followingIds.map((id) => getUserById(id)).filter(Boolean); // "My Neighbors" = followed people

  return (
    <div className="flex flex-col bg-paper min-h-full">
      {/* Masthead header */}
      <div className="relative bg-ink px-5 pb-6 pt-10">
        <div className="absolute right-5 top-10 flex gap-2">
          <Link href="/discover" className="rounded-full bg-ink-muted/30 p-2 text-paper/70 hover:text-paper transition-colors" title="Discover">
            <Compass size={18} />
          </Link>
          <Link href="/onboarding" className="rounded-full bg-ink-muted/30 p-2 text-paper/70 hover:text-paper transition-colors" title="Edit profile">
            <Settings size={18} />
          </Link>
        </div>

        <div className="flex items-end gap-4">
          <div className="relative">
            <Link href="/users/me">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-ink-muted/30 text-4xl ring-2 ring-press hover:ring-press/70 transition-all">
                {ME.avatar}
              </div>
            </Link>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-press text-xs font-bold text-paper">
              #1
            </div>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-paper">{ME.displayName}</h1>
            <p className="text-sm text-paper/60 font-mono">@{ME.username}</p>
          </div>
        </div>

        {ME.bio && <p className="mt-4 text-sm leading-relaxed text-paper/80 italic">{ME.bio}</p>}

        <div className="mt-4 flex gap-5 border-t border-paper/20 pt-4">
          <Link href="/discover?filter=followers" className="text-center hover:opacity-80 transition-opacity">
            <p className="text-lg font-bold text-paper">{ME.followerIds.length}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-paper/50">Neighbors</p>
          </Link>
          <Link href="/discover?filter=following" className="text-center hover:opacity-80 transition-opacity">
            <p className="text-lg font-bold text-paper">{ME.followingIds.length}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-paper/50">Following</p>
          </Link>
          <Link href="/neighborhoods" className="text-center hover:opacity-80 transition-opacity">
            <p className="text-lg font-bold text-paper">{myGroups.length}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-paper/50">Groups</p>
          </Link>
          <div className="text-center">
            <p className="text-lg font-bold text-press">{stats.hotTakesPosted}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-paper/50">Hot Takes</p>
          </div>
        </div>
      </div>

      {/* Notification banner */}
      {notifStatus === 'unknown' && (
        <div className="mx-5 mt-4 flex items-center gap-3 border-l-4 border-press bg-paper-dark px-4 py-3">
          <Bell size={16} className="text-press shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-ink">Enable notifications</p>
            <p className="text-xs text-ink-muted">Get alerted for new debates, bets & hot takes</p>
          </div>
          <button
            onClick={enableNotifications}
            className="shrink-0 bg-ink px-3 py-1.5 text-xs font-bold text-paper hover:bg-ink/80 transition-colors uppercase tracking-wide"
          >
            Enable
          </button>
        </div>
      )}
      {notifStatus === 'granted' && (
        <div className="mx-5 mt-4 flex items-center gap-2 border-l-4 border-field bg-paper-dark px-4 py-2.5">
          <Bell size={14} className="text-field" />
          <p className="text-xs text-field font-bold">Notifications enabled</p>
        </div>
      )}
      {notifStatus === 'denied' && (
        <div className="mx-5 mt-4 flex items-center gap-2 border-l-4 border-rule bg-paper-dark px-4 py-2.5">
          <BellOff size={14} className="text-ink-faint" />
          <p className="text-xs text-ink-faint">Notifications blocked — enable in browser settings</p>
        </div>
      )}

      {/* My Neighbors (who you follow) */}
      {myNeighbors.length > 0 && (
        <section className="px-5 py-4 border-b border-rule">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-ink-muted" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-ink-muted">My Neighbors</h2>
            </div>
            <Link href="/discover" className="text-xs font-semibold text-masthead hover:underline">Find more →</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {myNeighbors.slice(0, 6).map((user) => (
              <Link key={user!.id} href={`/users/${user!.id}`} className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-dark border border-rule text-xl hover:border-ink transition-all">
                  {user!.avatar}
                </div>
                <p className="text-[10px] text-ink-muted text-center w-12 truncate">{user!.displayName.split(' ')[0]}</p>
              </Link>
            ))}
            <Link href="/discover" className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-rule text-ink-faint hover:border-ink hover:text-ink transition-all">
                <span className="text-xl font-light">+</span>
              </div>
              <p className="text-[10px] text-ink-faint">Add</p>
            </Link>
          </div>
        </section>
      )}

      {/* My Groups */}
      {myGroups.length > 0 && (
        <section className="px-5 py-4 border-b border-rule">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-ink-muted">My Groups</h2>
            <Link href="/neighborhoods" className="text-xs font-semibold text-masthead hover:underline">All →</Link>
          </div>
          <div className="flex gap-2 flex-wrap">
            {myGroups.map((chat) => (
              <Link
                key={chat.id}
                href={`/neighborhoods/${chat.id}`}
                className="flex items-center gap-1.5 border border-rule bg-paper-dark px-3 py-1.5 text-xs font-semibold text-ink hover:bg-paper-deeper transition-colors"
              >
                <span>{chat.emoji}</span>
                <span>{chat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Fan Identity */}
      <section className="px-5 py-4 border-b border-rule">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-ink-muted">Fan Identity</h2>
          <Link href="/discover?mode=teams" className="text-xs font-semibold text-masthead hover:underline">Add teams →</Link>
        </div>
        <div className="flex flex-col gap-1.5">
          {ME.fanTeams.map((ft) => (
            <Link
              key={ft.team.id}
              href={`/discover?mode=teams&q=${ft.team.name}`}
              className="flex items-center gap-3 bg-paper-dark px-4 py-2.5 hover:bg-paper-deeper transition-colors border-l-4"
              style={{ borderLeftColor: ft.team.color }}
            >
              <span className="flex h-6 w-6 items-center justify-center text-xs font-bold text-paper rounded-full" style={{ backgroundColor: ft.team.color }}>
                {ft.rank}
              </span>
              <span className="text-lg">{ft.team.emoji}</span>
              <div className="flex-1">
                <p className="font-bold text-ink text-sm">{ft.team.city} {ft.team.name}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">{ft.team.league}</p>
              </div>
              {ft.rank === 1 && <Star size={13} className="text-press" fill="currentColor" />}
            </Link>
          ))}
        </div>
      </section>

      {/* Bragging Rights / Stats */}
      <section className="px-5 py-4 border-b border-rule">
        <h2 className="text-xs font-bold uppercase tracking-widest text-ink-muted mb-3">Bragging Rights</h2>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/neighborhoods" className="border border-rule bg-paper-dark px-4 py-3 hover:bg-paper-deeper transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <Swords size={14} className="text-navy" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">Debates</span>
            </div>
            <p className="text-base font-display font-bold text-ink">{stats.debatesWon}W · {stats.debatesLost}L · {stats.debatesDrew}D</p>
          </Link>
          <Link href="/neighborhoods" className="border border-rule bg-paper-dark px-4 py-3 hover:bg-paper-deeper transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <Handshake size={14} className="text-field" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">Bets</span>
            </div>
            <p className="text-base font-display font-bold text-ink">{stats.betsWon}W · {stats.betsLost}L</p>
          </Link>
          <div className="border border-rule bg-paper-dark px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Flame size={14} className="text-press" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">Reactions</span>
            </div>
            <p className="text-base font-display font-bold text-ink">{stats.hotTakeReactions}</p>
          </div>
          <div className="border border-rule bg-paper-dark px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={14} className="text-rule-dark" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">Pending</span>
            </div>
            <p className="text-base font-display font-bold text-ink">{stats.betsPending}</p>
          </div>
        </div>
      </section>

      {/* Content feed — "Your Scene" */}
      <section className="px-5 py-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-ink">Your Scene</h2>
          <Link href="/neighborhoods" className="text-xs font-semibold text-masthead hover:underline uppercase tracking-wide">See all →</Link>
        </div>

        <div className="flex flex-col gap-3">
          {myDebates.map((debate) => {
            const side1First = getUserById(debate.side1UserIds[0]);
            const side2First = getUserById(debate.side2UserIds[0]);
            return (
              <Link
                key={debate.id}
                href={`/neighborhoods/${debate.chatId}?tab=debates`}
                className="block border-l-4 border-navy bg-paper-dark px-4 py-3 hover:bg-paper-deeper transition-colors"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Swords size={12} className="text-navy" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-navy">Debate</span>
                  <span className="ml-auto text-[10px] text-ink-faint">{debate.chatName}</span>
                </div>
                <p className="text-sm text-ink font-medium leading-snug line-clamp-2 italic">&ldquo;{debate.claim}&rdquo;</p>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-ink-muted flex-wrap">
                  <span className="font-bold">{debate.side1Label ?? 'Side 1'}:</span>
                  <span>{side1First?.displayName}</span>
                  <span className="text-rule-dark">vs</span>
                  <span className="font-bold">{debate.side2Label ?? 'Side 2'}:</span>
                  <span>{side2First?.displayName}</span>
                  <span className="text-ink-faint ml-auto">{debate.votes.length} votes</span>
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
                className="block border-l-4 border-field bg-paper-dark px-4 py-3 hover:bg-paper-deeper transition-colors"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Handshake size={12} className="text-field" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-field">Bet</span>
                  <span className={`ml-auto text-[10px] font-bold uppercase ${bet.status === 'resolved' ? 'text-ink-faint' : bet.status === 'awaiting-resolution' ? 'text-rule-dark' : 'text-field'}`}>
                    {bet.status}
                  </span>
                </div>
                <p className="text-sm text-ink font-medium leading-snug line-clamp-2 italic">&ldquo;{bet.claim}&rdquo;</p>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-ink-muted">
                  <span>{p1?.displayName}</span>
                  <span className="text-rule-dark">🤝</span>
                  <span>{p2?.displayName}</span>
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
                className="block border-l-4 border-press bg-paper-dark px-4 py-3 hover:bg-paper-deeper transition-colors"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Flame size={12} className="text-press" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-press">Hot Take</span>
                  <span className="ml-auto text-[10px] text-ink-faint">{ht.chatName}</span>
                </div>
                <p className="text-sm text-ink font-medium leading-snug line-clamp-2 italic">&ldquo;{ht.content}&rdquo;</p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-ink-muted">
                  <span>{author?.displayName}</span>
                  <span className="text-ink-faint">· {totalReactions(ht.reactions)} reactions · {timeAgo(ht.createdAt)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
