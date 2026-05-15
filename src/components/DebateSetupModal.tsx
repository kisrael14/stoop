'use client';

import { useState } from 'react';
import { X, Swords } from 'lucide-react';
import type { User } from '@/lib/types';

export interface DebateSetupResult {
  claim: string;
  side1Label: string;
  side2Label: string;
  side1Ids: string[];
  side2Ids: string[];
}

interface Props {
  initialClaim?: string;
  members?: User[];
  onConfirm: (data: DebateSetupResult) => void;
  onCancel: () => void;
}

export default function DebateSetupModal({ initialClaim = '', members, onConfirm, onCancel }: Props) {
  const [claim, setClaim]   = useState(initialClaim);
  const [labelA, setLabelA] = useState('');
  const [labelB, setLabelB] = useState('');
  const [sides, setSides]   = useState<Record<string, 'A' | 'B' | null>>({});

  const assign = (userId: string, side: 'A' | 'B') => {
    setSides((prev) => ({ ...prev, [userId]: prev[userId] === side ? null : side }));
  };

  const sideAIds = members?.filter((m) => sides[m.id] === 'A').map((m) => m.id) ?? [];
  const sideBIds = members?.filter((m) => sides[m.id] === 'B').map((m) => m.id) ?? [];

  const valid = claim.trim().length > 0 && (
    !members || (sideAIds.length >= 1 && sideBIds.length >= 1)
  );

  const submit = () => {
    if (!valid) return;
    onConfirm({
      claim: claim.trim(),
      side1Label: labelA.trim() || 'Side A',
      side2Label: labelB.trim() || 'Side B',
      side1Ids: sideAIds,
      side2Ids: sideBIds,
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

          {/* Claim / Question */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-2">The Debate Question</p>
            <textarea
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              placeholder="Who has the better starting lineup going into the playoffs…"
              rows={3}
              className="w-full border border-rule bg-paper px-4 py-3 text-sm text-ink placeholder-ink-faint outline-none focus:border-navy transition-colors rounded-lg resize-none leading-relaxed"
            />
          </div>

          {/* Side labels */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-2">Name Each Side</p>
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
          </div>

          {/* Member assignment (neighborhood context only) */}
          {members && members.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-3">Pick Sides</p>
              <div className="flex flex-col gap-2">
                {members.map((member) => {
                  const side = sides[member.id] ?? null;
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
                          className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all rounded-full ${
                            side === 'A'
                              ? 'bg-navy text-ink shadow-none translate-y-0.5'
                              : 'border border-rule/60 text-ink-muted hover:border-navy hover:text-navy'
                          }`}
                        >
                          {labelA.trim() || 'A'}
                        </button>
                        <button
                          onClick={() => assign(member.id, 'B')}
                          className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all rounded-full ${
                            side === 'B'
                              ? 'bg-field text-ink shadow-none translate-y-0.5'
                              : 'border border-rule/60 text-ink-muted hover:border-field hover:text-field'
                          }`}
                        >
                          {labelB.trim() || 'B'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {members && (sideAIds.length === 0 || sideBIds.length === 0) && (
                <p className="text-[10px] text-ink-faint mt-2 italic text-center">
                  Both sides need at least one person
                </p>
              )}
            </div>
          )}
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
