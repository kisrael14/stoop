'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Flame, Swords, Handshake, Trophy, Star, Users } from 'lucide-react';
import { DEBATES, BETS, HOT_TAKES, getUserById } from '@/lib/mock-data';
import { getTeamByIdFull } from '@/lib/teams-data';
import { timeAgo, totalReactions } from '@/lib/utils';
import type { VoteChoice } from '@/lib/types';

type Tab = 'overview' | 'debates' | 'hot-takes' | 'bets';
type Period = 'weekly' | 'monthly' | 'yearly';

const PERIOD_DAYS: Record<Period, number> = { weekly: 7, monthly: 30, yearly: 365 };

const RANK_STYLES = [
  'bg-ink text-paper',
  'bg-rule-dark text-paper',
  'bg-paper-deeper border border-rule text-ink',
  'bg-paper-dark border border-rule/50 text-ink-muted',
  'bg-paper-dark border border-rule/50 text-ink-muted',
];

function getTopFans(teamId: string, period: Period) {
  const cutoff = new Date('2026-05-13');
  cutoff.setDate(cutoff.getDate() - PERIOD_DAYS[period]);

  const scores: Record<string, number> = {};

  HOT_TAKES
    .filter((ht) => ht.teamIds.includes(teamId) && new Date(ht.createdAt) >= cutoff)
    .forEach((ht) => {
      scores[ht.authorId] = (scores[ht.authorId] || 0) + 5 + totalReactions(ht.reactions) * 2;
    });

  DEBATES
    .filter((d) => d.teamIds.includes(teamId) && new Date(d.createdAt) >= cutoff)
    .forEach((d) => {
      [...d.side1UserIds, ...d.side2UserIds].forEach((uid) => {
        scores[uid] = (scores[uid] || 0) + 3;
      });
      d.arguments.forEach((arg) => {
        scores[arg.userId] = (scores[arg.userId] || 0) + 2 + totalReactions(arg.reactions);
      });
    });

  BETS
    .filter((b) => b.teamIds.includes(teamId) && new Date(b.createdAt) >= cutoff)
    .forEach((b) => {
      b.participantIds.forEach((pid) => {
        scores[pid] = (scores[pid] || 0) + 4;
      });
    });

  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([userId, score]) => ({ user: getUserById(userId)!, score }))
    .filter((x) => x.user);
}

