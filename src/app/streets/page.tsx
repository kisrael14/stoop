'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Flame, Snowflake, Swords, Handshake, Plus, X, Send, Trophy,
  MessageCircle, Megaphone, ChevronDown, ChevronUp,
} from 'lucide-react';
import { HOT_TAKES, DEBATES, BETS, getUserById, USERS, ME } from '@/lib/mock-data';
import { timeAgo, totalReactions } from '@/lib/utils';
import type { HotTake, HotTakeComment, Debate, Bet, VoteChoice } from '@/lib/types';
import BetSetupModal, { type BetSetupResult } from '@/components/BetSetupModal';

type Filter = 'all' | 'takes' | 'debates' | 'bets';
type PostType = 'take' | 'debate' | 'bet';

function renderMentions(text: string) {
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, i) =>
    /^@\w+$/.test(part)
      ? <span key={i} className="text-navy font-bold">{part}</span>
      : <span key={i}>{part}</span>
  );
}

export default function StreetsPage() {
  const [filter, setFilter] = useState<Filter>('all');

  const [localHotTakes, setLocalHotTakes] = useState<HotTake[]>(() =>
    HOT_TAKES.filter((ht) => ht.isPublic).map((ht) => ({ ...ht, comments: ht.comments ?? [] }))
  );
  const [localDebates] = useState<Debate[]>(() => DEBATES.filter((d) => d.isPublic));
  const [localBets] = useState<Bet[]>(() => BETS.filter((b) => b.isPublic));

  // New post modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [postType, setPostType] = useState<PostType>('take');
  const [postText, setPostText] = useState('');
  const [betSetupClaim, setBetSetupClaim] = useState<string | null>(null);

  // Comments UI
  const [showCommentsFor, setShowCommentsFor] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [mentionQuery, setMentionQuery] = useState('');
  const commentInputRef = useRef<HTMLInputElement>(null);

  const mentionMatches = mentionQuery
    ? USERS.filter((u) => u.username.toLowerCase().startsWith(mentionQuery.toLowerCase())).slice(0, 5)
    : [];

  const handleCommentInput = (val: string) => {
    setCommentText(val);
    const lastWord = val.split(/\s/).pop() ?? '';
    if (lastWord.startsWith('@') && lastWord.length > 1) {
      setMentionQuery(lastWord.slice(1));
    } else {
      setMentionQuery('');
    }
  };

  const insertMention = (username: string) => {
    const words = commentText.split(/(\s)/);
    const lastWordIdx = words.length - 1;
    words[lastWordIdx] = `@${username}`;
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

  const addComment = (htId: string) => {
    if (!commentText.trim()) return;
    const newComment: HotTakeComment = {
      id: `c-${Date.now()}`,
      userId: 'me',
      content: commentText.trim(),
      timestamp: new Date().toISOString(),
    };
    setLocalHotTakes((prev) =>
      prev.map((ht) =>
        ht.id === htId ? { ...ht, comments: [...(ht.comments ?? []), newComment] } : ht
      )
    );
    setCommentText('');
    setMentionQuery('');
  };

  const submitPost = () => {
    if (!postText.trim()) return;
    if (postType === 'bet') {
      setBetSetupClaim(postText.trim());
      return;
    }
    if (postType === 'take') {
      const newHT: HotTake = {
        id: `ht-s-${Date.now()}`,
        chatId: 'streets',
        chatName: 'The Streets',
        content: postText.trim(),
        authorId: 'me',
        reactions: [],
        teamIds: [],
        createdAt: new Date().toISOString(),
        isPublic: true,
        comments: [],
      };
      setLocalHotTakes((prev) => [newHT, ...prev]);
    }
    setPostText('');
    setShowAddModal(false);
  };

  const confirmBet = (data: BetSetupResult) => {
    // For Streets bets, we just close the modal — full bet management is in neighborhoods
    setBetSetupClaim(null);
    setPostText('');
    setShowAddModal(false);
  };

  // Build the feed
  const feedItems = [
    ...localHotTakes.map((ht) => ({ type: 'take' as const, time: ht.createdAt, ht })),
    ...localDebates.map((d) => ({ type: 'debate' as const, time: d.createdAt, d })),
    ...localBets.map((b) => ({ type: 'bet' as const, time: b.createdAt, b })),
  ]
    .filter((item) =>
      filter === 'all' ||
      (filter === 'takes' && item.type === 'take') ||
      (filter === 'debates' && item.type === 'debate') ||
      (filter === 'bets' && item.type === 'bet')
    )
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <div className="flex flex-col h-full bg-paper">

      {/* ── Masthead ──────────────────────────────────────── */}
      <div className="shrink-0 bg-ink px-5 pt-10 pb-4">
        <div className="flex items-end justify-between mb-1">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-paper/40 mb-0.5">Live · Public Feed</p>
            <h1 className="font-display text-3xl font-black text-paper leading-none">The Streets</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-press text-paper px-4 py-2.5 rounded-full font-bold text-[11px] uppercase tracking-widest btn-3d hover:bg-press/80 transition-colors"
          >
            <Plus size={13} /> Post
          </button>
        </div>
        <p className="text-[10px] text-paper/40 italic mb-3">What the people are saying</p>

        {/* Filter pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {([
            { id: 'all', label: 'All' },
            { id: 'takes', label: '🔥 Hot Takes' },
            { id: 'debates', label: '⚔️ Debates' },
            { id: 'bets', label: '🤝 Bets' },
          ] as { id: Filter; label: string }[]).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`shrink-0 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full transition-colors ${
                filter === id ? 'bg-paper text-ink' : 'bg-paper/10 text-paper/60 hover:bg-paper/20'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Feed ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 pb-24">
        {feedItems.length === 0 && (
          <div className="text-center py-16">
            <p className="font-display text-4xl mb-2 text-ink-faint">📰</p>
            <p className="font-display font-bold text-ink text-lg">Nothing here yet</p>
            <p className="text-sm text-ink-muted italic mt-1">Be the first to post to The Streets</p>
          </div>
        )}

        {feedItems.map((entry) => {
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
                {/* Card body */}
                <div className="border-l-4 border-fire px-4 pt-4 pb-3 bg-paper">
                  <div className="flex items-center gap-2 mb-2">
                    <Link href={`/users/${ht.authorId}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-dark border border-rule text-base hover:border-ink transition-all shrink-0">
                      {isMe ? ME.avatar : author?.avatar}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/users/${ht.authorId}`} className="text-sm font-bold text-ink hover:text-masthead transition-colors block leading-tight">
                        {isMe ? 'You' : author?.displayName}
                      </Link>
                      <p className="text-[10px] text-ink-faint font-mono">
                        {timeAgo(ht.createdAt)}
                        {ht.chatId !== 'streets' && (
                          <> · <Link href={`/neighborhoods/${ht.chatId}`} className="hover:text-ink">{ht.chatName}</Link></>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-fire shrink-0">
                      <Flame size={12} />
                      <span className="text-[10px] font-bold">Hot Take</span>
                    </div>
                  </div>
                  <p className="font-display text-base font-bold text-ink italic leading-snug">&ldquo;{ht.content}&rdquo;</p>
                </div>

                {/* Vote + comment bar */}
                <div className="border-t border-rule/50 px-4 py-2.5 flex items-center gap-2 bg-paper-dark">
                  <button
                    onClick={() => voteHotTake(ht.id, '🔥')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm transition-all btn-3d ${
                      myFire ? 'bg-fire text-white' : 'bg-paper border border-rule text-ink-muted hover:border-fire hover:text-fire'
                    }`}
                  >
                    <Flame size={14} />
                    {fireCount > 0 && <span className="text-xs">{fireCount}</span>}
                  </button>
                  <button
                    onClick={() => voteHotTake(ht.id, '❄️')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm transition-all btn-3d ${
                      myIce ? 'bg-ice text-white' : 'bg-paper border border-rule text-ink-muted hover:border-ice hover:text-ice'
                    }`}
                  >
                    <Snowflake size={14} />
                    {iceCount > 0 && <span className="text-xs">{iceCount}</span>}
                  </button>
                  {hotPct !== null && (
                    <span className="text-[10px] font-bold font-mono text-ink-faint">{hotPct}% hot</span>
                  )}
                  <button
                    onClick={() => { setShowCommentsFor(showingComments ? null : ht.id); setCommentText(''); setMentionQuery(''); }}
                    className="ml-auto flex items-center gap-1 text-[10px] font-bold text-ink-muted hover:text-ink transition-colors"
                  >
                    <MessageCircle size={13} />
                    {comments.length > 0 ? comments.length : 'Reply'}
                    {showingComments ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </button>
                </div>

                {/* Comments section */}
                {showingComments && (
                  <div className="border-t border-rule/30 bg-paper-dark px-4 py-3 flex flex-col gap-3">
                    {comments.map((c) => {
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
                            <p className="text-xs text-ink leading-relaxed">{renderMentions(c.content)}</p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Comment input */}
                    <div className="relative">
                      {mentionQuery && mentionMatches.length > 0 && (
                        <div className="absolute bottom-full left-0 mb-1 bg-paper border border-rule shadow-xl rounded-xl overflow-hidden z-10 w-48">
                          {mentionMatches.map((u) => (
                            <button
                              key={u.id}
                              onClick={() => insertMention(u.username)}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-paper-dark transition-colors text-left"
                            >
                              <span className="text-base">{u.avatar}</span>
                              <div>
                                <p className="text-xs font-bold text-ink">{u.displayName}</p>
                                <p className="text-[10px] text-ink-faint">@{u.username}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-paper border border-rule text-sm shrink-0">
                          {ME.avatar}
                        </div>
                        <input
                          ref={commentInputRef}
                          value={commentText}
                          onChange={(e) => handleCommentInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addComment(ht.id)}
                          placeholder="Reply… (@ to mention)"
                          className="flex-1 bg-paper border border-rule px-3 py-1.5 text-xs text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors rounded-full"
                        />
                        <button
                          onClick={() => addComment(ht.id)}
                          disabled={!commentText.trim()}
                          className="flex h-7 w-7 items-center justify-center bg-ink text-paper rounded-full hover:bg-ink/80 disabled:opacity-40 transition-colors shrink-0"
                        >
                          <Send size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          if (entry.type === 'debate') {
            const d = entry.d;
            const side1Users = d.side1UserIds.map((uid) => getUserById(uid)).filter(Boolean);
            const side2Users = d.side2UserIds.map((uid) => getUserById(uid)).filter(Boolean);
            const total = d.votes.length;
            const side1Pct = total > 0 ? Math.round((d.votes.filter((v) => v.choice === 'side1').length / total) * 100) : 0;
            const side2Pct = total > 0 ? Math.round((d.votes.filter((v) => v.choice === 'side2').length / total) * 100) : 0;
            return (
              <div key={d.id} className="border border-rule overflow-hidden">
                <div className="border-l-4 border-navy px-4 pt-4 pb-3 bg-paper">
                  <div className="flex items-center gap-2 mb-2">
                    <Swords size={12} className="text-navy" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-navy">Debate</span>
                    <span className="text-[10px] text-ink-faint font-mono ml-auto">
                      {total} votes · {timeAgo(d.createdAt)}
                    </span>
                  </div>
                  <p className="font-display text-base font-bold text-ink italic leading-snug mb-3">&ldquo;{d.claim}&rdquo;</p>
                  <div className="flex items-center gap-2 text-xs flex-wrap mb-3">
                    <span className="text-[10px] font-bold uppercase text-navy">{d.side1Label ?? 'Side 1'}:</span>
                    {side1Users.slice(0, 2).map((u) => (
                      <Link key={u!.id} href={`/users/${u!.id}`} className="flex items-center gap-1 bg-paper-dark border border-rule px-2 py-0.5 text-ink-muted hover:border-ink">
                        <span>{u!.avatar}</span><span>{u!.displayName.split(' ')[0]}</span>
                      </Link>
                    ))}
                    <span className="text-ink-faint font-bold mx-0.5">vs</span>
                    <span className="text-[10px] font-bold uppercase text-field">{d.side2Label ?? 'Side 2'}:</span>
                    {side2Users.slice(0, 2).map((u) => (
                      <Link key={u!.id} href={`/users/${u!.id}`} className="flex items-center gap-1 bg-paper-dark border border-rule px-2 py-0.5 text-ink-muted hover:border-ink">
                        <span>{u!.avatar}</span><span>{u!.displayName.split(' ')[0]}</span>
                      </Link>
                    ))}
                  </div>
                  {total > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-navy w-8 font-mono">{side1Pct}%</span>
                      <div className="flex-1 h-1.5 bg-paper-dark border border-rule/50 overflow-hidden flex">
                        <div className="h-full bg-navy" style={{ width: `${side1Pct}%` }} />
                        <div className="h-full bg-field" style={{ width: `${side2Pct}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-field w-8 font-mono text-right">{side2Pct}%</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-rule/50 px-4 py-2 bg-paper-dark flex items-center">
                  <Link href={`/neighborhoods/${d.chatId}`} className="text-[10px] text-ink-faint font-mono">
                    {d.chatName}
                  </Link>
                  <Link href={`/debates/${d.id}`} className="ml-auto text-[10px] font-bold uppercase tracking-wider text-masthead hover:underline">
                    Face-Off →
                  </Link>
                </div>
              </div>
            );
          }

          // Bet card
          const b = entry.b;
          const side1Users = (b.side1Ids ?? []).map((id) => getUserById(id)).filter(Boolean);
          const side2Users = (b.side2Ids ?? []).map((id) => getUserById(id)).filter(Boolean);
          const participants = b.participantIds.map((pid) => getUserById(pid)).filter(Boolean);
          const winner = b.winnerId ? getUserById(b.winnerId) : null;
          const statusColor = { pending: 'text-ink-faint', active: 'text-field', 'awaiting-resolution': 'text-rule-dark', resolved: 'text-ink-faint', disputed: 'text-masthead' }[b.status];
          return (
            <div key={b.id} className="border border-rule overflow-hidden">
              <div className="border-l-4 border-field px-4 pt-4 pb-3 bg-paper">
                <div className="flex items-center gap-2 mb-2">
                  <Handshake size={12} className="text-field" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-field">Bet</span>
                  <span className={`ml-auto text-[10px] font-bold uppercase tracking-wide ${statusColor}`}>{b.status}</span>
                </div>
                <p className="font-display text-base font-bold text-ink italic leading-snug mb-3">&ldquo;{b.claim}&rdquo;</p>
                {b.side1Ids && b.side2Ids ? (
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex-1">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-navy mb-1">{b.side1Label ?? 'Side 1'}</p>
                      <div className="flex flex-wrap gap-1">
                        {side1Users.map((u) => (
                          <Link key={u!.id} href={`/users/${u!.id}`} className="flex items-center gap-1 border border-rule px-2 py-0.5 text-xs text-ink-muted hover:border-ink bg-paper-dark">
                            <span>{u!.avatar}</span><span>{u!.displayName.split(' ')[0]}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                    <span className="text-ink-faint font-bold text-xs mt-4">vs</span>
                    <div className="flex-1">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-field mb-1 text-right">{b.side2Label ?? 'Side 2'}</p>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {side2Users.map((u) => (
                          <Link key={u!.id} href={`/users/${u!.id}`} className="flex items-center gap-1 border border-rule px-2 py-0.5 text-xs text-ink-muted hover:border-ink bg-paper-dark">
                            <span>{u!.avatar}</span><span>{u!.displayName.split(' ')[0]}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 flex-wrap mb-2">
                    {participants.map((p, i) => (
                      <span key={p!.id} className="flex items-center gap-1">
                        {i > 0 && <span className="text-ink-faint text-xs">🤝</span>}
                        <Link href={`/users/${p!.id}`} className="flex items-center gap-1 border border-rule px-2 py-0.5 text-xs text-ink-muted hover:border-ink bg-paper-dark">
                          <span>{p!.avatar}</span><span>{p!.displayName.split(' ')[0]}</span>
                        </Link>
                      </span>
                    ))}
                  </div>
                )}
                {b.stakes && (
                  <p className="text-[10px] text-ink-muted italic border-t border-rule/40 pt-2 mt-1">
                    Stakes: <span className="font-bold text-ink">{b.stakes}</span>
                  </p>
                )}
                {b.status === 'resolved' && (
                  <div className="flex items-center gap-1.5 mt-2 border-t border-rule/40 pt-2">
                    <Trophy size={11} className="text-rule-dark" />
                    <span className="text-[11px] font-bold text-ink">{b.isPush ? 'Push' : `${winner?.displayName} won`}</span>
                  </div>
                )}
              </div>
              <div className="border-t border-rule/50 px-4 py-2 bg-paper-dark flex items-center">
                <Link href={`/neighborhoods/${b.chatId}`} className="text-[10px] text-ink-faint font-mono">{b.chatName}</Link>
                <span className="ml-auto text-[10px] text-ink-faint font-mono">{timeAgo(b.createdAt)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Add Post Modal ──────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-md bg-paper border-t-2 border-ink">
            <div className="flex items-center justify-between px-5 py-4 bg-ink sticky top-0">
              <div className="flex items-center gap-2">
                <Megaphone size={14} className="text-paper" />
                <p className="font-display font-bold text-paper text-base">Post to The Streets</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-paper/60 hover:text-paper"><X size={18} /></button>
            </div>

            <div className="px-5 py-5 flex flex-col gap-4">
              {/* Type selector */}
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: 'take', emoji: '🔥', label: 'Hot Take' },
                  { id: 'debate', emoji: '⚔️', label: 'Debate' },
                  { id: 'bet', emoji: '🤝', label: 'Bet' },
                ] as { id: PostType; emoji: string; label: string }[]).map(({ id, emoji, label }) => (
                  <button
                    key={id}
                    onClick={() => setPostType(id)}
                    className={`flex flex-col items-center gap-1 py-3 border-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                      postType === id ? 'border-ink bg-ink text-paper' : 'border-rule text-ink-muted hover:border-ink-muted'
                    }`}
                  >
                    <span className="text-xl">{emoji}</span>{label}
                  </button>
                ))}
              </div>

              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder={
                  postType === 'take' ? 'Drop your hot take…'
                  : postType === 'debate' ? 'State the claim to debate…'
                  : 'What\'s the bet?'
                }
                rows={3}
                className="w-full border border-rule bg-paper-dark px-4 py-3 text-sm text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors resize-none rounded-lg"
              />
            </div>

            <div className="sticky bottom-0 border-t-2 border-rule bg-paper px-5 py-4 flex gap-3">
              <button onClick={() => setShowAddModal(false)} className="border border-rule px-5 py-3 text-xs font-bold uppercase tracking-wider text-ink-muted hover:bg-paper-dark transition-colors rounded-full">
                Cancel
              </button>
              <button
                onClick={submitPost}
                disabled={!postText.trim()}
                className="flex-1 bg-press text-paper py-3 text-xs font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed rounded-full btn-3d hover:bg-press/80 transition-colors"
              >
                Post to The Streets
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bet setup modal */}
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
