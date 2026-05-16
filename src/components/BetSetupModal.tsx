'use client';

import { useState } from 'react';
import { X, Check, Plus } from 'lucide-react';
import type { User } from '@/lib/types';

export interface BetSetupResult {
  side1Ids: string[];
  side2Ids: string[];
  side1Label: string;
  side2Label: string;
  stakes: string;
}

interface Props {
  claim: string;
  members?: User[];
  onConfirm: (data: BetSetupResult) => void;
  onCancel: () => void;
}

const BANNED = /[$€£¥₹]|\d/;

type Side = 'side1' | 'side2' | null;

export default function BetSetupModal({ claim, members = [], onConfirm, onCancel }: Props) {
  const [side1Label, setSide1Label] = useState('Side A');
  const [side2Label, setSide2Label] = useState('Side B');
  const [assignments, setAssignments]   = useState<Record<string, Side>>({ me: 'side1' });
  const [stakes, setStakes]       = useState('');
  const [stakesErr, setStakesErr] = useState('');

  const side1Ids = Object.entries(assignments).filter(([, s]) => s === 'side1').map(([id]) => id);
  const side2Ids = Object.entries(assignments).filter(([, s]) => s === 'side2').map(([id]) => id);

  const valid = stakes.trim().length > 0 && !stakesErr && side1Ids.length > 0 && side2Ids.length > 0;

  const handleStakes = (val: string) => {
    setStakes(val);
    setStakesErr(BANNED.test(val) ? 'No money or numbers — keep it creative' : '');
  };

  const toggle = (uid: string, side: Side) => {
    setAssignments((prev) => ({ ...prev, [uid]: prev[uid] === side ? null : side }));
  };

  const allMembers: User[] = [
    { id: 'me', username: 'me', displayName: 'You', avatar: '🧑', bio: '', fanTeams: [], stats: { debatesWon: 0, debatesLost: 0, debatesDrew: 0, betsWon: 0, betsLost: 0, betsPending: 0, hotTakesPosted: 0, hotTakeReactions: 0 }, followingIds: [], followerIds: [], groupIds: [] },
    ...members.filter((m) => m.id !== 'me'),
  ];

  const submit = () => {
    if (!valid) return;
    onConfirm({ side1Ids, side2Ids, side1Label, side2Label, stakes });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-nav-bg/80 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative w-full max-w-md bg-paper-dark border-t border-rule max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-nav-bg sticky top-0 z-10">
          <p className="font-display font-bold text-ink text-base">🤝 New Bet</p>
          <button onClick={onCancel} className="text-ink/60 hover:text-ink transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-6">

          {/* Terms */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-2">Terms</p>
            <div className="border border-rule bg-paper px-4 py-3 rounded-lg">
              <p className="text-sm text-ink italic leading-snug">&ldquo;{claim}&rdquo;</p>
            </div>
          </div>

          {/* Pick Sides */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-3">Pick Sides</p>

            {/* Side label inputs */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-navy mb-1">Side A label</p>
                <input
                  value={side1Label}
                  onChange={(e) => setSide1Label(e.target.value)}
                  className="w-full border border-navy/40 bg-navy/10 text-navy font-bold px-3 py-2 text-xs outline-none rounded-lg focus:border-navy"
                />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-field mb-1">Side B label</p>
                <input
                  value={side2Label}
                  onChange={(e) => setSide2Label(e.target.value)}
                  className="w-full border border-field/40 bg-field/10 text-field font-bold px-3 py-2 text-xs outline-none rounded-lg focus:border-field"
                />
              </div>
            </div>

            {/* Member rows */}
            <div className="flex flex-col gap-2">
              {allMembers.map((m) => {
                const cur = assignments[m.id] ?? null;
                return (
                  <div key={m.id} className="flex items-center gap-3 bg-paper px-3 py-2.5 rounded-lg border border-rule">
                    <span className="text-lg shrink-0">{m.avatar}</span>
                    <span className="flex-1 text-xs font-semibold text-ink truncate">{m.displayName}</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => toggle(m.id, 'side1')}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-colors border ${
                          cur === 'side1'
                            ? 'bg-navy text-paper border-navy'
                            : 'border-navy/30 text-navy/60 hover:border-navy hover:text-navy'
                        }`}
                      >
                        {side1Label}
                      </button>
                      <button
                        onClick={() => toggle(m.id, 'side2')}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-colors border ${
                          cur === 'side2'
                            ? 'bg-field text-paper border-field'
                            : 'border-field/30 text-field/60 hover:border-field hover:text-field'
                        }`}
                      >
                        {side2Label}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {side1Ids.length === 0 || side2Ids.length === 0 ? (
              <p className="text-[10px] text-masthead font-bold mt-2">Both sides need at least one person</p>
            ) : (
              <p className="text-[10px] text-ink-faint mt-2">
                {side1Label}: {side1Ids.length} · {side2Label}: {side2Ids.length}
              </p>
            )}
          </div>

          {/* Stakes */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-2">
              What&apos;s at Stake
            </p>
            <input
              value={stakes}
              onChange={(e) => handleStakes(e.target.value)}
              placeholder="Loser cooks dinner for a month…"
              className={`w-full border bg-paper-dark px-4 py-3 text-sm text-ink placeholder-ink-faint outline-none transition-colors rounded-lg ${
                stakesErr ? 'border-masthead' : 'border-rule focus:border-ink'
              }`}
            />
            {stakesErr ? (
              <p className="text-[10px] text-masthead font-bold mt-1">{stakesErr}</p>
            ) : (
              <p className="text-[10px] text-ink-faint mt-1">No money or numbers — be creative</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-rule bg-paper-dark px-5 py-4 flex gap-3">
          <button
            onClick={onCancel}
            className="border border-rule px-5 py-3 text-xs font-bold uppercase tracking-wider text-ink-muted hover:bg-paper-deeper transition-colors rounded-full"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!valid}
            className="flex-1 flex items-center justify-center gap-2 bg-field text-ink py-3 text-xs font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed rounded-full btn-3d hover:bg-field/80 transition-colors"
          >
            <Check size={14} />
            Lock In Bet
          </button>
        </div>
      </div>
    </div>
  );
}
