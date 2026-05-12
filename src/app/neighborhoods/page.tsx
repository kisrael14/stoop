'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Users, Flame, Swords, Handshake } from 'lucide-react';
import { CHATS, DEBATES, BETS, HOT_TAKES, getUserById } from '@/lib/mock-data';
import { timeAgo } from '@/lib/utils';

export default function NeighborhoodsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = CHATS.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col bg-paper min-h-full">
      {/* Masthead */}
      <div className="sticky top-0 z-10 bg-paper/97 backdrop-blur-sm px-5 pt-10 pb-4 border-b-2 border-ink">
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-display text-2xl font-bold text-ink">My Neighborhoods</h1>
          <button className="flex items-center gap-1.5 bg-ink px-4 py-2 text-xs font-bold text-paper uppercase tracking-wider hover:bg-ink/80 transition-colors">
            <Plus size={14} />
            New
          </button>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint mb-3">Your Group Chats</p>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search neighborhoods..."
            className="w-full border border-rule bg-paper-dark py-2.5 pl-9 pr-4 text-sm text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors rounded-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-0 py-4 px-0">
        {filtered.map((chat, index) => {
          const lastMessage = chat.messages[chat.messages.length - 1];
          const lastSender = lastMessage ? getUserById(lastMessage.userId) : null;
          const members = chat.memberIds.map((id) => getUserById(id)).filter(Boolean);
          const activeDebates = DEBATES.filter((d) => d.chatId === chat.id && d.status === 'active').length;
          const activeBets = BETS.filter((b) => b.chatId === chat.id && b.status !== 'resolved').length;
          const recentTakes = HOT_TAKES.filter((h) => h.chatId === chat.id).length;

          return (
            <Link
              key={chat.id}
              href={`/neighborhoods/${chat.id}`}
              className={`block bg-paper hover:bg-paper-dark transition-colors border-b border-rule ${index === 0 ? 'border-t border-rule' : ''}`}
            >
              {/* Header */}
              <div className="flex items-start gap-4 px-5 pt-4 pb-3">
                <div className="flex h-14 w-14 items-center justify-center bg-ink text-2xl shrink-0 rounded-sm">
                  <span>{chat.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-display font-bold text-ink text-lg leading-tight">{chat.name}</p>
                    {lastMessage && (
                      <span className="text-[10px] text-ink-faint shrink-0 font-mono">{timeAgo(lastMessage.timestamp)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Users size={10} className="text-ink-faint" />
                    <p className="text-[11px] text-ink-faint uppercase tracking-wide font-semibold">{members.length} members</p>
                  </div>
                </div>
              </div>

              {/* Member avatars */}
              <div className="flex items-center gap-1.5 px-5 pb-3">
                {members.slice(0, 5).map((m) => (
                  <div
                    key={m!.id}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-paper-dark border border-rule text-sm"
                    title={m!.displayName}
                  >
                    {m!.avatar}
                  </div>
                ))}
                {members.length > 5 && (
                  <span className="text-[10px] text-ink-faint ml-1">+{members.length - 5}</span>
                )}
              </div>

              {/* Last message preview */}
              {lastMessage && (
                <div className="px-5 pb-3 flex items-center gap-1.5">
                  {lastMessage.tag && (
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 border ${
                      lastMessage.tag === 'hot-take' ? 'border-press/40 text-press bg-press/10' :
                      lastMessage.tag === 'debate' ? 'border-navy/40 text-navy bg-navy/10' :
                      'border-field/40 text-field bg-field/10'
                    }`}>
                      {lastMessage.tag === 'hot-take' ? '🔥 Take' : lastMessage.tag === 'debate' ? '⚔️ Debate' : '🤝 Bet'}
                    </span>
                  )}
                  <p className="text-sm text-ink-muted truncate">
                    <span className="text-ink font-semibold">
                      {lastSender?.id === 'me' ? 'You' : lastSender?.displayName?.split(' ')[0]}:
                    </span>{' '}
                    {lastMessage.content}
                  </p>
                </div>
              )}

              {/* Activity stats bar */}
              <div className="border-t border-rule/50 px-5 py-2.5 flex items-center gap-4 bg-paper-dark">
                <Link
                  href={`/neighborhoods/${chat.id}?tab=debates`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-[11px] font-semibold text-navy hover:underline transition-colors"
                >
                  <Swords size={11} />
                  <span>{activeDebates} debate{activeDebates !== 1 ? 's' : ''}</span>
                </Link>
                <Link
                  href={`/neighborhoods/${chat.id}?tab=bets`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-[11px] font-semibold text-field hover:underline transition-colors"
                >
                  <Handshake size={11} />
                  <span>{activeBets} bet{activeBets !== 1 ? 's' : ''}</span>
                </Link>
                <Link
                  href={`/neighborhoods/${chat.id}?tab=hot-takes`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-[11px] font-semibold text-press hover:underline transition-colors"
                >
                  <Flame size={11} />
                  <span>{recentTakes} take{recentTakes !== 1 ? 's' : ''}</span>
                </Link>
                <Link
                  href={`/neighborhoods/${chat.id}?tab=chat`}
                  onClick={(e) => e.stopPropagation()}
                  className="ml-auto text-[11px] font-bold uppercase tracking-wider text-masthead hover:underline transition-colors"
                >
                  Open Chat →
                </Link>
              </div>
            </Link>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-5">
            <p className="font-display text-4xl mb-3 text-ink-faint">🏘️</p>
            <p className="font-display font-bold text-ink text-lg mb-1">No neighborhoods yet</p>
            <p className="text-sm text-ink-muted italic">Create one or get added by a friend</p>
          </div>
        )}
      </div>
    </div>
  );
}
