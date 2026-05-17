'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Flame, Snowflake, Swords, Trophy, Star, Users, Plus, Check, X, Send, Home, PenLine, Megaphone, MessageSquare, ChevronDown, ChevronUp, Images } from 'lucide-react';
import { DEBATES, HOT_TAKES, ANALYSES, getUserById, USERS, ME } from '@/lib/mock-data';
import { getTeamByIdFull } from '@/lib/teams-data';
import { useAuth } from '@/lib/auth-context';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { timeAgo, totalReactions, teamDisplayName } from '@/lib/utils';
import type { VoteChoice, HotTake, Analysis, HotTakeComment } from '@/lib/types';
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


  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([userId, score]) => ({ user: getUserById(userId)!, score }))
    .filter((x) => x.user);
}

export default function TeamPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user: authUser, refreshProfile } = useAuth();
  const team = getTeamByIdFull(id);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [period, setPeriod] = useState<Period>('weekly');
  const [showDiscussModal, setShowDiscussModal] = useState(false);
  const [discussType, setDiscussType] = useState<'take' | 'debate'>('take');
  const [discussText, setDiscussText] = useState('');
  const [isFollowing, setIsFollowing] = useState(() => ME.fanTeams.some((ft) => ft.team.id === id));
  const [followerCount, setFollowerCount] = useState(0);
  const [showFansModal, setShowFansModal] = useState(false);
  type FanProfile = { id: string; username: string; display_name: string; avatar: string | null };
  const [fansList, setFansList] = useState<FanProfile[]>([]);
  const [fansLoading, setFansLoading] = useState(false);

  // Sync isFollowing with real auth teams when available
  useEffect(() => {
    if (authUser?.teams) setIsFollowing(authUser.teams.some((t) => t.team_id === id));
  }, [authUser?.teams, id]);

  // Fetch total follower count
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any;
    supabase
      .from('user_teams')
      .select('user_id', { count: 'exact', head: true })
      .eq('team_id', id)
      .then(({ count }: { count: number | null }) => { if (count != null) setFollowerCount(count); });
  }, [id]);

  const openFansModal = async () => {
    setShowFansModal(true);
    if (!isSupabaseConfigured() || fansList.length > 0) return;
    setFansLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any;
    const { data: teamRows } = await supabase.from('user_teams').select('user_id').eq('team_id', id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userIds: string[] = (teamRows ?? []).map((r: any) => r.user_id);
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, username, display_name, avatar').in('id', userIds);
      setFansList(profiles ?? []);
    }
    setFansLoading(false);
  };
  const [localHotTakes, setLocalHotTakes] = useState(() =>
    HOT_TAKES
      .filter((ht) => ht.teamIds.includes(id))
      .sort((a, b) => totalReactions(b.reactions) - totalReactions(a.reactions))
  );
  const [localAnalyses, setLocalAnalyses] = useState<Analysis[]>(() =>
    ANALYSES.filter((a) => a.teamIds.includes(id))
  );
  const [showAnalysisForm, setShowAnalysisForm] = useState(false);
  const [analysisTitle, setAnalysisTitle] = useState('');
  const [analysisBody, setAnalysisBody] = useState('');
  const [showAnalystCommentsFor, setShowAnalystCommentsFor] = useState<string | null>(null);
  const [analystCommentText, setAnalystCommentText] = useState('');
  const analystCommentInputRef = useRef<HTMLInputElement>(null);
  const swipeStartX = useRef(0);
  const swipeStartY = useRef(0);

  const voteHotTakeTeam = (htId: string, vote: '🔥' | '❄️') => {
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

  const submitDiscuss = () => {
    if (!discussText.trim()) return;
    if (discussType === 'take') {
      const newHT: HotTake = {
        id: `ht-t-${Date.now()}`,
        chatId: 'streets',
        chatName: 'The Streets',
        content: discussText.trim(),
        authorId: 'me',
        reactions: [],
        teamIds: [id],
        createdAt: new Date().toISOString(),
        isPublic: true,
        comments: [],
      };
      setLocalHotTakes((prev) => [newHT, ...prev]);
    }
    setDiscussText('');
    setShowDiscussModal(false);
  };

  const TAB_ORDER: Tab[] = ['overview', 'debates', 'hot-takes', 'analysis', 'media'];
  const onSwipeStart = (e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX;
    swipeStartY.current = e.touches[0].clientY;
  };
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
    const newAnalysis: Analysis = {
      id: `an-t-${Date.now()}`,
      chatId: id,
      chatName: team?.name ?? '',
      title: analysisTitle.trim(),
      content: analysisBody.trim(),
      authorId: 'me',
      reactions: [],
      teamIds: [id],
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
      id: `ac-t-${Date.now()}`,
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
    setLocalAnalyses((prev) =>
      prev.map((a) => (a.id === anId ? { ...a, isPublic: true } : a))
    );
  };

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

  const topFans = getTopFans(id, period);

  const tabs: { id: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'debates',   label: 'Debates',  icon: Swords,  count: teamDebates.length },
    { id: 'hot-takes', label: 'Takes',    icon: Flame,   count: localHotTakes.length },
    { id: 'analysis',  label: 'Analysis', icon: PenLine, count: localAnalyses.length },
    { id: 'media',     label: 'Media',    icon: Images,  count: 0 },
  ];

  return (
    <div className="flex flex-col min-h-full bg-paper" onTouchStart={onSwipeStart} onTouchEnd={onSwipeEnd}>
      {/* ── Team header ─────────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-3 flex items-center gap-2.5" style={{ background: team.color }}>
        <button onClick={() => router.back()} className="text-white/60 hover:text-white p-1 shrink-0">
          <ArrowLeft size={20} />
        </button>
        <button
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-2.5 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0 overflow-hidden p-0.5"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)' }}
          >
            <TeamLogo team={team} size={30} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-white truncate leading-tight">{teamDisplayName(team)}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50">{team.league}</p>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('overview')}
          className={`shrink-0 flex items-center justify-center h-8 w-8 rounded-full transition-all ${activeTab === 'overview' ? 'bg-white/25 text-white' : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'}`}
          aria-label="Overview"
        >
          <Home size={14} />
        </button>
        <button
          onClick={async () => {
            const next = !isFollowing;
            setIsFollowing(next);
            setFollowerCount((c) => next ? c + 1 : Math.max(0, c - 1));
            if (authUser && isSupabaseConfigured()) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const supabase = createClient() as any;
              if (next) {
                await supabase.from('user_teams').upsert({ user_id: authUser.id, team_id: id, fandom_level: 'casual' });
              } else {
                await supabase.from('user_teams').delete().eq('user_id', authUser.id).eq('team_id', id);
              }
              await refreshProfile();
            }
          }}
          className={`shrink-0 flex items-center justify-center h-8 w-8 rounded-full transition-all ${isFollowing ? 'bg-white/25 text-white' : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'}`}
          title={isFollowing ? 'Unfollow' : 'Follow team'}
        >
          {isFollowing ? <Check size={14} /> : <Plus size={14} />}
        </button>
      </div>

      {/* Stats strip */}
      <div className="shrink-0 px-5 py-3" style={{ background: team.color }}>
        <div className="flex gap-6 border-t border-white/20 pt-3">
          {[
            { label: 'Fans',      value: followerCount,          action: openFansModal },
            { label: 'Debates',   value: teamDebates.length,     action: () => setActiveTab('debates' as Tab) },
            { label: 'Hot Takes', value: localHotTakes.length,   action: () => setActiveTab('hot-takes' as Tab) },
            { label: 'Analysis',  value: localAnalyses.length,   action: () => setActiveTab('analysis' as Tab) },
          ].map(({ label, value, action }) => (
            <button key={label} onClick={action} className="text-left hover:opacity-70 transition-opacity">
              <p className="text-xl font-bold text-white font-mono">{value}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/50">{label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex bg-paper-dark border-b border-rule">
        {tabs.map(({ id: tabId, label, icon: Icon, count }) => (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[9px] font-bold uppercase tracking-wider transition-colors border-b-2 relative ${
              activeTab === tabId ? '' : 'border-transparent text-ink-muted hover:text-ink'
            }`}
            style={activeTab === tabId ? { borderColor: team.color, color: team.color } : {}}
          >
            <span className="relative">
              <Icon size={12} />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-2.5 flex h-3.5 min-w-3.5 px-0.5 items-center justify-center rounded-full bg-press text-[7px] font-bold text-white leading-none">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </span>
            {label}
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

            {teamDebates.length === 0 && localHotTakes.length === 0 ? (
              <div className="py-10 text-center border border-rule/50">
                <p className="text-2xl mb-2">{team.emoji}</p>
                <p className="font-display font-bold text-ink">No activity yet</p>
                <p className="text-sm text-ink-muted italic mt-1">Start debates in your neighborhoods</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {[
                  ...localHotTakes.slice(0, 2).map((ht) => ({ type: 'hot-take' as const, time: ht.createdAt, ht })),
                  ...teamDebates.slice(0, 2).map((d)  => ({ type: 'debate'   as const, time: d.createdAt,  d  })),
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
                    onClick={() => voteHotTakeTeam(ht.id, '🔥')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm transition-all btn-3d ${
                      myFire ? 'bg-[#f97316] text-white' : 'bg-paper border border-rule text-ink-muted hover:border-[#f97316] hover:text-[#f97316]'
                    }`}
                  >
                    <Flame size={14} />
                    {fireCount > 0 && <span className="text-xs">{fireCount}</span>}
                  </button>
                  <button
                    onClick={() => voteHotTakeTeam(ht.id, '❄️')}
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

      {/* ── ANALYSIS TAB ──────────────────────────────────────────────── */}
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

      {/* ── + to Discussion FAB ────────────────────────────── */}
      <button
        onClick={() => setShowDiscussModal(true)}
        className="fixed bottom-20 right-4 flex items-center gap-1.5 bg-nav-bg text-ink px-4 py-2.5 rounded-full shadow-xl font-bold text-[11px] uppercase tracking-widest hover:bg-nav-bg/80 transition-colors z-20 border border-rule"
        style={{ maxWidth: 'calc(100vw - 2rem)' }}
      >
        <Plus size={13} /> to Discussion
      </button>

      {/* ── Discuss Modal ───────────────────────────────── */}
      {showDiscussModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-nav-bg/80 backdrop-blur-sm" onClick={() => setShowDiscussModal(false)} />
          <div className="relative w-full max-w-md bg-paper-dark border-t border-rule">
            <div className="flex items-center justify-between px-5 py-4 bg-nav-bg">
              <div>
                <p className="font-display font-bold text-ink">{team.emoji} {team.name}</p>
                <p className="text-[10px] text-ink/50 uppercase tracking-widest">Post to The Streets</p>
              </div>
              <button onClick={() => setShowDiscussModal(false)} className="text-ink/60 hover:text-ink"><X size={18} /></button>
            </div>
            <div className="px-5 py-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2">
                {([
                  { id: 'take', emoji: '🔥', label: 'Hot Take' },
                  { id: 'debate', emoji: '⚔️', label: 'Debate' },
                ] as { id: 'take' | 'debate'; emoji: string; label: string }[]).map(({ id, emoji, label }) => (
                  <button
                    key={id}
                    onClick={() => setDiscussType(id)}
                    className={`flex flex-col items-center gap-1 py-3 border-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                      discussType === id ? 'border-masthead bg-nav-bg text-ink' : 'border-rule text-ink-muted hover:border-ink-muted'
                    }`}
                  >
                    <span className="text-xl">{emoji}</span>{label}
                  </button>
                ))}
              </div>
              <textarea
                value={discussText}
                onChange={(e) => setDiscussText(e.target.value)}
                placeholder={
                  discussType === 'take' ? `Hot take about the ${team.name}…`
                  : `State the debate claim…`
                }
                rows={3}
                className="w-full border border-rule bg-paper-dark px-4 py-3 text-sm text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors resize-none rounded-lg"
              />
            </div>
            <div className="border-t border-rule bg-paper-dark px-5 py-4 flex gap-3">
              <button onClick={() => setShowDiscussModal(false)} className="border border-rule px-5 py-3 text-xs font-bold uppercase tracking-wider text-ink-muted hover:bg-paper-deeper transition-colors rounded-full">
                Cancel
              </button>
              <button
                onClick={submitDiscuss}
                disabled={!discussText.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-press text-ink py-3 text-xs font-bold uppercase tracking-widest disabled:opacity-40 rounded-full btn-3d hover:bg-press/80 transition-colors"
              >
                <Send size={13} /> Post to Streets
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'media' && <MediaTab contextType="team" contextId={id} />}

      {/* ── Fans modal ──────────────────────────────────────── */}
      {showFansModal && (
        <div className="fixed inset-0 flex items-end justify-center" style={{ zIndex: 9999 }}>
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowFansModal(false)} />
          <div className="relative w-full max-w-md bg-paper rounded-t-2xl shadow-2xl max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-rule shrink-0">
              <h2 className="font-bold text-ink text-base">{teamDisplayName(team)} Fans ({followerCount})</h2>
              <button onClick={() => setShowFansModal(false)} className="text-ink-faint hover:text-ink"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto flex-1">
              {fansLoading ? (
                <div className="flex justify-center py-10">
                  <div className="h-6 w-6 rounded-full border-2 border-masthead border-t-transparent animate-spin" />
                </div>
              ) : fansList.length === 0 ? (
                <div className="text-center py-10 text-ink-muted italic text-sm">No fans yet</div>
              ) : fansList.map((fan) => {
                const iFollow = authUser?.followingProfiles?.some((p) => p.id === fan.id) ?? false;
                return (
                  <button
                    key={fan.id}
                    onClick={() => { setShowFansModal(false); router.push(`/users/${fan.id}`); }}
                    className="flex w-full items-center gap-3 px-4 py-3 border-b border-rule/40 hover:bg-paper-dark transition-colors text-left last:border-0"
                  >
                    <div className="h-10 w-10 rounded-full bg-nav-bg border border-rule overflow-hidden flex items-center justify-center text-xl shrink-0">
                      {fan.avatar && fan.avatar.startsWith('http')
                        ? <img src={fan.avatar} alt="" className="w-full h-full object-cover" />
                        : <span>{fan.avatar || '👤'}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-ink text-sm truncate">{fan.display_name}</p>
                      <p className="text-[11px] text-ink-faint font-mono">@{fan.username}</p>
                    </div>
                    {iFollow && <Check size={15} className="text-masthead shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
