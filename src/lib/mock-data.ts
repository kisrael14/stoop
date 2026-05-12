import type { User, Team, Chat, Debate, Bet, HotTake } from './types';

export const TEAMS: Team[] = [
  { id: 'giants', name: 'Giants', city: 'New York', league: 'NFL', emoji: '🏈', color: '#0b2265' },
  { id: 'knicks', name: 'Knicks', city: 'New York', league: 'NBA', emoji: '🏀', color: '#006bb6' },
  { id: 'yankees', name: 'Yankees', city: 'New York', league: 'MLB', emoji: '⚾', color: '#003087' },
  { id: 'rangers', name: 'Rangers', city: 'New York', league: 'NHL', emoji: '🏒', color: '#0038a8' },
  { id: 'chiefs', name: 'Chiefs', city: 'Kansas City', league: 'NFL', emoji: '🏈', color: '#e31837' },
  { id: 'lakers', name: 'Lakers', city: 'Los Angeles', league: 'NBA', emoji: '🏀', color: '#552583' },
  { id: 'eagles', name: 'Eagles', city: 'Philadelphia', league: 'NFL', emoji: '🏈', color: '#004c54' },
  { id: 'sixers', name: '76ers', city: 'Philadelphia', league: 'NBA', emoji: '🏀', color: '#006bb6' },
  { id: 'warriors', name: 'Warriors', city: 'Golden State', league: 'NBA', emoji: '🏀', color: '#1d428a' },
  { id: 'niners', name: '49ers', city: 'San Francisco', league: 'NFL', emoji: '🏈', color: '#aa0000' },
  { id: 'cowboys', name: 'Cowboys', city: 'Dallas', league: 'NFL', emoji: '🏈', color: '#003594' },
  { id: 'mavs', name: 'Mavericks', city: 'Dallas', league: 'NBA', emoji: '🏀', color: '#00538c' },
];

export const USERS: User[] = [
  {
    id: 'me',
    username: 'jhayes23',
    displayName: 'Jordan Hayes',
    avatar: '🤙',
    bio: 'Born & raised in the Bronx. Bleed blue. If you talk crazy about the Giants or Knicks, I\'m ready.',
    fanTeams: [
      { team: TEAMS[0], rank: 1 },
      { team: TEAMS[1], rank: 2 },
      { team: TEAMS[2], rank: 3 },
      { team: TEAMS[3], rank: 4 },
    ],
    stats: {
      debatesWon: 7,
      debatesLost: 3,
      debatesDrew: 1,
      betsWon: 5,
      betsLost: 2,
      betsPending: 2,
      hotTakesPosted: 14,
      hotTakeReactions: 89,
    },
    followingIds: ['marcus', 'deshawn', 'sofia', 'tre'],
    followerIds: ['marcus', 'deshawn', 'sofia', 'tre'],
  },
  {
    id: 'marcus',
    username: 'mwebb_chief',
    displayName: 'Marcus Webb',
    avatar: '👑',
    bio: 'Chiefs Kingdom forever. Laker Nation. Don\'t @ me.',
    fanTeams: [
      { team: TEAMS[4], rank: 1 },
      { team: TEAMS[5], rank: 2 },
    ],
    stats: {
      debatesWon: 4,
      debatesLost: 6,
      debatesDrew: 2,
      betsWon: 3,
      betsLost: 4,
      betsPending: 1,
      hotTakesPosted: 22,
      hotTakeReactions: 134,
    },
    followingIds: ['me', 'deshawn', 'sofia', 'tre'],
    followerIds: ['me', 'deshawn', 'sofia', 'tre'],
  },
  {
    id: 'deshawn',
    username: 'd_payne_eagles',
    displayName: 'DeShawn Payne',
    avatar: '🦅',
    bio: 'E-A-G-L-E-S. Trust the process. Ring the bell.',
    fanTeams: [
      { team: TEAMS[6], rank: 1 },
      { team: TEAMS[7], rank: 2 },
    ],
    stats: {
      debatesWon: 9,
      debatesLost: 2,
      debatesDrew: 0,
      betsWon: 6,
      betsLost: 1,
      betsPending: 0,
      hotTakesPosted: 18,
      hotTakeReactions: 211,
    },
    followingIds: ['me', 'marcus', 'sofia', 'tre'],
    followerIds: ['me', 'marcus', 'sofia', 'tre'],
  },
  {
    id: 'sofia',
    username: 'sofia_warriors',
    displayName: 'Sofia Rivera',
    avatar: '💪',
    bio: 'Bay Area born. Warriors until I die. 49ers faithful.',
    fanTeams: [
      { team: TEAMS[8], rank: 1 },
      { team: TEAMS[9], rank: 2 },
    ],
    stats: {
      debatesWon: 5,
      debatesLost: 4,
      debatesDrew: 3,
      betsWon: 4,
      betsLost: 3,
      betsPending: 1,
      hotTakesPosted: 9,
      hotTakeReactions: 67,
    },
    followingIds: ['me', 'marcus', 'deshawn', 'tre'],
    followerIds: ['me', 'marcus', 'deshawn', 'tre'],
  },
  {
    id: 'tre',
    username: 'trewill_stars',
    displayName: 'Tre Williams',
    avatar: '⭐',
    bio: 'America\'s Team. If you know, you know.',
    fanTeams: [
      { team: TEAMS[10], rank: 1 },
      { team: TEAMS[11], rank: 2 },
    ],
    stats: {
      debatesWon: 3,
      debatesLost: 8,
      debatesDrew: 1,
      betsWon: 2,
      betsLost: 5,
      betsPending: 2,
      hotTakesPosted: 31,
      hotTakeReactions: 178,
    },
    followingIds: ['me', 'marcus', 'deshawn', 'sofia'],
    followerIds: ['me', 'marcus', 'deshawn', 'sofia'],
  },
];

