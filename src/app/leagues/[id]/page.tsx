'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Flame, Snowflake, Swords, Trophy, Star, Users, Plus, Check,
  Home, PenLine, Megaphone, MessageSquare, ChevronDown, ChevronUp, Send, Images,
} from 'lucide-react';
import { DEBATES, HOT_TAKES, ANALYSES, getUserById, ME } from '@/lib/mock-data';
import { getLeagueById } from '@/lib/leagues-data';
import { ALL_TEAMS } from '@/lib/teams-data';
import { useAuth } from '@/lib/auth-context';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { timeAgo, totalReactions, teamDisplayName } from '@/lib/utils';
import type { Analysis, HotTakeComment } from '@/lib/types';
import TeamLogo from '@/components/TeamLogo';
import MediaTab from '@/components/MediaTab';

type Tab = 'overview' | 'debates' | 'hot-takes' | 'analysis' | 'media';
type Period = 'weekly' | 'monthly' | 'yearly';

const PERIOD_DAYS: Record<Period, number> = { weekly: 7, monthly: 30, yearly: 365 };

const RANK_STYLES = [
  'bg-masthead text-[#12111a]',
  'bg-rule-dark text-ink',
  'bg-paper-deeper border border-rule text-ink',
  'bg-paper-dark border border-rule/50 text-ink-muted',
  'bg-paper-dark border border-rule/50 text-ink-muted',
];

function getLeagueTopFans(leagueTeamIds: string[], period: Period) {
  const cutoff = new Date('2026-05-16');
  cutoff.setDate(cutoff.getDate() - PERIOD_DAYS[period]);

  const scores: Record<string, number> = {};

  HOT_TAKES
    .filter((ht) => ht.teamIds.some((tid) => leagueTeamIds.includes(tid)) && new Date(ht.createdAt) >= cutoff)
    .forEach((ht) => {
      scores[ht.authorId] = (scores[ht.authorId] || 0) + 5 + totalReactions(ht.reactions) * 2;
    });

  DEBATES
    .filter((d) => d.teamIds.some((tid) => leagueTeamIds.includes(tid)) && new Date(d.createdAt) >= cutoff)
    .forEach((d) => {
      [...d.side1UserIds, ...d.side2UserIds].forEach((uid) => {
        scores[uid] = (scores[uid] || 0) + 3;
      });
      d.arguments.forEach((arg) => {
        scores[arg.userId] = (scores[arg.userId] || 0) + 2 + totalReactions(arg.reactions);
      });
    });

  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([userId, score]) => ({ user: getUserById(userId)!, score }))
    .filter((x) => x.user);
}

