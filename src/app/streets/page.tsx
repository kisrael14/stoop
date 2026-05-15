'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Flame, Snowflake, Swords, Handshake, Plus, X, Send, Trophy,
  MessageCircle, ChevronDown, ChevronUp, PenLine, Megaphone,
} from 'lucide-react';
import { HOT_TAKES, DEBATES, BETS, ANALYSES, getUserById, USERS, ME } from '@/lib/mock-data';
import { timeAgo } from '@/lib/utils';
import type { HotTake, HotTakeComment, Debate, Bet, Analysis, DebateVote } from '@/lib/types';
import BetSetupModal, { type BetSetupResult } from '@/components/BetSetupModal';
import { detectTeamIds } from '@/lib/players-data';

type Filter = 'all' | 'takes' | 'debates' | 'bets' | 'analysis';
type PostType = 'take' | 'debate' | 'bet' | 'analysis';

const INITIAL_LIMIT = 5;

export default function StreetsPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [showAll, setShowAll] = useState(false);

  const handleFilterChange = (f: Filter) => {
    setFilter(f);
    setShowAll(false);
  };

  const [localHotTakes, setLocalHotTakes] = useState<HotTake[]>(() =>
    HOT_TAKES.filter((ht) => ht.isPublic).map((ht) => ({ ...ht, comments: ht.comments ?? [] }))
  );
  const [localDebates, setLocalDebates] = useState<Debate[]>(() => DEBATES.filter((d) => d.isPublic));
  const [localBets] = useState<Bet[]>(() => BETS.filter((b) => b.isPublic));
  const [localAnalyses, setLocalAnalyses] = useState<Analysis[]>(() =>
    ANALYSES.filter((a) => a.isPublic).map((a) => ({ ...a, comments: a.comments ?? [] }))
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [postType, setPostType] = useState<PostType>('take');
  const [postText, setPostText] = useState('');
  const [betSetupClaim, setBetSetupClaim] = useState<string | null>(null);

  const [showCommentsFor, setShowCommentsFor] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [mentionQuery, setMentionQuery] = useState('');
  const commentInputRef = useRef<HTMLInputElement>(null);

  const mentionMatches = mentionQuery
    ? USERS.filter((u) => u.username.toLowerCase().startsWith(mentionQuery.toLowerCase())).slice(0, 4)
    : [];

  const handleCommentInput = (val: string) => {
    setCommentText(val);
    const lastWord = val.split(/\s/).pop() ?? '';
    setMentionQuery(lastWord.startsWith('@') && lastWord.length > 1 ? lastWord.slice(1) : '');
  };

  const insertMention = (username: string) => {
    const words = commentText.split(/(\s)/);
    words[words.length - 1] = `@${username}`;
    setCommentText(words.join('') + ' ');
    setMentionQuery('');
    commentInputRef.current?.focus();
  };

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

  const voteDebate = (dId: string, choice: 'side1' | 'side2') => {
    setLocalDebates((prev) =>
      prev.map((d) => {
        if (d.id !== dId) return d;
        const alreadyVoted = d.votes.find((v) => v.userId === 'me');
        if (alreadyVoted?.choice === choice) {
          return { ...d, votes: d.votes.filter((v) => v.userId !== 'me') };
        }
        const filtered = d.votes.filter((v) => v.userId !== 'me');
        const newVote: DebateVote = { userId: 'me', choice };
        return { ...d, votes: [...filtered, newVote] };
      })
    );
  };

  const addComment = (htId: string) => {
    if (!commentText.trim()) return;
    const newComment: HotTakeComment = {
      id: `c-${Date.now()}`,
      userId: 'me',
      content: commentText.trim(),
      timestamp: new Date().toISOString(),
    };
    setLocalHotTakes((prev) =>
      prev.map((ht) => ht.id === htId ? { ...ht, comments: [...(ht.comments ?? []), newComment] } : ht)
    );
    setCommentText('');
    setMentionQuery('');
  };

  const submitPost = () => {
    if (!postText.trim()) return;
    if (postType === 'bet') { setBetSetupClaim(postText.trim()); return; }
    const detectedTeams = detectTeamIds(postText.trim());
    if (postType === 'take') {
      setLocalHotTakes((prev) => [{
        id: `ht-s-${Date.now()}`, chatId: 'streets', chatName: 'The Streets',
        content: postText.trim(), authorId: 'me', reactions: [], teamIds: detectedTeams,
        createdAt: new Date().toISOString(), isPublic: true, comments: [],
      }, ...prev]);
    }
    if (postType === 'analysis') {
      setLocalAnalyses((prev) => [{
        id: `an-s-${Date.now()}`, chatId: 'streets', chatName: 'The Streets',
        title: postText.trim().split('\n')[0] || postText.trim(),
        content: postText.trim(), authorId: 'me', reactions: [], teamIds: detectedTeams,
        createdAt: new Date().toISOString(), isPublic: true, comments: [],
      }, ...prev]);
    }
    setPostText('');
    setShowAddModal(false);
  };

  const confirmBet = (_data: BetSetupResult) => {
    // Bet object creation for streets is handled by the neighborhood flow;
    // here we just close the modal. teamIds detection happens if this page
    // is extended to create a full Bet record.
    setBetSetupClaim(null);
    setPostText('');
    setShowAddModal(false);
  };

  const feedItems = [
    ...localHotTakes.map((ht) => ({ type: 'take' as const, time: ht.createdAt, ht })),
    ...localDebates.map((d) => ({ type: 'debate' as const, time: d.createdAt, d })),
    ...localBets.map((b) => ({ type: 'bet' as const, time: b.createdAt, b })),
    ...localAnalyses.map((a) => ({ type: 'analysis' as const, time: a.createdAt, a })),
  ]
    .filter((item) =>
      filter === 'all' ||
      (filter === 'takes' && item.type === 'take') ||
      (filter === 'debates' && item.type === 'debate') ||
      (filter === 'bets' && item.type === 'bet') ||
      (filter === 'analysis' && item.type === 'analysis')
    )
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const FILTERS: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'takes', label: '🔥 Takes' },
    { id: 'debates', label: '⚔️ Debates' },
    { id: 'bets', label: '🤝 Bets' },
    { id: 'analysis', label: '📊 Analysis' },
  ];

  const visibleItems = showAll ? feedItems : feedItems.slice(0, INITIAL_LIMIT);
  const hasMore = !showAll && feedItems.length > INITIAL_LIMIT;

  return (
    <div className="flex flex-col min-h-full bg-paper">

      {/* ── Header — sticky ────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-nav-bg px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-ink/40">Live · Public Feed</p>
          <h1 className="font-display text-2xl font-black text-ink leading-none">The Streets</h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-press text-ink px-3.5 py-2 rounded-full font-bold text-[11px] uppercase tracking-widest btn-3d hover:bg-press/80 transition-colors shrink-0"
        >
          <Plus size={12} /> Post
        </button>
      </div>

      {/* ── Filter pills — sticky below header ─────────────── */}
      <div className="sticky top-[56px] z-10 bg-paper-dark border-b border-rule px-3 py-2 flex gap-1.5 overflow-x-auto">
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => handleFilterChange(id)}
            className={`shrink-0 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full transition-colors whitespace-nowrap ${
              filter === id
                ? 'bg-masthead/20 text-masthead border border-masthead/50'
                : 'bg-paper border border-rule text-ink-muted hover:border-ink-muted hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Feed ─────────────────────────────────────────── */}
      <div className="px-4 py-3 flex flex-col gap-3">
        {feedItems.length === 0 && (
          <div className="text-center py-16">
            <p className="font-display text-4xl mb-2 text-ink-faint">📰</p>
            <p className="font-display font-bold text-ink text-lg">Nothing here yet</p>
            <p className="text-sm text-ink-muted italic mt-1">Be the first to post</p>
          </div>
        )}

        {visibleItems.map((entry) => {
          // ── Hot Take ──────────────────────────────────────
          if (entry.type === 'take') {
            const ht = entry.ht;
            const author = getUserById(ht.authorId);
            const isMe = ht.authorId === 'me';
            const fireR = ht.reactions.find((r) => r.emoji === '🔥');
            const iceR  = ht.reactions.find((r) => r.emoji === '❄️');
            const fireCount = fireR?.userIds.length ?? 0;
            const iceCount  = iceR?.userIds.length  ?? 0;
            const myFire = fireR?.userIds.includes('me') ?? false;
            const myIce  = iceR?.userIds.includes('me')  ?? false;
            const total  = fireCount + iceCount;
            const hotPct = total > 0 ? Math.round((fireCount / total) * 100) : null;
            const comments = ht.comments ?? [];
            const showingComments = showCommentsFor === ht.id;

            return (
              <div key={ht.id} className="border border-rule overflow-hidden">
                {/* Author row */}
                <div className="flex items-center gap-2.5 px-4 pt-3 pb-2 border-b border-rule/50">
                  <Link href={`/users/${ht.authorId}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-dark border border-rule text-base hover:border-ink transition-all shrink-0">
                    {isMe ? ME.avatar : author?.avatar}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/users/${ht.authorId}`} className="text-[11px] font-bold text-ink hover:text-masthead block leading-tight uppercase tracking-wide">
                      {isMe ? 'You' : author?.displayName}
                    </Link>
                    <p className="text-[9px] text-ink-faint font-mono">
                      {timeAgo(ht.createdAt)}
                      {ht.chatId !== 'streets' && (
                        <> · <Link href={`/neighborhoods/${ht.chatId}`} className="hover:underline">{ht.chatName}</Link></>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-[#f97316]/10 border border-[#f97316]/30 px-2 py-0.5 rounded-full shrink-0">
                    <Flame size={10} className="text-[#f97316]" />
                    <span className="text-[9px] font-bold text-[#f97316] uppercase tracking-wider">Hot Take</span>
                  </div>
                </div>
                {/* Content */}
                <div className="px-4 py-3 border-l-4 border-l-[#f97316]">
                  <p className="font-display text-sm font-bold text-ink italic leading-snug">&ldquo;{ht.content}&rdquo;</p>
                </div>
                {/* Actions */}
                <div className="border-t border-rule/50 px-4 py-2 flex items-center gap-2 bg-paper-dark">
                  <button
                    onClick={() => voteHotTake(ht.id, '🔥')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-xs transition-all ${
                      myFire ? 'bg-[#f97316] text-white' : 'bg-paper border border-rule text-ink-muted hover:border-[#f97316] hover:text-[#f97316]'
                    }`}
                  >
                    <Flame size={12} />
                    {fireCount > 0 && fireCount}
                  </button>
                  <button
                    onClick={() => voteHotTake(ht.id, '❄️')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-xs transition-all ${
                      myIce ? 'bg-[#38bdf8] text-white' : 'bg-paper border border-rule text-ink-muted hover:border-[#38bdf8] hover:text-[#38bdf8]'
                    }`}
                  >
                    <Snowflake size={12} />
                    {iceCount > 0 && iceCount}
                  </button>
                  {hotPct !== null && (
                    <span className="text-[9px] font-mono text-ink-faint">{hotPct}% 🔥</span>
                  )}
                  <button
                    onClick={() => { setShowCommentsFor(showingComments ? null : ht.id); setCommentText(''); setMentionQuery(''); }}
                    className="ml-auto flex items-center gap-1 text-[10px] font-bold text-ink-muted hover:text-ink"
                  >
                    <MessageCircle size={12} />
                    {comments.length > 0 ? comments.length : 'Reply'}
                    {showingComments ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                  </button>
                </div>
                {/* Comments */}
                {showingComments && (
                  <div className="border-t border-rule/30 bg-paper-dark px-4 py-3 flex flex-col gap-2.5">
                    {comments.map((c) => {
                      const commenter = getUserById(c.userId);
                      return (
                        <div key={c.id} className="flex gap-2">
                          <Link href={`/users/${c.userId}`} className="flex h-6 w-6 items-center justify-center rounded-full bg-paper border border-rule text-xs shrink-0">
                            {c.userId === 'me' ? ME.avatar : commenter?.avatar}
                          </Link>
                          <div className="flex-1 bg-paper border border-rule/60 rounded-xl px-3 py-1.5">
                            <span className="text-[10px] font-bold text-ink">{c.userId === 'me' ? 'You' : commenter?.displayName}</span>
                            <span className="text-[9px] text-ink-faint font-mono ml-1.5">{timeAgo(c.timestamp)}</span>
                            <p className="text-xs text-ink mt-0.5">{c.content}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div className="relative">
                      {mentionQuery && mentionMatches.length > 0 && (
                        <div className="absolute bottom-full left-0 mb-1 bg-paper border border-rule shadow-xl rounded-xl overflow-hidden z-10 w-44">
                          {mentionMatches.map((u) => (
                            <button key={u.id} onClick={() => insertMention(u.username)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-paper-dark text-left">
                              <span>{u.avatar}</span>
                              <div>
                                <p className="text-xs font-bold text-ink">{u.displayName}</p>
                                <p className="text-[10px] text-ink-faint">@{u.username}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 items-center">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-paper border border-rule text-xs shrink-0">{ME.avatar}</div>
                        <input
                          ref={commentInputRef}
                          value={commentText}
                          onChange={(e) => handleCommentInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addComment(ht.id)}
                          placeholder="Reply… @ to mention"
                          className="flex-1 bg-paper border border-rule px-3 py-1.5 text-xs text-ink placeholder-ink-faint outline-none focus:border-ink rounded-full"
                        />
                        <button onClick={() => addComment(ht.id)} disabled={!commentText.trim()} className="h-7 w-7 flex items-center justify-center bg-nav-bg text-ink rounded-full disabled:opacity-40 shrink-0">
                          <Send size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          // ── Debate ────────────────────────────────────────
          if (entry.type === 'debate') {
            const d = entry.d;
            const side1Users = d.side1UserIds.map((uid) => getUserById(uid)).filter(Boolean);
            const side2Users = d.side2UserIds.map((uid) => getUserById(uid)).filter(Boolean);
            const total = d.votes.length;
            const s1Count = d.votes.filter((v) => v.choice === 'side1').length;
            const s2Count = d.votes.filter((v) => v.choice === 'side2').length;
            const s1Pct = total > 0 ? Math.round((s1Count / total) * 100) : 0;
            const s2Pct = total > 0 ? Math.round((s2Count / total) * 100) : 0;
            const myVote = d.votes.find((v) => v.userId === 'me')?.choice;
            return (
              <div key={d.id} className="border border-rule overflow-hidden">
                <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-rule/50">
                  <div className="flex items-center gap-1 bg-navy/10 border border-navy/30 px-2 py-0.5 rounded-full">
                    <Swords size={10} className="text-navy" />
                    <span className="text-[9px] font-bold text-navy uppercase tracking-wider">Debate</span>
                  </div>
                  <span className="text-[9px] text-ink-faint font-mono ml-auto">{total} votes · {timeAgo(d.createdAt)}</span>
                </div>
                <div className="px-4 py-3 border-l-4 border-l-navy">
                  <p className="font-display text-sm font-bold text-ink italic leading-snug mb-2.5">&ldquo;{d.claim}&rdquo;</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-navy mb-1">{d.side1Label ?? 'Side 1'}</p>
                      <div className="flex flex-wrap gap-1">
                        {side1Users.slice(0, 2).map((u) => (
                          <span key={u!.id} className="flex items-center gap-1 bg-paper-dark border border-rule px-1.5 py-0.5 text-ink-muted text-[10px]">
                            {u!.avatar} {u!.displayName.split(' ')[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-field mb-1">{d.side2Label ?? 'Side 2'}</p>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {side2Users.slice(0, 2).map((u) => (
                          <span key={u!.id} className="flex items-center gap-1 bg-paper-dark border border-rule px-1.5 py-0.5 text-ink-muted text-[10px]">
                            {u!.avatar} {u!.displayName.split(' ')[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {total > 0 && (
                    <div className="flex items-center gap-2 mt-2.5">
                      <span className="text-[9px] font-bold text-navy font-mono w-6">{s1Pct}%</span>
                      <div className="flex-1 h-1.5 bg-paper-dark border border-rule/50 overflow-hidden flex rounded-full">
                        <div className="h-full bg-navy rounded-full" style={{ width: `${s1Pct}%` }} />
                        <div className="h-full bg-field rounded-full" style={{ width: `${s2Pct}%` }} />
                      </div>
                      <span className="text-[9px] font-bold text-field font-mono w-6 text-right">{s2Pct}%</span>
                    </div>
                  )}
                </div>
                {/* Vote + Join row */}
                <div className="border-t border-rule/50 px-3 py-2.5 bg-paper-dark flex items-center gap-2">
                  <button
                    onClick={() => voteDebate(d.id, 'side1')}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-colors border ${
                      myVote === 'side1'
                        ? 'bg-navy text-ink border-navy'
                        : 'bg-paper border-rule text-ink-muted hover:border-navy hover:text-navy'
                    }`}
                  >
                    {d.side1Label ?? 'Side 1'}{s1Count > 0 && ` · ${s1Count}`}
                  </button>
                  <button
                    onClick={() => voteDebate(d.id, 'side2')}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-colors border ${
                      myVote === 'side2'
                        ? 'bg-field text-ink border-field'
                        : 'bg-paper border-rule text-ink-muted hover:border-field hover:text-field'
                    }`}
                  >
                    {d.side2Label ?? 'Side 2'}{s2Count > 0 && ` · ${s2Count}`}
                  </button>
                  <Link
                    href={`/debates/${d.id}`}
                    className="shrink-0 text-[10px] font-bold text-masthead hover:underline whitespace-nowrap pl-1"
                  >
                    Join Debate →
                  </Link>
                </div>
              </div>
            );
          }

          // ── Analysis ──────────────────────────────────────
          if (entry.type === 'analysis') {
            const a = entry.a;
            const author = getUserById(a.authorId);
            const isMe = a.authorId === 'me';
            return (
              <Link key={a.id} href={`/analyses/${a.id}`} className="block border border-rule overflow-hidden hover:bg-paper-dark/30 transition-colors">
                <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-rule/50">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-paper-dark border border-rule text-sm shrink-0">
                    {isMe ? ME.avatar : author?.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-ink">{isMe ? 'You' : author?.displayName}</span>
                    <span className="text-[9px] text-ink-faint font-mono ml-2">{timeAgo(a.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-rule border border-rule-dark px-2 py-0.5 rounded-full shrink-0">
                    <PenLine size={10} className="text-ink-muted" />
                    <span className="text-[9px] font-bold text-ink-muted uppercase tracking-wider">Analysis</span>
                  </div>
                </div>
                <div className="px-4 py-3 border-l-4 border-l-ink-muted">
                  <h3 className="font-display text-sm font-bold text-ink leading-snug mb-1">{a.title}</h3>
                  <p className="text-xs text-ink-muted leading-relaxed line-clamp-2">{a.content}</p>
                </div>
                <div className="border-t border-rule/50 px-4 py-2 bg-paper-dark flex items-center">
                  <span className="text-[9px] text-ink-faint font-mono">{a.chatName}</span>
                  <span className="ml-auto text-[10px] font-bold text-masthead">Read →</span>
                </div>
              </Link>
            );
          }

          // ── Bet ───────────────────────────────────────────
          const b = entry.b;
          const side1Users = (b.side1Ids ?? []).map((id) => getUserById(id)).filter(Boolean);
          const side2Users = (b.side2Ids ?? []).map((id) => getUserById(id)).filter(Boolean);
          const participants = b.participantIds.map((pid) => getUserById(pid)).filter(Boolean);
          const winner = b.winnerId ? getUserById(b.winnerId) : null;
          return (
            <Link key={b.id} href={`/neighborhoods/${b.chatId}?tab=bets`} className="block border border-rule overflow-hidden hover:bg-paper-dark/30 transition-colors">
              <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-rule/50">
                <div className="flex items-center gap-1 bg-field/10 border border-field/30 px-2 py-0.5 rounded-full">
                  <Handshake size={10} className="text-field" />
                  <span className="text-[9px] font-bold text-field uppercase tracking-wider">Bet</span>
                </div>
                <span className="text-[9px] text-ink-faint font-mono ml-auto">{timeAgo(b.createdAt)}</span>
              </div>
              <div className="px-4 py-3 border-l-4 border-l-field">
                <p className="font-display text-sm font-bold text-ink italic leading-snug mb-2.5">&ldquo;{b.claim}&rdquo;</p>
                {b.side1Ids && b.side2Ids ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-navy mb-1">{b.side1Label ?? 'Side 1'}</p>
                      <div className="flex flex-wrap gap-1">
                        {side1Users.map((u) => (
                          <span key={u!.id} className="flex items-center gap-1 bg-paper-dark border border-rule px-1.5 py-0.5 text-[10px] text-ink-muted">
                            {u!.avatar} {u!.displayName.split(' ')[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-field mb-1">{b.side2Label ?? 'Side 2'}</p>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {side2Users.map((u) => (
                          <span key={u!.id} className="flex items-center gap-1 bg-paper-dark border border-rule px-1.5 py-0.5 text-[10px] text-ink-muted">
                            {u!.avatar} {u!.displayName.split(' ')[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {participants.map((p, i) => (
                      <span key={p!.id} className="flex items-center gap-1">
                        {i > 0 && <span className="text-ink-faint text-xs font-bold">vs</span>}
                        <span className="flex items-center gap-1 bg-paper-dark border border-rule px-1.5 py-0.5 text-[10px] text-ink-muted">
                          {p!.avatar} {p!.displayName.split(' ')[0]}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
                {b.stakes && (
                  <p className="text-[9px] text-ink-muted italic mt-2 pt-1.5 border-t border-rule/40">
                    Stakes: <span className="font-bold text-ink">{b.stakes}</span>
                  </p>
                )}
                {b.status === 'resolved' && (
                  <div className="flex items-center gap-1 mt-2 pt-1.5 border-t border-rule/40">
                    <Trophy size={10} className="text-rule-dark" />
                    <span className="text-[10px] font-bold text-ink">{b.isPush ? 'Push' : `${winner?.displayName} won`}</span>
                  </div>
                )}
              </div>
              <div className="border-t border-rule/50 px-4 py-2 bg-paper-dark flex items-center">
                <span className="text-[9px] text-ink-faint font-mono">{b.chatName}</span>
                <span className="ml-auto text-[9px] font-bold uppercase tracking-widest text-field">{b.status}</span>
              </div>
            </Link>
          );
        })}

        {hasMore && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full py-3 border border-rule text-ink font-bold text-xs uppercase tracking-widest hover:bg-paper-dark transition-colors"
          >
            See More ({feedItems.length - INITIAL_LIMIT} more)
          </button>
        )}
      </div>

      {/* ── Post Modal ─────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-nav-bg/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-md bg-paper-dark rounded-t-2xl overflow-hidden border-t border-rule">
            <div className="flex items-center justify-between px-5 py-3.5 bg-nav-bg">
              <div className="flex items-center gap-2">
                <Megaphone size={14} className="text-masthead" />
                <p className="font-display font-bold text-ink text-sm">Post to The Streets</p>
              </div>
              <button onClick={() => { setShowAddModal(false); setPostText(''); }} className="text-ink/60 hover:text-ink"><X size={16} /></button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              <div className="grid grid-cols-4 gap-1.5">
                {([
                  { id: 'take', emoji: '🔥', label: 'Take' },
                  { id: 'debate', emoji: '⚔️', label: 'Debate' },
                  { id: 'bet', emoji: '🤝', label: 'Bet' },
                  { id: 'analysis', emoji: '📊', label: 'Analysis' },
                ] as { id: PostType; emoji: string; label: string }[]).map(({ id, emoji, label }) => (
                  <button
                    key={id}
                    onClick={() => setPostType(id)}
                    className={`flex flex-col items-center gap-0.5 py-2.5 border rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                      postType === id ? 'border-masthead bg-nav-bg text-ink' : 'border-rule text-ink-muted hover:border-ink-muted'
                    }`}
                  >
                    <span className="text-lg">{emoji}</span>{label}
                  </button>
                ))}
              </div>
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder={
                  postType === 'take' ? 'Drop your hot take (280 chars max)…'
                  : postType === 'debate' ? 'State the claim to debate…'
                  : postType === 'analysis' ? 'Write your analysis…'
                  : "What's the bet?"
                }
                rows={4}
                autoFocus
                className="w-full border border-rule bg-paper-dark px-4 py-3 text-sm text-ink placeholder-ink-faint outline-none focus:border-ink resize-none rounded-xl leading-relaxed"
              />
            </div>
            <div className="border-t border-rule bg-paper px-5 py-3 flex gap-2">
              <button onClick={() => { setShowAddModal(false); setPostText(''); }} className="border border-rule px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-ink-muted hover:bg-paper-dark rounded-full">
                Cancel
              </button>
              <button
                onClick={submitPost}
                disabled={!postText.trim()}
                className="flex-1 bg-press text-ink py-2.5 text-xs font-bold uppercase tracking-widest disabled:opacity-40 rounded-full btn-3d hover:bg-press/80"
              >
                Post to The Streets
              </button>
            </div>
          </div>
        </div>
      )}

      {betSetupClaim !== null && (
        <BetSetupModal
          claim={betSetupClaim}
          members={USERS}
          onConfirm={confirmBet}
          onCancel={() => setBetSetupClaim(null)}
        />
      )}
    </div>
  );
}
