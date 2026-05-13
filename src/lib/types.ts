export interface Team {
  id: string;
  name: string;
  city: string;
  league: string;
  emoji: string;
  color: string;
}

export type FandomLevel = 'diehard' | 'supporter' | 'fair-weather' | 'casual';

export const FANDOM_LABELS: Record<FandomLevel, string> = {
  diehard: 'Diehard',
  supporter: 'Supporter',
  'fair-weather': 'Fair Weather',
  casual: 'Casual',
};

export interface FanTeam {
  team: Team;
  rank: number;
  fandomLevel: FandomLevel;
}

export interface UserStats {
  debatesWon: number;
  debatesLost: number;
  debatesDrew: number;
  betsWon: number;
  betsLost: number;
  betsPending: number;
  hotTakesPosted: number;
  hotTakeReactions: number;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  fanTeams: FanTeam[];
  stats: UserStats;
  followingIds: string[];   // "My Neighbors" — people you follow
  followerIds: string[];
  groupIds: string[];       // "My Groups" — neighborhoods/chats you're in
}

export interface Reaction {
  emoji: string;
  userIds: string[];
}

export type MessageTag = 'hot-take' | 'debate' | 'bet';

export interface Message {
  id: string;
  chatId: string;
  userId: string;
  content: string;
  timestamp: string;
  tag?: MessageTag;
  taggedDebateId?: string;
  reactions: Reaction[];
  mediaUrl?: string;
  mediaType?: 'photo' | 'video' | 'link';
  replyToId?: string;
}

export interface Chat {
  id: string;
  name: string;
  emoji: string;
  memberIds: string[];
  messages: Message[];
  teamIds: string[];
}

export type VoteChoice = 'side1' | 'side2' | 'draw';

export interface DebateVote {
  userId: string;
  choice: VoteChoice;
}

export interface DebateArgument {
  id: string;
  userId: string;
  side: 'side1' | 'side2';
  content: string;
  timestamp: string;
  reactions: Reaction[];
}

export interface Debate {
  id: string;
  chatId: string;
  chatName: string;
  claim: string;
  side1UserIds: string[];   // multiple users can be on each side
  side2UserIds: string[];
  side1Label?: string;      // optional custom label (e.g. "Team LeBron")
  side2Label?: string;
  arguments: DebateArgument[];
  votes: DebateVote[];
  status: 'active' | 'resolved';
  resolution?: VoteChoice;
  teamIds: string[];
  createdAt: string;
  resolvedAt?: string;
  isPublic?: boolean;
}

export type BetStatus = 'pending' | 'active' | 'awaiting-resolution' | 'resolved' | 'disputed';

export interface BetResolutionProposal {
  proposedBy: string;
  winnerId?: string;
  isPush: boolean;
  agreements: string[];
  disputes: string[];
}

export interface Bet {
  id: string;
  chatId: string;
  chatName: string;
  claim: string;
  participantIds: string[];
  side1Ids?: string[];
  side2Ids?: string[];
  side1Label?: string;
  side2Label?: string;
  stakes?: string;
  status: BetStatus;
  proposal?: BetResolutionProposal;
  winnerId?: string;
  isPush?: boolean;
  teamIds: string[];
  createdAt: string;
  resolvedAt?: string;
  isPublic?: boolean;
}

export interface HotTakeComment {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
}

export interface HotTake {
  id: string;
  chatId: string;
  chatName: string;
  content: string;
  authorId: string;
  reactions: Reaction[];
  teamIds: string[];
  createdAt: string;
  isPublic?: boolean;
  comments?: HotTakeComment[];
}

export interface MediaItem {
  id: string;
  chatId: string;
  senderId: string;
  type: 'photo' | 'video' | 'link';
  url: string;
  thumbnail?: string;
  title?: string;
  teamIds: string[];
  createdAt: string;
}
