'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Swords, Handshake, Flame, Star, UserPlus, UserCheck, MessageCircle } from 'lucide-react';
import { getUserById, DEBATES, BETS, HOT_TAKES, CHATS, ME } from '@/lib/mock-data';
import { timeAgo, totalReactions } from '@/lib/utils';
import { computeBadges } from '@/lib/badges';
import TeamLogo from '@/components/TeamLogo';
import BadgeChip from '@/components/BadgeChip';

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
  const sharedNeighborhoods = CHATS.filter(
    (c) => c.memberIds.includes('me') && c.memberIds.includes(user.id)
  );
  const userDebates = DEBATES.filter(
    (d) => d.side1UserIds.includes(user.id) || d.side2UserIds.includes(user.id)
  );
  const userBets = BETS.filter((b) => b.participantIds.includes(user.id));
  const userHotTakes = HOT_TAKES.filter((h) => h.authorId === user.id);
  const { stats } = user;
  const badges = computeBadges(user.id);

  return (
    <div className="flex flex-col bg-paper min-h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b-2 border-ink bg-ink">
        <button onClick={() => router.back()} className="text-paper/60 hover:text-paper p-1">
          <ArrowLeft size={20} />
        </button>
        <p className="font-bold text-paper font-mono">@{user.username}</p>
        {isMe && (
          <Link href="/stoop" className="ml-auto text-[11px] font-bold uppercase tracking-widest text-press hover:text-press/80">
            Edit Profile →
          </Link>
        )}
      </div>

      {/* Profile hero */}
      <div className="bg-ink px-5 pb-6 pt-6">
        <div className="flex items-end gap-4 mb-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-ink-muted/30 text-4xl ring-2 ring-press">
            {user.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl font-bold text-paper">{user.displayName}</h1>
            <p className="text-sm text-paper/50 font-mono">@{user.username}</p>
          </div>
          {!isMe && (
            <div className="flex gap-2">
              <button
                onClick={() => setFollowing((f) => !f)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  following
                    ? 'bg-ink-muted/30 text-paper/70 hover:bg-ink-muted/50'
                    : 'bg-press text-paper hover:bg-press/80'
                }`}
              >
                {following ? <UserCheck size={13} /> : <UserPlus size={13} />}
                {following ? 'Following' : 'Follow'}
              </button>
              {sharedNeighborhoods.length > 0 && (
                <Link
                  href={`/neighborhoods/${sharedNeighborhoods[0].id}?tab=chat`}
                  className="flex items-center justify-center h-9 w-9 border border-paper/30 text-paper/60 hover:text-paper hover:border-paper/60 transition-colors"
                >
                  <MessageCircle size={15} />
                </Link>
              )}
            </div>
          )}
        </div>

        {user.bio && <p className="text-sm text-paper/70 leading-relaxed mb-4 italic">{user.bio}</p>}

        <div className="flex gap-6 border-t border-paper/20 pt-4">
          <div className="text-center">
            <p className="text-lg font-bold text-paper">{user.followerIds.length}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-paper/50">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-paper">{user.followingIds.length}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-paper/50">Following</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-press">{stats.hotTakesPosted}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-paper/50">Hot Takes</p>
          </div>
        </div>
      </div>

      {/* Shared neighborhoods */}
      {sharedNeighborhoods.length > 0 && !isMe && (
        <div className="px-5 py-4 border-b border-rule">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-2">Shared Neighborhoods</p>
          <div className="flex gap-2 flex-wrap">
            {sharedNeighborhoods.map((c) => (
              <Link
                key={c.id}
                href={`/neighborhoods/${c.id}`}
                className="flex items-center gap-2 border border-rule bg-paper-dark px-3 py-1.5 text-xs font-semibold text-ink hover:bg-paper-deeper transition-colors"
              >
                <span>{c.emoji}</span>
                <span>{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Fan teams */}
      <section className="px-5 py-4 border-b border-rule">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-3">Fan Identity</h2>
        <div className="flex flex-col gap-0">
          {user.fanTeams.map((ft, i) => (
            <div
              key={ft.team.id}
              className={`flex items-center gap-3 px-4 py-2.5 border-b border-rule/50 last:border-0 ${i === 0 ? 'border-t border-rule/50' : ''}`}
              style={{ borderLeftWidth: '3px', borderLeftColor: ft.team.color, borderLeftStyle: 'solid' }}
            >
              <span className="flex h-6 w-6 items-center justify-center text-xs font-bold text-paper rounded-full" style={{ backgroundColor: ft.team.color }}>
                {ft.rank}
              </span>
              <TeamLogo team={ft.team} size={24} />
              <div className="flex-1">
                <p className="text-sm font-bold text-ink">{ft.team.city} {ft.team.name}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink-faint">{ft.team.league}</p>
              </div>
              {ft.rank === 1 && <Star size={13} className="text-press" fill="currentColor" />}
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="px-5 py-4 border-b border-rule">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-3">Bragging Rights</h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Debates Won', value: stats.debatesWon, color: 'text-navy' },
            { label: 'Bets Won', value: stats.betsWon, color: 'text-field' },
            { label: 'Reactions', value: stats.hotTakeReactions, color: 'text-press' },
          ].map(({ label, value, color }) => (
            <div key={label} className="border border-rule bg-paper-dark px-3 py-3 text-center">
              <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-[9px] font-bold uppercase tracking-wide text-ink-faint mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Badges */}
      <section className="px-5 py-4 border-b border-rule">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">Badges</h2>
          <span className="text-[9px] text-ink-faint italic">Tap to learn more</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <BadgeChip key={badge.type} badge={badge} />
          ))}
        </div>
        <p className="text-[9px] text-ink-faint italic mt-3 leading-relaxed">
          Badges are earned from activity over the last 6 months. Keep posting to level up — or go quiet and drop back down.
        </p>
      </section>

      {/* Recent debates */}
      {userDebates.length > 0 && (
        <section className="px-5 py-4 border-b border-rule">
          <div className="flex items-center gap-2 mb-3">
            <Swords size={13} className="text-navy" />
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">Recent Debates</h2>
            <span className="text-[10px] text-ink-faint ml-auto">{stats.debatesWon}W · {stats.debatesLost}L</span>
          </div>
          <div className="flex flex-col gap-0">
            {userDebates.slice(0, 3).map((d, i) => {
              const onSide1 = d.side1UserIds.includes(user.id);
              const won = d.status === 'resolved' && ((onSide1 && d.resolution === 'side1') || (!onSide1 && d.resolution === 'side2'));
              const lost = d.status === 'resolved' && ((onSide1 && d.resolution === 'side2') || (!onSide1 && d.resolution === 'side1'));
              return (
                <Link
                  key={d.id}
                  href={`/neighborhoods/${d.chatId}?tab=debates`}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-paper-dark transition-colors border-b border-rule/50 last:border-0 ${i === 0 ? 'border-t border-rule/50' : ''}`}
                >
                  <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${won ? 'bg-field' : lost ? 'bg-masthead' : 'bg-navy'}`} />
                  <p className="text-sm text-ink line-clamp-1 flex-1 italic">&ldquo;{d.claim}&rdquo;</p>
                  <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider border ${won ? 'border-field/40 text-field bg-field/10' : lost ? 'border-masthead/40 text-masthead bg-masthead/10' : 'border-navy/40 text-navy bg-navy/10'}`}>
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
            <Flame size={13} className="text-press" />
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">Hot Takes</h2>
            <span className="text-[10px] text-ink-faint ml-auto">{totalReactions(userHotTakes.flatMap((h) => h.reactions))} reactions</span>
          </div>
          <div className="flex flex-col gap-0">
            {userHotTakes.slice(0, 3).map((ht, i) => (
              <Link
                key={ht.id}
                href={`/neighborhoods/${ht.chatId}?tab=hot-takes`}
                className={`border-l-4 border-l-press px-4 py-3 hover:bg-paper-dark transition-colors border-b border-b-rule/50 last:border-b-0 ${i === 0 ? 'border-t border-t-rule/50' : ''}`}
              >
                <p className="text-sm text-ink line-clamp-2 italic font-medium">&ldquo;{ht.content}&rdquo;</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-1 flex-wrap">
                    {ht.reactions.map((r) => (
                      <span key={r.emoji} className="text-[11px] text-ink-faint font-mono">{r.emoji}{r.userIds.length}</span>
                    ))}
                  </div>
                  <span className="ml-auto text-[10px] text-ink-faint font-mono">{timeAgo(ht.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
