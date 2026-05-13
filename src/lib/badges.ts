import { HOT_TAKES, DEBATES, BETS, ANALYSES, CHATS, getUserById } from './mock-data';

// ── Types ─────────────────────────────────────────────────────────────────────

export type BadgeType = 'debater' | 'analyst' | 'chatter' | 'gambler' | 'troll' | 'homer' | 'tailgater';

export interface BadgeLevelInfo {
  level: 1 | 2 | 3 | 4 | 5;
  name: string;
  minScore: number;
}

export interface BadgeDefinition {
  type: BadgeType;
  emoji: string;
  name: string;
  description: string;   // shown on hover — what the badge tracks
  levels: BadgeLevelInfo[];
}

export interface UserBadge {
  type: BadgeType;
  score: number;
  level: 1 | 2 | 3 | 4 | 5;
  levelName: string;
  nextLevelScore: number | null; // null when Hall of Famer
  progressPct: number;           // 0-100 within current level
}

// ── Definitions ───────────────────────────────────────────────────────────────

export const BADGE_LEVELS: BadgeLevelInfo[] = [
  { level: 1, name: 'Recreational', minScore: 0   },
  { level: 2, name: 'Amateur',      minScore: 50  },
  { level: 3, name: 'Professional', minScore: 200 },
  { level: 4, name: 'All-Star',     minScore: 500 },
  { level: 5, name: 'Hall of Famer',minScore: 1000 },
];

export const BADGE_DEFINITIONS: Record<BadgeType, BadgeDefinition> = {
  debater: {
    type: 'debater',
    emoji: '⚔️',
    name: 'Debater',
    description: 'Earned by starting debates, posting arguments, and voting. The more you argue your side the higher you climb.',
    levels: BADGE_LEVELS,
  },
  analyst: {
    type: 'analyst',
    emoji: '📊',
    name: 'Analyst',
    description: 'Earned by writing long-form analysis pieces and commenting on others. Deep thinkers rise here.',
    levels: BADGE_LEVELS,
  },
  chatter: {
    type: 'chatter',
    emoji: '💬',
    name: 'Chatter',
    description: 'Earned by staying active in neighborhood chats. The louder your stoop the higher you level up.',
    levels: BADGE_LEVELS,
  },
  gambler: {
    type: 'gambler',
    emoji: '🤝',
    name: 'Gambler',
    description: 'Earned by creating and participating in bets. The more skin you put in the game the more this grows.',
    levels: BADGE_LEVELS,
  },
  troll: {
    type: 'troll',
    emoji: '😈',
    name: 'Troll',
    description: 'Earned by posting hot takes, debates, and bets about your rivals. If you love stirring the pot on enemy turf, this one\'s for you.',
    levels: BADGE_LEVELS,
  },
  homer: {
    type: 'homer',
    emoji: '🏠',
    name: 'Homer',
    description: 'Earned by posting about your favorite teams. The more you rep your squad the higher you climb.',
    levels: BADGE_LEVELS,
  },
  tailgater: {
    type: 'tailgater',
    emoji: '🍺',
    name: 'Tailgater',
    description: 'Earned by reacting, voting, and engaging — even if you don\'t post much. You\'re always there, always hyped.',
    levels: BADGE_LEVELS,
  },
};

// ── Scoring ───────────────────────────────────────────────────────────────────

// Rolling 6-month cutoff — in mock data there are no real timestamps so we use all data.
// When connected to real DB, filter by: new Date(item.createdAt) >= SIX_MONTHS_AGO
// const SIX_MONTHS_AGO = new Date();
// SIX_MONTHS_AGO.setMonth(SIX_MONTHS_AGO.getMonth() - 6);

function scoreDebater(userId: string): number {
  let pts = 0;
  for (const d of DEBATES) {
    const onSide1 = d.side1UserIds.includes(userId);
    const onSide2 = d.side2UserIds.includes(userId);
    if (d.side1UserIds[0] === userId) pts += 10;  // started the debate (first on side1)
    if (onSide1 || onSide2) pts += 3;             // joined a side
    pts += d.arguments.filter((a) => a.userId === userId).length * 5;  // arguments posted
    pts += d.votes.filter((v) => v.userId === userId).length * 2;       // votes cast
  }
  return pts;
}

function scoreAnalyst(userId: string): number {
  let pts = 0;
  for (const a of ANALYSES) {
    if (a.authorId === userId) {
      pts += 20;                                   // posted an analysis
      if (a.isPublic) pts += 10;                  // published to Streets
      pts += Math.min((a.comments ?? []).length * 5, 20); // got comments (capped at 20 per piece)
    }
    pts += (a.comments ?? []).filter((c) => c.userId === userId).length * 3; // commented on analysis
  }
  return pts;
}

function scoreChatter(userId: string): number {
  let pts = 0;
  for (const chat of CHATS) {
    for (const msg of chat.messages) {
      if (msg.userId === userId) {
        pts += 1;
        if (msg.tag) pts += 2;  // tagged message bonus
      }
    }
  }
  return pts;
}

function scoreGambler(userId: string): number {
  let pts = 0;
  for (const b of BETS) {
    if (b.participantIds[0] === userId) pts += 10; // created the bet (first participant)
    if (b.participantIds.includes(userId)) pts += 5;
    if (b.status === 'resolved' && b.winnerId === userId) pts += 20;
    if (b.status === 'resolved' && b.participantIds.includes(userId)) pts += 3;
  }
  return pts;
}

