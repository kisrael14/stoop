'use client';

import { useState } from 'react';
import { X, Search, Check, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { ALL_TEAMS } from '@/lib/teams-data';
import type { FandomLevel } from '@/lib/types';
import TeamLogo from '@/components/TeamLogo';

const FANDOM_OPTIONS: { level: FandomLevel; label: string; emoji: string }[] = [
  { level: 'diehard',      label: 'Diehard',      emoji: '🔥' },
  { level: 'supporter',    label: 'Supporter',    emoji: '✊' },
  { level: 'fair-weather', label: 'Fair Weather', emoji: '☁️' },
  { level: 'casual',       label: 'Casual',       emoji: '👋' },
];

const UNIQUE_LEAGUES = [...new Set(ALL_TEAMS.map((t) => t.league))].sort();

const LEAGUE_COLORS: Record<string, string> = {
  NFL: 'bg-blue-900/60 text-blue-200',
  NBA: 'bg-red-900/60 text-red-200',
  MLB: 'bg-blue-800/60 text-blue-200',
  NHL: 'bg-slate-700/60 text-slate-200',
  MLS: 'bg-green-900/60 text-green-200',
};

interface Props {
  onClose: () => void;
}

type Tab = 'teams' | 'leagues';

export default function FollowTeamsModal({ onClose }: Props) {
  const { user: authUser, refreshProfile } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;

  const [tab, setTab] = useState<Tab>('teams');
  const [query, setQuery] = useState('');
  const [fandomPickerFor, setFandomPickerFor] = useState<string | null>(null);
  const [busy, setBusy] = useState<Set<string>>(new Set());

  const myTeamIds = new Set((authUser?.teams ?? []).map((t) => t.team_id));
  const myLeagueIds = new Set(authUser?.leagues ?? []);

  const filteredTeams = ALL_TEAMS.filter((t) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.city.toLowerCase().includes(q) || t.league.toLowerCase().includes(q);
  });

  const filteredLeagues = UNIQUE_LEAGUES.filter((l) =>
    !query.trim() || l.toLowerCase().includes(query.toLowerCase())
  );

  const addTeam = async (teamId: string, level: FandomLevel) => {
    if (!authUser) return;
    setBusy((p) => new Set(p).add(teamId));
    await supabase.from('user_teams').upsert({ user_id: authUser.id, team_id: teamId, fandom_level: level });
    await refreshProfile();
    setFandomPickerFor(null);
    setBusy((p) => { const s = new Set(p); s.delete(teamId); return s; });
  };

  const removeTeam = async (teamId: string) => {
    if (!authUser) return;
    setBusy((p) => new Set(p).add(teamId));
    await supabase.from('user_teams').delete().eq('user_id', authUser.id).eq('team_id', teamId);
    await refreshProfile();
    setBusy((p) => { const s = new Set(p); s.delete(teamId); return s; });
  };

  const toggleLeague = async (leagueId: string) => {
    if (!authUser) return;
    setBusy((p) => new Set(p).add(leagueId));
    if (myLeagueIds.has(leagueId)) {
      await supabase.from('user_leagues').delete().eq('user_id', authUser.id).eq('league_id', leagueId);
    } else {
      await supabase.from('user_leagues').insert({ user_id: authUser.id, league_id: leagueId });
    }
    await refreshProfile();
    setBusy((p) => { const s = new Set(p); s.delete(leagueId); return s; });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-nav-bg/80 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-4 top-[8%] z-50 bg-paper-dark border border-rule shadow-2xl max-w-sm mx-auto max-h-[84vh] flex flex-col rounded-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-nav-bg shrink-0">
          <p className="font-display font-bold text-ink text-base">🏅 Follow Teams & Leagues</p>
          <button onClick={onClose} className="text-ink/60 hover:text-ink transition-colors"><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-rule shrink-0">
          {(['teams', 'leagues'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setQuery(''); setFandomPickerFor(null); }}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors ${
                tab === t ? 'text-masthead border-b-2 border-masthead' : 'text-ink-faint hover:text-ink'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-rule shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setFandomPickerFor(null); }}
              placeholder={tab === 'teams' ? 'Search teams…' : 'Search leagues…'}
              autoFocus
              className="w-full border border-rule focus:border-masthead bg-paper pl-9 pr-3 py-2.5 text-sm text-ink placeholder-ink-faint outline-none transition-colors rounded-lg"
            />
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1">
          {tab === 'teams' && filteredTeams.map((team) => {
            const followed = myTeamIds.has(team.id);
            const picking = fandomPickerFor === team.id;
            const isBusy = busy.has(team.id);
            return (
              <div key={team.id} className="border-b border-rule/40 last:border-0">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full shrink-0 p-1"
                    style={{ backgroundColor: team.color + '25', border: `2px solid ${team.color}50` }}
                  >
                    <TeamLogo team={team} size={26} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink text-sm truncate">{team.city} {team.name}</p>
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${LEAGUE_COLORS[team.league] ?? 'bg-paper text-ink-faint'}`}>
                      {team.league}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (followed) { removeTeam(team.id); }
                      else { setFandomPickerFor(picking ? null : team.id); }
                    }}
                    disabled={isBusy}
                    className={`shrink-0 flex items-center justify-center h-8 w-8 rounded-full border-2 transition-all disabled:opacity-40 ${
                      followed
                        ? 'bg-paper-dark border-rule text-ink-muted'
                        : picking
                        ? 'bg-nav-bg border-rule text-ink'
                        : 'border-transparent text-[#12111a]'
                    }`}
                    style={followed || picking ? {} : { backgroundColor: team.color }}
                    title={followed ? 'Unfollow' : 'Follow'}
                  >
                    {followed ? <Check size={14} /> : <Plus size={14} />}
                  </button>
                </div>

                {picking && (
                  <div className="px-4 pb-3">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-ink-muted mb-2">How big a fan are you?</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {FANDOM_OPTIONS.map(({ level, label, emoji }) => (
                        <button
                          key={level}
                          onClick={() => addTeam(team.id, level)}
                          className="flex flex-col items-center gap-1 py-2 border-2 border-rule rounded-xl bg-paper hover:border-ink hover:bg-paper-dark transition-all"
                        >
                          <span className="text-base">{emoji}</span>
                          <span className="text-[8px] font-bold uppercase tracking-wide text-ink leading-tight text-center">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {tab === 'leagues' && filteredLeagues.map((leagueId) => {
            const followed = myLeagueIds.has(leagueId);
            const isBusy = busy.has(leagueId);
            const leagueTeams = ALL_TEAMS.filter((t) => t.league === leagueId);
            const sample = leagueTeams[0];
            return (
              <div key={leagueId} className="flex items-center gap-3 px-4 py-3 border-b border-rule/40 last:border-0">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full shrink-0 text-xl"
                  style={{ backgroundColor: (sample?.color ?? '#444') + '25', border: `2px solid ${(sample?.color ?? '#444')}50` }}
                >
                  {sample?.emoji ?? '🏅'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink text-sm">{leagueId}</p>
                  <p className="text-[10px] text-ink-faint">{leagueTeams.length} teams</p>
                </div>
                <button
                  onClick={() => toggleLeague(leagueId)}
                  disabled={isBusy}
                  className={`shrink-0 flex items-center justify-center h-8 w-8 rounded-full border-2 transition-all disabled:opacity-40 ${
                    followed
                      ? 'bg-paper-dark border-rule text-ink-muted'
                      : 'bg-masthead border-transparent text-[#12111a] hover:bg-masthead/80'
                  }`}
                  title={followed ? 'Unfollow' : 'Follow'}
                >
                  {followed ? <Check size={14} /> : <Plus size={14} />}
                </button>
              </div>
            );
          })}

          {tab === 'teams' && filteredTeams.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-ink-faint italic">No teams found for &ldquo;{query}&rdquo;</p>
          )}
          {tab === 'leagues' && filteredLeagues.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-ink-faint italic">No leagues found for &ldquo;{query}&rdquo;</p>
          )}
        </div>
      </div>
    </>
  );
}
