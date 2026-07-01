import type { CompetitionGroup, FootballMatch, Prediction, Stadium, Team } from '../types/football'

export const demoTeams: Team[] = [
  { id: 1, name: 'France', fifaCode: 'FRA', country: 'France', flagUrl: null, groupCode: 'A' },
  { id: 2, name: 'Brésil', fifaCode: 'BRA', country: 'Brésil', flagUrl: null, groupCode: 'B' },
  { id: 3, name: 'Argentine', fifaCode: 'ARG', country: 'Argentine', flagUrl: null, groupCode: 'A' },
  { id: 4, name: 'Japon', fifaCode: 'JPN', country: 'Japon', flagUrl: null, groupCode: 'B' },
]

export const demoFootballMatches: FootballMatch[] = [
  {
    id: 101,
    matchDate: '2026-06-11T21:00:00',
    status: 'LIVE',
    phase: 'Phase de groupes',
    phaseType: 'GROUP',
    groupCode: 'A',
    matchday: 1,
    homeScore: 2,
    awayScore: 1,
    currentMinute: 78,
    homeTeam: demoTeams[0],
    awayTeam: demoTeams[2],
    stadiumId: 1,
  },
  {
    id: 102,
    matchDate: '2026-06-12T18:00:00',
    status: 'SCHEDULED',
    phase: 'Phase de groupes',
    phaseType: 'GROUP',
    groupCode: 'B',
    matchday: 1,
    homeScore: null,
    awayScore: null,
    currentMinute: null,
    homeTeam: demoTeams[1],
    awayTeam: demoTeams[3],
    stadiumId: 2,
  },
  {
    id: 103,
    matchDate: '2026-06-13T20:00:00',
    status: 'FINISHED',
    phase: 'Phase de groupes',
    phaseType: 'GROUP',
    groupCode: 'A',
    matchday: 1,
    homeScore: 1,
    awayScore: 1,
    currentMinute: 90,
    homeTeam: demoTeams[2],
    awayTeam: demoTeams[0],
    stadiumId: 3,
  },
]

export const demoStadiums: Stadium[] = [
  {
    id: 1,
    name: 'Estadio Azteca',
    fifaName: 'Estadio Ciudad de Mexico',
    city: 'Mexico City',
    country: 'Mexique',
    capacity: 87523,
    region: 'Mexico',
  },
  {
    id: 2,
    name: 'BMO Field',
    fifaName: 'Toronto Stadium',
    city: 'Toronto',
    country: 'Canada',
    capacity: 30000,
    region: 'Canada Est',
  },
  {
    id: 3,
    name: 'SoFi Stadium',
    fifaName: 'Los Angeles Stadium',
    city: 'Los Angeles',
    country: 'États-Unis',
    capacity: 70240,
    region: 'USA Ouest',
  },
]

export const demoCompetitionGroups: CompetitionGroup[] = [
  {
    code: 'A',
    displayOrder: 1,
    standings: [
      {
        team: demoTeams[0],
        matchesPlayed: 2,
        wins: 1,
        draws: 1,
        losses: 0,
        points: 4,
        goalsFor: 3,
        goalsAgainst: 2,
        goalDifference: 1,
      },
      {
        team: demoTeams[2],
        matchesPlayed: 2,
        wins: 0,
        draws: 1,
        losses: 1,
        points: 1,
        goalsFor: 2,
        goalsAgainst: 3,
        goalDifference: -1,
      },
    ],
  },
]

export const demoPrediction: Prediction = {
  id: 1,
  matchId: 101,
  homeWinProbability: 0.56,
  drawProbability: 0.24,
  awayWinProbability: 0.2,
  predictedHomeScore: 2,
  predictedAwayScore: 1,
  confidenceScore: 0.72,
  modelName: 'Modèle de prédiction LiveKick',
  explanation: 'La France garde une probabilité supérieure grâce au volume offensif et à la possession récente.',
  generatedAt: '2026-06-11T20:45:00Z',
}
