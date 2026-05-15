'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MessageCircle, Search, X, ChevronRight, Plus, Check, Compass, Sun, Moon, Users } from 'lucide-react';
import { CHATS } from '@/lib/mock-data';
import { ALL_TEAMS } from '@/lib/teams-data';
import { ALL_LEAGUES } from '@/lib/leagues-data';
import { timeAgo, teamDisplayName } from '@/lib/utils';
import type { FandomLevel } from '@/lib/types';
import TeamLogo from '@/components/TeamLogo';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

const HIDDEN_ON = ['/login', '/onboarding'];

const LEAGUE_COLORS: Record<string, string> = {
  NFL: 'bg-masthead text-ink',
  NBA: 'bg-navy text-ink',
  MLB: 'bg-field text-ink',
  NHL: 'bg-nav-bg text-ink',
  MLS: 'bg-press text-ink',
  EPL: 'bg-[#3d195b] text-ink',
  LaLiga: 'bg-[#e63329] text-ink',
  SerieA: 'bg-[#024494] text-ink',
  Ligue1: 'bg-[#0f4fa8] text-ink',
  Bundesliga: 'bg-[#d20515] text-ink',
};

const FANDOM_OPTIONS: { level: FandomLevel; label: string; emoji: string }[] = [
  { level: 'diehard',      label: 'Diehard',      emoji: '🔥' },
  { level: 'supporter',    label: 'Supporter',    emoji: '✊' },
  { level: 'fair-weather', label: 'Fair Weather', emoji: '☁️' },
  { level: 'casual',       label: 'Casual',       emoji: '👋' },
];

