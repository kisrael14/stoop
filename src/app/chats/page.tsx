'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Pin } from 'lucide-react';
import { CHATS, getUserById } from '@/lib/mock-data';
import { timeAgo } from '@/lib/utils';

export default function ChatsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = CHATS.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col bg-slate-950 min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm px-5 pt-10 pb-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Chats</h1>
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
            placeholder="Search chats..."
            className="w-full rounded-full border border-slate-700 bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-slate-600 transition-colors"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex flex-col">
        {filteredChats.map((chat) => {
          const lastMessage = chat.messages[chat.messages.length - 1];
          const lastSender = lastMessage ? getUserById(lastMessage.userId) : null;
          const unreadCount = Math.floor(Math.random() * 5); // mock unread

          const membersPreview = chat.memberIds
            .slice(0, 3)
            .map((id) => getUserById(id))
            .filter(Boolean);

          return (
            <Link
              key={chat.id}
              href={`/chats/${chat.id}`}
              className="flex items-center gap-4 px-5 py-4 border-b border-slate-800/60 hover:bg-slate-900/50 transition-colors active:bg-slate-900"
            >
              {/* Group avatar */}
              <div className="relative flex-shrink-0">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-2xl">
                  {chat.emoji}
                </div>
                {/* Member stack */}
                <div className="absolute -bottom-1 -right-1 flex">
                  {membersPreview.slice(0, 2).map((member, i) => (
                    <div
                      key={member!.id}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-xs ring-2 ring-slate-950"
                      style={{ marginLeft: i > 0 ? '-4px' : '0' }}
                    >
                      {member!.avatar}
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-white truncate">{chat.name}</p>
                    <span className="text-xs text-slate-500">
                      {chat.memberIds.length} members
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    {lastMessage && (
                      <span className="text-xs text-slate-500">
                        {timeAgo(lastMessage.timestamp)}
                      </span>
                    )}
                    {unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-xs font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>

                {lastMessage && (
                  <div className="flex items-center gap-1">
                    {lastMessage.tag && (
                      <span
                        className={`flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                          lastMessage.tag === 'hot-take'
                            ? 'bg-orange-900/60 text-orange-400'
                            : lastMessage.tag === 'debate'
                            ? 'bg-blue-900/60 text-blue-400'
                            : 'bg-green-900/60 text-green-400'
                        }`}
                      >
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
              </div>
            </Link>
          );
        })}
      </div>

      {filteredChats.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <p className="text-4xl mb-3">💬</p>
          <p className="font-semibold text-white mb-1">No chats found</p>
          <p className="text-sm text-slate-400">Start a new group chat to get the conversation going</p>
        </div>
      )}
    </div>
  );
}
