import type { League } from './types';

export const ALL_LEAGUES: League[] = [
  { id: 'NFL',        name: 'National Football League',    shortName: 'NFL',        sport: 'Football',   country: 'USA',         emoji: '🏈', color: '#013369' },
  { id: 'NBA',        name: 'National Basketball Assoc.',  shortName: 'NBA',        sport: 'Basketball', country: 'USA',         emoji: '🏀', color: '#c9082a' },
  { id: 'MLB',        name: 'Major League Baseball',       shortName: 'MLB',        sport: 'Baseball',   country: 'USA',         emoji: '⚾', color: '#002d72' },
  { id: 'NHL',        name: 'National Hockey League',      shortName: 'NHL',        sport: 'Hockey',     country: 'USA / CAN',   emoji: '🏒', color: '#000000' },
  { id: 'MLS',        name: 'Major League Soccer',         shortName: 'MLS',        sport: 'Soccer',     country: 'USA',         emoji: '⚽', color: '#1a3e7c' },
  { id: 'EPL',        name: 'Premier League',              shortName: 'EPL',        sport: 'Soccer',     country: 'England',     emoji: '🦁', color: '#3d195b' },
  { id: 'LaLiga',     name: 'La Liga',                     shortName: 'La Liga',    sport: 'Soccer',     country: 'Spain',       emoji: '🇪🇸', color: '#e63329' },
  { id: 'SerieA',     name: 'Serie A',                     shortName: 'Serie A',    sport: 'Soccer',     country: 'Italy',       emoji: '🇮🇹', color: '#024494' },
  { id: 'Ligue1',     name: 'Ligue 1',                     shortName: 'Ligue 1',    sport: 'Soccer',     country: 'France',      emoji: '🇫🇷', color: '#0f4fa8' },
  { id: 'Bundesliga', name: 'Bundesliga',                  shortName: 'Bundesliga', sport: 'Soccer',     country: 'Germany',     emoji: '🦅', color: '#d20515' },
];

export function getLeagueById(id: string): League | undefined {
  return ALL_LEAGUES.find((l) => l.id === id);
}