export const ME = USERS[0];

export const CHATS: Chat[] = [
  {
    id: 'council',
    name: 'The Council',
    emoji: '🏆',
    memberIds: ['me', 'marcus', 'deshawn', 'sofia', 'tre'],
    teamIds: ['giants', 'chiefs', 'eagles', 'warriors', 'cowboys'],
    messages: [
      {
        id: 'm1',
        chatId: 'council',
        userId: 'marcus',
        content: 'Mahomes is the greatest QB of this generation, no debate needed.',
        timestamp: '2026-05-12T09:00:00Z',
        tag: 'hot-take',
        reactions: [
          { emoji: '🔥', userIds: ['sofia', 'tre'] },
          { emoji: '🧢', userIds: ['me', 'deshawn'] },
        ],
      },
      {
        id: 'm2',
        chatId: 'council',
        userId: 'me',
        content: 'Bro has the easiest schedule in the league every year and a top 3 OL. Let\'s not.',
        timestamp: '2026-05-12T09:03:00Z',
        reactions: [
          { emoji: '💯', userIds: ['deshawn'] },
        ],
      },
      {
        id: 'm3',
        chatId: 'council',
        userId: 'deshawn',
        content: 'LeBron would\'ve won 7 rings with the resources Jordan had. MJ is overrated.',
        timestamp: '2026-05-12T09:15:00Z',
        tag: 'debate',
        reactions: [
          { emoji: '😭', userIds: ['me', 'marcus', 'tre'] },
          { emoji: '💯', userIds: ['sofia'] },
        ],
      },
      {
        id: 'm4',
        chatId: 'council',
        userId: 'tre',
        content: 'Cowboys are winning the NFC this year. I\'ll bet anyone on that.',
        timestamp: '2026-05-12T10:00:00Z',
        tag: 'bet',
        reactions: [
          { emoji: '😂', userIds: ['me', 'deshawn', 'sofia', 'marcus'] },
        ],
      },
      {
        id: 'm5',
        chatId: 'council',
        userId: 'sofia',
        content: 'The Knicks are only relevant because they\'re in New York. Remove the market and nobody talks about them.',
        timestamp: '2026-05-12T10:30:00Z',
        tag: 'hot-take',
        reactions: [
          { emoji: '🔥', userIds: ['marcus', 'deshawn', 'tre'] },
          { emoji: '🤬', userIds: ['me'] },
        ],
      },
      {
        id: 'm6',
        chatId: 'council',
        userId: 'me',
        content: 'The Knicks are a top 5 most valuable franchise in ALL of sports. Respectfully disagree.',
        timestamp: '2026-05-12T10:33:00Z',
        reactions: [
          { emoji: '💯', userIds: ['marcus'] },
        ],
      },
      {
        id: 'm7',
        chatId: 'council',
        userId: 'marcus',
        content: 'Giants beat the Eagles in Week 14. Put something on it, DeShawn.',
        timestamp: '2026-05-12T11:00:00Z',
        tag: 'bet',
        reactions: [
          { emoji: '👀', userIds: ['me', 'sofia', 'tre'] },
          { emoji: '🤝', userIds: ['deshawn'] },
        ],
      },
    ],
  },
  {
    id: 'nyc-ball',
    name: 'NYC Ball 🗽',
    emoji: '🗽',
    memberIds: ['me', 'sofia', 'marcus'],
    teamIds: ['giants', 'knicks', 'yankees'],
    messages: [
      {
        id: 'n1',
        chatId: 'nyc-ball',
        userId: 'sofia',
        content: 'The Yankees are going to the Series this year. Mark it.',
        timestamp: '2026-05-11T18:00:00Z',
        tag: 'hot-take',
        reactions: [
          { emoji: '🔥', userIds: ['me'] },
          { emoji: '🙏', userIds: ['me'] },
        ],
      },
      {
        id: 'n2',
        chatId: 'nyc-ball',
        userId: 'me',
        content: 'Finally someone with sense in this chat',
        timestamp: '2026-05-11T18:02:00Z',
        reactions: [{ emoji: '😂', userIds: ['sofia', 'marcus'] }],
      },
      {
        id: 'n3',
        chatId: 'nyc-ball',
        userId: 'marcus',
        content: 'Knicks or Lakers in the Finals this year. Bet.',
        timestamp: '2026-05-11T19:00:00Z',
        tag: 'bet',
        reactions: [
          { emoji: '🤝', userIds: ['me'] },
          { emoji: '😂', userIds: ['sofia'] },
        ],
      },
    ],
  },
  {
    id: 'nfc-east',
    name: 'NFC East Wars',
    emoji: '🏈',
    memberIds: ['me', 'deshawn', 'tre'],
    teamIds: ['giants', 'eagles', 'cowboys'],
    messages: [
      {
        id: 'e1',
        chatId: 'nfc-east',
        userId: 'deshawn',
        content: 'Eagles are the class of the NFC. Division is over before it started.',
        timestamp: '2026-05-10T14:00:00Z',
        tag: 'hot-take',
        reactions: [
          { emoji: '🔥', userIds: ['deshawn'] },
          { emoji: '🧢', userIds: ['me', 'tre'] },
        ],
      },
      {
        id: 'e2',
        chatId: 'nfc-east',
        userId: 'tre',
        content: 'Cowboys own this division historically. One good season doesn\'t change legacy.',
        timestamp: '2026-05-10T14:15:00Z',
        tag: 'debate',
        reactions: [
          { emoji: '😂', userIds: ['deshawn', 'me'] },
        ],
      },
      {
        id: 'e3',
        chatId: 'nfc-east',
        userId: 'me',
        content: 'Giants sweep both of yall this year. Remember this message.',
        timestamp: '2026-05-10T14:30:00Z',
        tag: 'bet',
        reactions: [
          { emoji: '😭', userIds: ['deshawn', 'tre'] },
          { emoji: '🤝', userIds: ['deshawn'] },
        ],
      },
    ],
  },
];