export default function TeamPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const team = getTeamByIdFull(id);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [period, setPeriod] = useState<Period>('weekly');

  if (!team) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-ink-muted italic">Team not found</p>
      </div>
    );
  }

  const teamDebates = DEBATES
    .filter((d) => d.teamIds.includes(id))
    .sort((a, b) => (b.votes.length + b.arguments.length) - (a.votes.length + a.arguments.length));

  const teamHotTakes = HOT_TAKES
    .filter((ht) => ht.teamIds.includes(id))
    .sort((a, b) => totalReactions(b.reactions) - totalReactions(a.reactions));

  const teamBets = BETS
    .filter((b) => b.teamIds.includes(id))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const topFans = getTopFans(id, period);

  const tabs: { id: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'overview',   label: 'Overview',  icon: Users,     count: 0 },
    { id: 'debates',    label: 'Debates',   icon: Swords,    count: teamDebates.length },
    { id: 'hot-takes',  label: 'Takes',     icon: Flame,     count: teamHotTakes.length },
    { id: 'bets',       label: 'Bets',      icon: Handshake, count: teamBets.length },
  ];

  const headerBg = team.color + 'dd';

  return (
    <div className="flex flex-col min-h-full bg-paper">
      {/* ── Team header ─────────────────────────────────────────────────── */}
      <div className="shrink-0 px-5 pt-10 pb-5" style={{ backgroundColor: headerBg }}>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-white/60 hover:text-white mb-5 text-xs font-bold uppercase tracking-widest transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.2)' }}
          >
            {team.emoji}
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/50">{team.league}</span>
            <h1 className="font-display text-2xl font-black text-white leading-none">{team.city}</h1>
            <h2 className="font-display text-2xl font-black leading-none" style={{ color: 'rgba(255,255,255,0.75)' }}>{team.name}</h2>
          </div>
        </div>
        <div className="flex gap-6 mt-5 pt-4 border-t border-white/20">
          {[
            { label: 'Debates',   value: teamDebates.length },
            { label: 'Hot Takes', value: teamHotTakes.length },
            { label: 'Bets',      value: teamBets.length },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xl font-bold text-white font-mono">{value}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/50">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex border-b-2 border-ink bg-paper">
        {tabs.map(({ id: tabId, label, icon: Icon, count }) => (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            className={`flex flex-1 items-center justify-center gap-1.5 px-2 py-2.5 text-[10px] font-bold uppercase tracking-widest border-b-2 -mb-0.5 transition-colors ${
              activeTab === tabId ? 'border-ink text-ink' : 'border-transparent text-ink-faint hover:text-ink-muted'
            }`}
          >
            <Icon size={11} />
            {label}
            {count > 0 && (
              <span className="text-[9px] bg-paper-dark px-1 rounded font-mono">{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="flex-1 overflow-y-auto pb-8">

          {/* Top Fans */}
          <div className="px-5 pt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star size={14} className="text-rule-dark" />
                <h3 className="font-display font-bold text-ink text-lg">Top Fans</h3>
              </div>
              {/* Period switcher */}
              <div className="flex border-2 border-ink overflow-hidden rounded-full">
                {(['weekly', 'monthly', 'yearly'] as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider transition-colors ${
                      period === p ? 'bg-ink text-paper' : 'bg-paper text-ink-muted hover:bg-paper-dark'
                    }`}
                  >
                    {p === 'weekly' ? 'Wk' : p === 'monthly' ? 'Mo' : 'Yr'}
                  </button>
                ))}
              </div>
            </div>

            {topFans.length > 0 ? (
              <div className="border-2 border-ink overflow-hidden">
                {topFans.map(({ user, score }, i) => (
                  <Link
                    key={user.id}
                    href={`/users/${user.id}`}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-paper-dark transition-colors border-b border-rule/50 last:border-0 ${i === 0 ? 'bg-paper-dark' : ''}`}
                  >
                    <div className={`flex h-7 w-7 items-center justify-center text-xs font-bold shrink-0 rounded-full ${RANK_STYLES[i]}`}>
                      {i + 1}
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-dark border border-rule text-xl shrink-0">
                      {user.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-ink text-sm">{user.displayName}</p>
                      <p className="text-[10px] text-ink-faint font-mono">@{user.username}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-ink font-mono">{score}</p>
                      <p className="text-[9px] text-ink-faint uppercase tracking-wide">pts</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="border border-rule/50 py-8 text-center">
                <p className="text-ink-muted italic text-sm">
                  No fan activity yet this {period === 'weekly' ? 'week' : period === 'monthly' ? 'month' : 'year'}
                </p>
                <p className="text-[10px] text-ink-faint mt-1">Post hot takes or debates to climb the board</p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="px-5 pt-5">
            <div className="section-header mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink">Recent Activity</span>
            </div>

            {teamDebates.length === 0 && teamHotTakes.length === 0 && teamBets.length === 0 ? (
              <div className="py-10 text-center border border-rule/50">
                <p className="text-2xl mb-2">{team.emoji}</p>
                <p className="font-display font-bold text-ink">No activity yet</p>
                <p className="text-sm text-ink-muted italic mt-1">Start debates in your neighborhoods</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {[
                  ...teamHotTakes.slice(0, 2).map((ht) => ({ type: 'hot-take' as const, time: ht.createdAt, ht })),
                  ...teamDebates.slice(0, 2).map((d)  => ({ type: 'debate'   as const, time: d.createdAt,  d  })),
                  ...teamBets.slice(0, 1).map((b)     => ({ type: 'bet'      as const, time: b.createdAt,  b  })),
                ]
                  .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                  .slice(0, 5)
                  .map((entry) => {
                    if (entry.type === 'hot-take') {
                      const ht = entry.ht;
                      const author = getUserById(ht.authorId);
                      return (
                        <div key={ht.id} className="border-l-4 border-press border border-rule/50 px-4 py-3 bg-paper">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-press">🔥 Hot Take</span>
                            <span className="text-[10px] text-ink-faint font-mono ml-auto">{timeAgo(ht.createdAt)}</span>
                          </div>
                          <p className="text-sm text-ink italic leading-snug">&ldquo;{ht.content}&rdquo;</p>
                          <p className="text-[10px] text-ink-faint mt-1.5">
                            — {author?.displayName} · <Link href={`/neighborhoods/${ht.chatId}`} className="font-bold hover:text-ink">{ht.chatName}</Link>
                          </p>
                        </div>
                      );
                    }
                    if (entry.type === 'debate') {
                      const d = entry.d;
                      return (
                        <Link key={d.id} href={`/debates/${d.id}`} className="border-l-4 border-navy border border-rule/50 px-4 py-3 bg-paper block hover:bg-paper-dark transition-colors">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-navy">⚔️ Debate</span>
                            <span className="text-[10px] text-ink-faint font-mono ml-auto">{timeAgo(d.createdAt)}</span>
                          </div>
                          <p className="text-sm text-ink italic leading-snug">&ldquo;{d.claim}&rdquo;</p>
                          <p className="text-[10px] text-masthead font-bold mt-1.5">Face-Off →</p>
                        </Link>
                      );
                    }
                    const b = entry.b;
                    const participants = b.participantIds.map((pid) => getUserById(pid)).filter(Boolean);
                    return (
                      <div key={b.id} className="border-l-4 border-field border border-rule/50 px-4 py-3 bg-paper">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-field">🤝 Bet</span>
                          <span className="text-[10px] text-ink-faint font-mono ml-auto">{timeAgo(b.createdAt)}</span>
                        </div>
                        <p className="text-sm text-ink italic leading-snug">&ldquo;{b.claim}&rdquo;</p>
                        <p className="text-[10px] text-ink-faint mt-1.5">{participants.map((p) => p!.displayName).join(' vs ')}</p>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── DEBATES TAB ───────────────────────────────────────────────────── */}
      {activeTab === 'debates' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 pb-8">
          {teamDebates.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-display text-4xl mb-2 text-ink-faint">⚔️</p>
              <p className="font-display font-bold text-ink text-lg">No debates yet</p>
              <p className="text-sm text-ink-muted italic mt-1">Start one in a neighborhood</p>
            </div>
          ) : teamDebates.map((debate) => {
            const side1Users = debate.side1UserIds.map((uid) => getUserById(uid)).filter(Boolean);
            const side2Users = debate.side2UserIds.map((uid) => getUserById(uid)).filter(Boolean);
            return (
              <div key={debate.id} className="border border-rule overflow-hidden">
                <div className="px-4 py-4 bg-paper">
                  <div className="flex items-center gap-2 mb-2">
                    <Swords size={12} className="text-navy" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-navy">Debate</span>
                    <span className="text-[10px] text-ink-faint font-mono">
                      {debate.votes.length} votes · {debate.arguments.length} args · {timeAgo(debate.createdAt)}
                    </span>
                    <Link
                      href={`/debates/${debate.id}`}
                      className="ml-auto text-[10px] font-bold uppercase tracking-wider text-masthead hover:underline"
                    >
                      Face-Off →
                    </Link>
                  </div>
                  <p className="text-sm text-ink font-medium italic mb-3 leading-snug">&ldquo;{debate.claim}&rdquo;</p>
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-navy">{debate.side1Label ?? 'Side 1'}:</span>
                    {side1Users.slice(0, 2).map((u) => (
                      <Link key={u!.id} href={`/users/${u!.id}`} className="flex items-center gap-1 bg-paper-dark border border-rule px-2 py-0.5 text-ink-muted hover:border-ink">
                        <span>{u!.avatar}</span><span>{u!.displayName.split(' ')[0]}</span>
                      </Link>
                    ))}
                    <span className="text-ink-faint font-bold mx-0.5">vs</span>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-field">{debate.side2Label ?? 'Side 2'}:</span>
                    {side2Users.slice(0, 2).map((u) => (
                      <Link key={u!.id} href={`/users/${u!.id}`} className="flex items-center gap-1 bg-paper-dark border border-rule px-2 py-0.5 text-ink-muted hover:border-ink">
                        <span>{u!.avatar}</span><span>{u!.displayName.split(' ')[0]}</span>
                      </Link>
                    ))}
                  </div>
                </div>
                {debate.status === 'resolved' && (
                  <div className="border-t border-rule bg-paper-dark px-4 py-2 flex items-center gap-2">
                    <Trophy size={12} className="text-rule-dark" />
                    <span className="text-[11px] font-bold text-ink">
                      {debate.resolution === 'side1' ? (debate.side1Label ?? 'Side 1')
                        : debate.resolution === 'side2' ? (debate.side2Label ?? 'Side 2')
                        : 'Draw'} won
                    </span>
                    <span className="ml-auto text-[10px] text-ink-faint font-mono">{timeAgo(debate.createdAt)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── HOT TAKES TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'hot-takes' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 pb-8">
          {teamHotTakes.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-display text-4xl mb-2 text-ink-faint">🔥</p>
              <p className="font-display font-bold text-ink text-lg">No hot takes yet</p>
              <p className="text-sm text-ink-muted italic mt-1">Drop one in a neighborhood</p>
            </div>
          ) : teamHotTakes.map((ht) => {
            const author = getUserById(ht.authorId);
            const reactions = totalReactions(ht.reactions);
            return (
              <div key={ht.id} className="border border-rule overflow-hidden">
                <div className="border-l-4 border-press px-4 pt-4 pb-3 bg-paper">
                  <div className="flex items-center gap-2 mb-3">
                    <Link href={`/users/${ht.authorId}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-dark border border-rule text-base hover:border-ink transition-all">
                      {author?.avatar}
                    </Link>
                    <div>
                      <Link href={`/users/${ht.authorId}`} className="text-sm font-bold text-ink hover:text-masthead transition-colors">
                        {author?.displayName}
                      </Link>
                      <p className="text-[10px] text-ink-faint font-mono">{timeAgo(ht.createdAt)}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1 text-press">
                      <Flame size={13} />
                      {reactions > 0 && <span className="text-xs font-bold">{reactions}</span>}
                    </div>
                  </div>
                  <p className="font-display text-base font-bold text-ink italic leading-snug">&ldquo;{ht.content}&rdquo;</p>
                </div>
                <div className="border-t border-rule/50 px-4 py-2 bg-paper-dark flex items-center gap-1 text-[10px] text-ink-faint font-mono">
                  From <Link href={`/neighborhoods/${ht.chatId}`} className="font-bold text-ink-muted hover:text-ink ml-1">{ht.chatName}</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── BETS TAB ──────────────────────────────────────────────────────── */}
      {activeTab === 'bets' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 pb-8">
          {teamBets.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-display text-4xl mb-2 text-ink-faint">🤝</p>
              <p className="font-display font-bold text-ink text-lg">No bets yet</p>
              <p className="text-sm text-ink-muted italic mt-1">Make one in a neighborhood</p>
            </div>
          ) : teamBets.map((bet) => {
            const participants = bet.participantIds.map((pid) => getUserById(pid)).filter(Boolean);
            const winner = bet.winnerId ? getUserById(bet.winnerId) : null;
            return (
              <div key={bet.id} className="border border-rule px-4 py-4 bg-paper">
                <div className="flex items-center gap-2 mb-2">
                  <Handshake size={12} className="text-field" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-field">Bet</span>
                  <span className={`ml-auto text-[10px] font-bold uppercase tracking-wide ${
                    bet.status === 'resolved' ? 'text-ink-faint' : 'text-field'
                  }`}>{bet.status}</span>
                </div>
                <p className="text-sm text-ink italic mb-3 leading-snug">&ldquo;{bet.claim}&rdquo;</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {participants.map((p, i) => (
                    <span key={p!.id} className="flex items-center gap-1">
                      {i > 0 && <span className="text-ink-faint text-xs">🤝</span>}
                      <Link href={`/users/${p!.id}`} className="flex items-center gap-1 border border-rule px-2 py-0.5 text-xs text-ink-muted hover:border-ink bg-paper-dark">
                        <span>{p!.avatar}</span><span>{p!.displayName.split(' ')[0]}</span>
                      </Link>
                    </span>
                  ))}
                  {bet.status === 'resolved' && (
                    <div className="ml-auto flex items-center gap-1.5">
                      <Trophy size={12} className="text-rule-dark" />
                      <span className="text-[11px] font-bold text-ink">{bet.isPush ? 'Push' : `${winner?.displayName} won`}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-ink-faint font-mono">{timeAgo(bet.createdAt)}</span>
                  <Link href={`/neighborhoods/${bet.chatId}`} className="text-[10px] font-bold text-masthead hover:underline">
                    {bet.chatName} →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
