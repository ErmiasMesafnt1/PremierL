/**
 * 2025/26 Premier League clubs with badge image URLs.
 * Badges from football-data.org (free crest CDN).
 */
export interface Team {
  id: string;
  name: string;
  badgeUri: string;
}

export const PREMIER_LEAGUE_TEAMS: Team[] = [
  { id: 'arsenal', name: 'Arsenal', badgeUri: 'https://crests.football-data.org/57.png' },
  { id: 'aston-villa', name: 'Aston Villa', badgeUri: 'https://crests.football-data.org/58.png' },
  { id: 'bournemouth', name: 'Bournemouth', badgeUri: 'https://upload.wikimedia.org/wikipedia/hif/5/53/AFC_Bournemouth_%282013%29.png' },
  { id: 'brentford', name: 'Brentford', badgeUri: 'https://crests.football-data.org/402.png' },
  { id: 'brighton', name: 'Brighton & Hove Albion', badgeUri: 'https://crests.football-data.org/397.png' },
  { id: 'burnley', name: 'Burnley', badgeUri: 'https://crests.football-data.org/328.png' },
  { id: 'chelsea', name: 'Chelsea', badgeUri: 'https://crests.football-data.org/61.png' },
  { id: 'crystal-palace', name: 'Crystal Palace', badgeUri: 'https://crests.football-data.org/354.png' },
  { id: 'everton', name: 'Everton', badgeUri: 'https://crests.football-data.org/62.png' },
  { id: 'fulham', name: 'Fulham', badgeUri: 'https://crests.football-data.org/63.png' },
  { id: 'leeds', name: 'Leeds United', badgeUri: 'https://crests.football-data.org/341.png' },
  { id: 'liverpool', name: 'Liverpool', badgeUri: 'https://crests.football-data.org/64.png' },
  { id: 'man-city', name: 'Manchester City', badgeUri: 'https://crests.football-data.org/65.png' },
  { id: 'man-united', name: 'Manchester United', badgeUri: 'https://crests.football-data.org/66.png' },
  { id: 'newcastle', name: 'Newcastle United', badgeUri: 'https://crests.football-data.org/67.png' },
  { id: 'nottingham-forest', name: 'Nottingham Forest', badgeUri: 'https://crests.football-data.org/351.png' },
  { id: 'sunderland', name: 'Sunderland', badgeUri: 'https://crests.football-data.org/71.png' },
  { id: 'tottenham', name: 'Tottenham Hotspur', badgeUri: 'https://crests.football-data.org/73.png' },
  { id: 'west-ham', name: 'West Ham United', badgeUri: 'https://crests.football-data.org/563.png' },
  { id: 'wolves', name: 'Wolverhampton Wanderers', badgeUri: 'https://crests.football-data.org/76.png' },
];