export const DEBATES: Debate[] = [
  {
    id: 'd1',
    chatId: 'council',
    chatName: 'The Council 🏆',
    claim: 'LeBron would\'ve won 7 rings with the resources Jordan had. MJ is overrated.',
    party1Id: 'deshawn',
    party2Id: 'me',
    votes: [
      { userId: 'sofia', choice: 'party1' },
      { userId: 'marcus', choice: 'party2' },
      { userId: 'tre', choice: 'party2' },
    ],
    status: 'active',
    teamIds: [],
    createdAt: '2026-05-12T09:15:00Z',
  },
  {
    id: 'd2',
    chatId: 'nfc-east',
    chatName: 'NFC East Wars 🏈',
    claim: 'Cowboys own this division historically. One good Eagles season doesn\'t change legacy.',
    party1Id: 'tre',
    party2Id: 'deshawn',
    votes: [
      { userId: 'me', choice: 'party2' },
      { userId: 'deshawn', choice: 'party2' },
    ],
    status: 'active',
    teamIds: ['eagles', 'cowboys'],
    createdAt: '2026-05-10T14:15:00Z',
  },
  {
    id: 'd3',
    chatId: 'council',
    chatName: 'The Council 🏆',
    claim: 'Mahomes has the easiest schedule in the league. His stats are inflated.',
    party1Id: 'me',
    party2Id: 'marcus',
    votes: [
      { userId: 'deshawn', choice: 'party1' },
      { userId: 'sofia', choice: 'party2' },
      { userId: 'tre', choice: 'party1' },
      { userId: 'marcus', choice: 'party2' },
    ],
    status: 'resolved',
    resolution: 'party1',
    teamIds: ['chiefs'],
    createdAt: '2026-05-08T10:00:00Z',
    resolvedAt: '2026-05-09T14:00:00Z',
  },
];

