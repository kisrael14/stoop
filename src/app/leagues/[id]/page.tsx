'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Flame, Snowflake, Swords, Handshake, Trophy, Users, Plus, Check } from 'lucide-react';
import { DEBATES, BETS, HOT_TAKES, getUserById } from '@/lib/mock-data';
import { getLeagueById } from '@/lib/leagues-data';
import { ALL_TEAMS } from '@/lib/teams-data';
import { timeAgo, totalReactions, teamDisplayName } from '@/lib/utils';
import type { VoteChoice } from '@/lib/types';
import TeamLogo from '@/components/TeamLogo';

type Tab = 'overview' | 'debates' | 'hot-takes' | 'bets';

export default function LeaguePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const league = getLeagueById(id);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isFollowing, setIsFollowing] = useState(false);
  const [localHotTakes, setLocalHotTakes] = useState(() => {
    const leagueTeamIds = ALL_TEAMS.filter((t) => t.league === id).map((t) => t.id);
    return HOT_TAKES
      .filter((ht) => ht.teamIds.some((tid) => leagueTeamIds.includes(tid)))
      .sort((a, b) => totalReactions(b.reactions) - totalReactions(a.reactions));
  });

  const voteHotTake = (htId: string, vote: '🔥' | '❄️') => {
    const opposite = vote === '🔥' ? '❄️' : '🔥';
    setLocalHotTakes((prev) =>
      prev.map((ht) => {
        if (ht.id !== htId) return ht;
        let reactions = ht.reactions
          .map((r) => r.emoji === opposite ? { ...r, userIds: r.userIds.filter((u) => u !== 'me') } : r)
          .filter((r) => r.userIds.length > 0);
        const existing = reactions.find((r) => r.emoji === vote);
        if (existing) {
          reactions = existing.userIds.includes('me')
            ? reactions.map((r) => r.emoji === vote ? { ...r, userIds: r.userIds.filter((u) => u !== 'me') } : r).filter((r) => r.userIds.length > 0)
            : reactions.map((r) => r.emoji === vote ? { ...r, userIds: [...r.userIds, 'me'] } : r);
        } else {
          reactions = [...reactions, { emoji: vote, userIds: ['me'] }];
        }
        return { ...ht, reactions };
      })
    );
  };

  if (!league) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-ink-muted italic">League not found</p>
      </div>
    );
  }

  const leagueTeams = ALL_TEAMS.filter((t) => t.league === id);
  const leagueTeamIds = leagueTeams.map((t) => t.id);

  const leagueDebates = DEBATES
    .filter((d) => d.teamIds.some((tid) => leagueTeamIds.includes(tid)))
    .sort((a, b) => (b.votes.length + b.arguments.length) - (a.votes.length + a.arguments.length));

  const leagueBets = BETS
    .filter((b) => b.teamIds.some((tid) => leagueTeamIds.includes(tid)))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const tabs: { id: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'overview',   label: 'Overview',  icon: Users,     count: 0 },
    { id: 'debates',    label: 'Debates',   icon: Swords,    count: leagueDebates.length },
    { id: 'hot-takes',  label: 'Takes',     icon: Flame,     count: localHotTakes.length },
    { id: 'bets',       label: 'Bets',      icon: Handshake, count: leagueBets.length },
  ];

  const headerBg = league.color + 'dd';

  return (
    <div className="flex flex-col min-h-full bg-paper">
      {/* ── League header ─────────────────────────────────────────────────── */}
      <div className="shrink-0 px-5 pt-10 pb-5" style={{ backgroundColor: headerBg }}>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-white/60 hover:text-white mb-5 text-xs font-bold uppercase tracking-widest transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl shrink-0 text-4xl"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.2)' }}
          >
            {league.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/50">{league.country}</span>
            <h1 className="font-display text-2xl font-black text-white leading-none">{league.name}</h1>
            <h2 className="font-display text-base font-bold leading-none" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {league.sport}
            </h2>
          </div>
          <button
            onClick={() => setIsFollowing((f) => !f)}
            className={`flex items-center justify-center h-10 w-10 rounded-full font-bold text-sm transition-all shrink-0 border-2 ${
              isFollowing
                ? 'bg-white/20 border-white/40 text-white hover:bg-white/10'
                : 'bg-white border-transparent text-ink hover:bg-white/90'
            }`}
            title={isFollowing ? 'Unfollow league' : 'Follow league'}
          >
            {isFollowing ? <Check size={15} /> : <Plus size={15} />}
          </button>
        </div>
        <div className="flex gap-6 mt-5 pt-4 border-t border-white/20">
          {[
            { label: 'Teams',     value: leagueTeams.length },
            { label: 'Debates',   value: leagueDebates.length },
            { label: 'Hot Takes', value: localHotTakes.length },
            { label: 'Bets',      value: leagueBets.length },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xl font-bold text-white font-mono">{value}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/50">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex border-b border-rule bg-paper-dark">
        {tabs.map(({ id: tabId, label, icon: Icon, count }) => (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            className={`flex flex-1 items-center justify-center gap-1.5 px-2 py-2.5 text-[10px] font-bold uppercase tracking-widest border-b-2 -mb-0.5 transition-colors ${
              activeTab === tabId ? 'border-masthead text-masthead' : 'border-transparent text-ink-faint hover:text-ink-muted'
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
          {/* Teams list */}
          <div className="px-5 pt-5">
            <div className="section-header mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink">Teams ({leagueTeams.length})</span>
            </div>
            <div className="flex flex-col">
              {leagueTeams.map((team, i) => (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  className={`flex items-center gap-3 px-4 py-3 bg-paper hover:bg-paper-dark transition-colors border-b border-rule/50 ${i === 0 ? 'border-t border-rule/50' : ''}`}
                  style={{ borderLeftWidth: '3px', borderLeftColor: team.color, borderLeftStyle: 'solid' }}
                >
                  <TeamLogo team={team} size={32} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink text-sm">{teamDisplayName(team)}</p>
                    <p className="text-[10px] text-ink-faint">{team.emoji}</p>
                  </div>
                  <span className="text-ink-faint text-xs">→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="px-5 pt-5">
            <div className="section-header mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink">Recent Activity</span>
            </div>
            {leagueDebates.length === 0 && localHotTakes.length === 0 && leagueBets.length === 0 ? (
              <div className="py-10 text-center border border-rule/50">
                <p className="text-2xl mb-2">{league.emoji}</p>
                <p className="font-display font-bold text-ink">No activity yet</p>
                <p className="text-sm text-ink-muted italic mt-1">Start debates in your neighborhoods</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {[
                  ...localHotTakes.slice(0, 2).map((ht) => ({ type: 'hot-take' as const, time: ht.createdAt, ht })),
                  ...leagueDebates.slice(0, 2).map((d)  => ({ type: 'debate'   as const, time: d.createdAt,  d  })),
                  ...leagueBets.slice(0, 1).map((b)     => ({ type: 'bet'      as const, time: b.createdAt,  b  })),
                ]
                  .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                  .slice(0, 5)
                  .map((entry) => {
                    if (entry.type === 'hot-take') {
                      const ht = entry.ht;
                      const author = getUserById(ht.authorId);
                      return (
                        <div key={ht.id} className="border border-rule/50 border-l-4 border-l-press px-4 py-3 bg-paper">
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
                        <Link key={d.id} href={`/debates/${d.id}`} className="border border-rule/50 border-l-4 border-l-navy px-4 py-3 bg-paper block hover:bg-paper-dark transition-colors">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-navy">⚔️ Debate</span>
                            <span className="text-[10px] text-ink-faint font-mono ml-auto">{timeAgo(d.createdAt)}</span>
                          </div>
                          <p className="text-sm text-ink italic leading-snug">&ldquo;{d.claim}&rdquo;</p>
                          <p className="text-[10px] text-masthead font-bold mt-1.5">Join Debate →</p>
                        </Link>
                      );
                    }
                    const b = entry.b;
                    const participants = b.participantIds.map((pid) => getUserById(pid)).filter(Boolean);
                    return (
                      <div key={b.id} className="border border-rule/50 border-l-4 border-l-field px-4 py-3 bg-paper">
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
          {leagueDebates.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-display text-4xl mb-2 text-ink-faint">⚔️</p>
              <p className="font-display font-bold text-ink text-lg">No debates yet</p>
              <p className="text-sm text-ink-muted italic mt-1">Start one in a neighborhood</p>
            </div>
          ) : leagueDebates.map((debate) => {
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
                      Join Debate →
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
          {localHotTakes.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-display text-4xl mb-2 text-ink-faint">🔥</p>
              <p className="font-display font-bold text-ink text-lg">No hot takes yet</p>
              <p className="text-sm text-ink-muted italic mt-1">Drop one in a neighborhood</p>
            </div>
          ) : localHotTakes.map((ht) => {
            const author = getUserById(ht.authorId);
            const fireReaction = ht.reactions.find((r) => r.emoji === '🔥');
            const iceReaction  = ht.reactions.find((r) => r.emoji === '❄️');
            const fireCount = fireReaction?.userIds.length ?? 0;
            const iceCount  = iceReaction?.userIds.length  ?? 0;
            const myFire = fireReaction?.userIds.includes('me') ?? false;
            const myIce  = iceReaction?.userIds.includes('me')  ?? false;
            const total  = fireCount + iceCount;
            const hotPct = total > 0 ? Math.round((fireCount / total) * 100) : null;
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
                    <div className="ml-auto flex items-center gap-1 text-ink-faint font-mono text-[10px]">
                      <Link href={`/neighborhoods/${ht.chatId}`} className="font-bold text-ink-muted hover:text-ink">{ht.chatName}</Link>
                    </div>
                  </div>
                  <p className="font-display text-base font-bold text-ink italic leading-snug">&ldquo;{ht.content}&rdquo;</p>
                </div>
                <div className="border-t border-rule/50 px-4 py-3 flex items-center gap-3 bg-paper-dark">
                  <button
                    onClick={() => voteHotTake(ht.id, '🔥')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm transition-all btn-3d ${
                      myFire ? 'bg-[#f97316] text-white' : 'bg-paper border border-rule text-ink-muted hover:border-[#f97316] hover:text-[#f97316]'
                    }`}
                  >
                    <Flame size={14} />
                    {fireCount > 0 && <span className="text-xs">{fireCount}</span>}
                  </button>
                  <button
                    onClick={() => voteHotTake(ht.id, '❄️')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm transition-all btn-3d ${
                      myIce ? 'bg-[#38bdf8] text-white' : 'bg-paper border border-rule text-ink-muted hover:border-[#38bdf8] hover:text-[#38bdf8]'
                    }`}
                  >
                    <Snowflake size={14} />
                    {iceCount > 0 && <span className="text-xs">{iceCount}</span>}
                  </button>
                  {hotPct !== null && (
                    <span className="ml-auto text-[10px] font-bold font-mono text-ink-faint">{hotPct}% hot</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── BETS TAB ──────────────────────────────────────────────────────── */}
      {activeTab === 'bets' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 pb-8">
          {leagueBets.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-display text-4xl mb-2 text-ink-faint">🤝</p>
              <p className="font-display font-bold text-ink text-lg">No bets yet</p>
              <p className="text-sm text-ink-muted italic mt-1">Make one in a neighborhood</p>
            </div>
          ) : leagueBets.map((bet) => {
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
