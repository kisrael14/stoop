'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Home, MessageCircle, Swords, Handshake, Flame,
  Send, Sparkles, X, Trophy, Users, TrendingUp, ArrowUp,
  AlertCircle, CheckCircle, Clock, GripVertical,
} from 'lucide-react';
import {
  getChatById, getUserById, ME, DEBATES, BETS, HOT_TAKES, TEAMS,
} from '@/lib/mock-data';
import { timeAgo, voteLeader, totalReactions } from '@/lib/utils';
import type { Message, MessageTag, Debate, Bet, HotTake, VoteChoice } from '@/lib/types';
import { sendNotification } from '@/lib/notifications';

type Tab = 'overview' | 'chat' | 'debates' | 'bets' | 'hot-takes';
const EMOJI_REACTIONS = ['🔥', '💯', '😂', '🧢', '👀', '😭', '🤬', '❤️'];
const REACT_OPTIONS = ['🔥', '💯', '🧢', '😂', '👀', '🤡'];

export default function NeighborhoodPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chat = getChatById(id);

  const initialTab = (searchParams.get('tab') as Tab) || 'overview';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  // Chat state
  const [messages, setMessages] = useState<Message[]>(chat?.messages ?? []);
  const [inputText, setInputText] = useState('');
  const [pendingTag, setPendingTag] = useState<MessageTag | null>(null);
  const [showReactionsFor, setShowReactionsFor] = useState<string | null>(null);
  const [tagPickerFor, setTagPickerFor] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Debate state
  const [debates, setDebates] = useState<Debate[]>(
    DEBATES.filter((d) => d.chatId === id)
  );
  const [expandedDebate, setExpandedDebate] = useState<string | null>(null);

  // Bet state
  const [bets, setBets] = useState<Bet[]>(
    BETS.filter((b) => b.chatId === id)
  );
  const [expandedBet, setExpandedBet] = useState<string | null>(null);

  // Hot take state
  const [hotTakes, setHotTakes] = useState<HotTake[]>(
    HOT_TAKES.filter((h) => h.chatId === id)
  );

  useEffect(() => {
    if (activeTab === 'chat') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        Neighborhood not found
      </div>
    );
  }

  const members = chat.memberIds.map((id) => getUserById(id)).filter(Boolean);
  const allFanTeams = members.flatMap((m) => m!.fanTeams).reduce<Record<string, number>>((acc, ft) => {
    acc[ft.team.id] = (acc[ft.team.id] || 0) + 1;
    return acc;
  }, {});
  const topTeams = Object.entries(allFanTeams)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([teamId, count]) => ({ team: TEAMS.find((t) => t.id === teamId)!, count }))
    .filter((x) => x.team);

  const aggStats = members.reduce(
    (acc, m) => ({
      debatesWon: acc.debatesWon + m!.stats.debatesWon,
      betsWon: acc.betsWon + m!.stats.betsWon,
      hotTakeReactions: acc.hotTakeReactions + m!.stats.hotTakeReactions,
    }),
    { debatesWon: 0, betsWon: 0, hotTakeReactions: 0 }
  );

  const tagConfig = {
    'hot-take': { label: 'Hot Take', emoji: '🔥', color: 'bg-orange-500', border: 'border-orange-500/40', bg: 'bg-orange-950/30' },
    debate: { label: 'Debate', emoji: '⚔️', color: 'bg-blue-500', border: 'border-blue-500/40', bg: 'bg-blue-950/30' },
    bet: { label: 'Bet', emoji: '🤝', color: 'bg-green-500', border: 'border-green-500/40', bg: 'bg-green-950/30' },
  };

  // ─── Chat actions ───────────────────────────────────────────
  const sendMessage = () => {
    if (!inputText.trim()) return;
    const msg: Message = {
      id: `new-${Date.now()}`,
      chatId: chat.id,
      userId: 'me',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
      tag: pendingTag ?? undefined,
      reactions: [],
    };
    setMessages((prev) => [...prev, msg]);

    // Spawn debate/bet/hot-take entry from tag
    if (pendingTag === 'debate') {
      const newDebate: Debate = {
        id: `d-new-${Date.now()}`,
        chatId: chat.id,
        chatName: chat.name,
        claim: inputText.trim(),
        party1Id: 'me',
        party2Id: members.find((m) => m!.id !== 'me')?.id ?? 'marcus',
        votes: [],
        status: 'active',
        teamIds: chat.teamIds,
        createdAt: new Date().toISOString(),
      };
      setDebates((prev) => [newDebate, ...prev]);
      sendNotification(`⚔️ New Debate — ${chat.name}`, inputText.trim());
    }
    if (pendingTag === 'bet') {
      const newBet: Bet = {
        id: `b-new-${Date.now()}`,
        chatId: chat.id,
        chatName: chat.name,
        claim: inputText.trim(),
        participantIds: ['me', members.find((m) => m!.id !== 'me')?.id ?? 'marcus'],
        status: 'active',
        teamIds: chat.teamIds,
        createdAt: new Date().toISOString(),
      };
      setBets((prev) => [newBet, ...prev]);
      sendNotification(`🤝 New Bet — ${chat.name}`, inputText.trim());
    }
    if (pendingTag === 'hot-take') {
      const newHT: HotTake = {
        id: `ht-new-${Date.now()}`,
        chatId: chat.id,
        chatName: chat.name,
        content: inputText.trim(),
        authorId: 'me',
        reactions: [],
        teamIds: chat.teamIds,
        createdAt: new Date().toISOString(),
      };
      setHotTakes((prev) => [newHT, ...prev]);
      sendNotification(`🔥 Hot Take — ${chat.name}`, inputText.trim());
    }
    setInputText('');
    setPendingTag(null);
  };

  const tagExistingMessage = (messageId: string, tag: MessageTag) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, tag } : m))
    );
    setTagPickerFor(null);
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;
    if (tag === 'debate') {
      const newDebate: Debate = {
        id: `d-tag-${Date.now()}`,
        chatId: chat.id,
        chatName: chat.name,
        claim: msg.content,
        party1Id: msg.userId === 'me' ? 'me' : msg.userId,
        party2Id: msg.userId === 'me' ? (members.find((m) => m!.id !== 'me')?.id ?? 'marcus') : 'me',
        votes: [],
        status: 'active',
        teamIds: chat.teamIds,
        createdAt: new Date().toISOString(),
      };
      setDebates((prev) => [newDebate, ...prev]);
    }
    if (tag === 'hot-take') {
      const newHT: HotTake = {
        id: `ht-tag-${Date.now()}`,
        chatId: chat.id,
        chatName: chat.name,
        content: msg.content,
        authorId: msg.userId,
        reactions: [],
        teamIds: chat.teamIds,
        createdAt: new Date().toISOString(),
      };
      setHotTakes((prev) => [newHT, ...prev]);
    }
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const existing = m.reactions.find((r) => r.emoji === emoji);
        if (existing) {
          return {
            ...m,
            reactions: existing.userIds.includes('me')
              ? m.reactions
                  .map((r) => r.emoji === emoji ? { ...r, userIds: r.userIds.filter((u) => u !== 'me') } : r)
                  .filter((r) => r.userIds.length > 0)
              : m.reactions.map((r) => r.emoji === emoji ? { ...r, userIds: [...r.userIds, 'me'] } : r),
          };
        }
        return { ...m, reactions: [...m.reactions, { emoji, userIds: ['me'] }] };
      })
    );
    setShowReactionsFor(null);
  };

  const sendAIMessage = () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    const question = aiQuery.trim();
    setAiQuery('');
    setTimeout(() => {
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        chatId: chat.id,
        userId: 'ai',
        content: `**Q: ${question}**\n\nBased on historical data and current stats, this is a great question for the neighborhood. The numbers suggest multiple angles worth debating — want me to break down the specifics?`,
        timestamp: new Date().toISOString(),
        reactions: [],
      };
      setMessages((prev) => [...prev, aiMsg]);
      setAiLoading(false);
      setShowAI(false);
    }, 1200);
  };

  // ─── Debate actions ──────────────────────────────────────────
  const castVote = (debateId: string, choice: VoteChoice) => {
    setDebates((prev) =>
      prev.map((d) => {
        if (d.id !== debateId || d.votes.find((v) => v.userId === 'me')) return d;
        const newVotes = [...d.votes, { userId: 'me', choice }];
        const counts = voteLeader(newVotes);
        const leading = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        if (leading && leading[1] > members.length / 2) {
          return { ...d, votes: newVotes, status: 'resolved' as const, resolution: leading[0] as VoteChoice, resolvedAt: new Date().toISOString() };
        }
        return { ...d, votes: newVotes };
      })
    );
  };

  // ─── Bet actions ─────────────────────────────────────────────
  const proposeResolution = (betId: string, winnerId: string | null) => {
    setBets((prev) =>
      prev.map((b) => {
        if (b.id !== betId) return b;
        if (b.participantIds.length === 1) {
          return { ...b, status: 'resolved' as const, winnerId: winnerId ?? undefined, isPush: winnerId === null, resolvedAt: new Date().toISOString() };
        }
        return {
          ...b,
          status: 'awaiting-resolution' as const,
          proposal: { proposedBy: 'me', winnerId: winnerId ?? undefined, isPush: winnerId === null, agreements: ['me'], disputes: [] },
        };
      })
    );
  };

  const agreeResolution = (betId: string) => {
    setBets((prev) =>
      prev.map((b) => {
        if (b.id !== betId || !b.proposal) return b;
        const agreements = [...b.proposal.agreements, 'me'];
        if (agreements.length >= b.participantIds.length) {
          return { ...b, status: 'resolved' as const, winnerId: b.proposal.winnerId, isPush: b.proposal.isPush, resolvedAt: new Date().toISOString(), proposal: undefined };
        }
        return { ...b, proposal: { ...b.proposal, agreements } };
      })
    );
  };

  // ─── Hot take actions ────────────────────────────────────────
  const addHTReaction = (htId: string, emoji: string) => {
    setHotTakes((prev) =>
      prev.map((ht) => {
        if (ht.id !== htId) return ht;
        const existing = ht.reactions.find((r) => r.emoji === emoji);
        if (existing) {
          return {
            ...ht,
            reactions: existing.userIds.includes('me')
              ? ht.reactions.map((r) => r.emoji === emoji ? { ...r, userIds: r.userIds.filter((u) => u !== 'me') } : r).filter((r) => r.userIds.length > 0)
              : ht.reactions.map((r) => r.emoji === emoji ? { ...r, userIds: [...r.userIds, 'me'] } : r),
          };
        }
        return { ...ht, reactions: [...ht.reactions, { emoji, userIds: ['me'] }] };
      })
    );
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'debates', label: 'Debates', icon: Swords },
    { id: 'bets', label: 'Bets', icon: Handshake },
    { id: 'hot-takes', label: 'Takes', icon: Flame },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white p-1">
          <ArrowLeft size={22} />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xl shrink-0">
          {chat.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white truncate">{chat.name}</p>
          <p className="text-xs text-slate-400">{members.length} members</p>
        </div>
        <Link href={`/neighborhoods/${id}?tab=overview`} onClick={() => setActiveTab('overview')} className="text-slate-400 hover:text-white p-1">
          <Users size={20} />
        </Link>
      </div>

      {/* Tab bar */}
      <div className="shrink-0 flex border-b border-slate-800 bg-slate-950 overflow-x-auto">
        {tabs.map(({ id: tabId, label, icon: Icon }) => (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tabId
                ? tabId === 'hot-takes' ? 'border-orange-500 text-orange-400'
                  : tabId === 'debates' ? 'border-blue-500 text-blue-400'
                  : tabId === 'bets' ? 'border-green-500 text-green-400'
                  : 'border-white text-white'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="flex-1 overflow-y-auto pb-4">
          {/* Neighborhood hero */}
          <div className="bg-linear-to-b from-slate-800 to-slate-950 px-5 pt-5 pb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-700 text-3xl">
                {chat.emoji}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{chat.name}</h2>
                <p className="text-sm text-slate-400">{members.length} members · Est. neighborhood</p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="text-center">
                <p className="text-xl font-bold text-blue-400">{debates.length}</p>
                <p className="text-xs text-slate-500">Debates</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-green-400">{bets.length}</p>
                <p className="text-xs text-slate-500">Bets</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-orange-400">{hotTakes.length}</p>
                <p className="text-xs text-slate-500">Hot Takes</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white">{aggStats.hotTakeReactions}</p>
                <p className="text-xs text-slate-500">Reactions</p>
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white">Members</h3>
              <span className="text-xs text-slate-500">{members.length} total</span>
            </div>
            <div className="flex flex-col gap-2">
              {members.map((m) => (
                <Link
                  key={m!.id}
                  href={`/users/${m!.id}`}
                  className="flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 hover:bg-slate-800 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-xl shrink-0">
                    {m!.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm">{m!.displayName}</p>
                    <p className="text-xs text-slate-400">@{m!.username}</p>
                  </div>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {m!.fanTeams.slice(0, 2).map((ft) => (
                      <span key={ft.team.id} className="text-sm" title={ft.team.name}>
                        {ft.team.emoji}
                      </span>
                    ))}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-green-400">{m!.stats.debatesWon}W</p>
                    <p className="text-[10px] text-slate-600">debates</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Collective fan identity */}
          {topTeams.length > 0 && (
            <div className="px-5 pb-4">
              <h3 className="font-bold text-white mb-3">Neighborhood Teams</h3>
              <div className="flex flex-col gap-2">
                {topTeams.map(({ team, count }) => (
                  <div
                    key={team.id}
                    className="flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-2.5"
                    style={{ borderLeft: `3px solid ${team.color}` }}
                  >
                    <span className="text-xl">{team.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{team.city} {team.name}</p>
                      <p className="text-xs text-slate-400">{team.league}</p>
                    </div>
                    <span className="text-xs text-slate-500">{count} fan{count !== 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick-nav links */}
          <div className="px-5 pb-4 flex flex-col gap-2">
            {(['chat', 'debates', 'bets', 'hot-takes'] as const).map((t) => {
              const cfgMap = {
                chat: { label: 'Jump to Chat', icon: MessageCircle, color: 'text-white', count: messages.length },
                debates: { label: 'View Debates', icon: Swords, color: 'text-blue-400', count: debates.filter((d) => d.status === 'active').length },
                bets: { label: 'View Bets', icon: Handshake, color: 'text-green-400', count: bets.filter((b) => b.status !== 'resolved').length },
                'hot-takes': { label: 'View Hot Takes', icon: Flame, color: 'text-orange-400', count: hotTakes.length },
              };
              const cfg = cfgMap[t];
              const Icon = cfg.icon;
              return (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 hover:bg-slate-800 transition-colors"
                >
                  <Icon size={16} className={cfg.color} />
                  <span className="flex-1 text-sm font-medium text-slate-200 text-left">{cfg.label}</span>
                  <span className="text-xs text-slate-500">{cfg.count} active</span>
                  <span className="text-slate-600">→</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CHAT TAB ─────────────────────────────────────────── */}
      {activeTab === 'chat' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg) => {
              const sender = getUserById(msg.userId);
              const isMe = msg.userId === 'me';
              const isAI = msg.userId === 'ai';
              const tag = msg.tag ? tagConfig[msg.tag] : null;

              return (
                <div key={msg.id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                  {!isMe && (
                    <Link href={isAI ? '#' : `/users/${msg.userId}`} className="shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-sm mt-1 hover:ring-2 hover:ring-orange-500 transition-all">
                        {isAI ? '✦' : sender?.avatar}
                      </div>
                    </Link>
                  )}
                  <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!isMe && (
                      <Link href={isAI ? '#' : `/users/${msg.userId}`} className="mb-1 text-xs font-medium text-slate-400 px-1 hover:text-orange-400 transition-colors">
                        {isAI ? 'Ask AI ✦' : sender?.displayName}
                      </Link>
                    )}
                    {tag && (
                      <div className={`mb-1 flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold text-white self-start ${tag.color}`}>
                        <span>{tag.emoji}</span><span>{tag.label}</span>
                      </div>
                    )}
                    <div
                      className={`relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed cursor-pointer ${
                        isAI ? 'bg-slate-800 text-slate-200 border border-slate-700'
                          : isMe ? 'bg-orange-500 text-white rounded-tr-sm'
                          : tag ? `border text-slate-100 rounded-tl-sm ${tag.border} ${tag.bg}`
                          : 'bg-slate-800 text-slate-100 rounded-tl-sm'
                      }`}
                      onDoubleClick={() => setShowReactionsFor(showReactionsFor === msg.id ? null : msg.id)}
                      onContextMenu={(e) => { e.preventDefault(); setTagPickerFor(tagPickerFor === msg.id ? null : msg.id); }}
                    >
                      {isAI ? (
                        <div>{msg.content.split('\n').map((line, i) => (
                          <p key={i} className={i === 0 ? 'font-semibold text-slate-300 mb-1' : ''}>{line}</p>
                        ))}</div>
                      ) : msg.content}
                    </div>

                    {/* Tag picker for other users' messages */}
                    {tagPickerFor === msg.id && !isMe && !isAI && (
                      <div className="mt-1 flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-2 border border-slate-700 shadow-xl">
                        <span className="text-xs text-slate-400 mr-1">Tag:</span>
                        {(['hot-take', 'debate', 'bet'] as MessageTag[]).map((t) => (
                          <button
                            key={t}
                            onClick={() => tagExistingMessage(msg.id, t)}
                            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-white transition-colors ${tagConfig[t].color}`}
                          >
                            {tagConfig[t].emoji} {tagConfig[t].label}
                          </button>
                        ))}
                        <button onClick={() => setTagPickerFor(null)} className="ml-1 text-slate-500 hover:text-white">
                          <X size={12} />
                        </button>
                      </div>
                    )}

                    {showReactionsFor === msg.id && (
                      <div className="mt-1 flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1.5 border border-slate-700 shadow-xl">
                        {EMOJI_REACTIONS.map((emoji) => (
                          <button key={emoji} onClick={() => addReaction(msg.id, emoji)} className="text-lg hover:scale-125 transition-transform">
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    {msg.reactions.filter((r) => r.userIds.length > 0).length > 0 && (
                      <div className={`mt-1 flex flex-wrap gap-1 ${isMe ? 'justify-end' : ''}`}>
                        {msg.reactions.filter((r) => r.userIds.length > 0).map((r) => (
                          <button
                            key={r.emoji}
                            onClick={() => addReaction(msg.id, r.emoji)}
                            className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs border transition-colors ${
                              r.userIds.includes('me') ? 'border-orange-500/50 bg-orange-900/30 text-orange-300' : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
                            }`}
                          >
                            {r.emoji} {r.userIds.length}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="mt-0.5 text-[10px] text-slate-600 px-1">{timeAgo(msg.timestamp)}</p>
                  </div>
                </div>
              );
            })}

            {aiLoading && (
              <div className="flex gap-2.5 items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-sm">✦</div>
                <div className="rounded-2xl rounded-tl-sm bg-slate-800 px-4 py-2.5">
                  <div className="flex gap-1.5 items-center">
                    {[0, 150, 300].map((d) => (
                      <div key={d} className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Ask AI panel */}
          {showAI && (
            <div className="shrink-0 border-t border-slate-800 bg-slate-900 px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-purple-400" />
                <span className="text-sm font-semibold text-purple-300">Ask AI — Sports</span>
                <button onClick={() => setShowAI(false)} className="ml-auto text-slate-500 hover:text-white"><X size={16} /></button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendAIMessage()}
                  placeholder="Who has the most playoff wins since 2010?"
                  autoFocus
                  className="flex-1 rounded-xl bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none border border-slate-700 focus:border-purple-500 transition-colors"
                />
                <button onClick={sendAIMessage} disabled={!aiQuery.trim()} className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-40 transition-colors">
                  Ask
                </button>
              </div>
            </div>
          )}

          {pendingTag && (
            <div className="shrink-0 px-4 py-2 flex items-center gap-2 bg-slate-900 border-t border-slate-800">
              <span className="text-xs text-slate-400">Tagging as:</span>
              <div className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white ${tagConfig[pendingTag].color}`}>
                {tagConfig[pendingTag].emoji} {tagConfig[pendingTag].label}
              </div>
              <button onClick={() => setPendingTag(null)} className="ml-auto text-slate-500 hover:text-white"><X size={14} /></button>
            </div>
          )}

          <div className="shrink-0 border-t border-slate-800 bg-slate-950 px-3 py-3">
            <div className="flex items-center gap-2 mb-2.5">
              {(['hot-take', 'debate', 'bet'] as MessageTag[]).map((tag) => {
                const cfg = tagConfig[tag];
                const isActive = pendingTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setPendingTag(isActive ? null : tag)}
                    className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold transition-colors ${
                      isActive ? `${cfg.color} text-white border-transparent` : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
                    }`}
                  >
                    {cfg.emoji} {cfg.label}
                  </button>
                );
              })}
              <div className="ml-auto">
                <button
                  onClick={() => { setShowAI(true); setShowReactionsFor(null); }}
                  className="flex items-center gap-1 rounded-full border border-slate-700 px-2.5 py-1 text-xs font-semibold text-purple-400 hover:border-purple-600 hover:text-purple-300 transition-colors"
                >
                  <Sparkles size={11} /> Ask AI
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={pendingTag ? `Drop your ${tagConfig[pendingTag].label.toLowerCase()}...` : 'Message...'}
                className="flex-1 rounded-full bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none border border-slate-700 focus:border-slate-600 transition-colors"
              />
              <button
                onClick={sendMessage}
                disabled={!inputText.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DEBATES TAB ──────────────────────────────────────── */}
      {activeTab === 'debates' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 pb-6">
          {debates.filter((d) => d.status === 'active').map((debate) => {
            const p1 = getUserById(debate.party1Id);
            const p2 = getUserById(debate.party2Id);
            const myVote = debate.votes.find((v) => v.userId === 'me');
            const counts = voteLeader(debate.votes);
            const getVotePct = (c: VoteChoice) => debate.votes.length > 0 ? Math.round(((counts[c] ?? 0) / debate.votes.length) * 100) : 0;
            const expanded = expandedDebate === debate.id;

            return (
              <div key={debate.id} className="rounded-2xl border border-blue-900/40 overflow-hidden">
                <button onClick={() => setExpandedDebate(expanded ? null : debate.id)} className="w-full text-left px-4 py-4 bg-blue-950/20 hover:bg-blue-950/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Swords size={13} className="text-blue-400" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-blue-400">Debate</span>
                    <span className="text-xs text-slate-500">{debate.votes.length} votes · {timeAgo(debate.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-100 leading-snug mb-3">&ldquo;{debate.claim}&rdquo;</p>
                  <div className="flex items-center gap-2 text-xs">
                    <Link href={`/users/${p1?.id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 bg-slate-800 rounded-full px-2 py-1 hover:bg-slate-700">
                      <span>{p1?.avatar}</span><span className="text-slate-300">{p1?.displayName.split(' ')[0]}</span>
                    </Link>
                    <span className="text-slate-600">vs</span>
                    <Link href={`/users/${p2?.id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 bg-slate-800 rounded-full px-2 py-1 hover:bg-slate-700">
                      <span>{p2?.avatar}</span><span className="text-slate-300">{p2?.displayName.split(' ')[0]}</span>
                    </Link>
                  </div>
                </button>
                {expanded && (
                  <div className="border-t border-slate-800 bg-slate-900 px-4 py-4">
                    {(['party1', 'party2', 'draw'] as VoteChoice[]).map((choice) => {
                      const label = choice === 'party1' ? p1?.displayName : choice === 'party2' ? p2?.displayName : 'Draw';
                      const user = choice === 'party1' ? p1 : choice === 'party2' ? p2 : null;
                      return (
                        <div key={choice} className="mb-3">
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span className="flex items-center gap-1">{user && <span>{user.avatar}</span>}<span>{label}</span>{myVote?.choice === choice && <span className="text-orange-400">(you)</span>}</span>
                            <span>{getVotePct(choice)}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-800"><div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${getVotePct(choice)}%` }} /></div>
                        </div>
                      );
                    })}
                    {!myVote ? (
                      <div className="flex gap-2 mt-3">
                        {([
                          { choice: 'party1' as VoteChoice, label: `${p1?.displayName.split(' ')[0]} Won` },
                          { choice: 'party2' as VoteChoice, label: `${p2?.displayName.split(' ')[0]} Won` },
                          { choice: 'draw' as VoteChoice, label: 'Draw' },
                        ]).map(({ choice, label }) => (
                          <button key={choice} onClick={() => castVote(debate.id, choice)} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors">{label}</button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-xs text-slate-500 mt-2">Your vote is in ✓</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {debates.filter((d) => d.status === 'resolved').length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mt-2">Archived</p>
              {debates.filter((d) => d.status === 'resolved').map((debate) => {
                const p1 = getUserById(debate.party1Id);
                const p2 = getUserById(debate.party2Id);
                const winnerUser = debate.resolution === 'party1' ? p1 : debate.resolution === 'party2' ? p2 : null;
                return (
                  <div key={debate.id} className="rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-4 opacity-60">
                    <p className="text-sm text-slate-300 mb-2 line-clamp-2">&ldquo;{debate.claim}&rdquo;</p>
                    <div className="flex items-center gap-2">
                      <Trophy size={13} className="text-yellow-400" />
                      <span className="text-xs font-semibold text-white">{winnerUser?.displayName ?? 'Draw'} won</span>
                      <span className="ml-auto text-xs text-slate-600">{timeAgo(debate.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {debates.length === 0 && (
            <div className="text-center py-16">
              <p className="text-3xl mb-2">⚔️</p>
              <p className="text-slate-400 text-sm">No debates yet. Start one in the chat.</p>
            </div>
          )}
        </div>
      )}

      {/* ── BETS TAB ─────────────────────────────────────────── */}
      {activeTab === 'bets' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 pb-6">
          {bets.filter((b) => b.status !== 'resolved').map((bet) => {
            const participants = bet.participantIds.map((pid) => getUserById(pid)).filter(Boolean);
            const isMine = bet.participantIds.includes('me');
            const myProposalPending = bet.status === 'awaiting-resolution' && bet.proposal?.proposedBy !== 'me' && !bet.proposal?.agreements.includes('me');
            const expanded = expandedBet === bet.id;
            const statusIcon = { pending: Clock, active: CheckCircle, 'awaiting-resolution': AlertCircle, resolved: CheckCircle, disputed: AlertCircle }[bet.status];
            const StatusIcon = statusIcon;
            const statusColor = { pending: 'text-slate-400', active: 'text-green-400', 'awaiting-resolution': 'text-yellow-400', resolved: 'text-slate-500', disputed: 'text-red-400' }[bet.status];

            return (
              <div key={bet.id} className="rounded-2xl border border-green-900/40 overflow-hidden">
                <button onClick={() => setExpandedBet(expanded ? null : bet.id)} className="w-full text-left px-4 py-4 bg-green-950/20 hover:bg-green-950/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Handshake size={13} className="text-green-400" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-green-400">Bet</span>
                    <div className={`ml-auto flex items-center gap-1 text-xs ${statusColor}`}><StatusIcon size={11} />{bet.status}</div>
                  </div>
                  <p className="text-sm text-slate-100 mb-3 leading-snug">&ldquo;{bet.claim}&rdquo;</p>
                  <div className="flex items-center gap-2">
                    {participants.map((p, i) => (
                      <span key={p!.id} className="flex items-center gap-1">
                        {i > 0 && <span className="text-slate-600 text-xs">🤝</span>}
                        <Link href={`/users/${p!.id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 bg-slate-800 rounded-full px-2 py-1 text-xs text-slate-300 hover:bg-slate-700">
                          <span>{p!.avatar}</span><span>{p!.displayName.split(' ')[0]}</span>
                        </Link>
                      </span>
                    ))}
                    <span className="ml-auto text-xs text-slate-500">{timeAgo(bet.createdAt)}</span>
                  </div>
                  {bet.status === 'awaiting-resolution' && bet.proposal && (
                    <div className="mt-3 rounded-xl bg-yellow-950/30 border border-yellow-900/40 px-3 py-2">
                      <p className="text-xs text-yellow-400">{getUserById(bet.proposal.proposedBy)?.displayName} proposed: <span className="font-semibold">{bet.proposal.isPush ? 'Push' : `${getUserById(bet.proposal.winnerId ?? '')?.displayName} Won`}</span></p>
                      <p className="text-xs text-slate-500 mt-0.5">{bet.proposal.agreements.length}/{bet.participantIds.length} agreed</p>
                    </div>
                  )}
                </button>
                {expanded && isMine && bet.status === 'active' && (
                  <div className="border-t border-slate-800 bg-slate-900 px-4 py-4">
                    <p className="text-xs font-semibold text-slate-400 mb-3">Propose resolution — all parties must agree</p>
                    <div className="flex flex-col gap-2">
                      {participants.map((p) => (
                        <button key={p!.id} onClick={() => proposeResolution(bet.id, p!.id)} className="w-full flex items-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700 transition-colors">
                          <span>{p!.avatar}</span><span>{p!.displayName} Won</span>
                        </button>
                      ))}
                      <button onClick={() => proposeResolution(bet.id, null)} className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition-colors">Push — No Winner</button>
                    </div>
                  </div>
                )}
                {expanded && myProposalPending && (
                  <div className="border-t border-slate-800 bg-slate-900 px-4 py-4">
                    <p className="text-xs font-semibold text-slate-400 mb-3">Do you agree with this resolution?</p>
                    <div className="flex gap-2">
                      <button onClick={() => agreeResolution(bet.id)} className="flex-1 rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition-colors">✓ Agree</button>
                      <button className="flex-1 rounded-xl border border-red-900 bg-red-950/30 py-2.5 text-sm font-bold text-red-400">✗ Dispute</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {bets.filter((b) => b.status === 'resolved').length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mt-2">Archived</p>
              {bets.filter((b) => b.status === 'resolved').map((bet) => {
                const winner = bet.winnerId ? getUserById(bet.winnerId) : null;
                return (
                  <div key={bet.id} className="rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-4 opacity-60">
                    <p className="text-sm text-slate-300 mb-2 line-clamp-2">&ldquo;{bet.claim}&rdquo;</p>
                    <div className="flex items-center gap-2">
                      <Trophy size={13} className="text-yellow-400" />
                      <span className="text-xs font-semibold text-white">{bet.isPush ? 'Push' : `${winner?.displayName} won`}</span>
                      <span className="ml-auto text-xs text-slate-600">{timeAgo(bet.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {bets.length === 0 && (
            <div className="text-center py-16">
              <p className="text-3xl mb-2">🤝</p>
              <p className="text-slate-400 text-sm">No bets yet. Make one in the chat.</p>
            </div>
          )}
        </div>
      )}

      {/* ── HOT TAKES TAB ────────────────────────────────────── */}
      {activeTab === 'hot-takes' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 pb-6">
          {hotTakes.map((ht) => {
            const author = getUserById(ht.authorId);
            const isMe = ht.authorId === 'me';
            return (
              <div key={ht.id} className="rounded-2xl border border-orange-900/30 bg-orange-950/10 overflow-hidden">
                <div className="px-4 pt-4 pb-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Link href={`/users/${ht.authorId}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-base hover:ring-2 hover:ring-orange-500 transition-all">
                      {isMe ? ME.avatar : author?.avatar}
                    </Link>
                    <div>
                      <Link href={`/users/${ht.authorId}`} className="text-sm font-semibold text-white hover:text-orange-400 transition-colors">
                        {isMe ? 'You' : author?.displayName}
                      </Link>
                      <p className="text-xs text-slate-500">{timeAgo(ht.createdAt)}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1 text-orange-400">
                      <Flame size={14} />
                      {totalReactions(ht.reactions) > 0 && <span className="text-xs font-bold">{totalReactions(ht.reactions)}</span>}
                    </div>
                  </div>
                  <p className="text-base font-medium text-white leading-snug">&ldquo;{ht.content}&rdquo;</p>
                </div>
                <div className="border-t border-orange-900/20 px-4 py-2.5 flex items-center gap-1.5 flex-wrap">
                  {REACT_OPTIONS.map((emoji) => {
                    const existing = ht.reactions.find((r) => r.emoji === emoji);
                    const count = existing?.userIds.length ?? 0;
                    const reacted = existing?.userIds.includes('me') ?? false;
                    return (
                      <button key={emoji} onClick={() => addHTReaction(ht.id, emoji)} className={`flex items-center gap-0.5 rounded-full px-2.5 py-1 text-sm transition-all border ${reacted ? 'bg-orange-900/60 border-orange-500/50 scale-105' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}`}>
                        {emoji}{count > 0 && <span className={`text-xs font-medium ml-0.5 ${reacted ? 'text-orange-300' : 'text-slate-400'}`}>{count}</span>}
                      </button>
                    );
                  })}
                  {!isMe && (
                    <button className="ml-auto flex items-center gap-1 rounded-full border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-400 hover:border-orange-500/50 hover:text-orange-400 transition-colors">
                      <ArrowUp size={12} /> Boost
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {hotTakes.length === 0 && (
            <div className="text-center py-16">
              <p className="text-3xl mb-2">🔥</p>
              <p className="text-slate-400 text-sm">No hot takes yet. Drop one in the chat.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
