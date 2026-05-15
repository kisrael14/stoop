'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';

export interface BetSetupResult {
  side1Ids: string[];
  side2Ids: string[];
  side1Label: string;
  side2Label: string;
  stakes: string;
}

interface Props {
  claim: string;
  members?: never[];
  onConfirm: (data: BetSetupResult) => void;
  onCancel: () => void;
}

const BANNED = /[$€£¥₹]|\d/;

export default function BetSetupModal({ claim, onConfirm, onCancel }: Props) {
  const [stakes, setStakes]       = useState('');
  const [stakesErr, setStakesErr] = useState('');

  const valid = stakes.trim().length > 0 && !stakesErr;

  const handleStakes = (val: string) => {
    setStakes(val);
    setStakesErr(BANNED.test(val) ? 'No money or numbers — keep it creative' : '');
  };

  const submit = () => {
    if (!valid) return;
    onConfirm({
      side1Ids: ['me'],
      side2Ids: [],
      side1Label: 'Side A',
      side2Label: 'Side B',
      stakes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-nav-bg/80 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative w-full max-w-md bg-paper-dark border-t border-rule max-h-[88vh] overflow-y-auto">

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

          {/* Stakes */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-2">
              What&apos;s at Stake
            </p>
            <input
              value={stakes}
              onChange={(e) => handleStakes(e.target.value)}
              placeholder="Loser cooks dinner for a month…"
              autoFocus
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
