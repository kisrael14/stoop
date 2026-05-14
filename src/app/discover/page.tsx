'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, UserPlus, UserCheck, Phone, AtSign, X } from 'lucide-react';
import { USERS, TEAMS, ME } from '@/lib/mock-data';
import { ALL_LEAGUES } from '@/lib/leagues-data';
import { teamDisplayName } from '@/lib/utils';
import type { Team } from '@/lib/types';
import TeamLogo from '@/components/TeamLogo';

type SearchMode = 'people' | 'teams' | 'leagues';

export default function DiscoverPage() {
  const [mode, setMode] = useState<SearchMode>('people');
  const [query, setQuery] = useState('');
  const [following, setFollowing] = useState<string[]>(ME.followingIds);
  const [myTeamIds, setMyTeamIds] = useState<string[]>(ME.fanTeams.map((ft) => ft.team.id));

  const otherUsers = USERS.filter((u) => u.id !== 'me');

  const isPhone = /^\+?[\d\s\-()]{4,}$/.test(query.replace(/\s/g, ''));
  const queryType = query.length >= 2 ? (isPhone ? 'phone' : 'username') : null;

  const filteredUsers = query.length >= 1
    ? otherUsers.filter((u) =>
        u.displayName.toLowerCase().includes(query.toLowerCase()) ||
        u.username.toLowerCase().includes(query.toLowerCase())
      )
    : otherUsers;

  const filteredTeams = query.length >= 1
    ? TEAMS.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.city.toLowerCase().includes(query.toLowerCase()) ||
          t.league.toLowerCase().includes(query.toLowerCase())
      )
    : TEAMS;

  const toggleFollow = (userId: string) => {
    setFollowing((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleTeam = (teamId: string) => {
    setMyTeamIds((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  };

  const filteredLeagues = query.length >= 1
    ? ALL_LEAGUES.filter(
        (l) =>
          l.name.toLowerCase().includes(query.toLowerCase()) ||
          l.shortName.toLowerCase().includes(query.toLowerCase()) ||
          l.country.toLowerCase().includes(query.toLowerCase()) ||
          l.sport.toLowerCase().includes(query.toLowerCase())
      )
    : ALL_LEAGUES;

  const leagueGroups = filteredTeams.reduce<Record<string, Team[]>>((acc, team) => {
    if (!acc[team.league]) acc[team.league] = [];
    acc[team.league].push(team);
    return acc;
  }, {});

  return (
    <div className="flex flex-col bg-paper min-h-full">
      {/* Masthead */}
      <div className="sticky top-0 z-10 bg-paper/97 backdrop-blur-sm px-5 pt-10 pb-4 border-b-2 border-ink">
        <h1 className="font-display text-2xl font-bold text-ink mb-1">Discover</h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint mb-4">Find Neighbors · Follow Teams</p>

        {/* Mode toggle */}
        <div className="flex gap-0 border border-ink overflow-hidden mb-4">
          {(['people', 'teams', 'leagues'] as SearchMode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setQuery(''); }}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors border-r last:border-r-0 border-ink ${
                mode === m ? 'bg-ink text-paper' : 'bg-paper text-ink-muted hover:bg-paper-dark'
              }`}
            >
              {m === 'people' ? '👥 Neighbors' : m === 'teams' ? '🏆 Teams' : '🌍 Leagues'}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative">
          {queryType === 'phone' ? (
            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          ) : (
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          )}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              mode === 'people'
                ? 'Name, @username, or phone...'
                : mode === 'teams'
                ? 'Search teams, leagues, cities...'
                : 'Search leagues, countries, sports...'
            }
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
            <Phone size={9} className="inline mr-1" />
            Searching by phone number
          </p>
        )}
        {queryType === 'username' && query.startsWith('@') && (
          <p className="mt-1.5 text-[10px] text-ink-faint px-1 font-bold uppercase tracking-wide">
            <AtSign size={9} className="inline mr-1" />
            Searching by username
          </p>
        )}
      </div>

      {/* Neighbors results */}
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
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  following.includes(user.id)
                    ? 'bg-paper-dark border border-rule text-ink-muted hover:bg-paper-deeper'
                    : 'bg-ink text-paper hover:bg-ink/80'
                }`}
              >
                {following.includes(user.id) ? <UserCheck size={12} /> : <UserPlus size={12} />}
                {following.includes(user.id) ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Teams & leagues results */}
      {mode === 'teams' && (
        <div className="px-5 py-4 pb-8">
          {myTeamIds.length > 0 && (
            <div className="mb-5">
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
                      onClick={() => toggleTeam(tid)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-paper border transition-colors hover:opacity-80 uppercase tracking-wide"
                      style={{ backgroundColor: team.color + '40', borderColor: team.color + '80', color: team.color }}
                    >
                      <TeamLogo team={team} size={14} className="inline-block mr-0.5" />{team.name}
                      <X size={10} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {Object.entries(leagueGroups).map(([league, teams]) => (
            <div key={league} className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-faint mb-2 border-b border-rule pb-1">{league}</p>
              <div className="flex flex-col gap-0">
                {teams.map((team, i) => {
                  const added = myTeamIds.includes(team.id);
                  return (
                    <div
                      key={team.id}
                      className={`flex items-center gap-3 px-4 py-3 bg-paper hover:bg-paper-dark transition-colors border-b border-rule/50 ${i === 0 ? 'border-t border-rule/50' : ''}`}
                      style={{ borderLeftWidth: '3px', borderLeftColor: team.color, borderLeftStyle: 'solid' }}
                    >
                      <TeamLogo team={team} size={32} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-ink text-sm">{teamDisplayName(team)}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-ink-faint">{team.league}</p>
                      </div>
                      <button
                        onClick={() => toggleTeam(team.id)}
                        className={`shrink-0 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          added
                            ? 'border border-rule bg-paper-dark text-ink-muted hover:bg-paper-deeper'
                            : 'text-paper hover:opacity-80'
                        }`}
                        style={added ? {} : { backgroundColor: team.color }}
                      >
                        {added ? '✓ Following' : '+ Follow'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leagues results */}
      {mode === 'leagues' && (
        <div className="px-5 py-4 pb-8">
          {filteredLeagues.length === 0 && query.length > 0 && (
            <div className="text-center py-12 px-5">
              <p className="font-display text-3xl mb-2 text-ink-faint">🔍</p>
              <p className="font-display font-bold text-ink">No leagues found</p>
              <p className="text-xs text-ink-muted mt-1 italic">Try a different name or country</p>
            </div>
          )}
          <div className="flex flex-col gap-0">
            {filteredLeagues.map((league, i) => (
              <Link
                key={league.id}
                href={`/leagues/${league.id}`}
                className={`flex items-center gap-3 px-4 py-3 bg-paper hover:bg-paper-dark transition-colors border-b border-rule/50 ${i === 0 ? 'border-t border-rule/50' : ''}`}
                style={{ borderLeftWidth: '3px', borderLeftColor: league.color, borderLeftStyle: 'solid' }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-xl shrink-0"
                  style={{ backgroundColor: league.color + '25', border: `2px solid ${league.color}50` }}
                >
                  {league.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink text-sm">{league.name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-ink-faint">{league.country} · {league.sport}</p>
                </div>
                <span
                  className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 text-paper shrink-0"
                  style={{ backgroundColor: league.color }}
                >
                  {league.shortName}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
