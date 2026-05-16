'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { BADGE_DEFINITIONS } from '@/lib/badges';
import type { UserBadge } from '@/lib/badges';
import TrophySvg from '@/components/TrophySvg';

const LEVEL_COLORS: Record<number, { bar: string; hex: string; label: string }> = {
  1: { bar: 'bg-[#1E3FA8]', hex: '#1E3FA8', label: 'Royal Blue' },
  2: { bar: 'bg-[#228B22]', hex: '#228B22', label: 'Forest'     },
  3: { bar: 'bg-[#CD7F32]', hex: '#CD7F32', label: 'Bronze'     },
  4: { bar: 'bg-[#C0C0C0]', hex: '#C0C0C0', label: 'Silver'     },
  5: { bar: 'bg-[#FFD700]', hex: '#FFD700', label: 'Gold'       },
};

interface Props {
  badge: UserBadge;
  size?: 'xs' | 'sm' | 'md';
}

export default function BadgeChip({ badge, size = 'md' }: Props) {
  const [hovered, setHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const def = BADGE_DEFINITIONS[badge.type];
  const colors = LEVEL_COLORS[badge.level];

  const trophySize = size === 'xs' ? 28 : size === 'sm' ? 36 : 48;

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setModalOpen(true)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="flex flex-col items-center gap-0.5 rounded-lg transition-all active:scale-95 w-full"
          style={
            size === 'xs'
              ? { padding: '4px 6px', border: `1.5px solid ${colors.hex}60`, background: `${colors.hex}18` }
              : { padding: '6px 8px', border: `1.5px solid ${colors.hex}60`, background: `${colors.hex}12` }
          }
          title={def.name}
        >
          <TrophySvg type={badge.type} level={badge.level} size={trophySize} />
          {size !== 'xs' && (
            <>
              <span className={`font-bold uppercase tracking-wide leading-none ${size === 'sm' ? 'text-[8px]' : 'text-[9px]'}`} style={{ color: colors.hex }}>
                {def.name}
              </span>
              <span className={`font-mono leading-none ${size === 'sm' ? 'text-[7px]' : 'text-[8px]'} opacity-70`} style={{ color: colors.hex }}>
                {colors.label}
              </span>
            </>
          )}
        </button>

        {/* Hover tooltip */}
        {hovered && (
          <div
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-[#0e0d18] text-[#f0ede8] rounded-xl shadow-2xl z-50 p-3 pointer-events-none"
            style={{ minWidth: 220 }}
          >
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0e0d18]" />
            <div className="flex items-center gap-3 mb-2">
              <TrophySvg type={badge.type} level={badge.level} size={52} />
              <div>
                <p className="font-display font-bold text-[#f0ede8] text-sm leading-tight">{def.name}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: colors.hex }}>{colors.label} Tier</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((l) => (
                    <div key={l} className={`h-1 w-4 rounded-full ${l <= badge.level ? colors.bar : 'bg-[#f0ede8]/20'}`} />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-[#f0ede8]/70 leading-relaxed mb-2">{def.description}</p>
            {badge.nextLevelScore !== null ? (
              <div>
                <div className="flex justify-between text-[9px] text-[#f0ede8]/50 mb-1">
                  <span>{badge.score} pts</span>
                  <span>{badge.nextLevelScore} to next tier</span>
                </div>
                <div className="h-1 bg-[#f0ede8]/20 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${colors.bar}`} style={{ width: `${badge.progressPct}%` }} />
                </div>
              </div>
            ) : (
              <p className="text-[10px] font-bold text-center" style={{ color: colors.hex }}>🏆 Hall of Famer</p>
            )}
          </div>
        )}
      </div>

      {/* Click → bottom-sheet modal with full details */}
      {modalOpen && (
        <div className="fixed inset-0 z-60 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md bg-[#0e0d18] border-t-2 rounded-t-2xl shadow-2xl p-5 pb-8" style={{ borderColor: colors.hex }}>

            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-[#f0ede8]/50 hover:text-[#f0ede8] transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <TrophySvg type={badge.type} level={badge.level} size={72} />
              <div>
                <p className="font-display font-black text-[#f0ede8] text-xl leading-tight">{def.name}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: colors.hex }}>
                  {colors.label} Tier
                </p>
                <div className="flex gap-1 mt-1.5">
                  {[1, 2, 3, 4, 5].map((l) => (
                    <div key={l} className={`h-1.5 w-5 rounded-full ${l <= badge.level ? colors.bar : 'bg-[#f0ede8]/15'}`} />
                  ))}
                </div>
              </div>
            </div>

            <p className="text-sm text-[#f0ede8]/80 leading-relaxed mb-4">{def.description}</p>

            {badge.nextLevelScore !== null ? (
              <div>
                <div className="flex justify-between text-[10px] text-[#f0ede8]/50 mb-1.5">
                  <span>{badge.score} pts earned</span>
                  <span>{badge.nextLevelScore} pts to next tier</span>
                </div>
                <div className="h-2 bg-[#f0ede8]/15 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${colors.bar}`} style={{ width: `${badge.progressPct}%` }} />
                </div>
              </div>
            ) : (
              <p className="text-center text-sm font-bold" style={{ color: colors.hex }}>
                🏆 Hall of Famer — Max tier reached
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
