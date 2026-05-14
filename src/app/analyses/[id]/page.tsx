'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, PenLine, Send } from 'lucide-react';
import { getAnalysisById, getUserById, ME } from '@/lib/mock-data';
import { timeAgo, totalReactions } from '@/lib/utils';
import type { HotTakeComment } from '@/lib/types';

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const analysis = getAnalysisById(id);

  const [comments, setComments] = useState<HotTakeComment[]>(analysis?.comments ?? []);
  const [commentText, setCommentText] = useState('');
  const [reactions, setReactions] = useState(analysis?.reactions ?? []);

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-ink-faint">
        <p className="font-display text-3xl mb-2">📊</p>
        <p className="font-bold text-ink">Analysis not found</p>
      </div>
    );
  }

  const author = getUserById(analysis.authorId);
  const isMe = analysis.authorId === 'me';

  const submitComment = () => {
    const text = commentText.trim();
    if (!text) return;
    const newComment: HotTakeComment = {
      id: `c-${Date.now()}`,
      userId: 'me',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setComments((prev) => [...prev, newComment]);
    setCommentText('');
  };

  const toggleReaction = (emoji: string) => {
    setReactions((prev) => {
      const existing = prev.find((r) => r.emoji === emoji);
      if (existing) {
        const hasMe = existing.userIds.includes('me');
        const updated = hasMe
          ? existing.userIds.filter((u) => u !== 'me')
          : [...existing.userIds, 'me'];
        if (updated.length === 0) return prev.filter((r) => r.emoji !== emoji);
        return prev.map((r) => r.emoji === emoji ? { ...r, userIds: updated } : r);
      }
      return [...prev, { emoji, userIds: ['me'] }];
    });
  };

  const REACTION_OPTIONS = ['💯', '🔥', '🧠', '👀', '🤔'];

  return (
    <div className="flex flex-col bg-paper min-h-full">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b-2 border-ink bg-ink">
        <button onClick={() => router.back()} className="text-paper/60 hover:text-paper p-1">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-1.5">
          <PenLine size={13} className="text-paper/60" />
          <p className="font-bold text-paper text-sm">Analysis</p>
        </div>
        <Link
          href={`/neighborhoods/${analysis.chatId}?tab=analysts`}
          className="ml-auto text-[10px] font-bold uppercase tracking-widest text-press hover:text-press/80"
        >
          {analysis.chatName} →
        </Link>
      </div>

      {/* Article */}
      <article className="px-5 pt-6 pb-4 border-b border-rule">
        {/* Author */}
        <div className="flex items-center gap-3 mb-4">
          <Link href={`/users/${analysis.authorId}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-dark border border-rule text-xl hover:border-ink transition-all shrink-0">
            {isMe ? ME.avatar : author?.avatar}
          </Link>
          <div>
            <Link href={`/users/${analysis.authorId}`} className="text-sm font-bold text-ink hover:text-masthead transition-colors">
              {isMe ? ME.displayName : author?.displayName}
            </Link>
            <p className="text-[10px] text-ink-faint font-mono">{timeAgo(analysis.createdAt)}</p>
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display text-xl font-black text-ink leading-snug mb-4">{analysis.title}</h1>

        {/* Body */}
        <p className="text-sm text-ink leading-relaxed">{analysis.content}</p>
      </article>

      {/* Reactions */}
      <div className="px-5 py-3 border-b border-rule flex items-center gap-2 flex-wrap">
        {reactions.map((r) => (
          <button
            key={r.emoji}
            onClick={() => toggleReaction(r.emoji)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${
              r.userIds.includes('me')
                ? 'bg-ink text-paper border-ink'
                : 'bg-paper-dark text-ink border-rule hover:border-ink'
            }`}
          >
            {r.emoji} {r.userIds.length}
          </button>
        ))}
        {REACTION_OPTIONS.filter((e) => !reactions.find((r) => r.emoji === e)).map((emoji) => (
          <button
            key={emoji}
            onClick={() => toggleReaction(emoji)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border border-dashed border-rule text-ink-faint hover:border-ink hover:text-ink transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Comments */}
      <div className="flex flex-col flex-1 px-5 py-4 gap-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
          Discussion · {comments.length}
        </p>

        {comments.length === 0 && (
          <p className="text-sm text-ink-faint italic">No comments yet. Start the discussion.</p>
        )}

        {comments.map((c) => {
          const commenter = getUserById(c.userId);
          const isMeComment = c.userId === 'me';
          return (
            <div key={c.id} className="flex gap-3">
              <Link href={`/users/${c.userId}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-dark border border-rule text-base shrink-0 hover:border-ink transition-all">
                {isMeComment ? ME.avatar : commenter?.avatar}
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <Link href={`/users/${c.userId}`} className="text-xs font-bold text-ink hover:text-masthead transition-colors">
                    {isMeComment ? ME.displayName : commenter?.displayName}
                  </Link>
                  <span className="text-[9px] text-ink-faint font-mono">{timeAgo(c.timestamp)}</span>
                </div>
                <p className="text-sm text-ink-muted leading-relaxed mt-0.5">{c.content}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comment input */}
      <div className="sticky bottom-0 border-t-2 border-ink bg-paper px-4 py-3 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-dark border border-rule text-base shrink-0">
          {ME.avatar}
        </div>
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitComment()}
          placeholder="Add to the discussion…"
          className="flex-1 bg-paper-dark border border-rule px-3 py-2 text-sm text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors rounded-full"
        />
        <button
          onClick={submitComment}
          disabled={!commentText.trim()}
          className="shrink-0 flex items-center justify-center h-9 w-9 bg-ink text-paper rounded-full hover:bg-ink/80 disabled:opacity-40 transition-colors"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
