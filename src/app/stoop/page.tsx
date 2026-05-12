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
  const myDebates = DEBATES.filter((d) => d.party1Id === 'me' || d.party2Id === 'me').slice(0, 2);
  const myBets = BETS.filter((b) => b.participantIds.includes('me')).slice(0, 2);
  const myHotTakes = HOT_TAKES.filter((h) => h.authorId === 'me' || h.teamIds.some((t) => myTeamIds.includes(t))).slice(0, 2);
  const { stats } = ME;

  const myNeighborhoods = CHATS.filter((c) => c.memberIds.includes('me'));
  const neighborhoodMembers = [...new Set(myNeighborhoods.flatMap((c) => c.memberIds))].filter((id) => id !== 'me');

  return (
    <div className="flex flex-col bg-slate-950">
      {/* Header */}
      <div className="relative bg-linear-to-b from-slate-800 to-slate-950 px-5 pb-6 pt-10">
        <div className="absolute right-5 top-10 flex gap-2">
          <Link href="/discover" className="rounded-full bg-slate-800 p-2 text-slate-400 hover:text-white transition-colors" title="Discover">
            <Compass size={18} />
          </Link>
          <Link href="/onboarding" className="rounded-full bg-slate-800 p-2 text-slate-400 hover:text-white transition-colors" title="Edit profile">
            <Settings size={18} />
          </Link>
        </div>

        <div className="flex items-end gap-4">
          <div className="relative">
            <Link href={`/users/me`}>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-700 text-4xl ring-2 ring-orange-500 hover:ring-orange-400 transition-all">
                {ME.avatar}
              </div>
            </Link>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
              #1
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{ME.displayName}</h1>
            <p className="text-sm text-slate-400">@{ME.username}</p>
          </div>
        </div>

        {ME.bio && <p className="mt-4 text-sm leading-relaxed text-slate-300">{ME.bio}</p>}

        <div className="mt-4 flex gap-6">
          <Link href="/discover?filter=followers" className="text-center hover:opacity-80 transition-opacity">
            <p className="text-lg font-bold text-white">{ME.followerIds.length}</p>
            <p className="text-xs text-slate-400">Neighbors</p>
          </Link>
          <Link href="/discover?filter=following" className="text-center hover:opacity-80 transition-opacity">
            <p className="text-lg font-bold text-white">{ME.followingIds.length}</p>
            <p className="text-xs text-slate-400">Following</p>
          </Link>
          <Link href="/neighborhoods" className="text-center hover:opacity-80 transition-opacity">
            <p className="text-lg font-bold text-white">{myNeighborhoods.length}</p>
            <p className="text-xs text-slate-400">Neighborhoods</p>
          </Link>
          <div className="text-center">
            <p className="text-lg font-bold text-orange-400">{stats.hotTakesPosted}</p>
            <p className="text-xs text-slate-400">Hot Takes</p>
          </div>
        </div>
      </div>

      {/* Notification banner */}
      {notifStatus === 'unknown' && (
        <div className="mx-5 mt-4 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3">
          <Bell size={18} className="text-orange-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Enable notifications</p>
            <p className="text-xs text-slate-400">Get alerted for new messages, debates, and bets</p>
          </div>
          <button
            onClick={enableNotifications}
            className="shrink-0 rounded-full bg-orange-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-600 transition-colors"
          >
            Enable
          </button>
        </div>
      )}
      {notifStatus === 'granted' && (
        <div className="mx-5 mt-4 flex items-center gap-2 rounded-xl bg-green-950/30 border border-green-900/40 px-4 py-2.5">
          <Bell size={14} className="text-green-400" />
          <p className="text-xs text-green-400 font-medium">Notifications enabled — you&apos;re all set</p>
        </div>
      )}
      {notifStatus === 'denied' && (
        <div className="mx-5 mt-4 flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5">
          <BellOff size={14} className="text-slate-500" />
          <p className="text-xs text-slate-500">Notifications blocked — enable in browser settings</p>
        </div>
      )}

      {/* Neighborhood members */}
      {neighborhoodMembers.length > 0 && (
        <section className="px-5 py-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users size={15} className="text-slate-400" />
              <h2 className="text-sm font-bold text-white">My Neighborhood</h2>
            </div>
            <Link href="/discover" className="text-xs text-orange-400 hover:text-orange-300">Find more →</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {neighborhoodMembers.slice(0, 6).map((uid) => {
              const user = getUserById(uid);
              if (!user) return null;
              return (
                <Link key={uid} href={`/users/${uid}`} className="flex flex-col items-center gap-1.5 shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-xl hover:ring-2 hover:ring-orange-500 transition-all">
                    {user.avatar}
                  </div>
                  <p className="text-[10px] text-slate-400 text-center w-12 truncate">{user.displayName.split(' ')[0]}</p>
                </Link>
              );
            })}
            <Link href="/discover" className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-slate-700 text-slate-500 hover:border-orange-500 hover:text-orange-500 transition-all">
                <span className="text-xl">+</span>
              </div>
              <p className="text-[10px] text-slate-500">Add</p>
            </Link>
          </div>
        </section>
      )}

      {/* Fan Identity */}
      <section className="px-5 py-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white">My Teams</h2>
          <Link href="/discover?mode=teams" className="text-xs text-orange-400 hover:text-orange-300">Add teams →</Link>
        </div>
        <div className="flex flex-col gap-2">
          {ME.fanTeams.map((ft) => (
            <Link
              key={ft.team.id}
              href={`/discover?mode=teams&q=${ft.team.name}`}
              className="flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 hover:bg-slate-800 transition-colors"
              style={{ borderLeft: `3px solid ${ft.team.color}` }}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: ft.team.color }}>
                {ft.rank}
              </span>
              <span className="text-xl">{ft.team.emoji}</span>
              <div className="flex-1">
                <p className="font-semibold text-white text-sm">{ft.team.city} {ft.team.name}</p>
                <p className="text-xs text-slate-400">{ft.team.league}</p>
              </div>
              {ft.rank === 1 && <Star size={13} className="text-orange-400" fill="currentColor" />}
            </Link>
          ))}
        </div>
      </section>

      {/* Stats Panel */}
      <section className="px-5 py-4 border-b border-slate-800">
        <h2 className="text-sm font-bold text-white mb-3">Bragging Rights</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/neighborhoods" className="rounded-xl border border-blue-900/40 bg-slate-900 px-4 py-3 hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Swords size={16} className="text-blue-400" />
              <span className="text-xs text-slate-400">Debates</span>
            </div>
            <p className="text-lg font-bold text-white">{stats.debatesWon}W · {stats.debatesLost}L · {stats.debatesDrew}D</p>
          </Link>
          <Link href="/neighborhoods" className="rounded-xl border border-green-900/40 bg-slate-900 px-4 py-3 hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Handshake size={16} className="text-green-400" />
              <span className="text-xs text-slate-400">Bets</span>
            </div>
            <p className="text-lg font-bold text-white">{stats.betsWon}W · {stats.betsLost}L</p>
          </Link>
          <div className="rounded-xl border border-orange-900/40 bg-slate-900 px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <Flame size={16} className="text-orange-400" />
              <span className="text-xs text-slate-400">Hot Take Reactions</span>
            </div>
            <p className="text-lg font-bold text-white">{stats.hotTakeReactions}</p>
          </div>
          <div className="rounded-xl border border-yellow-900/40 bg-slate-900 px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={16} className="text-yellow-400" />
              <span className="text-xs text-slate-400">Bets Pending</span>
            </div>
            <p className="text-lg font-bold text-white">{stats.betsPending}</p>
          </div>
        </div>
      </section>

      {/* Content feed */}
      <section className="px-5 py-4 pb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white">Your Scene</h2>
          <Link href="/neighborhoods" className="text-xs text-orange-400 hover:text-orange-300">See all →</Link>
        </div>

        <div className="flex flex-col gap-3">
          {myDebates.map((debate) => {
            const p1 = getUserById(debate.party1Id);
            const p2 = getUserById(debate.party2Id);
            return (
              <Link
                key={debate.id}
                href={`/neighborhoods/${debate.chatId}?tab=debates`}
                className="block rounded-xl border border-blue-900/40 bg-blue-950/20 p-4 hover:bg-blue-950/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Swords size={13} className="text-blue-400" />
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">Debate</span>
                  <span className="text-xs text-slate-500">{debate.chatName}</span>
                </div>
                <p className="text-sm text-slate-200 leading-snug line-clamp-2">&ldquo;{debate.claim}&rdquo;</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <Link href={`/users/${p1?.id}`} onClick={(e) => e.stopPropagation()} className="hover:text-orange-400 transition-colors">{p1?.displayName}</Link>
                  <span>vs</span>
                  <Link href={`/users/${p2?.id}`} onClick={(e) => e.stopPropagation()} className="hover:text-orange-400 transition-colors">{p2?.displayName}</Link>
                  <span>·</span>
                  <span>{debate.votes.length} votes · {timeAgo(debate.createdAt)}</span>
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
                className="block rounded-xl border border-green-900/40 bg-green-950/20 p-4 hover:bg-green-950/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Handshake size={13} className="text-green-400" />
                  <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">Bet</span>
                  <span className="text-xs text-slate-500">{bet.chatName}</span>
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${bet.status === 'resolved' ? 'bg-slate-800 text-slate-400' : bet.status === 'awaiting-resolution' ? 'bg-yellow-900/60 text-yellow-400' : 'bg-green-900/40 text-green-400'}`}>
                    {bet.status === 'active' ? 'Active' : bet.status === 'resolved' ? 'Resolved' : 'Pending'}
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-snug line-clamp-2">&ldquo;{bet.claim}&rdquo;</p>
                <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                  <Link href={`/users/${p1?.id}`} onClick={(e) => e.stopPropagation()} className="hover:text-orange-400 transition-colors">{p1?.displayName}</Link>
                  <span>🤝</span>
                  <Link href={`/users/${p2?.id}`} onClick={(e) => e.stopPropagation()} className="hover:text-orange-400 transition-colors">{p2?.displayName}</Link>
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
                className="block rounded-xl border border-orange-900/40 bg-orange-950/20 p-4 hover:bg-orange-950/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Flame size={13} className="text-orange-400" />
                  <span className="text-xs font-semibold text-orange-400 uppercase tracking-wide">Hot Take</span>
                  <span className="text-xs text-slate-500">{ht.chatName}</span>
                </div>
                <p className="text-sm text-slate-200 leading-snug line-clamp-2">&ldquo;{ht.content}&rdquo;</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <Link href={`/users/${ht.authorId}`} onClick={(e) => e.stopPropagation()} className="hover:text-orange-400 transition-colors">{author?.displayName}</Link>
                  <span>·</span>
                  <span>{totalReactions(ht.reactions)} reactions · {timeAgo(ht.createdAt)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