const ICON_BTN = 'relative shrink-0 flex items-center justify-center h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-ink transition-all';
const DROPDOWN_RIGHT = 'max(1rem, calc(50vw - 224px + 1rem))';

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user: authUser, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [chatOpen, setChatOpen]     = useState(false);
  const [fandomOpen, setFandomOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [myTeamIds, setMyTeamIds] = useState<string[]>(() =>
    authUser?.teams?.map((t) => t.team_id) ?? []
  );
  const [myLeagueIds, setMyLeagueIds] = useState<string[]>([]);
  const [fandomPickerFor, setFandomPickerFor] = useState<string | null>(null);
  const [addingHood, setAddingHood] = useState(false);
  const [newHoodName, setNewHoodName] = useState('');
  const [newHoodEmoji, setNewHoodEmoji] = useState('');
  const inputRef   = useRef<HTMLInputElement>(null);
  const hoodRef    = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authUser?.teams) setMyTeamIds(authUser.teams.map((t) => t.team_id));
  }, [authUser?.teams]);

  useEffect(() => {
    if (authUser?.leagues != null) setMyLeagueIds(authUser.leagues);
  }, [authUser?.leagues]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [searchOpen]);

  useEffect(() => {
    if (addingHood) setTimeout(() => hoodRef.current?.focus(), 50);
  }, [addingHood]);

  const addTeamWithFandom = async (teamId: string, level: FandomLevel) => {
    setMyTeamIds((prev) => (prev.includes(teamId) ? prev : [...prev, teamId]));
    setFandomPickerFor(null);
    if (authUser && isSupabaseConfigured()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createClient() as any;
      await supabase.from('user_teams').upsert({ user_id: authUser.id, team_id: teamId, fandom_level: level });
      await refreshProfile();
    }
  };

  const removeTeam = async (teamId: string) => {
    setMyTeamIds((prev) => prev.filter((id) => id !== teamId));
    if (authUser && isSupabaseConfigured()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createClient() as any;
      await supabase.from('user_teams').delete().eq('user_id', authUser.id).eq('team_id', teamId);
      await refreshProfile();
    }
  };

  const toggleLeague = async (leagueId: string) => {
    const isNowFollowing = !myLeagueIds.includes(leagueId);
    setMyLeagueIds((prev) =>
      isNowFollowing ? [...prev, leagueId] : prev.filter((id) => id !== leagueId)
    );
    if (authUser && isSupabaseConfigured()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createClient() as any;
      if (isNowFollowing) {
        await supabase.from('user_leagues').insert({ user_id: authUser.id, league_id: leagueId });
      } else {
        await supabase.from('user_leagues').delete().eq('user_id', authUser.id).eq('league_id', leagueId);
      }
      await refreshProfile();
    }
  };

  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  const q = searchQuery.trim().toLowerCase();

  const matchedTeams = q.length >= 1
    ? ALL_TEAMS.filter((t) =>
        t.name.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.league.toLowerCase().includes(q)
      ).slice(0, 7)
    : [];

  const matchedLeagues = q.length >= 1
    ? ALL_LEAGUES.filter((l) =>
        l.name.toLowerCase().includes(q) ||
        l.shortName.toLowerCase().includes(q) ||
        l.country.toLowerCase().includes(q) ||
        l.sport.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const hasResults = matchedTeams.length > 0 || matchedLeagues.length > 0;

  const myTeamObjects = myTeamIds
    .map((id) => ALL_TEAMS.find((t) => t.id === id))
    .filter(Boolean) as typeof ALL_TEAMS;

  const closeAll = () => {
    setChatOpen(false);
    setFandomOpen(false);
    setSearchOpen(false);
    setSearchQuery('');
    setFandomPickerFor(null);
    setAddingHood(false);
    setNewHoodName('');
    setNewHoodEmoji('');
  };

  return (
    <>
      {/* Tap-away backdrop */}
      {(chatOpen || searchOpen || fandomOpen) && (
        <div className="fixed inset-0 z-40" onClick={closeAll} />
      )}

      {/* ── Top bar ─────────────────────────────────────── */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-14 z-50 bg-nav-bg flex items-center gap-2 px-4 shadow-[0_2px_12px_rgba(0,0,0,0.35)]">

        {searchOpen ? (
          /* Expanded search fills the bar */
          <div className="flex-1 flex items-center gap-2 bg-white/10 rounded-full px-4 h-10">
            <Search size={15} className="text-ink/60 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Teams & leagues…"
              className="flex-1 bg-transparent text-ink text-sm placeholder-ink/40 outline-none min-w-0"
            />
            <button onClick={closeAll} className="text-ink/50 hover:text-ink shrink-0 transition-colors">
              <X size={15} />
            </button>
          </div>
        ) : (
          <>
            {/* Compact search pill */}
            <button
              onClick={() => { setSearchOpen(true); setChatOpen(false); setFandomOpen(false); }}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 rounded-full px-3 h-9 transition-colors shrink-0"
            >
              <Search size={14} className="text-ink/60" />
              <span className="text-ink/40 text-xs font-medium">Search</span>
            </button>

            <div className="flex-1" />

            {/* Discover */}
            <button
              onClick={() => { closeAll(); router.push('/discover'); }}
              className={ICON_BTN}
              aria-label="Discover"
            >
              <Compass size={19} />
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={ICON_BTN}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Fandom bubble */}
            <button
              onClick={() => { setFandomOpen((o) => !o); setChatOpen(false); }}
              className={`${ICON_BTN} ${fandomOpen ? 'bg-white/25!' : ''}`}
              aria-label="Your teams"
            >
              <Users size={18} />
              {myTeamIds.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-masthead text-[7px] font-bold text-[#12111a] leading-none">
                  {myTeamIds.length}
                </span>
              )}
            </button>

            {/* Chat icon */}
            <button
              onClick={() => { setChatOpen((o) => !o); setFandomOpen(false); setSearchQuery(''); }}
              className={`${ICON_BTN} ${chatOpen ? 'bg-white/25!' : ''}`}
              aria-label="Open chats"
            >
              <MessageCircle size={20} />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-masthead text-[7px] font-bold text-[#12111a] leading-none">
                {CHATS.length}
              </span>
            </button>
          </>
        )}
      </div>

      {/* ── Search results ─────────────────────────────── */}
      {searchOpen && q.length >= 1 && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-paper-dark border-t border-rule max-h-[70vh] overflow-y-auto shadow-2xl">

          {matchedTeams.length > 0 && (
            <>
              <div className="section-header px-4">
                <span className="text-[9px] font-bold uppercase tracking-widest text-ink-faint">Teams</span>
              </div>
              {matchedTeams.map((team) => {
                const followed = myTeamIds.includes(team.id);
                const showingPicker = fandomPickerFor === team.id;
                return (
                  <div key={team.id} className="border-b border-rule/40 last:border-0">
                    <div className="flex w-full items-center gap-3 px-4 py-3 hover:bg-paper-dark transition-colors">
                      <button
                        onClick={() => { closeAll(); router.push(`/teams/${team.id}`); }}
                        className="flex items-center gap-3 flex-1 min-w-0 text-left"
                      >
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-full shrink-0 p-1"
                          style={{ backgroundColor: team.color + '25', border: `2px solid ${team.color}50` }}
                        >
                          <TeamLogo team={team} size={28} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-ink text-sm">{teamDisplayName(team)}</p>
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${LEAGUE_COLORS[team.league] ?? 'bg-ink-faint text-ink'}`}>
                          {team.league}
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (followed) {
                            removeTeam(team.id);
                          } else {
                            setFandomPickerFor(showingPicker ? null : team.id);
                          }
                        }}
                        className={`shrink-0 flex items-center justify-center h-8 w-8 rounded-full font-bold text-sm transition-all border-2 ${
                          followed
                            ? 'bg-paper-dark border-rule text-ink'
                            : showingPicker
                            ? 'bg-nav-bg border-rule text-ink'
                            : 'bg-masthead border-transparent text-[#12111a] hover:bg-masthead/80'
                        }`}
                        style={followed || showingPicker ? {} : { backgroundColor: team.color }}
                        title={followed ? 'Unfollow' : 'Follow team'}
                      >
                        {followed ? <Check size={14} /> : <Plus size={14} />}
                      </button>
                    </div>
                    {showingPicker && (
                      <div className="px-4 py-3 bg-paper-dark">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-2">Select fandom level:</p>
                        <div className="grid grid-cols-4 gap-2">
                          {FANDOM_OPTIONS.map(({ level, label, emoji }) => (
                            <button
                              key={level}
                              onClick={() => addTeamWithFandom(team.id, level)}
                              className="flex flex-col items-center gap-1 py-2 border-2 border-rule rounded-xl bg-paper hover:border-ink hover:bg-paper-dark transition-all"
                            >
                              <span className="text-base">{emoji}</span>
                              <span className="text-[9px] font-bold uppercase tracking-wide text-ink leading-tight text-center">{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {matchedLeagues.length > 0 && (
            <>
              <div className="section-header px-4">
                <span className="text-[9px] font-bold uppercase tracking-widest text-ink-faint">Leagues</span>
              </div>
              {matchedLeagues.map((league) => {
                const leagueFollowed = myLeagueIds.includes(league.id);
                return (
                  <div key={league.id} className="flex w-full items-center gap-3 px-4 py-3 hover:bg-paper-dark transition-colors border-b border-rule/40 last:border-0">
                    <button
                      onClick={() => { closeAll(); router.push(`/leagues/${league.id}`); }}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full shrink-0 text-xl"
                        style={{ backgroundColor: league.color + '25', border: `2px solid ${league.color}50` }}
                      >
                        {league.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-ink text-sm">{league.name}</p>
                        <p className="text-[10px] text-ink-faint">{league.country} · {league.sport}</p>
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${LEAGUE_COLORS[league.id] ?? 'bg-ink-faint text-ink'}`}>
                        {league.shortName}
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLeague(league.id);
                      }}
                      className={`shrink-0 flex items-center justify-center h-8 w-8 rounded-full font-bold text-sm transition-all border-2 ${
                        leagueFollowed
                          ? 'bg-paper-dark border-rule text-ink'
                          : 'bg-masthead border-transparent text-[#12111a] hover:bg-masthead/80'
                      }`}
                      style={leagueFollowed ? {} : { backgroundColor: league.color }}
                      title={leagueFollowed ? 'Unfollow league' : 'Follow league'}
                    >
                      {leagueFollowed ? <Check size={14} /> : <Plus size={14} />}
                    </button>
                  </div>
                );
              })}
            </>
          )}

          {!hasResults && (
            <div className="px-4 py-8 text-center">
              <p className="text-ink-muted italic text-sm">No results for &ldquo;{searchQuery}&rdquo;</p>
            </div>
          )}
        </div>
      )}

      {/* ── Fandom dropdown ────────────────────────────── */}
      {fandomOpen && (
        <div
          className="fixed top-14 z-50 w-72 bg-paper-dark border border-rule rounded-2xl shadow-2xl overflow-hidden"
          style={{ right: DROPDOWN_RIGHT }}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-nav-bg">
            <p className="font-display font-bold text-ink text-sm">Your Teams</p>
            <button onClick={() => setFandomOpen(false)} className="text-ink/60 hover:text-ink">
              <X size={16} />
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {myTeamObjects.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-ink-muted italic text-sm">No teams followed yet</p>
                <p className="text-ink-faint text-xs mt-1">Use Search to add teams</p>
              </div>
            ) : (
              myTeamObjects.map((team) => (
                <button
                  key={team.id}
                  onClick={() => { closeAll(); router.push(`/teams/${team.id}`); }}
                  className="flex w-full items-center gap-3 px-4 py-3 hover:bg-paper-deeper transition-colors text-left border-b border-rule/50 last:border-0"
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full shrink-0 p-1"
                    style={{ backgroundColor: team.color + '25', border: `2px solid ${team.color}50` }}
                  >
                    <TeamLogo team={team} size={28} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink text-sm">{teamDisplayName(team)}</p>
                    <p className="text-[10px] text-ink-faint">{team.league}</p>
                  </div>
                  <ChevronRight size={13} className="text-ink-faint" />
                </button>
              ))
            )}
          </div>
          <div className="border-t border-rule px-4 py-2.5 bg-paper-dark">
            <button
              onClick={() => { closeAll(); setSearchOpen(true); }}
              className="w-full text-center text-[11px] font-bold uppercase tracking-widest text-masthead hover:underline"
            >
              Search Teams →
            </button>
          </div>
        </div>
      )}

      {/* ── Chat drawer ────────────────────────────────── */}
      {chatOpen && (
        <div
          className="fixed top-14 z-50 w-72 bg-paper-dark border border-rule rounded-2xl shadow-2xl overflow-hidden"
          style={{ right: DROPDOWN_RIGHT }}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-nav-bg">
            <p className="font-display font-bold text-ink text-sm">Your Chats</p>
            <button onClick={() => setChatOpen(false)} className="text-ink/60 hover:text-ink">
              <X size={16} />
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {CHATS.map((chat) => {
              const lastMsg = chat.messages[chat.messages.length - 1];
              return (
                <button
                  key={chat.id}
                  onClick={() => { closeAll(); router.push(`/neighborhoods/${chat.id}?tab=chat`); }}
                  className="flex w-full items-center gap-3 px-4 py-3 hover:bg-paper-deeper transition-colors text-left border-b border-rule/50 last:border-0"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-nav-bg text-lg shrink-0">
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

          {/* Footer: All Neighborhoods + create button */}
          <div className="border-t border-rule px-4 py-2.5 bg-paper-dark flex items-center justify-between gap-2">
            <button
              onClick={() => { closeAll(); router.push('/neighborhoods'); }}
              className="text-[11px] font-bold uppercase tracking-widest text-masthead hover:underline"
            >
              All Neighborhoods →
            </button>
            <button
              onClick={() => setAddingHood((a) => !a)}
              className="flex items-center justify-center h-6 w-6 rounded-full bg-masthead text-[#12111a] hover:bg-masthead/80 transition-all active:scale-90 shrink-0"
              title="Create neighborhood"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Inline neighborhood creation form */}
          {addingHood && (
            <div className="border-t border-rule px-4 py-3 bg-paper flex flex-col gap-2.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">New Neighborhood</p>
              <div className="flex gap-2">
                <input
                  value={newHoodEmoji}
                  onChange={(e) => setNewHoodEmoji(e.target.value)}
                  placeholder="🏘"
                  maxLength={2}
                  className="w-12 border border-rule bg-paper-dark px-2 py-2 text-center text-lg outline-none focus:border-masthead transition-colors rounded-lg"
                />
                <input
                  ref={hoodRef}
                  value={newHoodName}
                  onChange={(e) => setNewHoodName(e.target.value)}
                  placeholder="Neighborhood name…"
                  className="flex-1 border border-rule bg-paper-dark px-3 py-2 text-sm text-ink placeholder-ink-faint outline-none focus:border-masthead transition-colors rounded-lg"
                />
              </div>
              <button
                disabled={!newHoodName.trim()}
                onClick={() => {
                  closeAll();
                  router.push('/neighborhoods');
                }}
                className="w-full py-2 bg-masthead text-[#12111a] text-xs font-bold uppercase tracking-widest rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-masthead/80 transition-colors"
              >
                Create
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
