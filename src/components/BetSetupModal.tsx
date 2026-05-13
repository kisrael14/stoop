'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';
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
  members: User[];
  onConfirm: (data: BetSetupResult) => void;
  onCancel: () => void;
}

const BANNED = /[$€£¥₹]|\d/;

export default function BetSetupModal({ claim, members, onConfirm, onCancel }: Props) {
  const [sides, setSides]       = useState<Record<string, 'A' | 'B' | null>>({});
  const [labelA, setLabelA]     = useState('');
  const [labelB, setLabelB]     = useState('');
  const [stakes, setStakes]     = useState('');
  const [stakesErr, setStakesErr] = useState('');

  const assign = (userId: string, side: 'A' | 'B') => {
    setSides((prev) => ({ ...prev, [userId]: prev[userId] === side ? null : side }));
  };

  const sideAIds = members.filter((m) => sides[m.id] === 'A').map((m) => m.id);
  const sideBIds = members.filter((m) => sides[m.id] === 'B').map((m) => m.id);
  const valid = sideAIds.length >= 1 && sideBIds.length >= 1 && !stakesErr;

  const handleStakes = (val: string) => {
    setStakes(val);
    setStakesErr(BANNED.test(val) ? 'No money or numbers — keep it creative' : '');
  };

  const submit = () => {
    if (!valid) return;
    onConfirm({
      side1Ids: sideAIds,
      side2Ids: sideBIds,
      side1Label: labelA.trim() || 'Side A',
      side2Label: labelB.trim() || 'Side B',
      stakes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onCancel} />

      {/* Sheet */}
      <div className="relative w-full max-w-md bg-paper border-t-2 border-ink max-h-[88vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-ink sticky top-0 z-10">
          <p className="font-display font-bold text-paper text-base">🤝 New Bet</p>
          <button onClick={onCancel} className="text-paper/60 hover:text-paper transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-6">

          {/* Terms */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-2">Terms</p>
            <div className="border border-rule bg-paper-dark px-4 py-3">
              <p className="text-sm text-ink italic leading-snug">&ldquo;{claim}&rdquo;</p>
            </div>
          </div>

          {/* Sides */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-3">Pick Sides</p>

            {/* Side name inputs */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <input
                value={labelA}
                onChange={(e) => setLabelA(e.target.value)}
                placeholder="Side A name…"
                className="border border-navy/40 bg-navy/5 px-3 py-2 text-sm text-ink placeholder-ink-faint outline-none focus:border-navy transition-colors rounded-lg"
              />
              <input
                value={labelB}
                onChange={(e) => setLabelB(e.target.value)}
                placeholder="Side B name…"
                className="border border-field/40 bg-field/5 px-3 py-2 text-sm text-ink placeholder-ink-faint outline-none focus:border-field transition-colors rounded-lg"
              />
            </div>

            {/* Member rows */}
            <div className="flex flex-col gap-2">
              {members.map((member) => {
                const side = sides[member.id] ?? null;
                const nameA = labelA.trim() || 'A';
                const nameB = labelB.trim() || 'B';
                return (
                  <div key={member.id} className="flex items-center gap-3 border border-rule/60 bg-paper px-3 py-2.5 rounded-xl">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-paper-dark border border-rule text-lg shrink-0">
                      {member.avatar}
                    </div>
                    <p className="flex-1 text-sm font-bold text-ink">
                      {member.id === 'me' ? 'You' : member.displayName}
                    </p>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => assign(member.id, 'A')}
                        className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all rounded-full btn-3d ${
                          side === 'A'
                            ? 'bg-navy text-paper shadow-none translate-y-0.5'
                            : 'border border-rule/60 text-ink-muted hover:border-navy hover:text-navy'
                        }`}
                      >
                        {nameA}
                      </button>
                      <button
                        onClick={() => assign(member.id, 'B')}
                        className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all rounded-full btn-3d ${
                          side === 'B'
                            ? 'bg-field text-paper shadow-none translate-y-0.5'
                            : 'border border-rule/60 text-ink-muted hover:border-field hover:text-field'
                        }`}
                      >
                        {nameB}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {(sideAIds.length === 0 || sideBIds.length === 0) && (
              <p className="text-[10px] text-ink-faint mt-2 italic text-center">
                Both sides need at least one person
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

        {/* Footer CTA */}
        <div className="sticky bottom-0 border-t-2 border-rule bg-paper px-5 py-4 flex gap-3">
          <button
            onClick={onCancel}
            className="border border-rule px-5 py-3 text-xs font-bold uppercase tracking-wider text-ink-muted hover:bg-paper-dark transition-colors rounded-full"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!valid}
            className="flex-1 flex items-center justify-center gap-2 bg-field text-paper py-3 text-xs font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed rounded-full btn-3d hover:bg-field/80 transition-colors"
          >
            <Check size={14} />
            Lock In Bet
          </button>
        </div>
      </div>
    </div>
  );
}
