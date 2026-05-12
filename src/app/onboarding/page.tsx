'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ChevronRight, Check, GripVertical } from 'lucide-react';
import { TEAMS, USERS } from '@/lib/mock-data';
import type { Team, FanTeam, FandomLevel } from '@/lib/types';

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');

  const [teamSearch, setTeamSearch] = useState('');
  const [fanTeams, setFanTeams] = useState<FanTeam[]>([]);

  const [following, setFollowing] = useState<string[]>([]);

  const filteredTeams = TEAMS.filter(
    (t) =>
      !fanTeams.find((ft) => ft.team.id === t.id) &&
      (t.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
        t.city.toLowerCase().includes(teamSearch.toLowerCase()) ||
        t.league.toLowerCase().includes(teamSearch.toLowerCase()))
  );

  const addTeam = (team: Team) => {
    setFanTeams((prev) => [...prev, { team, rank: prev.length + 1, fandomLevel: 'casual' as FandomLevel }]);
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

  const stepLabels = ['Your Info', 'Your Teams', 'Find Neighbors'];

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {/* Masthead */}
      <div className="px-6 pt-12 pb-6 bg-ink">
        <h1 className="font-display text-3xl font-black text-paper mb-1">Stoop Sports</h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-paper/50 mb-5">Setup Your Stoop</p>

        {/* Step indicators */}
        <div className="flex items-center gap-3">
          {([1, 2, 3] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center text-xs font-bold transition-colors ${
                  step > s
                    ? 'bg-field text-paper'
                    : step === s
                    ? 'bg-press text-paper'
                    : 'bg-ink-muted/30 text-paper/40'
                }`}
              >
                {step > s ? <Check size={13} /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`h-0.5 w-6 transition-colors ${
                    step > s ? 'bg-field' : 'bg-ink-muted/30'
                  }`}
                />
              )}
            </div>
          ))}
          <span className="ml-1 text-[11px] font-bold uppercase tracking-widest text-paper/60">
            {stepLabels[step - 1]}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8 pt-6">
        {/* Step 1 */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="font-display text-xl font-bold text-ink mb-1">Claim your spot</h2>
              <p className="text-sm text-ink-muted italic">Set up your fan identity</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-paper-dark border-2 border-rule text-4xl">
                🤙
              </div>
              <button className="border border-rule px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink-muted hover:bg-paper-dark transition-colors">
                Add photo
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Jordan Hayes"
                  className="w-full border border-rule bg-paper-dark px-4 py-3 text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors text-sm"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted font-bold">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                    placeholder="jhayes23"
                    className="w-full border border-rule bg-paper-dark py-3 pl-7 pr-4 text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                  Bio <span className="text-ink-faint normal-case">(optional)</span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your neighborhood who you are..."
                  rows={3}
                  maxLength={120}
                  className="w-full border border-rule bg-paper-dark px-4 py-3 text-ink placeholder-ink-faint outline-none focus:border-ink resize-none transition-colors text-sm"
                />
                <p className="mt-1 text-right text-[10px] text-ink-faint font-mono">{bio.length}/120</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="font-display text-xl font-bold text-ink mb-1">Build your fandom</h2>
              <p className="text-sm text-ink-muted italic">Search teams, leagues, or events. Rank by loyalty.</p>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                type="text"
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                placeholder="Search NFL, NBA, teams..."
                className="w-full border border-rule bg-paper-dark py-3 pl-9 pr-4 text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors text-sm"
              />
            </div>

            {teamSearch && (
              <div className="border border-rule bg-paper overflow-hidden">
                {filteredTeams.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-ink-muted italic">No results found</p>
                ) : (
                  filteredTeams.slice(0, 5).map((team, i) => (
                    <button
                      key={team.id}
                      onClick={() => addTeam(team)}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-paper-dark transition-colors border-b border-rule/50 last:border-0`}
                    >
                      <span className="text-2xl">{team.emoji}</span>
                      <div className="flex-1">
                        <p className="font-bold text-ink text-sm">{team.city} {team.name}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-ink-faint">{team.league}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-press">+ Add</span>
                    </button>
                  ))
                )}
              </div>
            )}

            {fanTeams.length > 0 && (
              <div className="flex flex-col gap-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-2">
                  Your teams — ranked by loyalty
                </p>
                {fanTeams.map((ft, index) => (
                  <div
                    key={ft.team.id}
                    className="flex items-center gap-3 border-b border-rule/50 bg-paper px-4 py-3 last:border-0"
                    style={{ borderLeftWidth: '3px', borderLeftColor: ft.team.color, borderLeftStyle: 'solid' }}
                  >
                    <GripVertical size={15} className="text-ink-faint cursor-grab" />
                    <span
                      className="flex h-6 w-6 items-center justify-center text-xs font-bold text-paper"
                      style={{ backgroundColor: ft.team.color }}
                    >
                      {index + 1}
                    </span>
                    <span className="text-xl">{ft.team.emoji}</span>
                    <div className="flex-1">
                      <p className="font-bold text-ink text-sm">{ft.team.city} {ft.team.name}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-ink-faint">{ft.team.league}</p>
                    </div>
                    <button
                      onClick={() => removeTeam(ft.team.id)}
                      className="text-ink-faint hover:text-masthead transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {fanTeams.length === 0 && !teamSearch && (
              <div className="border-2 border-dashed border-rule px-6 py-10 text-center">
                <p className="font-display text-3xl mb-2 text-ink-faint">🏆</p>
                <p className="font-display font-bold text-ink">Search for your first team</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="font-display text-xl font-bold text-ink mb-1">Find your neighbors</h2>
              <p className="text-sm text-ink-muted italic">Follow fans to build your stoop. Do this anytime.</p>
            </div>

            <div className="flex flex-col gap-0">
              {suggestedUsers.map((user, i) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 px-4 py-3.5 bg-paper hover:bg-paper-dark transition-colors border-b border-rule/50 ${i === 0 ? 'border-t border-rule/50' : ''}`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-dark border border-rule text-2xl">
                    {user.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink">{user.displayName}</p>
                    <p className="text-[11px] text-ink-faint font-mono">@{user.username}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {user.fanTeams.slice(0, 2).map((ft) => (
                        <span
                          key={ft.team.id}
                          className="px-2 py-0.5 text-[10px] font-bold text-paper uppercase tracking-wide"
                          style={{ backgroundColor: ft.team.color + '80' }}
                        >
                          {ft.team.emoji} {ft.team.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFollow(user.id)}
                    className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      following.includes(user.id)
                        ? 'border border-rule bg-paper-dark text-ink-muted'
                        : 'bg-ink text-paper hover:bg-ink/80'
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
      <div className="sticky bottom-0 border-t-2 border-rule bg-paper px-6 py-4">
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep((prev) => (prev - 1) as Step)}
              className="border border-rule px-5 py-3 text-xs font-bold uppercase tracking-wider text-ink-muted hover:bg-paper-dark transition-colors"
            >
              Back
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep((prev) => (prev + 1) as Step)}
              disabled={step === 1 ? !canAdvanceStep1 : !canAdvanceStep2}
              className="flex flex-1 items-center justify-center gap-2 bg-ink py-3 text-xs font-bold text-paper uppercase tracking-widest hover:bg-ink/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Continue
              <ChevronRight size={15} />
            </button>
          ) : (
            <button
              onClick={() => router.push('/stoop')}
              className="flex flex-1 items-center justify-center gap-2 bg-ink py-3 text-xs font-bold text-paper uppercase tracking-widest hover:bg-ink/80 transition-colors"
            >
              Enter the Stoop 🏟️
            </button>
          )}
        </div>

        {step === 3 && (
          <button
            onClick={() => router.push('/stoop')}
            className="mt-3 w-full text-center text-xs text-ink-faint hover:text-ink-muted italic"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
