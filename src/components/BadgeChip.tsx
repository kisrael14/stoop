'use client';

import { useState } from 'react';
import { BADGE_DEFINITIONS } from '@/lib/badges';
import type { UserBadge } from '@/lib/badges';
import TrophySvg from '@/components/TrophySvg';

// Level 1=Royal Blue, 2=Forest, 3=Bronze, 4=Silver, 5=Gold
const LEVEL_COLORS: Record<number, { bar: string; hex: string; label: string }> = {
  1: { bar: 'bg-[#1E3FA8]', hex: '#1E3FA8', label: 'Royal Blue' },
  2: { bar: 'bg-[#228B22]', hex: '#228B22', label: 'Forest'     },
  3: { bar: 'bg-[#CD7F32]', hex: '#CD7F32', label: 'Bronze'     },
  4: { bar: 'bg-[#C0C0C0]', hex: '#C0C0C0', label: 'Silver'     },
  5: { bar: 'bg-[#FFD700]', hex: '#FFD700', label: 'Gold'       },
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
  const trophySize = isSm ? 36 : 48;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors hover:bg-paper-dark"
        style={{ minWidth: isSm ? 52 : 64, border: `1.5px solid ${colors.hex}60`, background: `${colors.hex}12` }}
      >
        <TrophySvg type={badge.type} level={badge.level} size={trophySize} />
        <span className={`font-bold uppercase tracking-wide leading-none ${isSm ? 'text-[8px]' : 'text-[9px]'}`} style={{ color: colors.hex }}>
          {def.name}
        </span>
        <span className={`font-mono leading-none ${isSm ? 'text-[7px]' : 'text-[8px]'} opacity-70`} style={{ color: colors.hex }}>
          {colors.label}
        </span>
      </button>

      {/* Tooltip */}
      {open && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-ink text-paper rounded-xl shadow-2xl z-50 p-3 pointer-events-none"
          style={{ minWidth: 220 }}
        >
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-ink" />

          <div className="flex items-center gap-3 mb-2">
            <TrophySvg type={badge.type} level={badge.level} size={52} />
            <div>
              <p className="font-display font-bold text-paper text-sm leading-tight">{def.name}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: colors.hex }}>{colors.label} Tier</p>
              <div className="flex gap-1">
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

          {badge.nextLevelScore !== null ? (
            <div>
              <div className="flex justify-between text-[9px] text-paper/50 mb-1">
                <span>{badge.score} pts</span>
                <span>{badge.nextLevelScore} to next tier</span>
              </div>
              <div className="h-1 bg-paper/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${colors.bar}`}
                  style={{ width: `${badge.progressPct}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-[10px] font-bold text-center" style={{ color: colors.hex }}>🏆 Trophy Room — Hall of Famer</p>
          )}
        </div>
      )}
    </div>
  );
}
