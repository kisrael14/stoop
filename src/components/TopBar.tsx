'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MessageCircle, Search, X, ChevronRight } from 'lucide-react';
import { CHATS, USERS } from '@/lib/mock-data';
import { ALL_TEAMS } from '@/lib/teams-data';
import { timeAgo } from '@/lib/utils';

const HIDDEN_ON = ['/login', '/onboarding'];

const LEAGUE_COLORS: Record<string, string> = {
  NFL: 'bg-masthead text-paper',
  NBA: 'bg-navy text-paper',
  MLB: 'bg-field text-paper',
  NHL: 'bg-ink text-paper',
  MLS: 'bg-press text-paper',
};

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [chatOpen, setChatOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  const q = searchQuery.trim().toLowerCase();

  const matchedTeams = q.length >= 1
    ? ALL_TEAMS.filter((t) =>
        t.name.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.league.toLowerCase().includes(q)
      ).slice(0, 7)
    : [];

  const matchedUsers = q.length >= 1
    ? USERS.filter((u) =>
        u.id !== 'me' && (
          u.displayName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q)
        )
      ).slice(0, 4)
    : [];

  const closeAll = () => {
    setChatOpen(false);
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      {/* Backdrop */}
      {(chatOpen || searchOpen) && (
        <div className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm" onClick={closeAll} />
      )}

      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 pointer-events-none h-0">

        {/* ── Icon buttons (shown when search is closed) ── */}
        {!searchOpen && (
          <>
            {/* Search icon */}
            <button
              onClick={() => { setSearchOpen(true); setChatOpen(false); }}
              className="absolute top-3 right-14 pointer-events-auto flex items-center justify-center h-9 w-9 rounded-full bg-ink text-paper shadow-lg hover:bg-ink/80 active:scale-95 transition-all btn-3d"
              aria-label="Search teams and neighbors"
            >
              <Search size={16} />
            </button>

            {/* Chat icon */}
            <button
              onClick={() => { setChatOpen((o) => !o); }}
              className="absolute top-3 right-4 pointer-events-auto flex items-center justify-center h-9 w-9 rounded-full bg-ink text-paper shadow-lg hover:bg-ink/80 active:scale-95 transition-all btn-3d"
              aria-label="Open chats"
            >
              <MessageCircle size={17} />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-masthead text-[8px] font-bold text-paper">
                {CHATS.length}
              </span>
            </button>
          </>
        )}

        {/* ── Search overlay ── */}
        {searchOpen && (
          <div className="absolute top-0 left-0 right-0 pointer-events-auto bg-ink shadow-2xl">
            {/* Input row */}
            <div className="flex items-center gap-3 px-4 py-3">
              <Search size={15} className="text-paper/50 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Teams, leagues, neighbors…"
                className="flex-1 bg-transparent text-paper text-sm placeholder-paper/40 outline-none"
              />
              <button
                onClick={closeAll}
                className="text-paper/50 hover:text-paper shrink-0 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Results */}
            {q.length >= 1 && (
              <div className="max-h-[70vh] overflow-y-auto bg-paper border-t-2 border-rule">
                {/* Teams */}
                {matchedTeams.length > 0 && (
                  <>
                    <div className="section-header px-4">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-ink-faint">Teams</span>
                    </div>
                    {matchedTeams.map((team) => (
                      <button
                        key={team.id}
                        onClick={() => { closeAll(); router.push(`/teams/${team.id}`); }}
                        className="flex w-full items-center gap-3 px-4 py-3 hover:bg-paper-dark transition-colors text-left border-b border-rule/40 last:border-0"
                      >
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-full text-lg shrink-0"
                          style={{ backgroundColor: team.color + '25', border: `2px solid ${team.color}50` }}
                        >
                          {team.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-ink text-sm">{team.city} {team.name}</p>
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${LEAGUE_COLORS[team.league] ?? 'bg-ink-faint text-paper'}`}>
                          {team.league}
                        </span>
                        <ChevronRight size={13} className="text-ink-faint shrink-0" />
                      </button>
                    ))}
                  </>
                )}

                {/* Neighbors */}
                {matchedUsers.length > 0 && (
                  <>
                    <div className="section-header px-4">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-ink-faint">Neighbors</span>
                    </div>
                    {matchedUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => { closeAll(); router.push(`/users/${user.id}`); }}
                        className="flex w-full items-center gap-3 px-4 py-3 hover:bg-paper-dark transition-colors text-left border-b border-rule/40 last:border-0"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-paper-dark border border-rule text-lg shrink-0">
                          {user.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-ink text-sm">{user.displayName}</p>
                          <p className="text-[10px] text-ink-faint font-mono">@{user.username}</p>
                        </div>
                        <ChevronRight size={13} className="text-ink-faint shrink-0" />
                      </button>
                    ))}
                  </>
                )}

                {matchedTeams.length === 0 && matchedUsers.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <p className="text-ink-muted italic text-sm">No results for &ldquo;{searchQuery}&rdquo;</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Chat drawer ── */}
        {chatOpen && !searchOpen && (
          <div className="absolute top-14 right-4 pointer-events-auto w-72 bg-paper border-2 border-ink rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-ink">
              <p className="font-display font-bold text-paper text-sm">Your Chats</p>
              <button onClick={() => setChatOpen(false)} className="text-paper/60 hover:text-paper">
                <X size={16} />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto">
              {CHATS.map((chat) => {
                const lastMsg = chat.messages[chat.messages.length - 1];
                return (
                  <button
                    key={chat.id}
                    onClick={() => { closeAll(); router.push(`/neighborhoods/${chat.id}?tab=chat`); }}
                    className="flex w-full items-center gap-3 px-4 py-3 hover:bg-paper-dark transition-colors text-left border-b border-rule/50 last:border-0"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-lg shrink-0">
                      {chat.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-ink text-sm truncate">{chat.name}</p>
                      {lastMsg && (
                        <p className="text-[11px] text-ink-muted truncate">{lastMsg.content}</p>
                      )}
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {lastMsg && (
                        <span className="text-[10px] text-ink-faint font-mono">{timeAgo(lastMsg.timestamp)}</span>
                      )}
                      <ChevronRight size={13} className="text-ink-faint" />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-rule px-4 py-2.5 bg-paper-dark">
              <button
                onClick={() => { closeAll(); router.push('/neighborhoods'); }}
                className="w-full text-center text-[11px] font-bold uppercase tracking-widest text-masthead hover:underline"
              >
                All Neighborhoods →
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
