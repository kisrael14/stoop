'use client';

import { useState } from 'react';
import { Flame, TrendingUp, Trophy, ArrowUp } from 'lucide-react';
import { HOT_TAKES, getUserById, ME } from '@/lib/mock-data';
import { timeAgo, totalReactions } from '@/lib/utils';
import type { HotTake } from '@/lib/types';

type Tab = 'active' | 'stats';
type SortMode = 'recent' | 'reactions';

const REACT_OPTIONS = ['🔥', '💯', '🧢', '😂', '👀', '🤡'];

export default function HotTakesPage() {
  const [tab, setTab] = useState<Tab>('active');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [hotTakes, setHotTakes] = useState(HOT_TAKES);

  const sorted = [...hotTakes].sort((a, b) => {
    if (sortMode === 'reactions') {
      return totalReactions(b.reactions) - totalReactions(a.reactions);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const addReaction = (htId: string, emoji: string) => {
    setHotTakes((prev) =>
      prev.map((ht) => {
        if (ht.id !== htId) return ht;
        const existing = ht.reactions.find((r) => r.emoji === emoji);
        if (existing) {
          return {
            ...ht,
            reactions: existing.userIds.includes('me')
              ? ht.reactions
                  .map((r) =>
                    r.emoji === emoji
                      ? { ...r, userIds: r.userIds.filter((id) => id !== 'me') }
                      : r
                  )
                  .filter((r) => r.userIds.length > 0)
              : ht.reactions.map((r) =>
                  r.emoji === emoji ? { ...r, userIds: [...r.userIds, 'me'] } : r
                ),
          };
        }
        return { ...ht, reactions: [...ht.reactions, { emoji, userIds: ['me'] }] };
      })
    );
  };

  const boost = (htId: string) => {
    const original = hotTakes.find((ht) => ht.id === htId);
    if (!original) return;
    const boosted: HotTake = {
      ...original,
      id: `boost-${Date.now()}`,
      authorId: 'me',
      chatName: 'My Stoop',
      reactions: [],
      createdAt: new Date().toISOString(),
      content: `🔄 Boost: "${original.content}"`,
    };
    setHotTakes((prev) => [boosted, ...prev]);
  };

  const myTakes = hotTakes.filter((ht) => ht.authorId === 'me');
  const myTotalReactions = myTakes.reduce((sum, ht) => sum + totalReactions(ht.reactions), 0);
  const topTake = [...myTakes].sort((a, b) => totalReactions(b.reactions) - totalReactions(a.reactions))[0];
  const stats = ME.stats;

  return (
    <div className="flex flex-col bg-slate-950 min-h-full">
      {/* Header */}
      <div className="px-5 pt-10 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <Flame size={22} className="text-orange-400" />
          <h1 className="text-2xl font-bold text-white">Hot Takes</h1>
        </div>
        <div className="flex gap-1 bg-slate-900 rounded-xl p-1">
          {(['active', 'stats'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                tab === t ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'active' ? 'Active' : 'My Stats'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'active' && (
        <div className="px-5 py-4 pb-8">
          {/* Sort toggle */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-slate-500">Sort by:</span>
            {(['recent', 'reactions'] as SortMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setSortMode(mode)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  sortMode === mode
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {mode === 'recent' ? 'Recent' : '🔥 Reactions'}
              </button>
            ))}
          </div>

          {/* Hot takes feed */}
          <div className="flex flex-col gap-4">
            {sorted.map((ht) => (
              <HotTakeCard
                key={ht.id}
                hotTake={ht}
                onReact={addReaction}
                onBoost={boost}
              />
            ))}
          </div>

          {sorted.length === 0 && (
            <div className="text-center py-16">
              <p className="text-3xl mb-2">🔥</p>
              <p className="text-slate-400">No hot takes yet. Drop one in a chat.</p>
            </div>
          )}
        </div>
      )}

      {tab === 'stats' && (
        <div className="px-5 py-5 flex flex-col gap-4 pb-8">
          {/* Overall stats */}
          <div className="rounded-2xl border border-orange-900/40 bg-orange-950/20 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Flame size={18} className="text-orange-400" />
              <p className="font-semibold text-white">Hot Take Stats</p>
            </div>
            <div className="flex justify-around text-center">
              <div>
                <p className="text-3xl font-bold text-orange-400">{stats.hotTakesPosted}</p>
                <p className="text-xs text-slate-400 mt-1">Takes Posted</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-400">{stats.hotTakeReactions}</p>
                <p className="text-xs text-slate-400 mt-1">Reactions</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-400">
                  {stats.hotTakesPosted > 0
                    ? Math.round(stats.hotTakeReactions / stats.hotTakesPosted)
                    : 0}
                </p>
                <p className="text-xs text-slate-400 mt-1">Avg / Take</p>
              </div>
            </div>
          </div>

          {/* All-time top take */}
          {topTake && (
            <div className="rounded-2xl border border-yellow-900/40 bg-yellow-950/20 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={16} className="text-yellow-400" />
                <p className="text-sm font-semibold text-yellow-300">Your Biggest Take</p>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">&ldquo;{topTake.content}&rdquo;</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {topTake.reactions.map((r) => (
                  <span
                    key={r.emoji}
                    className="flex items-center gap-0.5 rounded-full bg-slate-800 px-2 py-0.5 text-xs"
                  >
                    {r.emoji} {r.userIds.length}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* My takes list */}
          <div className="flex items-center gap-2 mt-1">
            <TrendingUp size={16} className="text-slate-400" />
            <p className="text-sm font-semibold text-slate-300">Your Hot Takes</p>
          </div>
          {myTakes.map((ht) => (
            <div
              key={ht.id}
              className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3"
            >
              <p className="text-sm text-slate-200 line-clamp-2">{ht.content}</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex gap-1 flex-wrap">
                  {ht.reactions.map((r) => (
                    <span key={r.emoji} className="text-xs text-slate-500">
                      {r.emoji}{r.userIds.length}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-600">{timeAgo(ht.createdAt)}</p>
              </div>
            </div>
          ))}

          {myTakes.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-6">
              No hot takes yet. Go drop one in a chat.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function HotTakeCard({
  hotTake,
  onReact,
  onBoost,
}: {
  hotTake: HotTake;
  onReact: (id: string, emoji: string) => void;
  onBoost: (id: string) => void;
}) {
  const author = getUserById(hotTake.authorId);
  const isMe = hotTake.authorId === 'me';
  const total = totalReactions(hotTake.reactions);

  return (
    <div className="rounded-2xl border border-orange-900/30 bg-orange-950/10 overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        {/* Author + chat source */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-base">
            {isMe ? ME.avatar : author?.avatar}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {isMe ? 'You' : author?.displayName}
            </p>
            <p className="text-xs text-slate-500">{hotTake.chatName} · {timeAgo(hotTake.createdAt)}</p>
          </div>
          <div className="ml-auto flex items-center gap-1 text-orange-400">
            <Flame size={14} />
            {total > 0 && <span className="text-xs font-bold">{total}</span>}
          </div>
        </div>

        {/* Content */}
        <p className="text-base font-medium text-white leading-snug">
          &ldquo;{hotTake.content}&rdquo;
        </p>
      </div>

      {/* Reactions row */}
      <div className="border-t border-orange-900/20 px-4 py-2.5 flex items-center gap-1.5 flex-wrap">
        {REACT_OPTIONS.map((emoji) => {
          const existing = hotTake.reactions.find((r) => r.emoji === emoji);
          const count = existing?.userIds.length ?? 0;
          const reacted = existing?.userIds.includes('me') ?? false;

          return (
            <button
              key={emoji}
              onClick={() => onReact(hotTake.id, emoji)}
              className={`flex items-center gap-0.5 rounded-full px-2.5 py-1 text-sm transition-all ${
                reacted
                  ? 'bg-orange-900/60 border border-orange-500/50 scale-105'
                  : 'bg-slate-800 border border-slate-700 hover:border-slate-600'
              }`}
            >
              {emoji}
              {count > 0 && (
                <span className={`text-xs font-medium ml-0.5 ${reacted ? 'text-orange-300' : 'text-slate-400'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}

        {!isMe && (
          <button
            onClick={() => onBoost(hotTake.id)}
            className="ml-auto flex items-center gap-1 rounded-full border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-400 hover:border-orange-500/50 hover:text-orange-400 transition-colors"
          >
            <ArrowUp size={12} />
            Boost
          </button>
        )}
      </div>
    </div>
  );
}
