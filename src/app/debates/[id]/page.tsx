'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, Trophy } from 'lucide-react';
import { DEBATES, getUserById, ME } from '@/lib/mock-data';
import { timeAgo, voteLeader } from '@/lib/utils';
import type { DebateArgument, VoteChoice } from '@/lib/types';

export default function DebateFaceOffPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [debates, setDebates] = useState(DEBATES);
  const debate = debates.find((d) => d.id === id);

  const [newArgSide, setNewArgSide] = useState<'side1' | 'side2' | null>(null);
  const [argText, setArgText] = useState('');

  if (!debate) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-ink-faint">
        <p className="font-display text-3xl mb-2">⚔️</p>
        <p className="font-bold text-ink">Debate not found</p>
      </div>
    );
  }

  const side1Users = debate.side1UserIds.map((uid) => getUserById(uid)).filter(Boolean);
  const side2Users = debate.side2UserIds.map((uid) => getUserById(uid)).filter(Boolean);
  const myVote = debate.votes.find((v) => v.userId === 'me');
  const counts = voteLeader(debate.votes);
  const total = debate.votes.length;
  const getVotePct = (c: VoteChoice) => total > 0 ? Math.round(((counts[c] ?? 0) / total) * 100) : 0;

  const side1Args = debate.arguments.filter((a) => a.side === 'side1');
  const side2Args = debate.arguments.filter((a) => a.side === 'side2');
  const maxLen = Math.max(side1Args.length, side2Args.length);

  const isMeOnSide1 = debate.side1UserIds.includes('me');
  const isMeOnSide2 = debate.side2UserIds.includes('me');
  const isMeParticipant = isMeOnSide1 || isMeOnSide2;

  const castVote = (choice: VoteChoice) => {
    if (myVote) return;
    setDebates((prev) =>
      prev.map((d) =>
        d.id !== debate.id ? d : { ...d, votes: [...d.votes, { userId: 'me', choice }] }
      )
    );
  };

  const submitArg = () => {
    if (!argText.trim() || !newArgSide) return;
    const newArg: DebateArgument = {
      id: `arg-${Date.now()}`,
      userId: 'me',
      side: newArgSide,
      content: argText.trim(),
      timestamp: new Date().toISOString(),
      reactions: [],
    };
    setDebates((prev) =>
      prev.map((d) =>
        d.id !== debate.id ? d : { ...d, arguments: [...d.arguments, newArg] }
      )
    );
    setArgText('');
    setNewArgSide(null);
  };

  return (
    <div className="flex flex-col h-full bg-paper">
      {/* Header */}
      <div className="shrink-0 bg-nav-bg px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-ink/60 hover:text-ink p-1">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink/50">Face-Off · {debate.chatName}</p>
          <p className="font-display font-bold text-ink text-sm leading-snug truncate">&ldquo;{debate.claim}&rdquo;</p>
        </div>
        {debate.status === 'resolved' && (
          <div className="flex items-center gap-1 text-rule-dark shrink-0">
            <Trophy size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wide">Resolved</span>
          </div>
        )}
      </div>

      {/* Side labels + vote bar */}
      <div className="shrink-0 bg-paper-dark border-b border-rule">
        <div className="grid grid-cols-2">
          {/* Side 1 */}
          <div className="px-4 py-3 border-r border-rule">
            <p className="text-[10px] font-bold uppercase tracking-widest text-navy mb-1">{debate.side1Label ?? 'Side 1'}</p>
            <div className="flex gap-1 flex-wrap">
              {side1Users.map((u) => (
                <Link key={u!.id} href={`/users/${u!.id}`} className="flex items-center gap-1 bg-paper-dark border border-rule px-1.5 py-0.5 text-[11px] hover:border-ink transition-colors">
                  <span>{u!.avatar}</span>
                  <span className="text-ink font-semibold">{u!.displayName.split(' ')[0]}</span>
                </Link>
              ))}
            </div>
          </div>
          {/* Side 2 */}
          <div className="px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-field mb-1 text-right">{debate.side2Label ?? 'Side 2'}</p>
            <div className="flex gap-1 flex-wrap justify-end">
              {side2Users.map((u) => (
                <Link key={u!.id} href={`/users/${u!.id}`} className="flex items-center gap-1 bg-paper-dark border border-rule px-1.5 py-0.5 text-[11px] hover:border-ink transition-colors">
                  <span>{u!.avatar}</span>
                  <span className="text-ink font-semibold">{u!.displayName.split(' ')[0]}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Vote bars */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-navy w-8 text-left font-mono">{getVotePct('side1')}%</span>
            <div className="flex-1 h-2 bg-paper-dark border border-rule overflow-hidden flex">
              <div className="h-full bg-navy transition-all duration-500" style={{ width: `${getVotePct('side1')}%` }} />
              <div className="h-full bg-field transition-all duration-500" style={{ width: `${getVotePct('side2')}%` }} />
            </div>
            <span className="text-[10px] font-bold text-field w-8 text-right font-mono">{getVotePct('side2')}%</span>
          </div>
          <p className="text-center text-[10px] text-ink-faint font-mono">{total} vote{total !== 1 ? 's' : ''} cast</p>

          {/* Vote buttons */}
          {!myVote && debate.status === 'active' && (
            <div className="flex gap-2 mt-2">
              <button onClick={() => castVote('side1')} className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest bg-navy text-ink hover:bg-navy/80 transition-colors">
                Vote {debate.side1Label ?? 'Side 1'}
              </button>
              <button onClick={() => castVote('draw')} className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest border border-rule text-ink-muted hover:bg-paper-dark transition-colors">
                Draw
              </button>
              <button onClick={() => castVote('side2')} className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest bg-field text-ink hover:bg-field/80 transition-colors">
                Vote {debate.side2Label ?? 'Side 2'}
              </button>
            </div>
          )}
          {myVote && (
            <p className="text-center text-[10px] font-bold uppercase tracking-widest text-ink-faint mt-2">
              You voted: <span className="text-ink">{myVote.choice === 'side1' ? (debate.side1Label ?? 'Side 1') : myVote.choice === 'side2' ? (debate.side2Label ?? 'Side 2') : 'Draw'}</span>
            </p>
          )}
          {debate.status === 'resolved' && debate.resolution && (
            <div className="flex items-center justify-center gap-2 mt-2 bg-rule/20 py-2 border border-rule/50">
              <Trophy size={12} className="text-rule-dark" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink">
                {debate.resolution === 'draw' ? 'Draw' : debate.resolution === 'side1' ? (debate.side1Label ?? 'Side 1') : (debate.side2Label ?? 'Side 2')} Won
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Side-by-side arguments */}
      <div className="flex-1 overflow-y-auto">
        {/* Column headers */}
        <div className="grid grid-cols-2 bg-paper-dark border-b border-rule sticky top-0 z-10">
          <div className="px-3 py-2 border-r border-rule">
            <p className="text-[9px] font-bold uppercase tracking-widest text-navy">{debate.side1Label ?? 'Side 1'}</p>
          </div>
          <div className="px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-field text-right">{debate.side2Label ?? 'Side 2'}</p>
          </div>
        </div>

        {/* Arguments grid */}
        {maxLen === 0 ? (
          <div className="text-center py-12 px-5">
            <p className="font-display text-3xl mb-2 text-ink-faint">💬</p>
            <p className="font-display font-bold text-ink">No arguments yet</p>
            {isMeParticipant && (
              <p className="text-xs text-ink-muted italic mt-1">Be the first to make your case</p>
            )}
          </div>
        ) : (
          Array.from({ length: maxLen }).map((_, rowIdx) => {
            const arg1 = side1Args[rowIdx];
            const arg2 = side2Args[rowIdx];
            return (
              <div key={rowIdx} className={`grid grid-cols-2 border-b border-rule/50 ${rowIdx % 2 === 0 ? 'bg-paper' : 'bg-paper-dark'}`}>
                {/* Side 1 argument */}
                <div className="px-3 py-3 border-r border-rule/50">
                  {arg1 ? (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        {(() => {
                          const author = getUserById(arg1.userId);
                          return (
                            <>
                              <Link href={`/users/${arg1.userId}`} className="text-base hover:scale-110 transition-transform">
                                {author?.avatar}
                              </Link>
                              <span className="text-[9px] font-bold text-navy uppercase tracking-wide truncate">{author?.displayName.split(' ')[0]}</span>
                            </>
                          );
                        })()}
                      </div>
                      <p className="text-xs text-ink leading-relaxed">{arg1.content}</p>
                      {arg1.reactions.length > 0 && (
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {arg1.reactions.map((r) => (
                            <span key={r.emoji} className="text-[11px] text-ink-faint">{r.emoji}{r.userIds.length}</span>
                          ))}
                        </div>
                      )}
                      <p className="text-[9px] text-ink-faint font-mono mt-1">{timeAgo(arg1.timestamp)}</p>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <span className="text-ink-faint/30 text-xs">—</span>
                    </div>
                  )}
                </div>
                {/* Side 2 argument */}
                <div className="px-3 py-3">
                  {arg2 ? (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5 justify-end">
                        {(() => {
                          const author = getUserById(arg2.userId);
                          return (
                            <>
                              <span className="text-[9px] font-bold text-field uppercase tracking-wide truncate">{author?.displayName.split(' ')[0]}</span>
                              <Link href={`/users/${arg2.userId}`} className="text-base hover:scale-110 transition-transform">
                                {author?.avatar}
                              </Link>
                            </>
                          );
                        })()}
                      </div>
                      <p className="text-xs text-ink leading-relaxed text-right">{arg2.content}</p>
                      {arg2.reactions.length > 0 && (
                        <div className="flex gap-1 mt-1.5 flex-wrap justify-end">
                          {arg2.reactions.map((r) => (
                            <span key={r.emoji} className="text-[11px] text-ink-faint">{r.emoji}{r.userIds.length}</span>
                          ))}
                        </div>
                      )}
                      <p className="text-[9px] text-ink-faint font-mono mt-1 text-right">{timeAgo(arg2.timestamp)}</p>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <span className="text-ink-faint/30 text-xs">—</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Argument input (for participants only) */}
      {isMeParticipant && debate.status === 'active' && (
        <div className="shrink-0 border-t-2 border-rule bg-paper-dark px-4 py-3">
          {!newArgSide ? (
            <div className="flex gap-2">
              <button
                onClick={() => setNewArgSide('side1')}
                className="flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest bg-navy text-ink hover:bg-navy/80 transition-colors"
              >
                + Argue for {debate.side1Label ?? 'Side 1'}
              </button>
              <button
                onClick={() => setNewArgSide('side2')}
                className="flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest bg-field text-ink hover:bg-field/80 transition-colors"
              >
                + Argue for {debate.side2Label ?? 'Side 2'}
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${newArgSide === 'side1' ? 'text-navy' : 'text-field'}`}>
                  Making case for {newArgSide === 'side1' ? (debate.side1Label ?? 'Side 1') : (debate.side2Label ?? 'Side 2')}
                </span>
                <button onClick={() => setNewArgSide(null)} className="ml-auto text-ink-faint hover:text-ink text-xs">Cancel</button>
              </div>
              <div className="flex gap-2">
                <textarea
                  value={argText}
                  onChange={(e) => setArgText(e.target.value)}
                  placeholder="Make your case..."
                  rows={2}
                  className="flex-1 border border-rule bg-paper px-3 py-2 text-sm text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors resize-none"
                />
                <button
                  onClick={submitArg}
                  disabled={!argText.trim()}
                  className="flex h-full items-center justify-center px-4 bg-nav-bg text-ink hover:bg-nav-bg/80 disabled:opacity-40 transition-colors"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Observer note */}
      {!isMeParticipant && debate.status === 'active' && (
        <div className="shrink-0 border-t border-rule bg-paper-dark px-4 py-3 text-center">
          <p className="text-[10px] text-ink-faint italic">You&apos;re watching this debate · Vote above to weigh in</p>
        </div>
      )}
    </div>
  );
}
