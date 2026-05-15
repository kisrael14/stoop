import type { BadgeType } from '@/lib/badges';

interface T { id: string; main: string; light: string; dark: string; mid: string }

const TIERS: Record<number, T> = {
  1: { id: 'stone',  main: '#1E3FA8', light: '#6B90E8', dark: '#0D1F5C', mid: '#183080' },
  2: { id: 'iron',   main: '#228B22', light: '#5CBF5C', dark: '#145214', mid: '#1A6B1A' },
  3: { id: 'bronze', main: '#CD7F32', light: '#E8A86A', dark: '#8B4A0C', mid: '#C07030' },
  4: { id: 'silver', main: '#C0C0C0', light: '#E8E8E8', dark: '#888888', mid: '#D0D0D0' },
  5: { id: 'gold',   main: '#FFD700', light: '#FFF0A0', dark: '#B8960C', mid: '#E8C200' },
};

function Base({ t }: { t: T }) {
  return (
    <>
      <rect x="28" y="143" width="64" height="10" rx="5" fill={t.dark}/>
      <rect x="40" y="133" width="40" height="12" rx="3" fill={t.mid}/>
      <rect x="50" y="122" width="20" height="13" rx="2" fill={t.main}/>
    </>
  );
}

export default function TrophySvg({ type, level, size = 60 }: { type: BadgeType; level: 1|2|3|4|5; size?: number }) {
  const t = TIERS[level];
  const u = `${type}-${level}`;
  const h = Math.round(size * (160 / 120));

  if (type === 'debater') return (
    <svg viewBox="0 0 120 160" width={size} height={h} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`db-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.main}/><stop offset="100%" stopColor={t.dark}/>
        </linearGradient>
      </defs>
      <Base t={t}/>
      <path d="M22 65 Q18 90 28 108 Q40 122 60 122 Q80 122 92 108 Q102 90 98 65 Z" fill={`url(#db-${u})`}/>
      <path d="M30 72 Q27 88 32 102 Q28 90 30 72Z" fill={t.light} opacity="0.35"/>
      <rect x="20" y="58" width="80" height="10" rx="5" fill={t.light}/>
      <path d="M22 72 Q4 75 6 95 Q6 112 28 108" stroke={t.main} strokeWidth="9" fill="none" strokeLinecap="round"/>
      <path d="M98 72 Q116 75 114 95 Q114 112 92 108" stroke={t.main} strokeWidth="9" fill="none" strokeLinecap="round"/>
      <path d="M22 72 Q4 75 6 95 Q6 112 28 108" stroke={t.light} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4"/>
      <path d="M98 72 Q116 75 114 95 Q114 112 92 108" stroke={t.light} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4"/>
      <ellipse cx="60" cy="95" rx="20" ry="14" fill={t.dark} opacity="0.55"/>
      <rect x="44" y="87" width="7" height="8" rx="2" fill="white" opacity="0.9"/>
      <rect x="53" y="85" width="7" height="10" rx="2" fill="white" opacity="0.9"/>
      <rect x="62" y="85" width="7" height="10" rx="2" fill="white" opacity="0.9"/>
      <rect x="71" y="87" width="7" height="8" rx="2" fill="white" opacity="0.9"/>
      <line x1="42" y1="76" x2="54" y2="80" stroke={t.light} strokeWidth="4" strokeLinecap="round"/>
      <line x1="78" y1="76" x2="66" y2="80" stroke={t.light} strokeWidth="4" strokeLinecap="round"/>
      <rect x="62" y="18" width="42" height="24" rx="10" fill={t.light}/>
      <polygon points="70,42 66,52 78,42" fill={t.light}/>
      <text x="83" y="35" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fill={t.dark} fontWeight="bold">WRONG!</text>
      <rect x="18" y="26" width="36" height="18" rx="8" fill={t.mid}/>
      <polygon points="46,44 50,52 54,44" fill={t.mid}/>
      <text x="36" y="39" textAnchor="middle" fontFamily="sans-serif" fontSize="9" fill="white" fontWeight="bold">STATS!</text>
    </svg>
  );

  if (type === 'analyst') return (
    <svg viewBox="0 0 120 160" width={size} height={h} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`an-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.light}/><stop offset="100%" stopColor={t.dark}/>
        </linearGradient>
      </defs>
      <Base t={t}/>
      <path d="M32 122 L22 65 L98 65 L88 122 Z" fill={`url(#an-${u})`}/>
      <path d="M26 68 L36 120 L34 120 L24 68Z" fill={t.light} opacity="0.3"/>
      <rect x="18" y="20" width="84" height="52" rx="6" fill={t.dark}/>
      <rect x="22" y="24" width="76" height="42" rx="4" fill="#1a2a1a" opacity="0.8"/>
      <rect x="22" y="24" width="76" height="42" rx="4" fill={t.main} opacity="0.15"/>
      <line x1="22" y1="35" x2="98" y2="35" stroke={t.light} strokeWidth="1.5" opacity="0.5"/>
      <line x1="22" y1="46" x2="98" y2="46" stroke={t.light} strokeWidth="1.5" opacity="0.5"/>
      <line x1="22" y1="57" x2="98" y2="57" stroke={t.light} strokeWidth="1.5" opacity="0.5"/>
      <line x1="44" y1="24" x2="44" y2="66" stroke={t.light} strokeWidth="1.5" opacity="0.5"/>
      <line x1="66" y1="24" x2="66" y2="66" stroke={t.light} strokeWidth="1.5" opacity="0.5"/>
      <rect x="48" y="50" width="6" height="12" rx="1" fill={t.main} opacity="0.9"/>
      <rect x="57" y="40" width="6" height="22" rx="1" fill={t.light} opacity="0.9"/>
      <rect x="70" y="44" width="6" height="18" rx="1" fill={t.main} opacity="0.7"/>
      <rect x="79" y="34" width="6" height="28" rx="1" fill={t.light} opacity="0.8"/>
      <polyline points="48,58 60,46 70,50 85,36" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="14" y="70" width="92" height="8" rx="4" fill={t.mid}/>
      <circle cx="92" cy="22" r="13" fill="none" stroke={t.light} strokeWidth="4"/>
      <circle cx="92" cy="22" r="13" fill={t.dark} opacity="0.4"/>
      <line x1="101" y1="31" x2="110" y2="42" stroke={t.light} strokeWidth="5" strokeLinecap="round"/>
      <line x1="85" y1="22" x2="99" y2="22" stroke={t.light} strokeWidth="2" opacity="0.7"/>
      <line x1="92" y1="15" x2="92" y2="29" stroke={t.light} strokeWidth="2" opacity="0.7"/>
    </svg>
  );

  if (type === 'chatter') return (
    <svg viewBox="0 0 120 160" width={size} height={h} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`ch-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.main}/><stop offset="100%" stopColor={t.dark}/>
        </linearGradient>
      </defs>
      <Base t={t}/>
      <path d="M28 68 Q24 90 32 108 Q42 122 60 122 Q78 122 88 108 Q96 90 92 68 Z" fill={`url(#ch-${u})`}/>
      <rect x="26" y="62" width="68" height="9" rx="4" fill={t.light}/>
      <path d="M34 74 Q31 90 35 105 Q31 90 34 74Z" fill={t.light} opacity="0.3"/>
      <path d="M28 76 Q10 80 12 98 Q12 112 32 108" stroke={t.main} strokeWidth="8" fill="none" strokeLinecap="round"/>
      <path d="M92 76 Q110 80 108 98 Q108 112 88 108" stroke={t.main} strokeWidth="8" fill="none" strokeLinecap="round"/>
      <path d="M38 92 Q60 115 82 92" fill={t.dark} opacity="0.5"/>
      <path d="M38 92 Q60 108 82 92" fill="white" opacity="0.85"/>
      <ellipse cx="60" cy="105" rx="10" ry="6" fill="#e05060" opacity="0.9"/>
      <circle cx="46" cy="80" r="8" fill="white" opacity="0.9"/>
      <circle cx="74" cy="80" r="8" fill="white" opacity="0.9"/>
      <circle cx="48" cy="80" r="4" fill={t.dark}/>
      <circle cx="76" cy="80" r="4" fill={t.dark}/>
      <circle cx="50" cy="78" r="1.5" fill="white"/>
      <circle cx="78" cy="78" r="1.5" fill="white"/>
      <rect x="30" y="22" width="30" height="18" rx="8" fill={t.light}/>
      <polygon points="38,40 42,50 48,40" fill={t.light}/>
      <text x="45" y="35" textAnchor="middle" fontFamily="sans-serif" fontSize="9" fill={t.dark} fontWeight="bold">YO!</text>
      <rect x="62" y="14" width="46" height="22" rx="9" fill={t.mid}/>
      <polygon points="74,36 70,46 80,36" fill={t.mid}/>
      <text x="85" y="26" textAnchor="middle" fontFamily="sans-serif" fontSize="8" fill="white" fontWeight="bold">DID YOU</text>
      <text x="85" y="36" textAnchor="middle" fontFamily="sans-serif" fontSize="8" fill="white" fontWeight="bold">SEE THAT</text>
      <path d="M8 85 Q2 92 8 99" stroke={t.light} strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.7"/>
      <path d="M2 80 Q-6 92 2 104" stroke={t.light} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.4"/>
    </svg>
  );

  if (type === 'gambler') return (
    <svg viewBox="0 0 120 160" width={size} height={h} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`gm-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.light}/><stop offset="100%" stopColor={t.dark}/>
        </linearGradient>
      </defs>
      <Base t={t}/>
      <path d="M26 68 Q22 92 30 110 Q42 122 60 122 Q78 122 90 110 Q98 92 94 68 Z" fill={`url(#gm-${u})`}/>
      <ellipse cx="60" cy="68" rx="34" ry="9" fill={t.light}/>
      <path d="M30 76 Q27 95 32 108 Q28 92 30 76Z" fill={t.light} opacity="0.3"/>
      <ellipse cx="38" cy="62" rx="13" ry="5" fill={t.dark} opacity="0.6" transform="rotate(-10,38,62)"/>
      <rect x="26" y="48" width="26" height="14" fill={t.mid} transform="rotate(-10,38,55)"/>
      <ellipse cx="38" cy="48" rx="13" ry="5" fill={t.main} transform="rotate(-10,38,48)"/>
      <ellipse cx="38" cy="45" rx="13" ry="5" fill={t.light} transform="rotate(-10,38,45)"/>
      <ellipse cx="82" cy="62" rx="13" ry="5" fill={t.dark} opacity="0.6" transform="rotate(10,82,62)"/>
      <rect x="70" y="48" width="26" height="14" fill={t.mid} transform="rotate(10,82,55)"/>
      <ellipse cx="82" cy="48" rx="13" ry="5" fill={t.main} transform="rotate(10,82,48)"/>
      <ellipse cx="82" cy="45" rx="13" ry="5" fill={t.light} transform="rotate(10,82,45)"/>
      <rect x="40" y="15" width="28" height="38" rx="4" fill={t.dark} transform="rotate(-20,54,34)"/>
      <rect x="43" y="18" width="22" height="32" rx="2" fill={t.mid} transform="rotate(-20,54,34)" opacity="0.7"/>
      <rect x="46" y="12" width="28" height="38" rx="4" fill="white"/>
      <text x="60" y="40" textAnchor="middle" fontFamily="serif" fontSize="22" fill="#cc2222" fontWeight="bold">♠</text>
      <text x="52" y="24" textAnchor="middle" fontFamily="serif" fontSize="11" fill="#cc2222">A</text>
      <rect x="52" y="15" width="28" height="38" rx="4" fill={t.dark} transform="rotate(20,66,34)"/>
      <rect x="55" y="18" width="22" height="32" rx="2" fill={t.mid} transform="rotate(20,66,34)" opacity="0.7"/>
      <text x="18" y="50" fontFamily="sans-serif" fontSize="16" fill={t.light} opacity="0.8">$</text>
      <text x="98" y="44" fontFamily="sans-serif" fontSize="20" fill={t.light} opacity="0.7">$</text>
      <text x="60" y="105" textAnchor="middle" fontFamily="sans-serif" fontSize="28" fill={t.dark} opacity="0.45" fontWeight="bold">$$$</text>
    </svg>
  );

  if (type === 'troll') return (
    <svg viewBox="0 0 120 160" width={size} height={h} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`tr-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.main}/><stop offset="100%" stopColor={t.dark}/>
        </linearGradient>
      </defs>
      <Base t={t}/>
      <path d="M26 70 Q22 92 30 110 Q42 122 60 122 Q78 122 90 110 Q98 92 94 70 Z" fill={`url(#tr-${u})`}/>
      <rect x="24" y="63" width="72" height="10" rx="5" fill={t.light}/>
      <path d="M31 78 Q29 93 33 108 Q29 92 31 78Z" fill={t.light} opacity="0.3"/>
      <path d="M26 80 Q8 82 10 100 Q10 114 30 110" stroke={t.main} strokeWidth="8" fill="none" strokeLinecap="round"/>
      <path d="M94 80 Q112 82 110 100 Q110 114 90 110" stroke={t.main} strokeWidth="8" fill="none" strokeLinecap="round"/>
      <ellipse cx="60" cy="95" rx="24" ry="20" fill={t.dark} opacity="0.45"/>
      <path d="M42 102 Q60 118 78 102" fill={t.dark} opacity="0.6"/>
      <path d="M42 102 Q60 114 78 102 L76 102 Q60 112 44 102Z" fill="white" opacity="0.9"/>
      <rect x="46" y="100" width="7" height="9" rx="1" fill="white" opacity="0.9"/>
      <rect x="55" y="98" width="7" height="11" rx="1" fill="white" opacity="0.9"/>
      <rect x="64" y="98" width="7" height="11" rx="1" fill="white" opacity="0.9"/>
      <rect x="73" y="100" width="7" height="9" rx="1" fill="white" opacity="0.9"/>
      <circle cx="48" cy="84" r="9" fill="white" opacity="0.9"/>
      <circle cx="72" cy="84" r="9" fill="white" opacity="0.9"/>
      <circle cx="50" cy="84" r="5" fill="#cc2222"/>
      <circle cx="74" cy="84" r="5" fill="#cc2222"/>
      <circle cx="52" cy="82" r="2" fill="white"/>
      <circle cx="76" cy="82" r="2" fill="white"/>
      <rect x="40" y="73" width="18" height="5" rx="2" fill={t.dark} transform="rotate(15,49,75)"/>
      <rect x="62" y="73" width="18" height="5" rx="2" fill={t.dark} transform="rotate(-15,71,75)"/>
      <polygon points="38,66 30,30 46,60" fill={t.main}/>
      <polygon points="52,63 46,22 60,58" fill={t.light}/>
      <polygon points="60,62 60,18 68,62" fill={t.main}/>
      <polygon points="72,63 74,22 84,60" fill={t.light}/>
      <polygon points="82,66 90,30 96,64" fill={t.main}/>
      <text x="10" y="58" fontSize="14">😈</text>
      <text x="100" y="52" fontSize="14">🔥</text>
    </svg>
  );

  if (type === 'homer') return (
    <svg viewBox="0 0 120 160" width={size} height={h} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`hm-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.light}/><stop offset="100%" stopColor={t.dark}/>
        </linearGradient>
      </defs>
      <Base t={t}/>
      <path d="M30 70 Q24 94 32 112 Q44 122 60 122 Q76 122 88 112 Q96 94 90 70 Z" fill={`url(#hm-${u})`}/>
      <ellipse cx="60" cy="70" rx="30" ry="8" fill={t.light}/>
      <path d="M34 78 Q31 95 35 110 Q31 93 34 78Z" fill={t.light} opacity="0.3"/>
      <rect x="30" y="40" width="60" height="36" rx="12" fill={t.main}/>
      <rect x="34" y="44" width="16" height="6" rx="3" fill={t.light} opacity="0.4"/>
      <rect x="48" y="8" width="24" height="40" rx="12" fill={t.main}/>
      <ellipse cx="60" cy="8" rx="12" ry="10" fill={t.light}/>
      <ellipse cx="60" cy="10" rx="9" ry="7" fill={t.main}/>
      <line x1="50" y1="30" x2="70" y2="30" stroke={t.dark} strokeWidth="2" opacity="0.3" strokeLinecap="round"/>
      <line x1="50" y1="22" x2="70" y2="22" stroke={t.dark} strokeWidth="2" opacity="0.3" strokeLinecap="round"/>
      <text x="60" y="66" textAnchor="middle" fontFamily="sans-serif" fontSize="20" fill={t.dark} opacity="0.6" fontWeight="bold">#1</text>
      <polygon points="16,40 18,33 20,40 27,40 21,44 23,51 18,47 13,51 15,44 9,40" fill={t.main} opacity="0.9"/>
      <polygon points="104,40 106,33 108,40 115,40 109,44 111,51 106,47 101,51 103,44 97,40" fill={t.main} opacity="0.9"/>
      <polygon points="18,22 19,17 21,22 26,22 22,25 23,30 19,27 15,30 16,25 12,22" fill={t.light} opacity="0.7"/>
      <polygon points="102,22 103,17 105,22 110,22 106,25 107,30 103,27 99,30 100,25 96,22" fill={t.light} opacity="0.7"/>
      <rect x="32" y="90" width="56" height="16" rx="4" fill={t.dark} opacity="0.5"/>
      <text x="60" y="102" textAnchor="middle" fontFamily="sans-serif" fontSize="9" fill={t.light} fontWeight="bold">WE&apos;RE #1</text>
    </svg>
  );

  if (type === 'tailgater') return (
    <svg viewBox="0 0 120 160" width={size} height={h} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`tg-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.light}/><stop offset="100%" stopColor={t.dark}/>
        </linearGradient>
      </defs>
      <rect x="20" y="143" width="80" height="10" rx="5" fill={t.dark}/>
      <rect x="34" y="133" width="52" height="12" rx="3" fill={t.mid}/>
      <rect x="48" y="122" width="24" height="13" rx="2" fill={t.main}/>
      <line x1="38" y1="122" x2="28" y2="143" stroke={t.dark} strokeWidth="7" strokeLinecap="round"/>
      <line x1="82" y1="122" x2="92" y2="143" stroke={t.dark} strokeWidth="7" strokeLinecap="round"/>
      <line x1="32" y1="136" x2="88" y2="136" stroke={t.mid} strokeWidth="5" strokeLinecap="round"/>
      <path d="M18 95 Q16 115 32 122 Q44 128 60 128 Q76 128 88 122 Q104 115 102 95 Z" fill={`url(#tg-${u})`}/>
      <path d="M22 98 Q20 112 28 120 Q22 110 22 98Z" fill={t.light} opacity="0.3"/>
      <ellipse cx="60" cy="95" rx="42" ry="10" fill={t.main}/>
      <path d="M18 95 Q16 65 60 55 Q104 65 102 95 Z" fill={t.main}/>
      <path d="M24 92 Q22 72 40 62 Q24 74 24 92Z" fill={t.light} opacity="0.35"/>
      <ellipse cx="60" cy="95" rx="42" ry="10" fill={t.light} opacity="0.2"/>
      <rect x="52" y="49" width="16" height="10" rx="5" fill={t.light}/>
      <line x1="28" y1="100" x2="92" y2="100" stroke={t.dark} strokeWidth="3" opacity="0.6"/>
      <line x1="26" y1="108" x2="94" y2="108" stroke={t.dark} strokeWidth="3" opacity="0.5"/>
      <line x1="40" y1="95" x2="40" y2="118" stroke={t.dark} strokeWidth="2.5" opacity="0.4"/>
      <line x1="55" y1="94" x2="55" y2="120" stroke={t.dark} strokeWidth="2.5" opacity="0.4"/>
      <line x1="70" y1="94" x2="70" y2="120" stroke={t.dark} strokeWidth="2.5" opacity="0.4"/>
      <line x1="85" y1="95" x2="85" y2="118" stroke={t.dark} strokeWidth="2.5" opacity="0.4"/>
      <text x="38" y="85" fontSize="18">🍔</text>
      <text x="62" y="83" fontSize="16">🌭</text>
      <path d="M36 55 Q30 44 36 34 Q42 24 36 14" stroke={t.light} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.65"/>
      <path d="M60 52 Q54 40 60 30 Q66 20 60 10" stroke={t.light} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.5"/>
      <path d="M84 55 Q90 44 84 34 Q78 24 84 14" stroke={t.light} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.55"/>
      <text x="50" y="116" fontSize="12">🔥</text>
      <text x="65" y="118" fontSize="10">🔥</text>
    </svg>
  );

  if (type === 'socialite') return (
    <svg viewBox="0 0 120 160" width={size} height={h} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`sc-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.light}/><stop offset="100%" stopColor={t.dark}/>
        </linearGradient>
        <radialGradient id={`sc-gem-${u}`} cx="35%" cy="25%">
          <stop offset="0%" stopColor="white"/>
          <stop offset="60%" stopColor={t.light}/>
          <stop offset="100%" stopColor={t.dark}/>
        </radialGradient>
      </defs>
      <Base t={t}/>
      <path d="M34 70 L30 122 L90 122 L86 70 Z" fill={`url(#sc-${u})`}/>
      <rect x="26" y="64" width="68" height="10" rx="5" fill={t.light}/>
      <path d="M36 74 L33 118 L31 118 L34 74Z" fill={t.light} opacity="0.3"/>
      <rect x="24" y="50" width="72" height="18" rx="5" fill={t.main}/>
      <circle cx="40" cy="59" r="5" fill={`url(#sc-gem-${u})`}/>
      <circle cx="60" cy="59" r="6" fill={`url(#sc-gem-${u})`}/>
      <circle cx="80" cy="59" r="5" fill={`url(#sc-gem-${u})`}/>
      <polygon points="28,52 34,18 44,52" fill={t.main}/>
      <circle cx="34" cy="16" r="7" fill={t.light}/>
      <circle cx="34" cy="16" r="4" fill={`url(#sc-gem-${u})`}/>
      <polygon points="50,52 60,8 70,52" fill={t.light}/>
      <circle cx="60" cy="6" r="9" fill={t.main}/>
      <circle cx="60" cy="6" r="6" fill={`url(#sc-gem-${u})`}/>
      <polygon points="76,52 86,18 92,52" fill={t.main}/>
      <circle cx="86" cy="16" r="7" fill={t.light}/>
      <circle cx="86" cy="16" r="4" fill={`url(#sc-gem-${u})`}/>
      <line x1="60" y1="70" x2="60" y2="84" stroke={t.light} strokeWidth="2" opacity="0.6"/>
      <rect x="44" y="84" width="32" height="20" rx="5" fill={t.dark} opacity="0.65"/>
      <text x="60" y="94" textAnchor="middle" fontFamily="sans-serif" fontSize="8" fill={t.light} fontWeight="bold">★ VIP ★</text>
      <text x="60" y="103" textAnchor="middle" fontFamily="sans-serif" fontSize="7" fill={t.light} opacity="0.7">ALL ACCESS</text>
      <text x="6" y="42" fontSize="13">✨</text>
      <text x="100" y="36" fontSize="12">✨</text>
      <text x="12" y="70" fontSize="10">💎</text>
      <text x="102" y="72" fontSize="10">💎</text>
      <text x="60" y="118" textAnchor="middle" fontSize="15">🥂</text>
    </svg>
  );

  return null;
}
