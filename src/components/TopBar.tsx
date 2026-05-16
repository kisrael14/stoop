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

const HOOD_EMOJIS = ['🏘️','🏟️','🏈','🏀','⚾','⚽','🏒','🔥','⚡','🎯','🏆','🎪','🌆','🌃'];

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
  const [newHoodEmoji, setNewHoodEmoji] = useState('🏘️');
  const [newHoodMemberIds, setNewHoodMemberIds] = useState<string[]>([]);
  const [hoodMemberSearch, setHoodMemberSearch] = useState('');
  const [hoodDbMembers, setHoodDbMembers] = useState<{ id: string; display_name: string; username: string; avatar: string }[]>([]);
  const [selectedHoodMemberDetails, setSelectedHoodMemberDetails] = useState<Record<string, { displayName: string; username: string; avatar: string }>>({});
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

  useEffect(() => {
    if (!addingHood || !authUser || !isSupabaseConfigured()) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any;
    const run = async () => {
      let q = supabase.from('profiles').select('id, username, display_name, avatar').neq('id', authUser.id);
      if (newHoodMemberIds.length > 0) q = q.not('id', 'in', `(${newHoodMemberIds.join(',')})`);
      if (hoodMemberSearch.trim().length > 0) q = q.or(`username.ilike.%${hoodMemberSearch}%,display_name.ilike.%${hoodMemberSearch}%`);
      const { data } = await q.limit(6);
      setHoodDbMembers(data ?? []);
    };
    run();
  }, [addingHood, hoodMemberSearch, newHoodMemberIds, authUser?.id]);

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
    setNewHoodEmoji('🏘️');
    setNewHoodMemberIds([]);
    setHoodMemberSearch('');
    setSelectedHoodMemberDetails({});
  };

  const createNeighborhood = async () => {
    if (!newHoodName.trim()) return;
    if (authUser && isSupabaseConfigured()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createClient() as any;
      try {
        const { data: hood, error: hoodErr } = await supabase
          .from('neighborhoods')
          .insert({ name: newHoodName.trim(), emoji: newHoodEmoji || '🏘️', created_by: authUser.id })
          .select()
          .single();
        if (hoodErr) { console.error('Neighborhood insert error:', hoodErr); return; }
        if (hood) {
          const memberInserts = [
            { neighborhood_id: hood.id, user_id: authUser.id },
            ...newHoodMemberIds.map((uid) => ({ neighborhood_id: hood.id, user_id: uid })),
          ];
          const { error: memberErr } = await supabase.from('neighborhood_members').insert(memberInserts);
          if (memberErr) console.error('Member insert error:', memberErr);
          closeAll();
          router.push(`/neighborhoods/${hood.id}`);
        }
      } catch (e) {
        console.error('Create neighborhood exception:', e);
      }
    } else {
      closeAll();
      router.push('/neighborhoods');
    }
  };

  return (
    <>
      {/* Tap-away backdrop for dropdowns */}
      {(chatOpen || searchOpen || fandomOpen) && !addingHood && (
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
            {/* Search pill — grows to fill available space */}
            <button
              onClick={() => { setSearchOpen(true); setChatOpen(false); setFandomOpen(false); }}
              className="flex flex-1 items-center gap-2 bg-white/10 hover:bg-white/15 rounded-full px-4 h-9 transition-colors min-w-0"
            >
              <Search size={14} className="text-ink/60 shrink-0" />
              <span className="text-ink/40 text-sm font-medium truncate">Search teams &amp; leagues…</span>
            </button>

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
                {authUser?.neighborhoodMemberships?.length ?? CHATS.length}
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
            <p className="font-display font-bold text-ink text-sm">Your Fandom</p>
            <button onClick={() => setFandomOpen(false)} className="text-ink/60 hover:text-ink">
              <X size={16} />
            </button>
          </div>

          {/* Fully expanded, swipeable list */}
          <div className="overflow-y-auto max-h-[60vh] overscroll-contain">
            {myTeamObjects.length === 0 && myLeagueIds.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-ink-muted italic text-sm">No teams or leagues followed yet</p>
                <p className="text-ink-faint text-xs mt-1">Use Search to add</p>
              </div>
            ) : (
              <>
                {myTeamObjects.length > 0 && (
                  <>
                    <p className="px-4 pt-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-ink-faint">Teams</p>
                    {myTeamObjects.map((team) => (
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
                    ))}
                  </>
                )}

                {myLeagueIds.length > 0 && (
                  <>
                    <p className="px-4 pt-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-ink-faint">Leagues</p>
                    {myLeagueIds.map((lid) => {
                      const league = ALL_LEAGUES.find((l) => l.id === lid);
                      if (!league) return null;
                      return (
                        <button
                          key={league.id}
                          onClick={() => { closeAll(); router.push(`/leagues/${league.id}`); }}
                          className="flex w-full items-center gap-3 px-4 py-3 hover:bg-paper-deeper transition-colors text-left border-b border-rule/50 last:border-0"
                        >
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-full shrink-0 text-xl"
                            style={{ backgroundColor: league.color + '25', border: `2px solid ${league.color}50` }}
                          >
                            {league.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-ink text-sm">{league.name}</p>
                            <p className="text-[10px] text-ink-faint">{league.sport} · {league.country}</p>
                          </div>
                          <ChevronRight size={13} className="text-ink-faint" />
                        </button>
                      );
                    })}
                  </>
                )}
              </>
            )}
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
            {(authUser?.neighborhoodMemberships?.length
              ? authUser.neighborhoodMemberships
              : CHATS.map((c) => ({ id: c.id, name: c.name, emoji: c.emoji }))
            ).map((hood) => (
              <button
                key={hood.id}
                onClick={() => { closeAll(); router.push(`/neighborhoods/${hood.id}?tab=chat`); }}
                className="flex w-full items-center gap-3 px-4 py-3 hover:bg-paper-deeper transition-colors text-left border-b border-rule/50 last:border-0"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-nav-bg text-lg shrink-0">
                  {hood.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink text-sm truncate">{hood.name}</p>
                  <p className="text-[11px] text-ink-muted">Open chat →</p>
                </div>
                <ChevronRight size={13} className="text-ink-faint shrink-0" />
              </button>
            ))}
            {authUser && authUser.neighborhoodMemberships?.length === 0 && (
              <div className="px-4 py-5 text-center">
                <p className="text-xs text-ink-muted italic">No neighborhoods yet</p>
                <p className="text-[10px] text-ink-faint mt-1">Create one with the + button below</p>
              </div>
            )}
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
              onClick={() => { setChatOpen(false); setAddingHood(true); }}
              className="flex items-center justify-center h-6 w-6 rounded-full bg-masthead text-[#12111a] hover:bg-masthead/80 transition-all active:scale-90 shrink-0"
              title="Create neighborhood"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>
      )}
      {/* ── New Neighborhood Modal ─────────────────────── */}
      {addingHood && (
        <>
          <div className="fixed inset-0 z-60 bg-nav-bg/80 backdrop-blur-sm" onClick={closeAll} />
          <div className="fixed inset-x-4 top-[10%] z-60 bg-paper-dark border border-rule shadow-2xl max-w-sm mx-auto max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-nav-bg shrink-0">
              <p className="font-display font-bold text-ink text-base">New Neighborhood</p>
              <button onClick={closeAll} className="text-ink/60 hover:text-ink">
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-5 py-5 flex flex-col gap-4">
              {/* Name */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-faint block mb-1.5">Name</label>
                <input
                  ref={hoodRef}
                  type="text"
                  value={newHoodName}
                  onChange={(e) => setNewHoodName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createNeighborhood()}
                  placeholder="e.g. Sunday Crew"
                  className="w-full border border-rule focus:border-masthead bg-paper py-2.5 px-3 text-sm text-ink placeholder-ink-faint outline-none transition-colors"
                />
              </div>

              {/* Emoji picker */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-faint block mb-1.5">Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {HOOD_EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setNewHoodEmoji(e)}
                      className={`flex items-center justify-center h-9 w-9 text-xl rounded-lg border transition-all ${
                        newHoodEmoji === e ? 'border-masthead bg-paper-dark' : 'border-rule hover:border-ink-muted'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Member picker */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-faint block mb-1.5">
                  Add Neighbors ({newHoodMemberIds.length} added)
                </label>

                {/* Selected chips */}
                {newHoodMemberIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {newHoodMemberIds.map((uid) => {
                      const det = selectedHoodMemberDetails[uid];
                      if (!det) return null;
                      return (
                        <span key={uid} className="flex items-center gap-1 px-2 py-1 bg-paper-dark border border-rule text-xs font-bold text-ink">
                          {det.avatar} {det.displayName.split(' ')[0]}
                          <button
                            onClick={() => {
                              setNewHoodMemberIds((p) => p.filter((id) => id !== uid));
                              setSelectedHoodMemberDetails((p) => { const n = { ...p }; delete n[uid]; return n; });
                            }}
                            className="text-ink-faint hover:text-press ml-0.5"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Search input */}
                <div className="relative mb-2">
                  <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                  <input
                    type="text"
                    value={hoodMemberSearch}
                    onChange={(e) => setHoodMemberSearch(e.target.value)}
                    placeholder={authUser && isSupabaseConfigured() ? 'Search neighbors to add…' : 'Sign in to add members'}
                    disabled={!authUser || !isSupabaseConfigured()}
                    className="w-full border border-rule bg-paper-dark py-2 pl-8 pr-3 text-xs text-ink placeholder-ink-faint outline-none focus:border-masthead transition-colors disabled:opacity-50"
                  />
                </div>

                {/* Results list */}
                {(authUser && isSupabaseConfigured()) && (
                  <div className="flex flex-col border border-rule/50 max-h-36 overflow-y-auto">
                    {hoodDbMembers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setNewHoodMemberIds((p) => [...p, u.id]);
                          setSelectedHoodMemberDetails((p) => ({ ...p, [u.id]: { displayName: u.display_name, username: u.username, avatar: u.avatar || '👤' } }));
                          setHoodMemberSearch('');
                        }}
                        className="flex items-center gap-2 px-3 py-2 border-b border-rule/40 last:border-0 hover:bg-paper-dark transition-colors text-left"
                      >
                        <span className="text-base">{u.avatar || '👤'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-ink leading-none">{u.display_name}</p>
                          <p className="text-[10px] text-ink-faint font-mono">@{u.username}</p>
                        </div>
                        <Plus size={12} className="text-ink-muted shrink-0" />
                      </button>
                    ))}
                    {hoodDbMembers.length === 0 && hoodMemberSearch.length > 0 && (
                      <p className="text-[10px] text-ink-faint italic py-3 text-center">No neighbors found</p>
                    )}
                    {hoodDbMembers.length === 0 && hoodMemberSearch.length === 0 && (
                      <p className="text-[10px] text-ink-faint italic py-3 text-center">Type a name to search</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sticky footer */}
            <div className="shrink-0 px-5 pb-5 pt-2">
              <button
                onClick={createNeighborhood}
                disabled={!newHoodName.trim()}
                className="w-full bg-masthead text-[#12111a] py-3 font-bold uppercase tracking-widest text-xs btn-3d disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Create Neighborhood
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
