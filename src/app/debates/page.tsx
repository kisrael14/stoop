'use client';

import { useState } from 'react';
import { Swords, Trophy, TrendingUp } from 'lucide-react';
import { DEBATES, getUserById, ME } from '@/lib/mock-data';
import { timeAgo, voteLeader } from '@/lib/utils';
import type { Debate, VoteChoice } from '@/lib/types';

type Tab = 'active' | 'stats';

export default function DebatesPage() {
  const [tab, setTab] = useState<Tab>('active');
  const [debates, setDebates] = useState(DEBATES);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const activeDebates = debates.filter((d) => d.status === 'active');
  const resolvedDebates = debates.filter((d) => d.status === 'resolved');

  const castVote = (debateId: string, choice: VoteChoice) => {
    setDebates((prev) =>
      prev.map((d) => {
        if (d.id !== debateId) return d;
        const alreadyVoted = d.votes.find((v) => v.userId === 'me');
        if (alreadyVoted) return d;
        const newVotes = [...d.votes, { userId: 'me', choice }];

        // Auto-resolve if majority reached (more than half of 5 members voted and one leads)
        const counts = voteLeader(newVotes);
        const totalMembers = 5;
        const leading = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        if (leading && leading[1] > totalMembers / 2) {
          return {
            ...d,
            votes: newVotes,
            status: 'resolved' as const,
            resolution: leading[0] as VoteChoice,
            resolvedAt: new Date().toISOString(),
          };
        }
        return { ...d, votes: newVotes };
      })
    );
  };

  const stats = ME.stats;

  return (
    <div className="flex flex-col bg-slate-950 min-h-full">
      {/* Header */}
      <div className="px-5 pt-10 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <Swords size={22} className="text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Debates</h1>
        </div>
        <div className="flex gap-1 bg-slate-900 rounded-xl p-1">
          {(['active', 'stats'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors capitalize ${
                tab === t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'active' ? 'Active' : 'My Stats'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'active' && (
        <div className="px-5 py-4 flex flex-col gap-4 pb-8">
          {/* Active debates */}
          {activeDebates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-3xl mb-2">⚔️</p>
              <p className="text-slate-400">No active debates. Start one in a chat.</p>
            </div>
          )}

          {activeDebates.map((debate) => (
            <DebateCard
              key={debate.id}
              debate={debate}
              expanded={expandedId === debate.id}
              onToggle={() => setExpandedId(expandedId === debate.id ? null : debate.id)}
              onVote={castVote}
            />
          ))}

          {/* Archived / resolved */}
          {resolvedDebates.length > 0 && (
            <>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
                Archived
              </p>
              {resolvedDebates.map((debate) => (
                <DebateCard
                  key={debate.id}
                  debate={debate}
                  expanded={expandedId === debate.id}
                  onToggle={() => setExpandedId(expandedId === debate.id ? null : debate.id)}
                  onVote={castVote}
                  archived
                />
              ))}
            </>
          )}
        </div>
      )}

      {tab === 'stats' && (
        <div className="px-5 py-5 flex flex-col gap-4 pb-8">
          {/* Win rate card */}
          <div className="rounded-2xl border border-blue-900/40 bg-blue-950/20 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={18} className="text-blue-400" />
              <p className="font-semibold text-white">Your Record</p>
            </div>
            <div className="flex justify-around text-center">
              <div>
                <p className="text-3xl font-bold text-green-400">{stats.debatesWon}</p>
                <p className="text-xs text-slate-400 mt-1">Won</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-400">{stats.debatesLost}</p>
                <p className="text-xs text-slate-400 mt-1">Lost</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-400">{stats.debatesDrew}</p>
                <p className="text-xs text-slate-400 mt-1">Draw</p>
              </div>
            </div>
            <div className="mt-4 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{
                  width: `${Math.round((stats.debatesWon / (stats.debatesWon + stats.debatesLost + stats.debatesDrew)) * 100)}%`,
                }}
              />
            </div>
            <p className="mt-1 text-right text-xs text-slate-500">
              {Math.round((stats.debatesWon / (stats.debatesWon + stats.debatesLost + stats.debatesDrew)) * 100)}% win rate
            </p>
          </div>

          {/* Historical debates */}
          <div className="flex items-center gap-2 mt-1">
            <TrendingUp size={16} className="text-slate-400" />
            <p className="text-sm font-semibold text-slate-300">Recent Debates</p>
          </div>
          {DEBATES.filter((d) => d.party1Id === 'me' || d.party2Id === 'me').map((debate) => {
            const isParty1 = debate.party1Id === 'me';
            const won =
              debate.status === 'resolved' &&
              ((isParty1 && debate.resolution === 'party1') ||
                (!isParty1 && debate.resolution === 'party2'));
            const lost =
              debate.status === 'resolved' &&
              ((isParty1 && debate.resolution === 'party2') ||
                (!isParty1 && debate.resolution === 'party1'));
            const drew = debate.status === 'resolved' && debate.resolution === 'draw';

            return (
              <div
                key={debate.id}
                className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 flex items-start gap-3"
              >
                <div
                  className={`mt-0.5 flex-shrink-0 h-2.5 w-2.5 rounded-full ${
                    won ? 'bg-green-500' : lost ? 'bg-red-500' : drew ? 'bg-slate-500' : 'bg-blue-500'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 line-clamp-1">{debate.claim}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {debate.chatName} · {timeAgo(debate.createdAt)}
                  </p>
                </div>
                <span
                  className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                    won
                      ? 'bg-green-900/60 text-green-400'
                      : lost
                      ? 'bg-red-900/60 text-red-400'
                      : drew
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-blue-900/60 text-blue-400'
                  }`}
                >
                  {won ? 'W' : lost ? 'L' : drew ? 'D' : 'Active'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DebateCard({
  debate,
  expanded,
  onToggle,
  onVote,
  archived = false,
}: {
  debate: Debate;
  expanded: boolean;
  onToggle: () => void;
  onVote: (id: string, choice: VoteChoice) => void;
  archived?: boolean;
}) {
  const p1 = getUserById(debate.party1Id);
  const p2 = getUserById(debate.party2Id);
  const myVote = debate.votes.find((v) => v.userId === 'me');
  const counts = voteLeader(debate.votes);
  const totalVotes = debate.votes.length;

  const getVotePercent = (choice: VoteChoice) =>
    totalVotes > 0 ? Math.round(((counts[choice] ?? 0) / totalVotes) * 100) : 0;

  const winnerLabel =
    debate.resolution === 'party1'
      ? p1?.displayName
      : debate.resolution === 'party2'
      ? p2?.displayName
      : 'Draw';

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-opacity ${
        archived ? 'opacity-50' : ''
      } ${debate.status === 'resolved' ? 'border-slate-800' : 'border-blue-900/40'}`}
    >
      <button
        onClick={onToggle}
        className={`w-full text-left px-4 py-4 ${
          archived ? 'bg-slate-900/50' : 'bg-blue-950/20 hover:bg-blue-950/30'
        } transition-colors`}
      >
        <div className="flex items-center gap-2 mb-2">
          <Swords size={13} className={archived ? 'text-slate-600' : 'text-blue-400'} />
          <span className={`text-xs font-semibold uppercase tracking-wide ${archived ? 'text-slate-600' : 'text-blue-400'}`}>
            Debate
          </span>
          <span className="text-xs text-slate-500 ml-1">{debate.chatName}</span>
          {debate.status === 'resolved' && (
            <span className="ml-auto text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
              Resolved
            </span>
          )}
        </div>

        <p className="text-sm text-slate-100 leading-snug mb-3">
          &ldquo;{debate.claim}&rdquo;
        </p>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 bg-slate-800 rounded-full px-2 py-1">
            <span>{p1?.avatar}</span>
            <span className="text-slate-300">{p1?.displayName.split(' ')[0]}</span>
          </span>
          <span className="text-slate-600">vs</span>
          <span className="flex items-center gap-1 bg-slate-800 rounded-full px-2 py-1">
            <span>{p2?.avatar}</span>
            <span className="text-slate-300">{p2?.displayName.split(' ')[0]}</span>
          </span>
          <span className="ml-auto text-slate-500">{totalVotes} votes · {timeAgo(debate.createdAt)}</span>
        </div>

        {debate.status === 'resolved' && winnerLabel && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2">
            <Trophy size={14} className="text-yellow-400" />
            <span className="text-xs font-semibold text-white">Winner: {winnerLabel}</span>
          </div>
        )}
      </button>

      {/* Expanded vote section */}
      {expanded && debate.status === 'active' && (
        <div className="border-t border-slate-800 bg-slate-900 px-4 py-4">
          <p className="text-xs font-semibold text-slate-400 mb-3">Vote on who won</p>

          {/* Vote bars */}
          <div className="flex flex-col gap-2 mb-4">
            {([
              { choice: 'party1' as VoteChoice, user: p1, label: p1?.displayName ?? '' },
              { choice: 'party2' as VoteChoice, user: p2, label: p2?.displayName ?? '' },
              { choice: 'draw' as VoteChoice, user: null, label: 'Draw' },
            ]).map(({ choice, user, label }) => (
              <div key={choice}>
                <div className="flex items-center justify-between mb-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    {user && <span>{user.avatar}</span>}
                    <span>{label}</span>
                    {myVote?.choice === choice && (
                      <span className="text-orange-400 font-semibold">(Your vote)</span>
                    )}
                  </span>
                  <span>{getVotePercent(choice)}% · {counts[choice] ?? 0} votes</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${getVotePercent(choice)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {!myVote ? (
            <div className="flex gap-2">
              {([
                { choice: 'party1' as VoteChoice, label: `${p1?.displayName.split(' ')[0]} Won` },
                { choice: 'party2' as VoteChoice, label: `${p2?.displayName.split(' ')[0]} Won` },
                { choice: 'draw' as VoteChoice, label: 'Draw' },
              ]).map(({ choice, label }) => (
                <button
                  key={choice}
                  onClick={() => onVote(debate.id, choice)}
                  className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-xs text-slate-500">
              You voted for{' '}
              <span className="text-blue-400 font-semibold">
                {myVote.choice === 'party1' ? p1?.displayName : myVote.choice === 'party2' ? p2?.displayName : 'Draw'}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
