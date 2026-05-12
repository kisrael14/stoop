'use client';

import { useState } from 'react';
import { Handshake, Trophy, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { BETS, getUserById, ME } from '@/lib/mock-data';
import { timeAgo } from '@/lib/utils';
import type { Bet } from '@/lib/types';

type Tab = 'active' | 'stats';

export default function BetsPage() {
  const [tab, setTab] = useState<Tab>('active');
  const [bets, setBets] = useState(BETS);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const myBets = bets.filter((b) => b.participantIds.includes('me'));
  const groupBets = bets.filter((b) => !b.participantIds.includes('me'));
  const activeBets = myBets.filter((b) => b.status !== 'resolved');
  const resolvedBets = bets.filter((b) => b.status === 'resolved');

  const proposeResolution = (betId: string, winnerId: string | null) => {
    setBets((prev) =>
      prev.map((b) => {
        if (b.id !== betId) return b;
        const allParticipants = b.participantIds;
        const agreements = [ME.id];

        if (agreements.length === allParticipants.length) {
          return {
            ...b,
            status: 'resolved' as const,
            winnerId: winnerId ?? undefined,
            isPush: winnerId === null,
            resolvedAt: new Date().toISOString(),
          };
        }

        return {
          ...b,
          status: 'awaiting-resolution' as const,
          proposal: {
            proposedBy: ME.id,
            winnerId: winnerId ?? undefined,
            isPush: winnerId === null,
            agreements,
            disputes: [],
          },
        };
      })
    );
  };

  const agreeResolution = (betId: string) => {
    setBets((prev) =>
      prev.map((b) => {
        if (b.id !== betId || !b.proposal) return b;
        const agreements = [...b.proposal.agreements, ME.id];
        if (agreements.length === b.participantIds.length) {
          return {
            ...b,
            status: 'resolved' as const,
            winnerId: b.proposal.winnerId,
            isPush: b.proposal.isPush,
            resolvedAt: new Date().toISOString(),
            proposal: undefined,
          };
        }
        return { ...b, proposal: { ...b.proposal, agreements } };
      })
    );
  };

  const stats = ME.stats;

  return (
    <div className="flex flex-col bg-slate-950 min-h-full">
      {/* Header */}
      <div className="px-5 pt-10 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <Handshake size={22} className="text-green-400" />
          <h1 className="text-2xl font-bold text-white">Bets</h1>
        </div>
        <div className="flex gap-1 bg-slate-900 rounded-xl p-1">
          {(['active', 'stats'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                tab === t ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'active' ? 'Active' : 'My Stats'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'active' && (
        <div className="px-5 py-4 flex flex-col gap-4 pb-8">
          {/* My Bets section */}
          {activeBets.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">My Bets</p>
              {activeBets.map((bet) => (
                <BetCard
                  key={bet.id}
                  bet={bet}
                  expanded={expandedId === bet.id}
                  onToggle={() => setExpandedId(expandedId === bet.id ? null : bet.id)}
                  onPropose={proposeResolution}
                  onAgree={agreeResolution}
                  isMine
                />
              ))}
            </>
          )}

          {/* Group Bets section */}
          {groupBets.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-2">Group Bets</p>
              {groupBets.map((bet) => (
                <BetCard
                  key={bet.id}
                  bet={bet}
                  expanded={expandedId === bet.id}
                  onToggle={() => setExpandedId(expandedId === bet.id ? null : bet.id)}
                  onPropose={proposeResolution}
                  onAgree={agreeResolution}
                  isMine={false}
                />
              ))}
            </>
          )}

          {/* Resolved */}
          {resolvedBets.length > 0 && (
            <>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-600">Archived</p>
              {resolvedBets.map((bet) => (
                <BetCard
                  key={bet.id}
                  bet={bet}
                  expanded={expandedId === bet.id}
                  onToggle={() => setExpandedId(expandedId === bet.id ? null : bet.id)}
                  onPropose={proposeResolution}
                  onAgree={agreeResolution}
                  archived
                />
              ))}
            </>
          )}
        </div>
      )}

      {tab === 'stats' && (
        <div className="px-5 py-5 flex flex-col gap-4 pb-8">
          {/* Record card */}
          <div className="rounded-2xl border border-green-900/40 bg-green-950/20 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={18} className="text-green-400" />
              <p className="font-semibold text-white">Bet Record</p>
            </div>
            <div className="flex justify-around text-center">
              <div>
                <p className="text-3xl font-bold text-green-400">{stats.betsWon}</p>
                <p className="text-xs text-slate-400 mt-1">Won</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-400">{stats.betsLost}</p>
                <p className="text-xs text-slate-400 mt-1">Lost</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-400">{stats.betsPending}</p>
                <p className="text-xs text-slate-400 mt-1">Pending</p>
              </div>
            </div>
            {stats.betsWon + stats.betsLost > 0 && (
              <>
                <div className="mt-4 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{
                      width: `${Math.round((stats.betsWon / (stats.betsWon + stats.betsLost)) * 100)}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-right text-xs text-slate-500">
                  {Math.round((stats.betsWon / (stats.betsWon + stats.betsLost)) * 100)}% win rate
                </p>
              </>
            )}
          </div>

          {/* Historical bets */}
          <div className="flex flex-col gap-2 mt-1">
            {BETS.filter((b) => b.participantIds.includes('me')).map((bet) => {
              const myWin = bet.status === 'resolved' && bet.winnerId === 'me';
              const myLoss = bet.status === 'resolved' && bet.winnerId && bet.winnerId !== 'me';
              const push = bet.status === 'resolved' && bet.isPush;

              return (
                <div
                  key={bet.id}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 flex items-start gap-3"
                >
                  <div
                    className={`mt-0.5 flex-shrink-0 h-2.5 w-2.5 rounded-full ${
                      myWin ? 'bg-green-500' : myLoss ? 'bg-red-500' : push ? 'bg-slate-500' : 'bg-yellow-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 line-clamp-1">{bet.claim}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {bet.chatName} · {timeAgo(bet.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                      myWin
                        ? 'bg-green-900/60 text-green-400'
                        : myLoss
                        ? 'bg-red-900/60 text-red-400'
                        : push
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-yellow-900/60 text-yellow-400'
                    }`}
                  >
                    {myWin ? 'W' : myLoss ? 'L' : push ? 'Push' : 'Active'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function BetCard({
  bet,
  expanded,
  onToggle,
  onPropose,
  onAgree,
  isMine = false,
  archived = false,
}: {
  bet: Bet;
  expanded: boolean;
  onToggle: () => void;
  onPropose: (id: string, winnerId: string | null) => void;
  onAgree: (id: string) => void;
  isMine?: boolean;
  archived?: boolean;
}) {
  const participants = bet.participantIds.map((id) => getUserById(id)).filter(Boolean);
  const winner = bet.winnerId ? getUserById(bet.winnerId) : null;
  const myProposalPending =
    bet.status === 'awaiting-resolution' &&
    bet.proposal?.proposedBy !== 'me' &&
    !bet.proposal?.agreements.includes('me');

  const statusConfig = {
    pending: { label: 'Pending Confirmation', color: 'text-slate-400', icon: Clock },
    active: { label: 'Active', color: 'text-green-400', icon: CheckCircle },
    'awaiting-resolution': { label: 'Awaiting Resolution', color: 'text-yellow-400', icon: AlertCircle },
    resolved: { label: 'Resolved', color: 'text-slate-500', icon: CheckCircle },
    disputed: { label: 'Disputed', color: 'text-red-400', icon: AlertCircle },
  };

  const cfg = statusConfig[bet.status];
  const StatusIcon = cfg.icon;

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-opacity ${archived ? 'opacity-50' : ''} ${
        bet.status === 'resolved' ? 'border-slate-800' : 'border-green-900/40'
      }`}
    >
      <button
        onClick={onToggle}
        className={`w-full text-left px-4 py-4 ${
          archived ? 'bg-slate-900/50' : 'bg-green-950/20 hover:bg-green-950/30'
        } transition-colors`}
      >
        <div className="flex items-center gap-2 mb-2">
          <Handshake size={13} className={archived ? 'text-slate-600' : 'text-green-400'} />
          <span className={`text-xs font-semibold uppercase tracking-wide ${archived ? 'text-slate-600' : 'text-green-400'}`}>
            Bet
          </span>
          <span className="text-xs text-slate-500 ml-1">{bet.chatName}</span>
          <div className={`ml-auto flex items-center gap-1 text-xs font-medium ${cfg.color}`}>
            <StatusIcon size={12} />
            <span>{cfg.label}</span>
          </div>
        </div>

        <p className="text-sm text-slate-100 leading-snug mb-3">&ldquo;{bet.claim}&rdquo;</p>

        <div className="flex items-center gap-2">
          {participants.map((p, i) => (
            <span key={p!.id} className="flex items-center gap-1">
              {i > 0 && <span className="text-slate-600 text-xs">🤝</span>}
              <span className="flex items-center gap-1 bg-slate-800 rounded-full px-2 py-1 text-xs text-slate-300">
                <span>{p!.avatar}</span>
                <span>{p!.displayName.split(' ')[0]}</span>
              </span>
            </span>
          ))}
          <span className="ml-auto text-xs text-slate-500">{timeAgo(bet.createdAt)}</span>
        </div>

        {bet.status === 'resolved' && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2">
            <Trophy size={14} className="text-yellow-400" />
            <span className="text-xs font-semibold text-white">
              {bet.isPush ? 'Push — No winner' : `Winner: ${winner?.displayName ?? 'Unknown'}`}
            </span>
          </div>
        )}

        {bet.status === 'awaiting-resolution' && bet.proposal && (
          <div className="mt-3 rounded-xl bg-yellow-950/30 border border-yellow-900/40 px-3 py-2">
            <p className="text-xs text-yellow-400">
              {getUserById(bet.proposal.proposedBy)?.displayName} proposed:{' '}
              <span className="font-semibold">
                {bet.proposal.isPush
                  ? 'Push'
                  : `${getUserById(bet.proposal.winnerId ?? '')?.displayName} Won`}
              </span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {bet.proposal.agreements.length}/{bet.participantIds.length} agreed
            </p>
          </div>
        )}
      </button>

      {/* Expanded resolution section */}
      {expanded && isMine && bet.status === 'active' && (
        <div className="border-t border-slate-800 bg-slate-900 px-4 py-4">
          <p className="text-xs font-semibold text-slate-400 mb-3">
            Propose a resolution — all parties must agree
          </p>
          <div className="flex flex-col gap-2">
            {participants.map((p) => (
              <button
                key={p!.id}
                onClick={() => onPropose(bet.id, p!.id)}
                className="w-full flex items-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700 transition-colors"
              >
                <span>{p!.avatar}</span>
                <span>{p!.displayName} Won</span>
              </button>
            ))}
            <button
              onClick={() => onPropose(bet.id, null)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Push — No Winner
            </button>
          </div>
        </div>
      )}

      {/* Agreement section */}
      {expanded && myProposalPending && (
        <div className="border-t border-slate-800 bg-slate-900 px-4 py-4">
          <p className="text-xs font-semibold text-slate-400 mb-3">
            Do you agree with this resolution?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onAgree(bet.id)}
              className="flex-1 rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition-colors"
            >
              ✓ Agree
            </button>
            <button className="flex-1 rounded-xl border border-red-900 bg-red-950/30 py-2.5 text-sm font-bold text-red-400 hover:bg-red-950/50 transition-colors">
              ✗ Dispute
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
