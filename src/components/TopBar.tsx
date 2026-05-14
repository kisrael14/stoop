'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MessageCircle, Search, X, ChevronRight } from 'lucide-react';
import { CHATS, USERS } from '@/lib/mock-data';
import { ALL_TEAMS } from '@/lib/teams-data';
import { timeAgo } from '@/lib/utils';
import TeamLogo from '@/components/TeamLogo';

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
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
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

  const hasResults = matchedTeams.length > 0 || matchedUsers.length > 0;

  const closeAll = () => {
    setChatOpen(false);
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      {/* Tap-away backdrop */}
      {(chatOpen || searchOpen) && (
        <div className="fixed inset-0 z-40" onClick={closeAll} />
      )}

      {/* ── Full-width top bar ─────────────────────────── */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-14 z-50 bg-ink flex items-center gap-3 px-4 shadow-[0_2px_12px_rgba(0,0,0,0.35)]">

        {/* Search pill — stretches to fill */}
        <div className="flex-1 flex items-center gap-3 bg-white/10 hover:bg-white/15 rounded-full px-4 h-10 transition-colors min-w-0">
          <Search size={22} className="text-paper/60 shrink-0" />
          {searchOpen ? (
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Teams, leagues, neighbors…"
              className="flex-1 bg-transparent text-paper text-sm placeholder-paper/40 outline-none min-w-0"
            />
          ) : (
            <button
              onClick={() => { setSearchOpen(true); setChatOpen(false); }}
              className="flex-1 text-left text-paper/40 text-sm truncate"
            >
              Teams, leagues, neighbors…
            </button>
          )}
          {searchOpen && (
            <button onClick={closeAll} className="text-paper/50 hover:text-paper shrink-0 transition-colors">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Chat icon */}
        <button
          onClick={() => { setChatOpen((o) => !o); setSearchOpen(false); setSearchQuery(''); }}
          className="relative shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-paper transition-all"
          aria-label="Open chats"
        >
          <MessageCircle size={21} />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-masthead text-[8px] font-bold text-paper leading-none">
            {CHATS.length}
          </span>
        </button>
      </div>

      {/* ── Search results ─────────────────────────────── */}
      {searchOpen && q.length >= 1 && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-paper border-t-2 border-rule max-h-[70vh] overflow-y-auto shadow-2xl">
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
                    className="flex h-9 w-9 items-center justify-center rounded-full shrink-0 p-1"
                    style={{ backgroundColor: team.color + '25', border: `2px solid ${team.color}50` }}
                  >
                    <TeamLogo team={team} size={28} />
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

          {!hasResults && (
            <div className="px-4 py-8 text-center">
              <p className="text-ink-muted italic text-sm">No results for &ldquo;{searchQuery}&rdquo;</p>
            </div>
          )}
        </div>
      )}

      {/* ── Chat drawer ────────────────────────────────── */}
      {chatOpen && (
        <div
          className="fixed top-14 z-50 w-72 bg-paper border-2 border-ink rounded-2xl shadow-2xl overflow-hidden"
          style={{ right: 'max(1rem, calc(50vw - 224px + 1rem))' }}
        >
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
    </>
  );
}