function scoreTroll(userId: string): number {
  const user = getUserById(userId);
  if (!user || user.fanTeams.length === 0) return 0;

  // Rival = same league as a team you follow, but not one of your teams
  const myTeamIds = new Set(user.fanTeams.map((ft) => ft.team.id));
  const myLeagues = new Set(user.fanTeams.map((ft) => ft.team.league));

  let pts = 0;
  const isRival = (teamIds: string[]) =>
    teamIds.some((tid) => !myTeamIds.has(tid)) &&
    teamIds.some((tid) => {
      // check if it shares a league with one of my teams (we don't have full teams-data here,
      // but we can use the league stored on fanTeams)
      return !myTeamIds.has(tid) && myLeagues.size > 0;
    });

  for (const ht of HOT_TAKES) {
    if (ht.authorId === userId && ht.teamIds.length > 0 && isRival(ht.teamIds)) pts += 8;
  }
  for (const d of DEBATES) {
    if ((d.side1UserIds.includes(userId) || d.side2UserIds.includes(userId)) && d.teamIds.length > 0 && isRival(d.teamIds)) pts += 10;
  }
  for (const b of BETS) {
    if (b.participantIds.includes(userId) && b.teamIds.length > 0 && isRival(b.teamIds)) pts += 5;
  }
  return pts;
}

function scoreHomer(userId: string): number {
  const user = getUserById(userId);
  if (!user || user.fanTeams.length === 0) return 0;

  const topTeamId = user.fanTeams.sort((a, b) => a.rank - b.rank)[0]?.team.id;
  if (!topTeamId) return 0;

  let pts = 0;
  for (const ht of HOT_TAKES) {
    if (ht.authorId === userId && ht.teamIds.includes(topTeamId)) {
      pts += 8;
      const fireCount = ht.reactions.find((r) => r.emoji === '🔥')?.userIds.length ?? 0;
      pts += Math.min(fireCount * 2, 10); // reactions on homer posts, capped
    }
  }
  for (const a of ANALYSES) {
    if (a.authorId === userId && a.teamIds.includes(topTeamId)) pts += 15;
  }
  for (const d of DEBATES) {
    if ((d.side1UserIds.includes(userId) || d.side2UserIds.includes(userId)) && d.teamIds.includes(topTeamId)) pts += 10;
  }
  return pts;
}

function scoreTailgater(userId: string): number {
  let pts = 0;
  // Reactions on hot takes
  for (const ht of HOT_TAKES) {
    for (const r of ht.reactions) {
      if (r.userIds.includes(userId) && ht.authorId !== userId) pts += 2;
    }
    // Comments on other people's takes
    pts += (ht.comments ?? []).filter((c) => c.userId === userId && ht.authorId !== userId).length * 2;
  }
  // Votes on debates
  for (const d of DEBATES) {
    if (d.votes.some((v) => v.userId === userId)) pts += 3;
  }
  // Comments on analyses
  for (const a of ANALYSES) {
    pts += (a.comments ?? []).filter((c) => c.userId === userId && a.authorId !== userId).length * 2;
  }
  return pts;
}

// ── Level resolution ──────────────────────────────────────────────────────────

function resolveLevel(score: number): { level: 1 | 2 | 3 | 4 | 5; levelName: string; nextLevelScore: number | null; progressPct: number } {
  const sorted = [...BADGE_LEVELS].sort((a, b) => b.minScore - a.minScore);
  const current = sorted.find((l) => score >= l.minScore) ?? BADGE_LEVELS[0];
  const nextIdx = BADGE_LEVELS.findIndex((l) => l.level === current.level) + 1;
  const next = nextIdx < BADGE_LEVELS.length ? BADGE_LEVELS[nextIdx] : null;

  const rangeStart = current.minScore;
  const rangeEnd = next?.minScore ?? current.minScore + 1;
  const progressPct = next
    ? Math.min(Math.round(((score - rangeStart) / (rangeEnd - rangeStart)) * 100), 99)
    : 100;

  return {
    level: current.level as 1 | 2 | 3 | 4 | 5,
    levelName: current.name,
    nextLevelScore: next ? next.minScore : null,
    progressPct,
  };
}

// ── Main export ───────────────────────────────────────────────────────────────

const SCORERS: Record<BadgeType, (userId: string) => number> = {
  debater:   scoreDebater,
  analyst:   scoreAnalyst,
  chatter:   scoreChatter,
  gambler:   scoreGambler,
  troll:     scoreTroll,
  homer:     scoreHomer,
  tailgater: scoreTailgater,
};

export function computeBadges(userId: string): UserBadge[] {
  return (Object.keys(BADGE_DEFINITIONS) as BadgeType[]).map((type) => {
    const score = SCORERS[type](userId);
    const { level, levelName, nextLevelScore, progressPct } = resolveLevel(score);
    return { type, score, level, levelName, nextLevelScore, progressPct };
  });
}

export function getBadge(userId: string, type: BadgeType): UserBadge {
  const score = SCORERS[type](userId);
  const { level, levelName, nextLevelScore, progressPct } = resolveLevel(score);
  return { type, score, level, levelName, nextLevelScore, progressPct };
}
