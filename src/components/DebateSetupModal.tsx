'use client';

import { useState } from 'react';
import { X, Swords } from 'lucide-react';

export interface DebateSetupResult {
  claim: string;
  side1Label: string;
  side2Label: string;
}

interface Props {
  initialClaim?: string;
  onConfirm: (data: DebateSetupResult) => void;
  onCancel: () => void;
}

export default function DebateSetupModal({ initialClaim = '', onConfirm, onCancel }: Props) {
  const [claim, setClaim]   = useState(initialClaim);
  const [labelA, setLabelA] = useState('');
  const [labelB, setLabelB] = useState('');

  const valid = claim.trim().length > 0;

  const submit = () => {
    if (!valid) return;
    onConfirm({
      claim: claim.trim(),
      side1Label: labelA.trim() || 'Side A',
      side2Label: labelB.trim() || 'Side B',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-nav-bg/80 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md bg-paper-dark border-t border-rule max-h-[88vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-nav-bg sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Swords size={16} className="text-navy" />
            <p className="font-display font-bold text-ink text-base">New Debate</p>
          </div>
          <button onClick={onCancel} className="text-ink/60 hover:text-ink transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-5">

          {/* Claim */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-2">The Debate Question</p>
            <textarea
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              placeholder="Who has the better starting lineup going into the playoffs…"
              rows={3}
              autoFocus={!initialClaim}
              className="w-full border border-rule bg-paper px-4 py-3 text-sm text-ink placeholder-ink-faint outline-none focus:border-navy transition-colors rounded-lg resize-none leading-relaxed"
            />
          </div>

          {/* Side labels */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-2">Name Each Side <span className="normal-case font-normal text-ink-faint">(optional)</span></p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-navy block mb-1">Side A</label>
                <input
                  value={labelA}
                  onChange={(e) => setLabelA(e.target.value)}
                  placeholder="e.g. Lakers"
                  className="w-full border border-navy/40 bg-navy/5 px-3 py-2 text-sm text-ink placeholder-ink-faint outline-none focus:border-navy transition-colors rounded-lg"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-field block mb-1">Side B</label>
                <input
                  value={labelB}
                  onChange={(e) => setLabelB(e.target.value)}
                  placeholder="e.g. Celtics"
                  className="w-full border border-field/40 bg-field/5 px-3 py-2 text-sm text-ink placeholder-ink-faint outline-none focus:border-field transition-colors rounded-lg"
                />
              </div>
            </div>
            <p className="text-[10px] text-ink-faint mt-2 italic">Members vote on sides after the debate is posted</p>
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
            className="flex-1 flex items-center justify-center gap-2 bg-navy text-ink py-3 text-xs font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed rounded-full hover:bg-navy/80 transition-colors"
          >
            <Swords size={14} />
            Start Debate
          </button>
        </div>
      </div>
    </div>
  );
}
