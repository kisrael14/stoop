'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Swords, Handshake, Flame, X } from 'lucide-react';
import { CHATS, DEBATES, BETS, HOT_TAKES, USERS, getUserById } from '@/lib/mock-data';
import { timeAgo } from '@/lib/utils';
import type { Chat } from '@/lib/types';

const EMOJI_OPTIONS = ['🏘️','🏟️','🏈','🏀','⚾','⚽','🏒','🔥','⚡','🎯','🏆','🎪','🌆','🌃'];

type LocalChat = Chat & { isLocal?: boolean };

export default function NeighborhoodsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🏘️');
  const [newMemberIds, setNewMemberIds] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [localChats, setLocalChats] = useState<LocalChat[]>([]);

  const allChats = [...localChats, ...CHATS];
  const filtered = allChats.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const otherUsers = USERS.filter((u) => u.id !== 'me');
  const memberSearchResults = memberSearch.length > 0
    ? otherUsers.filter((u) =>
        !newMemberIds.includes(u.id) && (
          u.displayName.toLowerCase().includes(memberSearch.toLowerCase()) ||
          u.username.toLowerCase().includes(memberSearch.toLowerCase())
        )
      ).slice(0, 5)
    : otherUsers.filter((u) => !newMemberIds.includes(u.id)).slice(0, 4);

  const createNeighborhood = () => {
    if (!newName.trim()) return;
    const newChat: LocalChat = {
      id: `local-${Date.now()}`,
      name: newName.trim(),
      emoji: newEmoji,
      memberIds: ['me', ...newMemberIds],
      teamIds: [],
      messages: [],
      isLocal: true,
    };
    setLocalChats((prev) => [newChat, ...prev]);
    setNewName('');
    setNewEmoji('🏘️');
    setNewMemberIds([]);
    setMemberSearch('');
    setShowNewModal(false);
  };

  return (
    <div className="flex flex-col bg-paper min-h-full">
      {/* Masthead */}
      <div className="bg-nav-bg px-5 pt-10 pb-5">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-ink/40 mb-1">Stoop Sports</p>
        <h1 className="font-display text-3xl font-black text-ink leading-none">My Neighborhoods</h1>
        <div className="h-px bg-ink/20 my-3" />
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search neighborhoods..."
              className="w-full bg-ink/10 border border-ink/20 py-2 pl-9 pr-4 text-sm text-ink placeholder-ink/40 outline-none focus:border-ink/50 transition-colors rounded-full"
            />
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 bg-masthead text-[#12111a] px-4 py-2 text-xs font-bold uppercase tracking-wider btn-3d rounded-full shrink-0"
          >
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

      {/* Grid */}
      <div className="grid grid-cols-2 border-l border-t border-rule">
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
              className="border-r border-b border-rule block bg-paper-dark hover:bg-paper-deeper transition-colors"
            >
              {/* Card header */}
              <div className="bg-nav-bg px-3 py-3">
                <div className="flex items-start gap-2">
                  <span className="text-2xl leading-none mt-0.5 shrink-0">{chat.emoji}</span>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-ink text-sm leading-tight">{chat.name}</p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-ink/50 mt-0.5">{members.length} members</p>
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

      {/* ── New Neighborhood Modal ──────────────────────── */}
      {showNewModal && (
        <>
          <div className="fixed inset-0 z-50 bg-nav-bg/80 backdrop-blur-sm" onClick={() => setShowNewModal(false)} />
          <div className="fixed inset-x-4 top-1/4 z-50 bg-paper-dark border border-rule shadow-2xl max-w-sm mx-auto">
            <div className="flex items-center justify-between px-5 py-4 bg-nav-bg">
              <p className="font-display font-bold text-ink text-base">New Neighborhood</p>
              <button onClick={() => setShowNewModal(false)} className="text-ink/60 hover:text-ink">
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-5 flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-faint block mb-1.5">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createNeighborhood()}
                  placeholder="e.g. Sunday Crew"
                  autoFocus
                  className="w-full border border-rule focus:border-masthead bg-paper py-2.5 px-3 text-sm text-ink placeholder-ink-faint outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-faint block mb-1.5">Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setNewEmoji(e)}
                      className={`flex items-center justify-center h-9 w-9 text-xl rounded-lg border transition-all ${
                        newEmoji === e ? 'border-masthead bg-paper-dark' : 'border-rule hover:border-ink-muted'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              {/* Member selection */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-faint block mb-1.5">
                  Add Neighbors ({newMemberIds.length} added)
                </label>
                {/* Selected members chips */}
                {newMemberIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {newMemberIds.map((uid) => {
                      const u = getUserById(uid);
                      if (!u) return null;
                      return (
                        <span key={uid} className="flex items-center gap-1 px-2 py-1 bg-paper-dark border border-rule text-xs font-bold text-ink">
                          {u.avatar} {u.displayName.split(' ')[0]}
                          <button onClick={() => setNewMemberIds((p) => p.filter((id) => id !== uid))} className="text-ink-faint hover:text-press ml-0.5">
                            <X size={10} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
                <div className="relative mb-2">
                  <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search neighbors to add…"
                    className="w-full border border-rule bg-paper-dark py-2 pl-8 pr-3 text-xs text-ink placeholder-ink-faint outline-none focus:border-masthead transition-colors"
                  />
                </div>
                <div className="flex flex-col border border-rule/50 max-h-36 overflow-y-auto">
                  {memberSearchResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => { setNewMemberIds((p) => [...p, u.id]); setMemberSearch(''); }}
                      className="flex items-center gap-2 px-3 py-2 border-b border-rule/40 last:border-0 hover:bg-paper-dark transition-colors text-left"
                    >
                      <span className="text-base">{u.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-ink leading-none">{u.displayName}</p>
                        <p className="text-[10px] text-ink-faint font-mono">@{u.username}</p>
                      </div>
                      <Plus size={12} className="text-ink-muted shrink-0" />
                    </button>
                  ))}
                  {memberSearchResults.length === 0 && memberSearch.length > 0 && (
                    <p className="text-[10px] text-ink-faint italic py-3 text-center">No neighbors found</p>
                  )}
                </div>
              </div>

              <button
                onClick={createNeighborhood}
                disabled={!newName.trim()}
                className="w-full bg-masthead text-[#12111a] py-3 font-bold uppercase tracking-widest text-xs btn-3d disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Create Neighborhood
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
