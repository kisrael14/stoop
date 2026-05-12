'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ChevronRight, Check, GripVertical } from 'lucide-react';
import { TEAMS, USERS } from '@/lib/mock-data';
import type { Team, FanTeam, User } from '@/lib/types';

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  // Step 1 state
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');

  // Step 2 state
  const [teamSearch, setTeamSearch] = useState('');
  const [fanTeams, setFanTeams] = useState<FanTeam[]>([]);

  // Step 3 state
  const [following, setFollowing] = useState<string[]>([]);

  const filteredTeams = TEAMS.filter(
    (t) =>
      !fanTeams.find((ft) => ft.team.id === t.id) &&
      (t.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
        t.city.toLowerCase().includes(teamSearch.toLowerCase()) ||
        t.league.toLowerCase().includes(teamSearch.toLowerCase()))
  );

  const addTeam = (team: Team) => {
    setFanTeams((prev) => [...prev, { team, rank: prev.length + 1 }]);
    setTeamSearch('');
  };

  const removeTeam = (teamId: string) => {
    setFanTeams((prev) =>
      prev
        .filter((ft) => ft.team.id !== teamId)
        .map((ft, i) => ({ ...ft, rank: i + 1 }))
    );
  };

  const suggestedUsers = USERS.filter((u) => u.id !== 'me').slice(0, 4);

  const toggleFollow = (userId: string) => {
    setFollowing((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const canAdvanceStep1 = displayName.trim() && username.trim();
  const canAdvanceStep2 = fanTeams.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="text-3xl">🏟️</span>
          <h1 className="text-2xl font-bold text-white">Stoop Sports</h1>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2">
          {([1, 2, 3] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  step > s
                    ? 'bg-orange-500 text-white'
                    : step === s
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {step > s ? <Check size={14} /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`h-0.5 w-8 rounded-full transition-colors ${
                    step > s ? 'bg-orange-500' : 'bg-slate-800'
                  }`}
                />
              )}
            </div>
          ))}
          <span className="ml-2 text-sm text-slate-400">
            {step === 1 ? 'Your Info' : step === 2 ? 'Your Teams' : 'Your Neighborhood'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8">
        {/* Step 1 */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="mb-1 text-xl font-bold text-white">Create your profile</h2>
              <p className="text-sm text-slate-400">Set up your fan identity</p>
            </div>

            {/* Avatar placeholder */}
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 text-4xl">
                🤙
              </div>
              <button className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors">
                Add photo
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Jordan Hayes"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                    placeholder="jhayes23"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-8 pr-4 text-white placeholder-slate-500 outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Bio <span className="text-slate-500">(optional)</span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your neighborhood who you are..."
                  rows={3}
                  maxLength={120}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-orange-500 resize-none transition-colors"
                />
                <p className="mt-1 text-right text-xs text-slate-500">{bio.length}/120</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="mb-1 text-xl font-bold text-white">Build your fandom</h2>
              <p className="text-sm text-slate-400">
                Search for teams, leagues, or events. Drag to rank them.
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                placeholder="Search NFL, NBA, teams..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-10 pr-4 text-white placeholder-slate-500 outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            {/* Search results */}
            {teamSearch && (
              <div className="rounded-xl border border-slate-700 bg-slate-900 overflow-hidden">
                {filteredTeams.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-500">No results found</p>
                ) : (
                  filteredTeams.slice(0, 5).map((team) => (
                    <button
                      key={team.id}
                      onClick={() => addTeam(team)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-800 transition-colors border-b border-slate-800 last:border-0"
                    >
                      <span className="text-2xl">{team.emoji}</span>
                      <div className="flex-1">
                        <p className="font-medium text-white">
                          {team.city} {team.name}
                        </p>
                        <p className="text-xs text-slate-400">{team.league}</p>
                      </div>
                      <span className="text-xs font-medium text-orange-400">+ Add</span>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Selected teams */}
            {fanTeams.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-slate-400">
                  Your teams — ranked by loyalty
                </p>
                {fanTeams.map((ft, index) => (
                  <div
                    key={ft.team.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
                  >
                    <GripVertical size={16} className="text-slate-600 cursor-grab" />
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: ft.team.color }}
                    >
                      {index + 1}
                    </span>
                    <span className="text-xl">{ft.team.emoji}</span>
                    <div className="flex-1">
                      <p className="font-medium text-white">
                        {ft.team.city} {ft.team.name}
                      </p>
                      <p className="text-xs text-slate-400">{ft.team.league}</p>
                    </div>
                    <button
                      onClick={() => removeTeam(ft.team.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {fanTeams.length === 0 && !teamSearch && (
              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-10 text-center">
                <p className="text-3xl mb-2">🏆</p>
                <p className="text-slate-400">Search for your first team above</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="mb-1 text-xl font-bold text-white">Find your neighborhood</h2>
              <p className="text-sm text-slate-400">
                Follow people to add them to your stoop. You can always do this later.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {suggestedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-2xl">
                    {user.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{user.displayName}</p>
                    <p className="text-sm text-slate-400">@{user.username}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {user.fanTeams.slice(0, 2).map((ft) => (
                        <span
                          key={ft.team.id}
                          className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                          style={{ backgroundColor: ft.team.color + '80' }}
                        >
                          {ft.team.emoji} {ft.team.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFollow(user.id)}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                      following.includes(user.id)
                        ? 'bg-slate-700 text-slate-300'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    {following.includes(user.id) ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="sticky bottom-0 border-t border-slate-800 bg-slate-950 px-6 py-4">
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep((prev) => (prev - 1) as Step)}
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Back
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep((prev) => (prev + 1) as Step)}
              disabled={step === 1 ? !canAdvanceStep1 : !canAdvanceStep2}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Continue
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => router.push('/stoop')}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white hover:bg-orange-600 transition-colors"
            >
              Enter Your Stoop 🏟️
            </button>
          )}
        </div>

        {step === 3 && (
          <button
            onClick={() => router.push('/stoop')}
            className="mt-3 w-full text-center text-sm text-slate-500 hover:text-slate-400"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