export default function LeaguePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user: authUser, refreshProfile } = useAuth();
  const league = getLeagueById(id);

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [period, setPeriod] = useState<Period>('weekly');
  const [showTeams, setShowTeams] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  const [localHotTakes, setLocalHotTakes] = useState(() => {
    const leagueTeamIds = ALL_TEAMS.filter((t) => t.league === id).map((t) => t.id);
    return HOT_TAKES
      .filter((ht) => ht.teamIds.some((tid) => leagueTeamIds.includes(tid)))
      .sort((a, b) => totalReactions(b.reactions) - totalReactions(a.reactions));
  });

  const [localAnalyses, setLocalAnalyses] = useState<Analysis[]>(() => {
    const leagueTeamIds = ALL_TEAMS.filter((t) => t.league === id).map((t) => t.id);
    return ANALYSES.filter((a) => a.teamIds.some((tid) => leagueTeamIds.includes(tid)));
  });

  const [showAnalysisForm, setShowAnalysisForm] = useState(false);
  const [analysisTitle, setAnalysisTitle] = useState('');
  const [analysisBody, setAnalysisBody] = useState('');
  const [showAnalystCommentsFor, setShowAnalystCommentsFor] = useState<string | null>(null);
  const [analystCommentText, setAnalystCommentText] = useState('');
  const analystCommentInputRef = useRef<HTMLInputElement>(null);
  const swipeStartX = useRef(0);
  const swipeStartY = useRef(0);

  // Sync follow state + fetch follower count from Supabase
  useEffect(() => {
    if (authUser?.leagues) setIsFollowing(authUser.leagues.includes(id));
  }, [authUser?.leagues, id]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any;
    supabase
      .from('user_leagues')
      .select('user_id', { count: 'exact', head: true })
      .eq('league_id', id)
      .then(({ count }: { count: number | null }) => { if (count != null) setFollowerCount(count); });
  }, [id]);

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

  const TAB_ORDER: Tab[] = ['overview', 'debates', 'hot-takes', 'analysis', 'media'];
  const onSwipeStart = (e: React.TouchEvent) => { swipeStartX.current = e.touches[0].clientX; swipeStartY.current = e.touches[0].clientY; };
  const onSwipeEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - swipeStartX.current;
    const dy = e.changedTouches[0].clientY - swipeStartY.current;
    if (Math.abs(dy) > Math.abs(dx) || Math.abs(dx) < 50) return;
    const idx = TAB_ORDER.indexOf(activeTab);
    if (dx < 0 && idx < TAB_ORDER.length - 1) setActiveTab(TAB_ORDER[idx + 1]);
    else if (dx > 0 && idx > 0) setActiveTab(TAB_ORDER[idx - 1]);
  };

  const submitAnalysis = () => {
    if (!analysisTitle.trim() || !analysisBody.trim()) return;
    const leagueTeamIds = ALL_TEAMS.filter((t) => t.league === id).map((t) => t.id);
    const newAnalysis: Analysis = {
      id: `an-l-${Date.now()}`,
      chatId: id,
      chatName: league?.name ?? '',
      title: analysisTitle.trim(),
      content: analysisBody.trim(),
      authorId: 'me',
      reactions: [],
      teamIds: leagueTeamIds.slice(0, 1),
      createdAt: new Date().toISOString(),
      isPublic: false,
      comments: [],
    };
    setLocalAnalyses((prev) => [newAnalysis, ...prev]);
    setAnalysisTitle('');
    setAnalysisBody('');
    setShowAnalysisForm(false);
  };

  const addAnalystComment = (anId: string) => {
    if (!analystCommentText.trim()) return;
    const newComment: HotTakeComment = {
      id: `ac-l-${Date.now()}`,
      userId: 'me',
      content: analystCommentText.trim(),
      timestamp: new Date().toISOString(),
    };
    setLocalAnalyses((prev) =>
      prev.map((a) => a.id === anId ? { ...a, comments: [...(a.comments ?? []), newComment] } : a)
    );
    setAnalystCommentText('');
  };

  const publishAnalysisToStreets = (anId: string) => {
    setLocalAnalyses((prev) => prev.map((a) => (a.id === anId ? { ...a, isPublic: true } : a)));
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

  const topFans = getLeagueTopFans(leagueTeamIds, period);

  const tabs: { id: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'debates',   label: 'Debates',  icon: Swords,  count: leagueDebates.length },
    { id: 'hot-takes', label: 'Takes',    icon: Flame,   count: localHotTakes.length },
    { id: 'analysis',  label: 'Analysis', icon: PenLine, count: localAnalyses.length },
    { id: 'media',     label: 'Media',    icon: Images,  count: 0 },
  ];

  return (
    <div className="flex flex-col min-h-full bg-paper" onTouchStart={onSwipeStart} onTouchEnd={onSwipeEnd}>

      {/* ── League header ─────────────────────────────────────────────────── */}
      <div className="shrink-0 bg-nav-bg px-4 py-3 flex items-center gap-2.5">
        <button onClick={() => router.back()} className="text-ink/60 hover:text-ink p-1 shrink-0">
          <ArrowLeft size={20} />
        </button>
        <button
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-2.5 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
        >
          <div className="flex h-9 w-9 items-center justify-center bg-ink-muted/30 text-xl shrink-0 rounded-xl overflow-hidden">
            {league.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-ink truncate leading-tight">{league.name}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink/50">{league.country} · {league.sport}</p>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('overview')}
          className={`shrink-0 flex items-center justify-center h-8 w-8 rounded-full transition-all ${activeTab === 'overview' ? 'bg-masthead/20 text-masthead' : 'bg-ink/10 hover:bg-ink/20 text-ink/70 hover:text-ink'}`}
          aria-label="Overview"
        >
          <Home size={14} />
        </button>
        {/* Teams dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowTeams((s) => !s)}
            className="flex items-center gap-1 h-8 px-2.5 rounded-full transition-all bg-ink/10 hover:bg-ink/20 text-ink/70 hover:text-ink text-[10px] font-bold uppercase tracking-wider"
          >
            Teams
            <ChevronDown size={10} className={`transition-transform ${showTeams ? 'rotate-180' : ''}`} />
          </button>
          {showTeams && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-paper-dark border border-rule shadow-2xl rounded-xl overflow-hidden z-50 max-h-72 overflow-y-auto">
              {leagueTeams.map((team) => (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  onClick={() => setShowTeams(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-paper transition-colors border-b border-rule/40 last:border-0"
                  style={{ borderLeftWidth: '3px', borderLeftColor: team.color, borderLeftStyle: 'solid' }}
                >
                  <TeamLogo team={team} size={22} />
                  <span className="text-sm font-semibold text-ink truncate">{teamDisplayName(team)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={async () => {
            const next = !isFollowing;
            setIsFollowing(next);
            setFollowerCount((c) => next ? c + 1 : Math.max(0, c - 1));
            if (authUser && isSupabaseConfigured()) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const supabase = createClient() as any;
              if (next) {
                await supabase.from('user_leagues').insert({ user_id: authUser.id, league_id: id });
              } else {
                await supabase.from('user_leagues').delete().eq('user_id', authUser.id).eq('league_id', id);
              }
              await refreshProfile();
            }
          }}
          className={`shrink-0 flex items-center justify-center h-8 w-8 rounded-full transition-all ${isFollowing ? 'bg-masthead/20 text-masthead' : 'bg-ink/10 hover:bg-ink/20 text-ink/70 hover:text-ink'}`}
          title={isFollowing ? 'Unfollow league' : 'Follow league'}
        >
          {isFollowing ? <Check size={14} /> : <Plus size={14} />}
        </button>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex gap-1.5 px-3 py-2 bg-paper-dark border-b border-rule overflow-x-auto">
        {tabs.map(({ id: tabId, label, icon: Icon, count }) => (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            className={`flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap rounded-full transition-colors ${
              activeTab === tabId ? 'bg-masthead text-[#12111a]' : 'text-ink-muted hover:text-ink hover:bg-paper-deeper'
            }`}
          >
            <Icon size={11} />
            {label}
            {count > 0 && <span className="text-[9px] bg-paper-dark px-1 rounded font-mono ml-0.5">{count}</span>}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="flex-1 overflow-y-auto pb-8">

          {/* Stats strip */}
          <div className="bg-nav-bg px-5 pb-4">
            <div className="flex gap-6 border-t border-white/20 pt-4">
              {[
                { label: 'Fans',      value: followerCount },
                { label: 'Teams',     value: leagueTeams.length },
                { label: 'Debates',   value: leagueDebates.length },
                { label: 'Hot Takes', value: localHotTakes.length },
                { label: 'Analysis',  value: localAnalyses.length },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xl font-bold text-white font-mono">{value}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-white/50">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Fans */}
          <div className="px-5 pt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star size={14} className="text-rule-dark" />
                <h3 className="font-display font-bold text-ink text-lg">Top Fans</h3>
              </div>
              <div className="flex border border-rule overflow-hidden rounded-full">
                {(['weekly', 'monthly', 'yearly'] as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider transition-colors ${
                      period === p ? 'bg-masthead text-[#12111a]' : 'bg-paper-dark text-ink-muted hover:bg-paper-deeper'
                    }`}
                  >
                    {p === 'weekly' ? 'Wk' : p === 'monthly' ? 'Mo' : 'Yr'}
                  </button>
                ))}
              </div>
            </div>

            {topFans.length > 0 ? (
              <div className="border border-rule overflow-hidden">
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
            {leagueDebates.length === 0 && localHotTakes.length === 0 ? (
              <div className="py-10 text-center border border-rule/50">
                <p className="text-2xl mb-2">{league.emoji}</p>
                <p className="font-display font-bold text-ink">No activity yet</p>
                <p className="text-sm text-ink-muted italic mt-1">Start debates in your neighborhoods</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {[
                  ...localHotTakes.slice(0, 2).map((ht) => ({ type: 'hot-take' as const, time: ht.createdAt, ht })),
                  ...leagueDebates.slice(0, 2).map((d)  => ({ type: 'debate'   as const, time: d.createdAt, d })),
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
                    <Link href={`/debates/${debate.id}`} className="ml-auto text-[10px] font-bold uppercase tracking-wider text-masthead hover:underline">
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
                    <div className="ml-auto text-[10px] text-ink-faint font-mono">
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

      {/* ── ANALYSIS TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'analysis' && (
        <div className="flex-1 overflow-y-auto flex flex-col bg-paper">
          <div className="px-4 py-3 border-b border-rule bg-paper-dark flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-faint">Fan Analysis</p>
            <button
              onClick={() => setShowAnalysisForm(!showAnalysisForm)}
              className="flex items-center gap-1.5 bg-nav-bg text-ink px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full hover:bg-nav-bg/80 transition-colors"
            >
              <PenLine size={11} /> Write Piece
            </button>
          </div>

          {showAnalysisForm && (
            <div className="px-4 py-4 border-b border-rule bg-paper-dark flex flex-col gap-3">
              <input
                value={analysisTitle}
                onChange={(e) => setAnalysisTitle(e.target.value)}
                placeholder="Title your analysis…"
                className="w-full border border-rule bg-paper px-4 py-2.5 text-sm font-bold text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors rounded-lg"
              />
              <textarea
                value={analysisBody}
                onChange={(e) => setAnalysisBody(e.target.value)}
                placeholder="Write your analysis here. Break down what you saw, back it up with what you know…"
                rows={5}
                className="w-full border border-rule bg-paper px-4 py-2.5 text-sm text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors resize-none rounded-lg leading-relaxed"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setShowAnalysisForm(false); setAnalysisTitle(''); setAnalysisBody(''); }}
                  className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-ink-muted border border-rule rounded-full hover:bg-paper-dark transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitAnalysis}
                  disabled={!analysisTitle.trim() || !analysisBody.trim()}
                  className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider bg-nav-bg text-ink rounded-full hover:bg-nav-bg/80 disabled:opacity-40 transition-colors"
                >
                  Publish
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 px-4 py-4 pb-6">
            {localAnalyses.map((an) => {
              const author = getUserById(an.authorId);
              const isMe = an.authorId === 'me';
              const anComments = an.comments ?? [];
              const showingComments = showAnalystCommentsFor === an.id;
              return (
                <div key={an.id} className="border border-rule overflow-hidden">
                  <div className="border-l-4 border-l-ink-muted px-4 pt-4 pb-3 bg-paper">
                    <div className="flex items-center gap-2 mb-3">
                      <Link href={`/users/${an.authorId}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-dark border border-rule text-base hover:border-ink transition-all shrink-0">
                        {isMe ? ME.avatar : author?.avatar}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/users/${an.authorId}`} className="text-sm font-bold text-ink hover:text-masthead transition-colors block">
                          {isMe ? 'You' : author?.displayName}
                        </Link>
                        <p className="text-[10px] text-ink-faint font-mono">{timeAgo(an.createdAt)}</p>
                      </div>
                      {!an.isPublic && (
                        <button
                          onClick={() => publishAnalysisToStreets(an.id)}
                          className="flex items-center gap-1 border border-rule/60 px-2.5 py-1 text-[10px] font-bold text-ink-muted hover:border-press hover:text-press transition-colors rounded-full shrink-0"
                        >
                          <Megaphone size={10} /> Streets
                        </button>
                      )}
                      {an.isPublic && (
                        <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-press rounded-full border border-press/40 bg-press/5 shrink-0">
                          <Megaphone size={10} /> Live
                        </span>
                      )}
                    </div>
                    <Link href={`/analyses/${an.id}`} className="block group">
                      <h3 className="font-display text-base font-bold text-ink leading-snug mb-2 group-hover:text-masthead transition-colors">{an.title}</h3>
                      <p className="text-sm text-ink-muted leading-relaxed line-clamp-4">{an.content}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-press mt-2">Full analysis →</p>
                    </Link>
                  </div>
                  <div className="border-t border-rule/50 px-4 py-2.5 flex items-center gap-2 bg-paper-dark">
                    <PenLine size={11} className="text-ink-faint" />
                    <span className="text-[10px] text-ink-faint uppercase tracking-widest font-bold">Analysis</span>
                    <button
                      onClick={() => { setShowAnalystCommentsFor(showingComments ? null : an.id); setAnalystCommentText(''); }}
                      className="ml-auto flex items-center gap-1 text-[10px] font-bold text-ink-muted hover:text-ink transition-colors"
                    >
                      <MessageSquare size={12} />
                      {anComments.length > 0 ? anComments.length : 'Discuss'}
                      {showingComments ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                    </button>
                  </div>
                  {showingComments && (
                    <div className="border-t border-rule/30 bg-paper-dark px-4 py-3 flex flex-col gap-3">
                      {anComments.map((c) => {
                        const commenter = getUserById(c.userId);
                        return (
                          <div key={c.id} className="flex gap-2">
                            <Link href={`/users/${c.userId}`} className="flex h-7 w-7 items-center justify-center rounded-full bg-paper border border-rule text-sm shrink-0 hover:border-ink">
                              {c.userId === 'me' ? ME.avatar : commenter?.avatar}
                            </Link>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-1.5 mb-0.5">
                                <Link href={`/users/${c.userId}`} className="text-[11px] font-bold text-ink hover:text-masthead">
                                  {c.userId === 'me' ? 'You' : commenter?.displayName}
                                </Link>
                                <span className="text-[9px] text-ink-faint font-mono">{timeAgo(c.timestamp)}</span>
                              </div>
                              <p className="text-xs text-ink leading-relaxed">{c.content}</p>
                            </div>
                          </div>
                        );
                      })}
                      <div className="flex gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-paper border border-rule text-sm shrink-0">
                          {ME.avatar}
                        </div>
                        <input
                          ref={analystCommentInputRef}
                          value={showAnalystCommentsFor === an.id ? analystCommentText : ''}
                          onChange={(e) => setAnalystCommentText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addAnalystComment(an.id)}
                          placeholder="Discuss…"
                          className="flex-1 bg-paper border border-rule px-3 py-1.5 text-xs text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors rounded-full"
                        />
                        <button
                          onClick={() => addAnalystComment(an.id)}
                          disabled={!analystCommentText.trim()}
                          className="flex h-7 w-7 items-center justify-center bg-nav-bg text-ink rounded-full hover:bg-nav-bg/80 disabled:opacity-40 transition-colors shrink-0"
                        >
                          <Send size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {localAnalyses.length === 0 && !showAnalysisForm && (
              <div className="text-center py-16">
                <p className="font-display text-4xl mb-2 text-ink-faint">📊</p>
                <p className="font-display font-bold text-ink text-lg">No analyses yet</p>
                <p className="text-sm text-ink-muted italic mt-1">Be the first to write a breakdown</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'media' && <MediaTab contextType="league" contextId={id} />}
    </div>
  );
}
