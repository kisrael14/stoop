'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Home, MessageCircle, Swords, Handshake, Flame,
  Send, Sparkles, X, Trophy, Users, ArrowUp,
  AlertCircle, CheckCircle, Clock,
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

  const [messages, setMessages] = useState<Message[]>(chat?.messages ?? []);
  const [inputText, setInputText] = useState('');
  const [pendingTag, setPendingTag] = useState<MessageTag | null>(null);
  const [showReactionsFor, setShowReactionsFor] = useState<string | null>(null);
  const [tagPickerFor, setTagPickerFor] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [debates, setDebates] = useState<Debate[]>(
    DEBATES.filter((d) => d.chatId === id)
  );
  const [expandedDebate, setExpandedDebate] = useState<string | null>(null);

  const [bets, setBets] = useState<Bet[]>(
    BETS.filter((b) => b.chatId === id)
  );
  const [expandedBet, setExpandedBet] = useState<string | null>(null);

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
      <div className="flex items-center justify-center h-full text-ink-muted">
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

  const tagConfig = {
    'hot-take': { label: 'Hot Take', emoji: '🔥', bg: 'bg-press', border: 'border-press/40', surface: 'bg-press/10 border-press/30' },
    debate: { label: 'Debate', emoji: '⚔️', bg: 'bg-navy', border: 'border-navy/40', surface: 'bg-navy/10 border-navy/30' },
    bet: { label: 'Bet', emoji: '🤝', bg: 'bg-field', border: 'border-field/40', surface: 'bg-field/10 border-field/30' },
  };

  // ─── Chat actions ────────────────────────────────────────
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

    if (pendingTag === 'debate') {
      const newDebate: Debate = {
        id: `d-new-${Date.now()}`,
        chatId: chat.id,
        chatName: chat.name,
        claim: inputText.trim(),
        side1UserIds: ['me'],
        side2UserIds: [members.find((m) => m!.id !== 'me')?.id ?? 'marcus'],
        arguments: [],
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
        side1UserIds: [msg.userId === 'me' ? 'me' : msg.userId],
        side2UserIds: [msg.userId === 'me' ? (members.find((m) => m!.id !== 'me')?.id ?? 'marcus') : 'me'],
        arguments: [],
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

  // ─── Debate actions ──────────────────────────────────────
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

  // ─── Bet actions ─────────────────────────────────────────
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

  // ─── Hot take actions ────────────────────────────────────
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
    <div className="flex flex-col h-full bg-paper">
      {/* Header — newspaper section header */}
      <div className="shrink-0 bg-ink px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-paper/60 hover:text-paper p-1">
          <ArrowLeft size={20} />
        </button>
        <div className="flex h-9 w-9 items-center justify-center bg-ink-muted/30 text-xl shrink-0">
          {chat.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-paper truncate leading-tight">{chat.name}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-paper/50">{members.length} members</p>
        </div>
        <button onClick={() => setActiveTab('overview')} className="text-paper/60 hover:text-paper p-1">
          <Users size={18} />
        </button>
      </div>

      {/* Tab bar */}
      <div className="shrink-0 flex border-b-2 border-ink bg-paper overflow-x-auto">
        {tabs.map(({ id: tabId, label, icon: Icon }) => (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap border-b-2 -mb-0.5 transition-colors ${
              activeTab === tabId
                ? tabId === 'hot-takes' ? 'border-press text-press'
                  : tabId === 'debates' ? 'border-navy text-navy'
                  : tabId === 'bets' ? 'border-field text-field'
                  : 'border-ink text-ink'
                : 'border-transparent text-ink-faint hover:text-ink-muted'
            }`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="flex-1 overflow-y-auto pb-4">
          {/* Neighborhood hero */}
          <div className="bg-ink px-5 pt-5 pb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-16 w-16 items-center justify-center bg-ink-muted/30 text-3xl">
                {chat.emoji}
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-paper">{chat.name}</h2>
                <p className="text-xs text-paper/60 uppercase tracking-wider font-semibold">{members.length} members · Neighborhood</p>
              </div>
            </div>
            <div className="flex gap-5 border-t border-paper/20 pt-4">
              {[
                { label: 'Debates', value: debates.length, color: 'text-paper' },
                { label: 'Bets', value: bets.length, color: 'text-paper' },
                { label: 'Hot Takes', value: hotTakes.length, color: 'text-press' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-paper/50">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Members */}
          <div className="px-5 py-4 border-b border-rule">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-ink text-lg">Members</h3>
              <span className="text-[10px] font-bold uppercase tracking-wide text-ink-faint">{members.length} total</span>
            </div>
            <div className="flex flex-col gap-0">
              {members.map((m, i) => (
                <Link
                  key={m!.id}
                  href={`/users/${m!.id}`}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-paper-dark transition-colors border-b border-rule/50 last:border-0 ${i === 0 ? 'border-t border-rule/50' : ''}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-dark border border-rule text-xl shrink-0">
                    {m!.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink text-sm">{m!.displayName}</p>
                    <p className="text-[11px] text-ink-faint font-mono">@{m!.username}</p>
                  </div>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {m!.fanTeams.slice(0, 2).map((ft) => (
                      <span key={ft.team.id} className="text-sm" title={ft.team.name}>
                        {ft.team.emoji}
                      </span>
                    ))}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-field">{m!.stats.debatesWon}W</p>
                    <p className="text-[9px] uppercase tracking-wide text-ink-faint">debates</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Neighborhood teams */}
          {topTeams.length > 0 && (
            <div className="px-5 py-4 border-b border-rule">
              <h3 className="font-display font-bold text-ink text-lg mb-3">Neighborhood Teams</h3>
              <div className="flex flex-col gap-0">
                {topTeams.map(({ team, count }, i) => (
                  <div
                    key={team.id}
                    className={`flex items-center gap-3 px-4 py-2.5 border-b border-rule/50 last:border-0 ${i === 0 ? 'border-t border-rule/50' : ''}`}
                    style={{ borderLeftWidth: '3px', borderLeftColor: team.color, borderLeftStyle: 'solid' }}
                  >
                    <span className="text-xl">{team.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-ink">{team.city} {team.name}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-ink-faint">{team.league}</p>
                    </div>
                    <span className="text-[11px] text-ink-muted">{count} fan{count !== 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick-nav */}
          <div className="px-5 py-4 flex flex-col gap-0">
            <h3 className="font-display font-bold text-ink text-lg mb-3">Jump To</h3>
            {(['chat', 'debates', 'bets', 'hot-takes'] as const).map((t, i) => {
              const cfgMap = {
                chat: { label: 'Chat', icon: MessageCircle, color: 'text-ink', count: messages.length, unit: 'messages' },
                debates: { label: 'Debates', icon: Swords, color: 'text-navy', count: debates.filter((d) => d.status === 'active').length, unit: 'active' },
                bets: { label: 'Bets', icon: Handshake, color: 'text-field', count: bets.filter((b) => b.status !== 'resolved').length, unit: 'active' },
                'hot-takes': { label: 'Hot Takes', icon: Flame, color: 'text-press', count: hotTakes.length, unit: 'total' },
              };
              const cfg = cfgMap[t];
              const Icon = cfg.icon;
              return (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`flex items-center gap-3 bg-paper px-4 py-3 hover:bg-paper-dark transition-colors border-b border-rule/50 ${i === 0 ? 'border-t border-rule/50' : ''}`}
                >
                  <Icon size={15} className={cfg.color} />
                  <span className="flex-1 text-sm font-bold text-ink text-left">{cfg.label}</span>
                  <span className="text-[11px] text-ink-faint">{cfg.count} {cfg.unit}</span>
                  <span className="text-ink-faint text-xs">→</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CHAT TAB ─────────────────────────────────────────── */}
      {activeTab === 'chat' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-paper">
            {messages.map((msg) => {
              const sender = getUserById(msg.userId);
              const isMe = msg.userId === 'me';
              const isAI = msg.userId === 'ai';
              const tag = msg.tag ? tagConfig[msg.tag] : null;

              return (
                <div key={msg.id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                  {!isMe && (
                    <Link href={isAI ? '#' : `/users/${msg.userId}`} className="shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-dark border border-rule text-sm mt-1 hover:border-ink transition-all">
                        {isAI ? '✦' : sender?.avatar}
                      </div>
                    </Link>
                  )}
                  <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!isMe && (
                      <Link href={isAI ? '#' : `/users/${msg.userId}`} className="mb-1 text-[11px] font-bold text-ink-muted px-1 hover:text-masthead transition-colors uppercase tracking-wide">
                        {isAI ? 'Ask AI ✦' : sender?.displayName}
                      </Link>
                    )}
                    {tag && (
                      <div className={`mb-1 flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold text-paper self-start uppercase tracking-wider ${tag.bg}`}>
                        <span>{tag.emoji}</span><span>{tag.label}</span>
                      </div>
                    )}
                    <div
                      className={`relative px-4 py-2.5 text-sm leading-relaxed cursor-pointer ${
                        isAI ? 'bg-paper-dark text-ink border border-rule'
                          : isMe ? 'bg-ink text-paper'
                          : tag ? `border text-ink ${tag.border} ${tag.surface.split(' ')[0]}`
                          : 'bg-paper-dark text-ink border border-rule/50'
                      }`}
                      onDoubleClick={() => setShowReactionsFor(showReactionsFor === msg.id ? null : msg.id)}
                      onContextMenu={(e) => { e.preventDefault(); setTagPickerFor(tagPickerFor === msg.id ? null : msg.id); }}
                    >
                      {isAI ? (
                        <div>{msg.content.split('\n').map((line, i) => (
                          <p key={i} className={i === 0 ? 'font-bold text-ink mb-1' : ''}>{line}</p>
                        ))}</div>
                      ) : msg.content}
                    </div>

                    {tagPickerFor === msg.id && !isMe && !isAI && (
                      <div className="mt-1 flex items-center gap-1 bg-paper border border-rule px-3 py-2 shadow-xl">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-ink-muted mr-1">Tag:</span>
                        {(['hot-take', 'debate', 'bet'] as MessageTag[]).map((t) => (
                          <button
                            key={t}
                            onClick={() => tagExistingMessage(msg.id, t)}
                            className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-paper uppercase tracking-wider ${tagConfig[t].bg}`}
                          >
                            {tagConfig[t].emoji} {tagConfig[t].label}
                          </button>
                        ))}
                        <button onClick={() => setTagPickerFor(null)} className="ml-1 text-ink-faint hover:text-ink">
                          <X size={12} />
                        </button>
                      </div>
                    )}

                    {showReactionsFor === msg.id && (
                      <div className="mt-1 flex items-center gap-1 bg-paper border border-rule px-3 py-1.5 shadow-xl">
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
                            className={`flex items-center gap-0.5 px-2 py-0.5 text-xs border transition-colors ${
                              r.userIds.includes('me') ? 'border-press/50 bg-press/10 text-press' : 'border-rule bg-paper-dark text-ink-muted hover:border-rule-dark'
                            }`}
                          >
                            {r.emoji} {r.userIds.length}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="mt-0.5 text-[10px] text-ink-faint px-1 font-mono">{timeAgo(msg.timestamp)}</p>
                  </div>
                </div>
              );
            })}

            {aiLoading && (
              <div className="flex gap-2.5 items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-dark border border-rule text-sm">✦</div>
                <div className="bg-paper-dark border border-rule px-4 py-2.5">
                  <div className="flex gap-1.5 items-center">
                    {[0, 150, 300].map((d) => (
                      <div key={d} className="h-1.5 w-1.5 rounded-full bg-ink-faint animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Ask AI panel */}
          {showAI && (
            <div className="shrink-0 border-t-2 border-rule bg-paper-dark px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-ink-muted" />
                <span className="text-xs font-bold uppercase tracking-widest text-ink-muted">Ask AI — Sports Desk</span>
                <button onClick={() => setShowAI(false)} className="ml-auto text-ink-faint hover:text-ink"><X size={16} /></button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendAIMessage()}
                  placeholder="Who has the most playoff wins since 2010?"
                  autoFocus
                  className="flex-1 border border-rule bg-paper px-3 py-2 text-sm text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors"
                />
                <button onClick={sendAIMessage} disabled={!aiQuery.trim()} className="bg-ink px-4 py-2 text-xs font-bold text-paper uppercase tracking-wider hover:bg-ink/80 disabled:opacity-40 transition-colors">
                  Ask
                </button>
              </div>
            </div>
          )}

          {pendingTag && (
            <div className="shrink-0 px-4 py-2 flex items-center gap-2 bg-paper-dark border-t border-rule">
              <span className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">Tagging as:</span>
              <div className={`flex items-center gap-1 px-3 py-1 text-[10px] font-bold text-paper uppercase tracking-wider ${tagConfig[pendingTag].bg}`}>
                {tagConfig[pendingTag].emoji} {tagConfig[pendingTag].label}
              </div>
              <button onClick={() => setPendingTag(null)} className="ml-auto text-ink-faint hover:text-ink"><X size={14} /></button>
            </div>
          )}

          {/* Input area */}
          <div className="shrink-0 border-t-2 border-rule bg-paper px-3 py-3">
            <div className="flex items-center gap-2 mb-2.5">
              {(['hot-take', 'debate', 'bet'] as MessageTag[]).map((tag) => {
                const cfg = tagConfig[tag];
                const isActive = pendingTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setPendingTag(isActive ? null : tag)}
                    className={`flex items-center gap-1 border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      isActive ? `${cfg.bg} text-paper border-transparent` : 'border-rule text-ink-muted hover:border-rule-dark hover:text-ink'
                    }`}
                  >
                    {cfg.emoji} {cfg.label}
                  </button>
                );
              })}
              <div className="ml-auto">
                <button
                  onClick={() => { setShowAI(true); setShowReactionsFor(null); }}
                  className="flex items-center gap-1 border border-rule px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted hover:border-ink hover:text-ink transition-colors"
                >
                  <Sparkles size={10} /> Ask AI
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
                className="flex-1 border border-rule bg-paper-dark px-4 py-2.5 text-sm text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors"
              />
              <button
                onClick={sendMessage}
                disabled={!inputText.trim()}
                className="flex h-9 w-9 items-center justify-center bg-ink text-paper hover:bg-ink/80 disabled:opacity-40 transition-colors"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DEBATES TAB ──────────────────────────────────────── */}
      {activeTab === 'debates' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 pb-6 bg-paper">
          {debates.filter((d) => d.status === 'active').map((debate) => {
            const side1Users = debate.side1UserIds.map((uid) => getUserById(uid)).filter(Boolean);
            const side2Users = debate.side2UserIds.map((uid) => getUserById(uid)).filter(Boolean);
            const myVote = debate.votes.find((v) => v.userId === 'me');
            const counts = voteLeader(debate.votes);
            const getVotePct = (c: VoteChoice) => debate.votes.length > 0 ? Math.round(((counts[c] ?? 0) / debate.votes.length) * 100) : 0;
            const expanded = expandedDebate === debate.id;

            return (
              <div key={debate.id} className="border border-rule overflow-hidden">
                <button onClick={() => setExpandedDebate(expanded ? null : debate.id)} className="w-full text-left px-4 py-4 bg-paper hover:bg-paper-dark transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Swords size={12} className="text-navy" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-navy">Debate</span>
                    <span className="text-[10px] text-ink-faint font-mono">{debate.votes.length} votes · {timeAgo(debate.createdAt)}</span>
                    <Link
                      href={`/debates/${debate.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="ml-auto text-[10px] font-bold uppercase tracking-wider text-masthead hover:underline"
                    >
                      Face-Off →
                    </Link>
                  </div>
                  <p className="text-sm text-ink font-medium leading-snug mb-3 italic">&ldquo;{debate.claim}&rdquo;</p>
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-navy">{debate.side1Label ?? 'Side 1'}:</span>
                    {side1Users.slice(0, 2).map((u) => (
                      <Link key={u!.id} href={`/users/${u!.id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 bg-paper-dark border border-rule px-2 py-0.5 text-ink-muted hover:border-ink text-xs">
                        <span>{u!.avatar}</span><span>{u!.displayName.split(' ')[0]}</span>
                      </Link>
                    ))}
                    <span className="text-ink-faint mx-0.5 font-bold">vs</span>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-field">{debate.side2Label ?? 'Side 2'}:</span>
                    {side2Users.slice(0, 2).map((u) => (
                      <Link key={u!.id} href={`/users/${u!.id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 bg-paper-dark border border-rule px-2 py-0.5 text-ink-muted hover:border-ink text-xs">
                        <span>{u!.avatar}</span><span>{u!.displayName.split(' ')[0]}</span>
                      </Link>
                    ))}
                  </div>
                </button>
                {expanded && (
                  <div className="border-t border-rule bg-paper-dark px-4 py-4">
                    {(['side1', 'side2', 'draw'] as VoteChoice[]).map((choice) => {
                      const label = choice === 'side1' ? (debate.side1Label ?? 'Side 1') : choice === 'side2' ? (debate.side2Label ?? 'Side 2') : 'Draw';
                      return (
                        <div key={choice} className="mb-3">
                          <div className="flex justify-between text-xs text-ink-muted mb-1">
                            <span className="font-bold uppercase tracking-wide">{label}{myVote?.choice === choice && <span className="text-press ml-1">(you)</span>}</span>
                            <span className="font-mono">{getVotePct(choice)}%</span>
                          </div>
                          <div className="h-2 bg-paper border border-rule/50">
                            <div className="h-full bg-ink transition-all duration-500" style={{ width: `${getVotePct(choice)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    {!myVote ? (
                      <div className="flex gap-2 mt-3">
                        {([
                          { choice: 'side1' as VoteChoice, label: debate.side1Label ?? 'Side 1' },
                          { choice: 'side2' as VoteChoice, label: debate.side2Label ?? 'Side 2' },
                          { choice: 'draw' as VoteChoice, label: 'Draw' },
                        ]).map(({ choice, label }) => (
                          <button key={choice} onClick={() => castVote(debate.id, choice)} className="flex-1 border border-ink bg-paper py-2 text-[10px] font-bold text-ink uppercase tracking-wider hover:bg-ink hover:text-paper transition-colors">{label}</button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-[10px] font-bold uppercase tracking-wider text-ink-faint mt-2">Vote submitted ✓</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {debates.filter((d) => d.status === 'resolved').length > 0 && (
            <>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-faint mt-2 border-b border-rule pb-1">Archived</p>
              {debates.filter((d) => d.status === 'resolved').map((debate) => {
                const winnerLabel = debate.resolution === 'side1' ? (debate.side1Label ?? 'Side 1') : debate.resolution === 'side2' ? (debate.side2Label ?? 'Side 2') : null;
                return (
                  <div key={debate.id} className="border border-rule/50 bg-paper/60 px-4 py-4 opacity-70">
                    <p className="text-sm text-ink mb-2 line-clamp-2 italic">&ldquo;{debate.claim}&rdquo;</p>
                    <div className="flex items-center gap-2">
                      <Trophy size={12} className="text-rule-dark" />
                      <span className="text-[11px] font-bold text-ink uppercase tracking-wide">{winnerLabel ?? 'Draw'} won</span>
                      <span className="ml-auto text-[10px] text-ink-faint font-mono">{timeAgo(debate.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {debates.length === 0 && (
            <div className="text-center py-16">
              <p className="font-display text-4xl mb-2 text-ink-faint">⚔️</p>
              <p className="font-display font-bold text-ink text-lg">No debates yet</p>
              <p className="text-sm text-ink-muted italic mt-1">Start one in the chat</p>
            </div>
          )}
        </div>
      )}

      {/* ── BETS TAB ─────────────────────────────────────────── */}
      {activeTab === 'bets' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 pb-6 bg-paper">
          {bets.filter((b) => b.status !== 'resolved').map((bet) => {
            const participants = bet.participantIds.map((pid) => getUserById(pid)).filter(Boolean);
            const isMine = bet.participantIds.includes('me');
            const myProposalPending = bet.status === 'awaiting-resolution' && bet.proposal?.proposedBy !== 'me' && !bet.proposal?.agreements.includes('me');
            const expanded = expandedBet === bet.id;
            const statusIcon = { pending: Clock, active: CheckCircle, 'awaiting-resolution': AlertCircle, resolved: CheckCircle, disputed: AlertCircle }[bet.status];
            const StatusIcon = statusIcon;
            const statusColor = { pending: 'text-ink-faint', active: 'text-field', 'awaiting-resolution': 'text-rule-dark', resolved: 'text-ink-faint', disputed: 'text-masthead' }[bet.status];

            return (
              <div key={bet.id} className="border border-rule overflow-hidden">
                <button onClick={() => setExpandedBet(expanded ? null : bet.id)} className="w-full text-left px-4 py-4 bg-paper hover:bg-paper-dark transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Handshake size={12} className="text-field" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-field">Bet</span>
                    <div className={`ml-auto flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${statusColor}`}><StatusIcon size={10} />{bet.status}</div>
                  </div>
                  <p className="text-sm text-ink font-medium mb-3 leading-snug italic">&ldquo;{bet.claim}&rdquo;</p>
                  <div className="flex items-center gap-2">
                    {participants.map((p, i) => (
                      <span key={p!.id} className="flex items-center gap-1">
                        {i > 0 && <span className="text-ink-faint text-xs">🤝</span>}
                        <Link href={`/users/${p!.id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 border border-rule px-2 py-0.5 text-xs text-ink-muted hover:border-ink bg-paper-dark">
                          <span>{p!.avatar}</span><span>{p!.displayName.split(' ')[0]}</span>
                        </Link>
                      </span>
                    ))}
                    <span className="ml-auto text-[10px] text-ink-faint font-mono">{timeAgo(bet.createdAt)}</span>
                  </div>
                  {bet.status === 'awaiting-resolution' && bet.proposal && (
                    <div className="mt-3 border-l-4 border-rule-dark bg-paper-dark px-3 py-2">
                      <p className="text-xs text-ink-muted"><span className="font-bold">{getUserById(bet.proposal.proposedBy)?.displayName}</span> proposed: <span className="font-bold">{bet.proposal.isPush ? 'Push' : `${getUserById(bet.proposal.winnerId ?? '')?.displayName} Won`}</span></p>
                      <p className="text-[10px] text-ink-faint mt-0.5">{bet.proposal.agreements.length}/{bet.participantIds.length} agreed</p>
                    </div>
                  )}
                </button>
                {expanded && isMine && bet.status === 'active' && (
                  <div className="border-t border-rule bg-paper-dark px-4 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-3">Propose resolution — all parties must agree</p>
                    <div className="flex flex-col gap-2">
                      {participants.map((p) => (
                        <button key={p!.id} onClick={() => proposeResolution(bet.id, p!.id)} className="w-full flex items-center gap-2 bg-field px-4 py-3 text-sm font-bold text-paper hover:bg-field/80 transition-colors">
                          <span>{p!.avatar}</span><span>{p!.displayName} Won</span>
                        </button>
                      ))}
                      <button onClick={() => proposeResolution(bet.id, null)} className="w-full border border-rule bg-paper px-4 py-3 text-sm font-semibold text-ink-muted hover:bg-paper-dark transition-colors uppercase tracking-wider">Push — No Winner</button>
                    </div>
                  </div>
                )}
                {expanded && myProposalPending && (
                  <div className="border-t border-rule bg-paper-dark px-4 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-3">Do you agree with this resolution?</p>
                    <div className="flex gap-2">
                      <button onClick={() => agreeResolution(bet.id)} className="flex-1 bg-field py-2.5 text-sm font-bold text-paper hover:bg-field/80 transition-colors">✓ Agree</button>
                      <button className="flex-1 border border-masthead/40 bg-masthead/10 py-2.5 text-sm font-bold text-masthead">✗ Dispute</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {bets.filter((b) => b.status === 'resolved').length > 0 && (
            <>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-faint mt-2 border-b border-rule pb-1">Archived</p>
              {bets.filter((b) => b.status === 'resolved').map((bet) => {
                const winner = bet.winnerId ? getUserById(bet.winnerId) : null;
                return (
                  <div key={bet.id} className="border border-rule/50 bg-paper/60 px-4 py-4 opacity-70">
                    <p className="text-sm text-ink mb-2 line-clamp-2 italic">&ldquo;{bet.claim}&rdquo;</p>
                    <div className="flex items-center gap-2">
                      <Trophy size={12} className="text-rule-dark" />
                      <span className="text-[11px] font-bold text-ink uppercase tracking-wide">{bet.isPush ? 'Push' : `${winner?.displayName} won`}</span>
                      <span className="ml-auto text-[10px] text-ink-faint font-mono">{timeAgo(bet.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {bets.length === 0 && (
            <div className="text-center py-16">
              <p className="font-display text-4xl mb-2 text-ink-faint">🤝</p>
              <p className="font-display font-bold text-ink text-lg">No bets yet</p>
              <p className="text-sm text-ink-muted italic mt-1">Make one in the chat</p>
            </div>
          )}
        </div>
      )}

      {/* ── HOT TAKES TAB ────────────────────────────────────── */}
      {activeTab === 'hot-takes' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 pb-6 bg-paper">
          {hotTakes.map((ht) => {
            const author = getUserById(ht.authorId);
            const isMe = ht.authorId === 'me';
            return (
              <div key={ht.id} className="border border-rule overflow-hidden">
                <div className="border-l-4 border-press px-4 pt-4 pb-3 bg-paper">
                  <div className="flex items-center gap-2 mb-3">
                    <Link href={`/users/${ht.authorId}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-dark border border-rule text-base hover:border-ink transition-all">
                      {isMe ? ME.avatar : author?.avatar}
                    </Link>
                    <div>
                      <Link href={`/users/${ht.authorId}`} className="text-sm font-bold text-ink hover:text-masthead transition-colors">
                        {isMe ? 'You' : author?.displayName}
                      </Link>
                      <p className="text-[10px] text-ink-faint font-mono">{timeAgo(ht.createdAt)}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1 text-press">
                      <Flame size={13} />
                      {totalReactions(ht.reactions) > 0 && <span className="text-xs font-bold">{totalReactions(ht.reactions)}</span>}
                    </div>
                  </div>
                  <p className="font-display text-base font-bold text-ink leading-snug italic">&ldquo;{ht.content}&rdquo;</p>
                </div>
                <div className="border-t border-rule/50 px-4 py-2.5 flex items-center gap-1.5 flex-wrap bg-paper-dark">
                  {REACT_OPTIONS.map((emoji) => {
                    const existing = ht.reactions.find((r) => r.emoji === emoji);
                    const count = existing?.userIds.length ?? 0;
                    const reacted = existing?.userIds.includes('me') ?? false;
                    return (
                      <button key={emoji} onClick={() => addHTReaction(ht.id, emoji)} className={`flex items-center gap-0.5 px-2.5 py-1 text-sm transition-all border ${reacted ? 'bg-press/20 border-press/50 scale-105' : 'bg-paper border-rule hover:border-rule-dark'}`}>
                        {emoji}{count > 0 && <span className={`text-xs font-medium ml-0.5 ${reacted ? 'text-press' : 'text-ink-muted'}`}>{count}</span>}
                      </button>
                    );
                  })}
                  {!isMe && (
                    <button className="ml-auto flex items-center gap-1 border border-rule px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted hover:border-press hover:text-press transition-colors">
                      <ArrowUp size={11} /> Boost
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {hotTakes.length === 0 && (
            <div className="text-center py-16">
              <p className="font-display text-4xl mb-2 text-ink-faint">🔥</p>
              <p className="font-display font-bold text-ink text-lg">No hot takes yet</p>
              <p className="text-sm text-ink-muted italic mt-1">Drop one in the chat</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
