'use client';

import { useState } from 'react';
import { BADGE_DEFINITIONS } from '@/lib/badges';
import type { UserBadge } from '@/lib/badges';

// Level 1=Stone, 2=Iron, 3=Bronze, 4=Silver, 5=Gold
const LEVEL_COLORS: Record<number, { bg: string; text: string; bar: string; hex: string }> = {
  1: { bg: 'bg-[#9E9E9E]/15', text: 'text-[#9E9E9E]', bar: 'bg-[#9E9E9E]', hex: '#9E9E9E' },
  2: { bg: 'bg-[#6B6B6B]/15', text: 'text-[#6B6B6B]', bar: 'bg-[#6B6B6B]', hex: '#6B6B6B' },
  3: { bg: 'bg-[#CD7F32]/15', text: 'text-[#CD7F32]', bar: 'bg-[#CD7F32]', hex: '#CD7F32' },
  4: { bg: 'bg-[#C0C0C0]/15', text: 'text-[#C0C0C0]', bar: 'bg-[#C0C0C0]', hex: '#C0C0C0' },
  5: { bg: 'bg-[#FFD700]/15', text: 'text-[#FFD700]', bar: 'bg-[#FFD700]', hex: '#FFD700' },
};

interface Props {
  badge: UserBadge;
  size?: 'sm' | 'md';
}

export default function BadgeChip({ badge, size = 'md' }: Props) {
  const [open, setOpen] = useState(false);
  const def = BADGE_DEFINITIONS[badge.type];
  const colors = LEVEL_COLORS[badge.level];
  const isSm = size === 'sm';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors ${colors.bg} ${colors.text}`}
        style={{ minWidth: isSm ? 52 : 64, border: `1.5px solid ${colors.hex}60` }}
      >
        <span className={isSm ? 'text-base' : 'text-xl'}>{def.emoji}</span>
        <span className={`font-bold uppercase tracking-wide leading-none ${isSm ? 'text-[8px]' : 'text-[9px]'}`}>
          {def.name}
        </span>
        <span className={`font-mono leading-none ${isSm ? 'text-[7px]' : 'text-[8px]'} opacity-70`}>
          {badge.levelName}
        </span>
      </button>

      {/* Tooltip */}
      {open && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-ink text-paper rounded-xl shadow-2xl z-50 p-3 pointer-events-none"
          style={{ minWidth: 200 }}
        >
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-ink" />

          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{def.emoji}</span>
            <div>
              <p className="font-display font-bold text-paper text-sm leading-tight">{badge.levelName} {def.name}</p>
              <div className="flex gap-1 mt-0.5">
                {[1, 2, 3, 4, 5].map((l) => (
                  <div
                    key={l}
                    className={`h-1 w-4 rounded-full ${l <= badge.level ? colors.bar : 'bg-paper/20'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-paper/70 leading-relaxed mb-2">{def.description}</p>

          {/* Progress to next level */}
          {badge.nextLevelScore !== null ? (
            <div>
              <div className="flex justify-between text-[9px] text-paper/50 mb-1">
                <span>{badge.score} pts</span>
                <span>{badge.nextLevelScore} pts to next</span>
              </div>
              <div className="h-1 bg-paper/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${colors.bar}`}
                  style={{ width: `${badge.progressPct}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-[10px] font-bold text-center" style={{ color: colors.hex }}>🏆 Hall of Famer</p>
          )}
        </div>
      )}
    </div>
  );
}