export const BETS: Bet[] = [
  {
    id: 'b1',
    chatId: 'council',
    chatName: 'The Council 🏆',
    claim: 'Giants beat the Eagles in Week 14',
    participantIds: ['marcus', 'deshawn'],
    status: 'active',
    teamIds: ['giants', 'eagles'],
    createdAt: '2026-05-12T11:00:00Z',
  },
  {
    id: 'b2',
    chatId: 'council',
    chatName: 'The Council 🏆',
    claim: 'Cowboys are winning the NFC this year',
    participantIds: ['tre', 'me'],
    status: 'active',
    teamIds: ['cowboys'],
    createdAt: '2026-05-12T10:00:00Z',
  },
  {
    id: 'b3',
    chatId: 'nyc-ball',
    chatName: 'NYC Ball 🗽',
    claim: 'Knicks or Lakers make the Finals this year',
    participantIds: ['marcus', 'me'],
    status: 'awaiting-resolution',
    proposal: {
      proposedBy: 'marcus',
      winnerId: 'marcus',
      isPush: false,
      agreements: ['marcus'],
      disputes: [],
    },
    teamIds: ['knicks', 'lakers'],
    createdAt: '2026-05-11T19:00:00Z',
  },
  {
    id: 'b4',
    chatId: 'nfc-east',
    chatName: 'NFC East Wars 🏈',
    claim: 'Giants sweep both Eagles and Cowboys this year',
    participantIds: ['me', 'deshawn'],
    status: 'resolved',
    winnerId: 'me',
    teamIds: ['giants', 'eagles', 'cowboys'],
    createdAt: '2026-04-28T14:30:00Z',
    resolvedAt: '2026-05-05T18:00:00Z',
  },
];

export const HOT_TAKES: HotTake[] = [
  {
    id: 'ht1',
    chatId: 'council',
    chatName: 'The Council 🏆',
    content: 'Mahomes is the greatest QB of this generation, no debate needed.',
    authorId: 'marcus',
    reactions: [
      { emoji: '🔥', userIds: ['sofia', 'tre'] },
      { emoji: '🧢', userIds: ['me', 'deshawn'] },
    ],
    teamIds: ['chiefs'],
    createdAt: '2026-05-12T09:00:00Z',
  },
  {
    id: 'ht2',
    chatId: 'council',
    chatName: 'The Council 🏆',
    content: 'The Knicks are only relevant because they\'re in New York. Remove the market and nobody talks about them.',
    authorId: 'sofia',
    reactions: [
      { emoji: '🔥', userIds: ['marcus', 'deshawn', 'tre'] },
      { emoji: '🤬', userIds: ['me'] },
    ],
    teamIds: ['knicks'],
    createdAt: '2026-05-12T10:30:00Z',
  },
  {
    id: 'ht3',
    chatId: 'nyc-ball',
    chatName: 'NYC Ball 🗽',
    content: 'The Yankees are going to the Series this year. Mark it.',
    authorId: 'sofia',
    reactions: [
      { emoji: '🙏', userIds: ['me'] },
      { emoji: '🔥', userIds: ['me'] },
    ],
    teamIds: ['yankees'],
    createdAt: '2026-05-11T18:00:00Z',
  },
  {
    id: 'ht4',
    chatId: 'nfc-east',
    chatName: 'NFC East Wars 🏈',
    content: 'Eagles are the class of the NFC. Division is over before it started.',
    authorId: 'deshawn',
    reactions: [
      { emoji: '🔥', userIds: ['deshawn'] },
      { emoji: '🧢', userIds: ['me', 'tre'] },
    ],
    teamIds: ['eagles'],
    createdAt: '2026-05-10T14:00:00Z',
  },
  {
    id: 'ht5',
    chatId: 'council',
    chatName: 'The Council 🏆',
    content: 'Tom Brady had the most system-aided dynasty in NFL history. Belichick was the GOAT, not Brady.',
    authorId: 'me',
    reactions: [
      { emoji: '🔥', userIds: ['deshawn', 'tre'] },
      { emoji: '🧢', userIds: ['marcus'] },
      { emoji: '💯', userIds: ['sofia'] },
    ],
    teamIds: [],
    createdAt: '2026-05-09T20:00:00Z',
  },
];

export function getUserById(id: string): User | undefined {
  return USERS.find((u) => u.id === id);
}

export function getChatById(id: string): Chat | undefined {
  return CHATS.find((c) => c.id === id);
}

export function getTeamById(id: string): Team | undefined {
  return TEAMS.find((t) => t.id === id);
}
