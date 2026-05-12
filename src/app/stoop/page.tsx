'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Settings, Users, Flame, Swords, Handshake, Trophy, Star } from 'lucide-react';
import { ME, DEBATES, BETS, HOT_TAKES, getUserById } from '@/lib/mock-data';
import { timeAgo, totalReactions } from '@/lib/utils';

type FeedFilter = 'all' | 'my-teams' | 'my-leagues';

export default function StoopPage() {
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('all');

  const myTeamIds = ME.fanTeams.map((ft) => ft.team.id);

  const myDebates = DEBATES.filter(
    (d) => d.party1Id === 'me' || d.party2Id === 'me' || d.votes.some((v) => v.userId === 'me')
  ).slice(0, 2);

  const myBets = BETS.filter((b) => b.participantIds.includes('me')).slice(0, 2);

  const myHotTakes = HOT_TAKES.filter((h) => h.authorId === 'me' || h.teamIds.some((t) => myTeamIds.includes(t))).slice(0, 2);

  const stats = ME.stats;

  return (
    <div className="flex flex-col bg-slate-950">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-slate-800 to-slate-950 px-5 pb-6 pt-10">
        <div className="absolute right-5 top-10">
          <Link href="/onboarding" className="rounded-full bg-slate-800 p-2 text-slate-400 hover:text-white">
            <Settings size={18} />
          </Link>
        </div>

        <div className="flex items-end gap-4">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-700 text-4xl ring-2 ring-orange-500">
              {ME.avatar}
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
              #1
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{ME.displayName}</h1>
            <p className="text-sm text-slate-400">@{ME.username}</p>
          </div>
        </div>

        {ME.bio && (
          <p className="mt-4 text-sm leading-relaxed text-slate-300">{ME.bio}</p>
        )}

        <div className="mt-4 flex gap-6">
          <div className="text-center">
            <p className="text-lg font-bold text-white">{ME.followerIds.length}</p>
            <p className="text-xs text-slate-400">Neighbors</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">{ME.followingIds.length}</p>
            <p className="text-xs text-slate-400">Following</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-orange-400">{stats.hotTakesPosted}</p>
            <p className="text-xs text-slate-400">Hot Takes</p>
          </div>
        </div>
      </div>

      {/* Fan Identity */}
      <section className="px-5 py-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">My Teams</h2>
          <Link href="/onboarding" className="text-xs text-orange-400 hover:text-orange-300">Edit</Link>
        </div>
        <div className="flex flex-col gap-2">
          {ME.fanTeams.map((ft) => (
            <div
              key={ft.team.id}
              className="flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-3"
              style={{ borderLeft: `3px solid ${ft.team.color}` }}
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: ft.team.color }}
              >
                {ft.rank}
              </span>
              <span className="text-xl">{ft.team.emoji}</span>
              <div className="flex-1">
                <p className="font-semibold text-white">
                  {ft.team.city} {ft.team.name}
                </p>
                <p className="text-xs text-slate-400">{ft.team.league}</p>
              </div>
              {ft.rank === 1 && <Star size={14} className="text-orange-400" fill="currentColor" />}
            </div>
          ))}
        </div>
      </section>

      {/* Stats Panel */}
      <section className="px-5 pb-5">
        <h2 className="mb-3 text-base font-bold text-white">Bragging Rights</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Swords size={18} className="text-blue-400" />}
            label="Debates"
            value={`${stats.debatesWon}W · ${stats.debatesLost}L · ${stats.debatesDrew}D`}
            accent="blue"
          />
          <StatCard
            icon={<Handshake size={18} className="text-green-400" />}
            label="Bets"
            value={`${stats.betsWon}W · ${stats.betsLost}L`}
            accent="green"
          />
          <StatCard
            icon={<Flame size={18} className="text-orange-400" />}
            label="Hot Take Reactions"
            value={stats.hotTakeReactions.toString()}
            accent="orange"
          />
          <StatCard
            icon={<Trophy size={18} className="text-yellow-400" />}
            label="Bets Pending"
            value={stats.betsPending.toString()}
            accent="yellow"
          />
        </div>
      </section>

      {/* Content Feed */}
      <section className="px-5 pb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Your Scene</h2>
          <div className="flex gap-1">
            {(['all', 'my-teams'] as FeedFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFeedFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  feedFilter === f
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {f === 'all' ? 'All' : 'My Teams'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {/* Active debates */}
          {myDebates.map((debate) => {
            const p1 = getUserById(debate.party1Id);
            const p2 = getUserById(debate.party2Id);
            return (
              <Link
                key={debate.id}
                href="/debates"
                className="block rounded-xl border border-blue-900/40 bg-blue-950/20 p-4 hover:bg-blue-950/30 transition-colors"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Swords size={13} className="text-blue-400" />
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">Debate</span>
                  <span className="text-xs text-slate-500">{debate.chatName}</span>
                </div>
                <p className="text-sm text-slate-200 leading-snug line-clamp-2">&ldquo;{debate.claim}&rdquo;</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <span>{p1?.displayName} vs {p2?.displayName}</span>
                  <span>·</span>
                  <span>{debate.votes.length} votes</span>
                  <span>·</span>
                  <span>{timeAgo(debate.createdAt)}</span>
                </div>
              </Link>
            );
          })}

          {/* Active bets */}
          {myBets.map((bet) => {
            const p1 = getUserById(bet.participantIds[0]);
            const p2 = getUserById(bet.participantIds[1]);
            return (
              <Link
                key={bet.id}
                href="/bets"
                className="block rounded-xl border border-green-900/40 bg-green-950/20 p-4 hover:bg-green-950/30 transition-colors"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Handshake size={13} className="text-green-400" />
                  <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">Bet</span>
                  <span className="text-xs text-slate-500">{bet.chatName}</span>
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${
                      bet.status === 'resolved'
                        ? 'bg-slate-800 text-slate-400'
                        : bet.status === 'awaiting-resolution'
                        ? 'bg-yellow-900/60 text-yellow-400'
                        : 'bg-green-900/40 text-green-400'
                    }`}
                  >
                    {bet.status === 'active' ? 'Active' : bet.status === 'resolved' ? 'Resolved' : 'Pending'}
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-snug line-clamp-2">&ldquo;{bet.claim}&rdquo;</p>
                <div className="mt-2 text-xs text-slate-500">
                  {p1?.displayName} 🤝 {p2?.displayName}
                </div>
              </Link>
            );
          })}

          {/* Hot takes */}
          {myHotTakes.map((ht) => {
            const author = getUserById(ht.authorId);
            return (
              <Link
                key={ht.id}
                href="/hot-takes"
                className="block rounded-xl border border-orange-900/40 bg-orange-950/20 p-4 hover:bg-orange-950/30 transition-colors"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Flame size={13} className="text-orange-400" />
                  <span className="text-xs font-semibold text-orange-400 uppercase tracking-wide">Hot Take</span>
                  <span className="text-xs text-slate-500">{ht.chatName}</span>
                </div>
                <p className="text-sm text-slate-200 leading-snug line-clamp-2">&ldquo;{ht.content}&rdquo;</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <span>{author?.displayName}</span>
                  <span>·</span>
                  <span>{totalReactions(ht.reactions)} reactions</span>
                  <span>·</span>
                  <span>{timeAgo(ht.createdAt)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: 'blue' | 'green' | 'orange' | 'yellow';
}) {
  const borders: Record<string, string> = {
    blue: 'border-blue-900/40',
    green: 'border-green-900/40',
    orange: 'border-orange-900/40',
    yellow: 'border-yellow-900/40',
  };
  return (
    <div className={`rounded-xl border bg-slate-900 px-4 py-3 ${borders[accent]}`}>
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
}
