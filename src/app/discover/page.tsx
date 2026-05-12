'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, UserPlus, UserCheck, Phone, AtSign, X } from 'lucide-react';
import { USERS, TEAMS, ME } from '@/lib/mock-data';
import type { Team } from '@/lib/types';

type SearchMode = 'people' | 'teams';

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

  const leagueGroups = filteredTeams.reduce<Record<string, Team[]>>((acc, team) => {
    if (!acc[team.league]) acc[team.league] = [];
    acc[team.league].push(team);
    return acc;
  }, {});

  return (
    <div className="flex flex-col bg-slate-950 min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm px-5 pt-10 pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white mb-4">Discover</h1>

        {/* Mode toggle */}
        <div className="flex gap-1 bg-slate-900 rounded-xl p-1 mb-4">
          {(['people', 'teams'] as SearchMode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setQuery(''); }}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors capitalize ${
                mode === m ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {m === 'people' ? '👥 People' : '🏆 Teams & Leagues'}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative">
          {queryType === 'phone' ? (
            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          ) : (
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          )}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              mode === 'people'
                ? 'Search by name, @username, or phone...'
                : 'Search teams, leagues, or cities...'
            }
            className="w-full rounded-full border border-slate-700 bg-slate-900 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500 transition-colors"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>

        {queryType === 'phone' && (
          <p className="mt-1.5 text-xs text-slate-500 px-1">
            <Phone size={10} className="inline mr-1" />
            Searching by phone number
          </p>
        )}
        {queryType === 'username' && query.startsWith('@') && (
          <p className="mt-1.5 text-xs text-slate-500 px-1">
            <AtSign size={10} className="inline mr-1" />
            Searching by username
          </p>
        )}
      </div>

      {/* People results */}
      {mode === 'people' && (
        <div className="flex flex-col px-5 py-4 gap-3 pb-8">
          {query.length < 1 && (
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Suggested — shared fan bases
            </p>
          )}
          {filteredUsers.length === 0 && query.length > 0 && (
            <div className="text-center py-12">
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-slate-400">No users found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-500 mt-1">Try searching by phone number or @username</p>
            </div>
          )}
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3"
            >
              <Link href={`/users/${user.id}`} className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-2xl shrink-0 hover:ring-2 hover:ring-orange-500 transition-all">
                {user.avatar}
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/users/${user.id}`} className="font-semibold text-white hover:text-orange-400 transition-colors">
                  {user.displayName}
                </Link>
                <p className="text-sm text-slate-400">@{user.username}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {user.fanTeams.slice(0, 3).map((ft) => (
                    <span
                      key={ft.team.id}
                      className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: ft.team.color + '90' }}
                    >
                      {ft.team.emoji} {ft.team.name}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => toggleFollow(user.id)}
                className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
                  following.includes(user.id)
                    ? 'bg-slate-700 text-slate-300'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {following.includes(user.id) ? <UserCheck size={13} /> : <UserPlus size={13} />}
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
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
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
                      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white border transition-colors hover:opacity-80"
                      style={{ backgroundColor: team.color + '40', borderColor: team.color + '80' }}
                    >
                      {team.emoji} {team.name}
                      <X size={10} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {Object.entries(leagueGroups).map(([league, teams]) => (
            <div key={league} className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{league}</p>
              <div className="flex flex-col gap-2">
                {teams.map((team) => {
                  const added = myTeamIds.includes(team.id);
                  return (
                    <div
                      key={team.id}
                      className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3"
                    >
                      <span className="text-2xl">{team.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm">{team.city} {team.name}</p>
                        <p className="text-xs text-slate-400">{team.league}</p>
                      </div>
                      <button
                        onClick={() => toggleTeam(team.id)}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                          added
                            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            : 'bg-orange-500 text-white hover:bg-orange-600'
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
    </div>
  );
}
