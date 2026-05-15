'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Phone, AtSign, X, Plus, Check } from 'lucide-react';
import { USERS, TEAMS, ME } from '@/lib/mock-data';
import { ALL_LEAGUES } from '@/lib/leagues-data';
import { teamDisplayName } from '@/lib/utils';
import type { FandomLevel } from '@/lib/types';
import TeamLogo from '@/components/TeamLogo';
import { useAuth } from '@/lib/auth-context';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

type SearchMode = 'people' | 'browse';

const FANDOM_OPTIONS: { level: FandomLevel; label: string; emoji: string }[] = [
  { level: 'diehard',      label: 'Diehard',      emoji: '🔥' },
  { level: 'supporter',    label: 'Supporter',    emoji: '✊' },
  { level: 'fair-weather', label: 'Fair Weather', emoji: '☁️' },
  { level: 'casual',       label: 'Casual',       emoji: '👋' },
];

export default function DiscoverPage() {
  const { user: authUser, refreshProfile } = useAuth();
  const [mode, setMode] = useState<SearchMode>('people');
  const [query, setQuery] = useState('');
  const [following, setFollowing] = useState<string[]>([]);
  const [myTeamIds, setMyTeamIds] = useState<string[]>(() => {
    if (authUser?.teams?.length) return authUser.teams.map((t) => t.team_id);
    return ME.fanTeams.map((ft) => ft.team.id);
  });
  const [myLeagueIds, setMyLeagueIds] = useState<string[]>([]);
  const [fandomPickerFor, setFandomPickerFor] = useState<string | null>(null);

  const otherUsers = USERS.filter((u) => u.id !== 'me');
  const isPhone = /^\+?[\d\s\-()]{4,}$/.test(query.replace(/\s/g, ''));
  const queryType = query.length >= 2 ? (isPhone ? 'phone' : 'username') : null;

  const filteredUsers = query.length >= 1
    ? otherUsers.filter((u) =>
        u.displayName.toLowerCase().includes(query.toLowerCase()) ||
        u.username.toLowerCase().includes(query.toLowerCase())
      )
    : otherUsers;

  const filteredLeagues = query.length >= 1
    ? ALL_LEAGUES.filter((l) =>
        l.name.toLowerCase().includes(query.toLowerCase()) ||
        l.shortName.toLowerCase().includes(query.toLowerCase()) ||
        l.country.toLowerCase().includes(query.toLowerCase()) ||
        l.sport.toLowerCase().includes(query.toLowerCase())
      )
    : ALL_LEAGUES;

  const filteredTeams = query.length >= 1
    ? TEAMS.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.city.toLowerCase().includes(query.toLowerCase()) ||
          t.league.toLowerCase().includes(query.toLowerCase())
      )
    : TEAMS;


  // Sync local state from auth when it loads
  useEffect(() => {
    if (authUser?.teams) setMyTeamIds(authUser.teams.map((t) => t.team_id));
  }, [authUser?.teams]);

  useEffect(() => {
    if (authUser?.followingProfiles != null) {
      setFollowing(authUser.followingProfiles.map((fp) => fp.id));
    } else if (!authUser) {
      setFollowing(ME.followingIds);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.followingProfiles]);

  useEffect(() => {
    if (authUser?.leagues != null) setMyLeagueIds(authUser.leagues);
  }, [authUser?.leagues]);

  const toggleFollow = async (userId: string) => {
    const isNowFollowing = !following.includes(userId);
    setFollowing((prev) =>
      isNowFollowing ? [...prev, userId] : prev.filter((id) => id !== userId)
    );
    if (authUser && isSupabaseConfigured()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createClient() as any;
      if (isNowFollowing) {
        await supabase.from('follows').insert({ follower_id: authUser.id, following_id: userId });
      } else {
        await supabase.from('follows').delete().eq('follower_id', authUser.id).eq('following_id', userId);
      }
      await refreshProfile();
    }
  };

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

  return (
    <div className="flex flex-col bg-paper min-h-full">

      {/* ── Masthead ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-paper/97 backdrop-blur-sm px-5 pt-10 pb-4 border-b-2 border-ink">
        <h1 className="font-display text-2xl font-bold text-ink mb-1">Discover</h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint mb-4">Find Neighbors · Follow Teams</p>

        {/* Mode toggle */}
        <div className="flex gap-0 border border-ink overflow-hidden mb-4">
          {([
            { id: 'people', label: '👥 Neighbors' },
            { id: 'browse', label: '🏆 Teams & Leagues' },
          ] as const).map(({ id: m, label }) => (
            <button
              key={m}
              onClick={() => { setMode(m); setQuery(''); setFandomPickerFor(null); }}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors border-r last:border-r-0 border-ink ${
                mode === m ? 'bg-ink text-paper' : 'bg-paper text-ink-muted hover:bg-paper-dark'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative">
          {queryType === 'phone'
            ? <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            : <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          }
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === 'people' ? 'Name, @username, or phone…' : 'Search teams, leagues, cities…'}
            className="w-full border border-rule bg-paper-dark py-2.5 pl-9 pr-10 text-sm text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink">
              <X size={13} />
            </button>
          )}
        </div>
        {queryType === 'phone' && (
          <p className="mt-1.5 text-[10px] text-ink-faint px-1 font-bold uppercase tracking-wide">
            <Phone size={9} className="inline mr-1" />Searching by phone number
          </p>
        )}
        {queryType === 'username' && query.startsWith('@') && (
          <p className="mt-1.5 text-[10px] text-ink-faint px-1 font-bold uppercase tracking-wide">
            <AtSign size={9} className="inline mr-1" />Searching by username
          </p>
        )}
      </div>

      {/* ── NEIGHBORS ───────────────────────────────────────── */}
      {mode === 'people' && (
        <div className="flex flex-col py-4 pb-8">
          {query.length < 1 && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-faint mb-3 px-5">
              Suggested — shared fan bases
            </p>
          )}
          {filteredUsers.length === 0 && query.length > 0 && (
            <div className="text-center py-12 px-5">
              <p className="font-display text-3xl mb-2 text-ink-faint">🔍</p>
              <p className="font-display font-bold text-ink">No neighbors found</p>
              <p className="text-xs text-ink-muted mt-1 italic">Try searching by phone number or @username</p>
            </div>
          )}
          {filteredUsers.map((user, i) => (
            <div
              key={user.id}
              className={`flex items-center gap-3 px-5 py-3.5 hover:bg-paper-dark transition-colors border-b border-rule/50 ${i === 0 ? 'border-t border-rule/50' : ''}`}
            >
              <Link href={`/users/${user.id}`} className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-dark border border-rule text-2xl shrink-0 hover:border-ink transition-all">
                {user.avatar}
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/users/${user.id}`} className="font-bold text-ink hover:text-masthead transition-colors">
                  {user.displayName}
                </Link>
                <p className="text-[11px] text-ink-faint font-mono">@{user.username}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {user.fanTeams.slice(0, 3).map((ft) => (
                    <span
                      key={ft.team.id}
                      className="px-2 py-0.5 text-[10px] font-bold text-paper uppercase tracking-wide"
                      style={{ backgroundColor: ft.team.color + '90' }}
                    >
                      <TeamLogo team={ft.team} size={12} className="inline-block mr-0.5" />{ft.team.name}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => toggleFollow(user.id)}
                className={`shrink-0 flex items-center justify-center h-9 w-9 rounded-full font-bold text-sm transition-all border-2 ${
                  following.includes(user.id)
                    ? 'bg-paper-dark border-ink text-ink'
                    : 'bg-ink border-transparent text-paper hover:bg-ink/80'
                }`}
                title={following.includes(user.id) ? 'Unfollow' : 'Follow'}
              >
                {following.includes(user.id) ? <Check size={14} /> : <Plus size={14} />}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── TEAMS & LEAGUES BROWSE ───────────────────────────── */}
      {mode === 'browse' && (
        <div className="pb-8">

          {/* Your teams chips */}
          {myTeamIds.length > 0 && (
            <div className="px-5 pt-4 pb-3 border-b border-rule">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-faint mb-2">
                Your Teams ({myTeamIds.length})
              </p>
              <div className="flex gap-2 flex-wrap">
                {myTeamIds.map((tid) => {
                  const team = TEAMS.find((t) => t.id === tid);
                  if (!team) return null;
                  return (
                    <button
                      key={tid}
                      onClick={() => removeTeam(tid)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border transition-all hover:opacity-70 uppercase tracking-wide"
                      style={{ backgroundColor: team.color + '20', borderColor: team.color + '60', color: team.color }}
                    >
                      <TeamLogo team={team} size={14} className="inline-block" />
                      {team.name}
                      <X size={10} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Teams flat list */}
          {filteredTeams.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-paper-dark border-b border-t border-rule/60">
                <span className="text-[9px] font-bold uppercase tracking-widest text-ink-faint">Teams</span>
              </div>
              {filteredTeams.map((team) => {
                const followed = myTeamIds.includes(team.id);
                const showingPicker = fandomPickerFor === team.id;
                return (
                  <div key={team.id} className="border-b border-rule/40">
                    <div
                      className="flex items-center gap-3 px-5 py-2.5 bg-paper hover:bg-paper-dark transition-colors"
                      style={{ borderLeftWidth: '3px', borderLeftColor: team.color + '70', borderLeftStyle: 'solid' }}
                    >
                      <Link href={`/teams/${team.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                        <TeamLogo team={team} size={28} />
                        <div>
                          <p className="font-bold text-ink text-sm">{teamDisplayName(team)}</p>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-faint">{team.league}</p>
                        </div>
                      </Link>
                      <button
                        onClick={() => {
                          if (followed) { removeTeam(team.id); }
                          else { setFandomPickerFor(showingPicker ? null : team.id); }
                        }}
                        className={`shrink-0 flex items-center justify-center h-8 w-8 rounded-full font-bold text-sm transition-all border-2 ${
                          followed ? 'bg-paper border-ink text-ink'
                          : showingPicker ? 'bg-ink border-ink text-paper'
                          : 'text-paper border-transparent hover:opacity-80'
                        }`}
                        style={followed || showingPicker ? {} : { backgroundColor: team.color }}
                        title={followed ? 'Unfollow' : 'Follow team'}
                      >
                        {followed ? <Check size={14} /> : <Plus size={14} />}
                      </button>
                    </div>
                    {showingPicker && (
                      <div className="px-5 py-3 bg-paper-dark flex flex-col gap-2" style={{ borderLeftWidth: '3px', borderLeftColor: team.color + '70', borderLeftStyle: 'solid' }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">Select your fandom level:</p>
                        <div className="grid grid-cols-4 gap-2">
                          {FANDOM_OPTIONS.map(({ level, label, emoji }) => (
                            <button
                              key={level}
                              onClick={() => addTeamWithFandom(team.id, level)}
                              className="flex flex-col items-center gap-1 py-2.5 border-2 border-rule rounded-xl bg-paper hover:border-ink hover:bg-paper-dark transition-all"
                            >
                              <span className="text-lg">{emoji}</span>
                              <span className="text-[9px] font-bold uppercase tracking-wide text-ink leading-tight text-center px-0.5">{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Leagues flat list */}
          {filteredLeagues.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-paper-dark border-b border-t border-rule/60">
                <span className="text-[9px] font-bold uppercase tracking-widest text-ink-faint">Leagues</span>
              </div>
              {filteredLeagues.map((league) => {
                const leagueFollowed = myLeagueIds.includes(league.id);
                return (
                  <div key={league.id} className="flex items-center gap-3 px-4 py-3 border-b border-rule/40 hover:bg-paper-dark transition-colors"
                    style={{ borderLeftWidth: '4px', borderLeftColor: league.color, borderLeftStyle: 'solid' }}
                  >
                    <Link
                      href={`/leagues/${league.id}`}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-xl shrink-0 hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: league.color + '30', border: `2px solid ${league.color}60` }}
                    >
                      {league.emoji}
                    </Link>
                    <Link href={`/leagues/${league.id}`} className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
                      <p className="font-bold text-ink text-sm">{league.name}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-ink-faint">{league.country} · {league.sport}</p>
                    </Link>
                    <button
                      onClick={() => toggleLeague(league.id)}
                      className={`shrink-0 flex items-center justify-center h-8 w-8 rounded-full font-bold text-sm transition-all border-2 ${
                        leagueFollowed ? 'bg-paper border-ink text-ink' : 'text-paper border-transparent hover:opacity-80'
                      }`}
                      style={leagueFollowed ? {} : { backgroundColor: league.color }}
                      title={leagueFollowed ? 'Unfollow league' : 'Follow league'}
                    >
                      {leagueFollowed ? <Check size={14} /> : <Plus size={14} />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {filteredTeams.length === 0 && filteredLeagues.length === 0 && query.length > 0 && (
            <div className="text-center py-12 px-5">
              <p className="font-display text-3xl mb-2 text-ink-faint">🔍</p>
              <p className="font-display font-bold text-ink">No results found</p>
              <p className="text-xs text-ink-muted mt-1 italic">Try a team name, city, or league</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
