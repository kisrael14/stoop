'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Swords, Handshake, Flame, Star, UserPlus, UserCheck, MessageCircle } from 'lucide-react';
import { getUserById, DEBATES, BETS, HOT_TAKES, CHATS, ME } from '@/lib/mock-data';
import { timeAgo, totalReactions } from '@/lib/utils';

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = getUserById(id);
  const [following, setFollowing] = useState(ME.followingIds.includes(id));

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <p className="text-3xl mb-2">👤</p>
        <p>User not found</p>
      </div>
    );
  }

  const isMe = user.id === 'me';
  const sharedNeighborhoods = CHATS.filter(
    (c) => c.memberIds.includes('me') && c.memberIds.includes(user.id)
  );
  const userDebates = DEBATES.filter(
    (d) => d.party1Id === user.id || d.party2Id === user.id
  );
  const userBets = BETS.filter((b) => b.participantIds.includes(user.id));
  const userHotTakes = HOT_TAKES.filter((h) => h.authorId === user.id);
  const { stats } = user;

  return (
    <div className="flex flex-col bg-slate-950 min-h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white p-1">
          <ArrowLeft size={22} />
        </button>
        <p className="font-semibold text-white">@{user.username}</p>
        {isMe && (
          <Link href="/stoop" className="ml-auto text-sm text-orange-400 hover:text-orange-300 font-medium">
            Edit Profile →
          </Link>
        )}
      </div>

      {/* Profile hero */}
      <div className="bg-linear-to-b from-slate-800 to-slate-950 px-5 pb-6 pt-6">
        <div className="flex items-end gap-4 mb-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-700 text-4xl ring-2 ring-orange-500">
            {user.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white">{user.displayName}</h1>
            <p className="text-sm text-slate-400">@{user.username}</p>
          </div>
          {!isMe && (
            <div className="flex gap-2">
              <button
                onClick={() => setFollowing((f) => !f)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  following
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {following ? <UserCheck size={15} /> : <UserPlus size={15} />}
                {following ? 'Following' : 'Follow'}
              </button>
              {sharedNeighborhoods.length > 0 && (
                <Link
                  href={`/neighborhoods/${sharedNeighborhoods[0].id}?tab=chat`}
                  className="flex items-center justify-center h-9 w-9 rounded-full border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
                >
                  <MessageCircle size={16} />
                </Link>
              )}
            </div>
          )}
        </div>

        {user.bio && <p className="text-sm text-slate-300 leading-relaxed mb-4">{user.bio}</p>}

        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-lg font-bold text-white">{user.followerIds.length}</p>
            <p className="text-xs text-slate-400">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">{user.followingIds.length}</p>
            <p className="text-xs text-slate-400">Following</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-orange-400">{stats.hotTakesPosted}</p>
            <p className="text-xs text-slate-400">Hot Takes</p>
          </div>
        </div>
      </div>

      {/* Shared neighborhoods */}
      {sharedNeighborhoods.length > 0 && !isMe && (
        <div className="px-5 py-4 border-b border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Shared Neighborhoods</p>
          <div className="flex gap-2 flex-wrap">
            {sharedNeighborhoods.map((c) => (
              <Link
                key={c.id}
                href={`/neighborhoods/${c.id}`}
                className="flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
              >
                <span>{c.emoji}</span>
                <span>{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Fan teams */}
      <section className="px-5 py-4 border-b border-slate-800">
        <h2 className="text-sm font-bold text-white mb-3">Fan Identity</h2>
        <div className="flex flex-col gap-2">
          {user.fanTeams.map((ft) => (
            <div
              key={ft.team.id}
              className="flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-2.5"
              style={{ borderLeft: `3px solid ${ft.team.color}` }}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: ft.team.color }}>
                {ft.rank}
              </span>
              <span className="text-xl">{ft.team.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{ft.team.city} {ft.team.name}</p>
                <p className="text-xs text-slate-400">{ft.team.league}</p>
              </div>
              {ft.rank === 1 && <Star size={13} className="text-orange-400" fill="currentColor" />}
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="px-5 py-4 border-b border-slate-800">
        <h2 className="text-sm font-bold text-white mb-3">Bragging Rights</h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Debates Won', value: stats.debatesWon, color: 'text-blue-400' },
            { label: 'Bets Won', value: stats.betsWon, color: 'text-green-400' },
            { label: 'Hot Take Reactions', value: stats.hotTakeReactions, color: 'text-orange-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl bg-slate-900 px-3 py-3 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent debates */}
      {userDebates.length > 0 && (
        <section className="px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Swords size={14} className="text-blue-400" />
            <h2 className="text-sm font-bold text-white">Recent Debates</h2>
            <span className="text-xs text-slate-500">{stats.debatesWon}W · {stats.debatesLost}L</span>
          </div>
          <div className="flex flex-col gap-2">
            {userDebates.slice(0, 3).map((d) => {
              const isParty1 = d.party1Id === user.id;
              const won = d.status === 'resolved' && ((isParty1 && d.resolution === 'party1') || (!isParty1 && d.resolution === 'party2'));
              const lost = d.status === 'resolved' && ((isParty1 && d.resolution === 'party2') || (!isParty1 && d.resolution === 'party1'));
              return (
                <Link
                  key={d.id}
                  href={`/neighborhoods/${d.chatId}?tab=debates`}
                  className="flex items-start gap-3 rounded-xl bg-slate-900 px-4 py-3 hover:bg-slate-800 transition-colors"
                >
                  <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${won ? 'bg-green-500' : lost ? 'bg-red-500' : 'bg-blue-500'}`} />
                  <p className="text-sm text-slate-200 line-clamp-1 flex-1">{d.claim}</p>
                  <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${won ? 'bg-green-900/60 text-green-400' : lost ? 'bg-red-900/60 text-red-400' : 'bg-blue-900/60 text-blue-400'}`}>
                    {won ? 'W' : lost ? 'L' : 'Active'}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent hot takes */}
      {userHotTakes.length > 0 && (
        <section className="px-5 py-4 pb-8">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={14} className="text-orange-400" />
            <h2 className="text-sm font-bold text-white">Hot Takes</h2>
            <span className="text-xs text-slate-500">{totalReactions(userHotTakes.flatMap((h) => h.reactions))} total reactions</span>
          </div>
          <div className="flex flex-col gap-2">
            {userHotTakes.slice(0, 3).map((ht) => (
              <Link
                key={ht.id}
                href={`/neighborhoods/${ht.chatId}?tab=hot-takes`}
                className="rounded-xl border border-orange-900/30 bg-orange-950/10 px-4 py-3 hover:bg-orange-950/20 transition-colors"
              >
                <p className="text-sm text-slate-200 line-clamp-2">&ldquo;{ht.content}&rdquo;</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-1 flex-wrap">
                    {ht.reactions.map((r) => (
                      <span key={r.emoji} className="text-xs text-slate-500">{r.emoji}{r.userIds.length}</span>
                    ))}
                  </div>
                  <span className="ml-auto text-xs text-slate-600">{timeAgo(ht.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
