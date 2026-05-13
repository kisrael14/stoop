import type { Team } from './types';

// The first 12 entries must stay at indices 0–11 — mock-data.ts users reference them by index.
export const ALL_TEAMS: Team[] = [
  // ── Existing 12 (indices 0–11) ─────────────────────────────────────────
  { id: 'giants',  name: 'Giants',    city: 'New York',      league: 'NFL', emoji: '🏈', color: '#0b2265' },
  { id: 'knicks',  name: 'Knicks',    city: 'New York',      league: 'NBA', emoji: '🏀', color: '#006bb6' },
  { id: 'yankees', name: 'Yankees',   city: 'New York',      league: 'MLB', emoji: '⚾', color: '#003087' },
  { id: 'rangers', name: 'Rangers',   city: 'New York',      league: 'NHL', emoji: '🏒', color: '#0038a8' },
  { id: 'chiefs',  name: 'Chiefs',    city: 'Kansas City',   league: 'NFL', emoji: '🏈', color: '#e31837' },
  { id: 'lakers',  name: 'Lakers',    city: 'Los Angeles',   league: 'NBA', emoji: '🏀', color: '#552583' },
  { id: 'eagles',  name: 'Eagles',    city: 'Philadelphia',  league: 'NFL', emoji: '🏈', color: '#004c54' },
  { id: 'sixers',  name: '76ers',     city: 'Philadelphia',  league: 'NBA', emoji: '🏀', color: '#006bb6' },
  { id: 'warriors',name: 'Warriors',  city: 'Golden State',  league: 'NBA', emoji: '🏀', color: '#1d428a' },
  { id: 'niners',  name: '49ers',     city: 'San Francisco', league: 'NFL', emoji: '🏈', color: '#aa0000' },
  { id: 'cowboys', name: 'Cowboys',   city: 'Dallas',        league: 'NFL', emoji: '🏈', color: '#003594' },
  { id: 'mavs',    name: 'Mavericks', city: 'Dallas',        league: 'NBA', emoji: '🏀', color: '#00538c' },

  // ── NFL ────────────────────────────────────────────────────────────────
  // AFC East
  { id: 'bills',       name: 'Bills',      city: 'Buffalo',       league: 'NFL', emoji: '🦬', color: '#00338d' },
  { id: 'dolphins',    name: 'Dolphins',   city: 'Miami',         league: 'NFL', emoji: '🐬', color: '#008e97' },
  { id: 'patriots',    name: 'Patriots',   city: 'New England',   league: 'NFL', emoji: '🏈', color: '#002244' },
  { id: 'ny-jets',     name: 'Jets',       city: 'New York',      league: 'NFL', emoji: '🛩️', color: '#125740' },
  // AFC North
  { id: 'ravens',      name: 'Ravens',     city: 'Baltimore',     league: 'NFL', emoji: '🐦‍⬛', color: '#241773' },
  { id: 'bengals',     name: 'Bengals',    city: 'Cincinnati',    league: 'NFL', emoji: '🐯', color: '#fb4f14' },
  { id: 'browns',      name: 'Browns',     city: 'Cleveland',     league: 'NFL', emoji: '🟤', color: '#311d00' },
  { id: 'steelers',    name: 'Steelers',   city: 'Pittsburgh',    league: 'NFL', emoji: '⚙️', color: '#ffb612' },
  // AFC South
  { id: 'texans',      name: 'Texans',     city: 'Houston',       league: 'NFL', emoji: '🤘', color: '#03202f' },
  { id: 'colts',       name: 'Colts',      city: 'Indianapolis',  league: 'NFL', emoji: '🐴', color: '#002c5f' },
  { id: 'jaguars',     name: 'Jaguars',    city: 'Jacksonville',  league: 'NFL', emoji: '🐆', color: '#006778' },
  { id: 'titans',      name: 'Titans',     city: 'Tennessee',     league: 'NFL', emoji: '⚔️', color: '#0c2340' },
  // AFC West
  { id: 'broncos',     name: 'Broncos',    city: 'Denver',        league: 'NFL', emoji: '🐴', color: '#fb4f14' },
  { id: 'raiders',     name: 'Raiders',    city: 'Las Vegas',     league: 'NFL', emoji: '☠️', color: '#000000' },
  { id: 'chargers',    name: 'Chargers',   city: 'Los Angeles',   league: 'NFL', emoji: '⚡', color: '#0080c6' },
  // NFC East
  { id: 'commanders',  name: 'Commanders', city: 'Washington',    league: 'NFL', emoji: '🪖', color: '#5a1414' },
  // NFC North
  { id: 'bears',       name: 'Bears',      city: 'Chicago',       league: 'NFL', emoji: '🐻', color: '#0b162a' },
  { id: 'lions',       name: 'Lions',      city: 'Detroit',       league: 'NFL', emoji: '🦁', color: '#0076b6' },
  { id: 'packers',     name: 'Packers',    city: 'Green Bay',     league: 'NFL', emoji: '🧀', color: '#203731' },
  { id: 'vikings',     name: 'Vikings',    city: 'Minnesota',     league: 'NFL', emoji: '⛵', color: '#4f2683' },
  // NFC South
  { id: 'falcons',     name: 'Falcons',    city: 'Atlanta',       league: 'NFL', emoji: '🦅', color: '#a71930' },
  { id: 'panthers',    name: 'Panthers',   city: 'Carolina',      league: 'NFL', emoji: '🐾', color: '#0085ca' },
  { id: 'saints',      name: 'Saints',     city: 'New Orleans',   league: 'NFL', emoji: '⚜️', color: '#9f8958' },
  { id: 'buccaneers',  name: 'Buccaneers', city: 'Tampa Bay',     league: 'NFL', emoji: '🏴‍☠️', color: '#d50a0a' },
  // NFC West
  { id: 'az-cardinals',name: 'Cardinals',  city: 'Arizona',       league: 'NFL', emoji: '🐦', color: '#97233f' },
  { id: 'rams',        name: 'Rams',       city: 'Los Angeles',   league: 'NFL', emoji: '🐏', color: '#003594' },
  { id: 'seahawks',    name: 'Seahawks',   city: 'Seattle',       league: 'NFL', emoji: '🦅', color: '#002244' },

  // ── NBA ────────────────────────────────────────────────────────────────
  // Atlantic
  { id: 'celtics',       name: 'Celtics',       city: 'Boston',        league: 'NBA', emoji: '🍀', color: '#007a33' },
  { id: 'nets',          name: 'Nets',          city: 'Brooklyn',      league: 'NBA', emoji: '🌐', color: '#000000' },
  { id: 'raptors',       name: 'Raptors',       city: 'Toronto',       league: 'NBA', emoji: '🦖', color: '#ce1141' },
  // Central
  { id: 'bulls',         name: 'Bulls',         city: 'Chicago',       league: 'NBA', emoji: '🐂', color: '#ce1141' },
  { id: 'cavaliers',     name: 'Cavaliers',     city: 'Cleveland',     league: 'NBA', emoji: '⚔️', color: '#860038' },
  { id: 'pistons',       name: 'Pistons',       city: 'Detroit',       league: 'NBA', emoji: '🔩', color: '#c8102e' },
  { id: 'pacers',        name: 'Pacers',        city: 'Indiana',       league: 'NBA', emoji: '🏎️', color: '#002d62' },
  { id: 'bucks',         name: 'Bucks',         city: 'Milwaukee',     league: 'NBA', emoji: '🦌', color: '#00471b' },
  // Southeast
  { id: 'hawks',         name: 'Hawks',         city: 'Atlanta',       league: 'NBA', emoji: '🦅', color: '#e03a3e' },
  { id: 'hornets',       name: 'Hornets',       city: 'Charlotte',     league: 'NBA', emoji: '🐝', color: '#1d1160' },
  { id: 'heat',          name: 'Heat',          city: 'Miami',         league: 'NBA', emoji: '🔥', color: '#98002e' },
  { id: 'magic',         name: 'Magic',         city: 'Orlando',       league: 'NBA', emoji: '✨', color: '#0077c0' },
  { id: 'wizards',       name: 'Wizards',       city: 'Washington',    league: 'NBA', emoji: '🧙', color: '#002b5c' },
  // Northwest
  { id: 'nuggets',       name: 'Nuggets',       city: 'Denver',        league: 'NBA', emoji: '⛏️', color: '#0e2240' },
  { id: 'timberwolves',  name: 'Timberwolves',  city: 'Minnesota',     league: 'NBA', emoji: '🐺', color: '#0c2340' },
  { id: 'thunder',       name: 'Thunder',       city: 'Oklahoma City', league: 'NBA', emoji: '⚡', color: '#007ac1' },
  { id: 'blazers',       name: 'Trail Blazers', city: 'Portland',      league: 'NBA', emoji: '🏃', color: '#e03a3e' },
  { id: 'jazz',          name: 'Jazz',          city: 'Utah',          league: 'NBA', emoji: '🎵', color: '#002b5c' },
  // Pacific
  { id: 'clippers',      name: 'Clippers',      city: 'Los Angeles',   league: 'NBA', emoji: '✂️', color: '#c8102e' },
  { id: 'suns',          name: 'Suns',          city: 'Phoenix',       league: 'NBA', emoji: '☀️', color: '#1d1160' },
  { id: 'kings',         name: 'Kings',         city: 'Sacramento',    league: 'NBA', emoji: '👑', color: '#5a2d81' },
  // Southwest
  { id: 'rockets',       name: 'Rockets',       city: 'Houston',       league: 'NBA', emoji: '🚀', color: '#ce1141' },
  { id: 'grizzlies',     name: 'Grizzlies',     city: 'Memphis',       league: 'NBA', emoji: '🐻', color: '#5d76a9' },
  { id: 'pelicans',      name: 'Pelicans',      city: 'New Orleans',   league: 'NBA', emoji: '🦜', color: '#0c2340' },
  { id: 'spurs',         name: 'Spurs',         city: 'San Antonio',   league: 'NBA', emoji: '⚙️', color: '#8a8d8f' },

  // ── MLB ────────────────────────────────────────────────────────────────
  // AL East
  { id: 'red-sox',       name: 'Red Sox',       city: 'Boston',        league: 'MLB', emoji: '⚾', color: '#bd3039' },
  { id: 'blue-jays',     name: 'Blue Jays',     city: 'Toronto',       league: 'MLB', emoji: '🐦', color: '#134a8e' },
  { id: 'orioles',       name: 'Orioles',       city: 'Baltimore',     league: 'MLB', emoji: '🐦', color: '#df4601' },
  { id: 'rays',          name: 'Rays',          city: 'Tampa Bay',     league: 'MLB', emoji: '☀️', color: '#092c5c' },
  // AL Central
  { id: 'white-sox',     name: 'White Sox',     city: 'Chicago',       league: 'MLB', emoji: '⚾', color: '#27251f' },
  { id: 'guardians',     name: 'Guardians',     city: 'Cleveland',     league: 'MLB', emoji: '🛡️', color: '#e31937' },
  { id: 'tigers',        name: 'Tigers',        city: 'Detroit',       league: 'MLB', emoji: '🐯', color: '#0c2c56' },
  { id: 'royals',        name: 'Royals',        city: 'Kansas City',   league: 'MLB', emoji: '👑', color: '#004687' },
  { id: 'twins',         name: 'Twins',         city: 'Minnesota',     league: 'MLB', emoji: '⚾', color: '#002b5c' },
  // AL West
  { id: 'astros',        name: 'Astros',        city: 'Houston',       league: 'MLB', emoji: '🚀', color: '#eb6e1f' },
  { id: 'angels',        name: 'Angels',        city: 'Los Angeles',   league: 'MLB', emoji: '👼', color: '#ba0021' },
  { id: 'athletics',     name: 'Athletics',     city: 'Oakland',       league: 'MLB', emoji: '🐘', color: '#003831' },
  { id: 'mariners',      name: 'Mariners',      city: 'Seattle',       league: 'MLB', emoji: '🧭', color: '#0c2c56' },
  { id: 'tex-rangers',   name: 'Rangers',       city: 'Texas',         league: 'MLB', emoji: '🤠', color: '#003278' },
  // NL East
  { id: 'braves',        name: 'Braves',        city: 'Atlanta',       league: 'MLB', emoji: '⚔️', color: '#ce1141' },
  { id: 'marlins',       name: 'Marlins',       city: 'Miami',         league: 'MLB', emoji: '🐟', color: '#00a3e0' },
  { id: 'mets',          name: 'Mets',          city: 'New York',      league: 'MLB', emoji: '🍎', color: '#002d72' },
  { id: 'phillies',      name: 'Phillies',      city: 'Philadelphia',  league: 'MLB', emoji: '🔔', color: '#e81828' },
  { id: 'nationals',     name: 'Nationals',     city: 'Washington',    league: 'MLB', emoji: '🎩', color: '#ab0003' },
  // NL Central
  { id: 'cubs',          name: 'Cubs',          city: 'Chicago',       league: 'MLB', emoji: '🐻', color: '#0e3386' },
  { id: 'reds',          name: 'Reds',          city: 'Cincinnati',    league: 'MLB', emoji: '⚾', color: '#c6011f' },
  { id: 'brewers',       name: 'Brewers',       city: 'Milwaukee',     league: 'MLB', emoji: '🍺', color: '#0a2351' },
  { id: 'pirates',       name: 'Pirates',       city: 'Pittsburgh',    league: 'MLB', emoji: '🏴‍☠️', color: '#27251f' },
  { id: 'stl-cardinals', name: 'Cardinals',     city: 'St. Louis',     league: 'MLB', emoji: '🐦', color: '#c41e3a' },
  // NL West
  { id: 'diamondbacks',  name: 'Diamondbacks',  city: 'Arizona',       league: 'MLB', emoji: '🐍', color: '#a71930' },
  { id: 'rockies',       name: 'Rockies',       city: 'Colorado',      league: 'MLB', emoji: '🏔️', color: '#33006f' },
  { id: 'dodgers',       name: 'Dodgers',       city: 'Los Angeles',   league: 'MLB', emoji: '💙', color: '#005a9c' },
  { id: 'padres',        name: 'Padres',        city: 'San Diego',     league: 'MLB', emoji: '⚾', color: '#2f241d' },
  { id: 'sf-giants',     name: 'Giants',        city: 'San Francisco', league: 'MLB', emoji: '🌁', color: '#fd5a1e' },

  // ── NHL ────────────────────────────────────────────────────────────────
  // Atlantic
  { id: 'bruins',        name: 'Bruins',        city: 'Boston',        league: 'NHL', emoji: '🐻', color: '#ffb81c' },
  { id: 'sabres',        name: 'Sabres',        city: 'Buffalo',       league: 'NHL', emoji: '⚔️', color: '#003087' },
  { id: 'red-wings',     name: 'Red Wings',     city: 'Detroit',       league: 'NHL', emoji: '🏒', color: '#ce1126' },
  { id: 'fla-panthers',  name: 'Panthers',      city: 'Florida',       league: 'NHL', emoji: '🐾', color: '#041e42' },
  { id: 'canadiens',     name: 'Canadiens',     city: 'Montreal',      league: 'NHL', emoji: '🍁', color: '#af1e2d' },
  { id: 'senators',      name: 'Senators',      city: 'Ottawa',        league: 'NHL', emoji: '🏛️', color: '#c52032' },
  { id: 'lightning',     name: 'Lightning',     city: 'Tampa Bay',     league: 'NHL', emoji: '⚡', color: '#002868' },
  { id: 'maple-leafs',   name: 'Maple Leafs',   city: 'Toronto',       league: 'NHL', emoji: '🍁', color: '#00205b' },
  // Metropolitan
  { id: 'hurricanes',    name: 'Hurricanes',    city: 'Carolina',      league: 'NHL', emoji: '🌀', color: '#cc0000' },
  { id: 'blue-jackets',  name: 'Blue Jackets',  city: 'Columbus',      league: 'NHL', emoji: '🚀', color: '#002654' },
  { id: 'devils',        name: 'Devils',        city: 'New Jersey',    league: 'NHL', emoji: '😈', color: '#ce1126' },
  { id: 'islanders',     name: 'Islanders',     city: 'New York',      league: 'NHL', emoji: '🏒', color: '#00539b' },
  { id: 'flyers',        name: 'Flyers',        city: 'Philadelphia',  league: 'NHL', emoji: '🔥', color: '#f74902' },
  { id: 'penguins',      name: 'Penguins',      city: 'Pittsburgh',    league: 'NHL', emoji: '🐧', color: '#fcb514' },
  { id: 'capitals',      name: 'Capitals',      city: 'Washington',    league: 'NHL', emoji: '🦅', color: '#c8102e' },
  // Central
  { id: 'blackhawks',    name: 'Blackhawks',    city: 'Chicago',       league: 'NHL', emoji: '🏒', color: '#cf0a2c' },
  { id: 'avalanche',     name: 'Avalanche',     city: 'Colorado',      league: 'NHL', emoji: '🏔️', color: '#6f263d' },
  { id: 'stars',         name: 'Stars',         city: 'Dallas',        league: 'NHL', emoji: '⭐', color: '#006847' },
  { id: 'wild',          name: 'Wild',          city: 'Minnesota',     league: 'NHL', emoji: '🌲', color: '#154734' },
  { id: 'predators',     name: 'Predators',     city: 'Nashville',     league: 'NHL', emoji: '🐯', color: '#ffb81c' },
  { id: 'blues',         name: 'Blues',         city: 'St. Louis',     league: 'NHL', emoji: '🎵', color: '#002f87' },
  { id: 'wpg-jets',      name: 'Jets',          city: 'Winnipeg',      league: 'NHL', emoji: '✈️', color: '#041e42' },
  { id: 'utah-hc',       name: 'Hockey Club',   city: 'Utah',          league: 'NHL', emoji: '⛏️', color: '#69b3e7' },
  // Pacific
  { id: 'ducks',         name: 'Ducks',         city: 'Anaheim',       league: 'NHL', emoji: '🦆', color: '#f47a38' },
  { id: 'flames',        name: 'Flames',        city: 'Calgary',       league: 'NHL', emoji: '🔥', color: '#c8102e' },
  { id: 'oilers',        name: 'Oilers',        city: 'Edmonton',      league: 'NHL', emoji: '⛽', color: '#ff4c00' },
  { id: 'la-kings',      name: 'Kings',         city: 'Los Angeles',   league: 'NHL', emoji: '👑', color: '#111111' },
  { id: 'sharks',        name: 'Sharks',        city: 'San Jose',      league: 'NHL', emoji: '🦈', color: '#006d75' },
  { id: 'kraken',        name: 'Kraken',        city: 'Seattle',       league: 'NHL', emoji: '🐙', color: '#001628' },
  { id: 'canucks',       name: 'Canucks',       city: 'Vancouver',     league: 'NHL', emoji: '🍁', color: '#00205b' },
  { id: 'golden-knights',name: 'Golden Knights',city: 'Vegas',         league: 'NHL', emoji: '🎰', color: '#b4975a' },

  // ── MLS ────────────────────────────────────────────────────────────────
  { id: 'atlanta-united',   name: 'Atlanta United',    city: 'Atlanta',       league: 'MLS', emoji: '⚽', color: '#80000a' },
  { id: 'austin-fc',        name: 'Austin FC',         city: 'Austin',        league: 'MLS', emoji: '🌵', color: '#00b140' },
  { id: 'cf-montreal',      name: 'CF Montréal',       city: 'Montreal',      league: 'MLS', emoji: '⚽', color: '#003da5' },
  { id: 'charlotte-fc',     name: 'Charlotte FC',      city: 'Charlotte',     league: 'MLS', emoji: '⚽', color: '#1a85c8' },
  { id: 'chicago-fire',     name: 'Chicago Fire',      city: 'Chicago',       league: 'MLS', emoji: '🔥', color: '#9a1b2e' },
  { id: 'fc-cincinnati',    name: 'FC Cincinnati',     city: 'Cincinnati',    league: 'MLS', emoji: '⚽', color: '#003087' },
  { id: 'colorado-rapids',  name: 'Colorado Rapids',   city: 'Colorado',      league: 'MLS', emoji: '🏔️', color: '#862633' },
  { id: 'columbus-crew',    name: 'Columbus Crew',     city: 'Columbus',      league: 'MLS', emoji: '⚽', color: '#d4a800' },
  { id: 'dc-united',        name: 'D.C. United',       city: 'Washington',    league: 'MLS', emoji: '🦅', color: '#231f20' },
  { id: 'fc-dallas',        name: 'FC Dallas',         city: 'Dallas',        league: 'MLS', emoji: '⭐', color: '#e81f27' },
  { id: 'houston-dynamo',   name: 'Houston Dynamo',    city: 'Houston',       league: 'MLS', emoji: '🧡', color: '#f4911e' },
  { id: 'inter-miami',      name: 'Inter Miami CF',    city: 'Miami',         league: 'MLS', emoji: '🌴', color: '#f7b5cd' },
  { id: 'la-galaxy',        name: 'LA Galaxy',         city: 'Los Angeles',   league: 'MLS', emoji: '⭐', color: '#00245d' },
  { id: 'lafc',             name: 'LAFC',              city: 'Los Angeles',   league: 'MLS', emoji: '⚫', color: '#c39e6e' },
  { id: 'minnesota-united', name: 'Minnesota United',  city: 'Minnesota',     league: 'MLS', emoji: '🐺', color: '#9bcbeb' },
  { id: 'nashville-sc',     name: 'Nashville SC',      city: 'Nashville',     league: 'MLS', emoji: '🎸', color: '#c8b400' },
  { id: 'ne-revolution',    name: 'Revolution',        city: 'New England',   league: 'MLS', emoji: '⚓', color: '#0a2240' },
  { id: 'nycfc',            name: 'NYCFC',             city: 'New York',      league: 'MLS', emoji: '🗽', color: '#6cabdd' },
  { id: 'ny-red-bulls',     name: 'NY Red Bulls',      city: 'New York',      league: 'MLS', emoji: '🐂', color: '#ed1e36' },
  { id: 'orlando-city',     name: 'Orlando City',      city: 'Orlando',       league: 'MLS', emoji: '🦁', color: '#633492' },
  { id: 'philly-union',     name: 'Philadelphia Union',city: 'Philadelphia',  league: 'MLS', emoji: '⚓', color: '#071b2c' },
  { id: 'portland-timbers', name: 'Portland Timbers',  city: 'Portland',      league: 'MLS', emoji: '🌲', color: '#00482b' },
  { id: 'real-salt-lake',   name: 'Real Salt Lake',    city: 'Salt Lake City',league: 'MLS', emoji: '⚽', color: '#b30838' },
  { id: 'sj-earthquakes',   name: 'Earthquakes',       city: 'San Jose',      league: 'MLS', emoji: '🌊', color: '#0d4c92' },
  { id: 'sounders',         name: 'Seattle Sounders',  city: 'Seattle',       league: 'MLS', emoji: '☔', color: '#5d9732' },
  { id: 'sporting-kc',      name: 'Sporting KC',       city: 'Kansas City',   league: 'MLS', emoji: '⭐', color: '#002f65' },
  { id: 'stl-city',         name: 'St. Louis City SC', city: 'St. Louis',     league: 'MLS', emoji: '⚽', color: '#c8102e' },
  { id: 'toronto-fc',       name: 'Toronto FC',        city: 'Toronto',       league: 'MLS', emoji: '🍁', color: '#b81137' },
  { id: 'whitecaps',        name: 'Vancouver Whitecaps',city: 'Vancouver',    league: 'MLS', emoji: '🍁', color: '#009bc8' },
  { id: 'san-diego-fc',     name: 'San Diego FC',      city: 'San Diego',     league: 'MLS', emoji: '⚽', color: '#003087' },
];

export function getTeamByIdFull(id: string) {
  return ALL_TEAMS.find((t) => t.id === id);
}
