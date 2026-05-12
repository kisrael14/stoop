'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Swords, Handshake, Flame } from 'lucide-react';
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
      <div className="bg-ink px-5 pt-10 pb-5">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-paper/40 mb-1">Stoop Sports</p>
        <h1 className="font-display text-3xl font-black text-paper leading-none">My Neighborhoods</h1>
        <div className="h-px bg-paper/20 my-3" />
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-paper/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search neighborhoods..."
              className="w-full bg-paper/10 border border-paper/20 py-2 pl-9 pr-4 text-sm text-paper placeholder-paper/40 outline-none focus:border-paper/50 transition-colors rounded-full"
            />
          </div>
          <button className="flex items-center gap-1.5 bg-paper text-ink px-4 py-2 text-xs font-bold uppercase tracking-wider btn-3d rounded-full shrink-0">
            <Plus size={14} />
            New
          </button>
        </div>
      </div>

      {/* Section divider */}
      <div className="section-header px-5 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-ink">Active Chats</span>
        <span className="text-[10px] text-ink-faint font-mono">{filtered.length} neighborhood{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Newspaper grid */}
      <div className="grid grid-cols-2 border-l-2 border-t-2 border-ink">
        {filtered.map((chat) => {
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
              className="border-r-2 border-b-2 border-ink block bg-paper hover:bg-paper-dark transition-colors"
            >
              {/* Card header — dark ink */}
              <div className="bg-ink px-3 py-3">
                <div className="flex items-start gap-2">
                  <span className="text-2xl leading-none mt-0.5 shrink-0">{chat.emoji}</span>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-paper text-sm leading-tight">{chat.name}</p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-paper/50 mt-0.5">{members.length} members</p>
                  </div>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 border-b border-rule/60 divide-x divide-rule/60">
                <Link
                  href={`/neighborhoods/${chat.id}?tab=debates`}
                  onClick={(e) => e.stopPropagation()}
                  className="py-2.5 text-center hover:bg-paper-deeper transition-colors"
                >
                  <p className="text-base font-bold text-navy font-mono">{activeDebates}</p>
                  <p className="text-[8px] font-bold uppercase tracking-wide text-ink-faint">Debates</p>
                </Link>
                <Link
                  href={`/neighborhoods/${chat.id}?tab=bets`}
                  onClick={(e) => e.stopPropagation()}
                  className="py-2.5 text-center hover:bg-paper-deeper transition-colors"
                >
                  <p className="text-base font-bold text-field font-mono">{activeBets}</p>
                  <p className="text-[8px] font-bold uppercase tracking-wide text-ink-faint">Bets</p>
                </Link>
                <Link
                  href={`/neighborhoods/${chat.id}?tab=hot-takes`}
                  onClick={(e) => e.stopPropagation()}
                  className="py-2.5 text-center hover:bg-paper-deeper transition-colors"
                >
                  <p className="text-base font-bold text-press font-mono">{recentTakes}</p>
                  <p className="text-[8px] font-bold uppercase tracking-wide text-ink-faint">Takes</p>
                </Link>
              </div>

              {/* Last message preview */}
              <div className="px-3 py-2.5 min-h-[52px]">
                {lastMessage ? (
                  <>
                    {lastMessage.tag && (
                      <span className={`inline-flex items-center gap-0.5 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 mb-1 ${
                        lastMessage.tag === 'hot-take' ? 'bg-press/15 text-press'
                        : lastMessage.tag === 'debate' ? 'bg-navy/15 text-navy'
                        : 'bg-field/15 text-field'
                      }`}>
                        {lastMessage.tag === 'hot-take' ? '🔥' : lastMessage.tag === 'debate' ? '⚔️' : '🤝'}
                        {' '}{lastMessage.tag === 'hot-take' ? 'Take' : lastMessage.tag === 'debate' ? 'Debate' : 'Bet'}
                      </span>
                    )}
                    <p className="text-[10px] text-ink-muted leading-tight line-clamp-2">
                      <span className="font-bold text-ink">
                        {lastSender?.id === 'me' ? 'You' : lastSender?.displayName?.split(' ')[0]}:
                      </span>{' '}
                      {lastMessage.content}
                    </p>
                    <p className="text-[9px] text-ink-faint font-mono mt-1">{timeAgo(lastMessage.timestamp)}</p>
                  </>
                ) : (
                  <p className="text-[10px] text-ink-faint italic">No messages yet</p>
                )}
              </div>

              {/* Open chat CTA */}
              <div className="border-t border-rule/60 px-3 py-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-masthead">
                  Open Chat →
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center px-5">
          <p className="font-display text-4xl mb-3 text-ink-faint">🏘️</p>
          <p className="font-display font-bold text-ink text-lg mb-1">No neighborhoods yet</p>
          <p className="text-sm text-ink-muted italic">Create one or get added by a friend</p>
        </div>
      )}

      {/* Activity feed footer */}
      {filtered.length > 0 && (
        <div className="section-header px-5 mt-0 flex items-center gap-2">
          <Swords size={10} className="text-navy" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink-faint">
            {DEBATES.filter((d) => d.status === 'active').length} live debates
          </span>
          <span className="text-rule mx-1">·</span>
          <Handshake size={10} className="text-field" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink-faint">
            {BETS.filter((b) => b.status !== 'resolved').length} open bets
          </span>
          <span className="text-rule mx-1">·</span>
          <Flame size={10} className="text-press" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink-faint">
            {HOT_TAKES.length} takes
          </span>
        </div>
      )}
    </div>
  );
}
