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
    <div className="flex flex-col bg-slate-950 min-h-full">
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm px-5 pt-10 pb-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">My Neighborhoods</h1>
          <button className="flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors">
            <Plus size={16} />
            New
          </button>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search neighborhoods..."
            className="w-full rounded-full border border-slate-700 bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-slate-600 transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 px-5 py-5">
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
              className="block rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden hover:border-slate-700 transition-colors"
            >
              {/* Header */}
              <div className="flex items-center gap-4 px-4 pt-4 pb-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-2xl shrink-0">
                  {chat.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-base">{chat.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Users size={11} className="text-slate-500" />
                    <p className="text-xs text-slate-500">{members.length} members</p>
                  </div>
                </div>
                {lastMessage && (
                  <span className="text-xs text-slate-600 shrink-0">{timeAgo(lastMessage.timestamp)}</span>
                )}
              </div>

              {/* Member avatars */}
              <div className="flex items-center gap-1.5 px-4 pb-3">
                {members.slice(0, 5).map((m) => (
                  <div
                    key={m!.id}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-700 text-sm ring-2 ring-slate-900"
                    title={m!.displayName}
                  >
                    {m!.avatar}
                  </div>
                ))}
                {members.length > 5 && (
                  <span className="text-xs text-slate-500 ml-1">+{members.length - 5}</span>
                )}
              </div>

              {/* Last message preview */}
              {lastMessage && (
                <div className="px-4 pb-3 flex items-center gap-1.5">
                  {lastMessage.tag && (
                    <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${
                      lastMessage.tag === 'hot-take' ? 'bg-orange-900/60 text-orange-400' :
                      lastMessage.tag === 'debate' ? 'bg-blue-900/60 text-blue-400' :
                      'bg-green-900/60 text-green-400'
                    }`}>
                      {lastMessage.tag === 'hot-take' ? '🔥' : lastMessage.tag === 'debate' ? '⚔️' : '🤝'}
                    </span>
                  )}
                  <p className="text-sm text-slate-400 truncate">
                    <span className="text-slate-300 font-medium">
                      {lastSender?.id === 'me' ? 'You' : lastSender?.displayName?.split(' ')[0]}:
                    </span>{' '}
                    {lastMessage.content}
                  </p>
                </div>
              )}

              {/* Activity stats bar */}
              <div className="border-t border-slate-800 px-4 py-2.5 flex items-center gap-4">
                <Link
                  href={`/neighborhoods/${chat.id}?tab=debates`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-400 transition-colors"
                >
                  <Swords size={12} className="text-blue-500/60" />
                  <span>{activeDebates} debate{activeDebates !== 1 ? 's' : ''}</span>
                </Link>
                <Link
                  href={`/neighborhoods/${chat.id}?tab=bets`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-green-400 transition-colors"
                >
                  <Handshake size={12} className="text-green-500/60" />
                  <span>{activeBets} bet{activeBets !== 1 ? 's' : ''}</span>
                </Link>
                <Link
                  href={`/neighborhoods/${chat.id}?tab=hot-takes`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-orange-400 transition-colors"
                >
                  <Flame size={12} className="text-orange-500/60" />
                  <span>{recentTakes} hot take{recentTakes !== 1 ? 's' : ''}</span>
                </Link>
                <Link
                  href={`/neighborhoods/${chat.id}?tab=chat`}
                  onClick={(e) => e.stopPropagation()}
                  className="ml-auto text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
                >
                  Open Chat →
                </Link>
              </div>
            </Link>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-4xl mb-3">🏘️</p>
            <p className="font-semibold text-white mb-1">No neighborhoods yet</p>
            <p className="text-sm text-slate-400">Create one or get added by a friend</p>
          </div>
        )}
      </div>
    </div>
  );
}
