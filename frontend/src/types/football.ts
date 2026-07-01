export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'HALF_TIME' | 'FINISHED' | 'POSTPONED'

export type MatchQueryParams = {
  group?: string
  phase?: string
  status?: MatchStatus
}

export type TeamSummary = {
  id: number | null
  name: string
  fifaCode: string | null
  flagUrl: string | null
}

export type Team = TeamSummary & {
  country: string
  groupCode: string | null
}

export type Stadium = {
  id: number
  name: string
  fifaName: string | null
  city: string
  country: string
  capacity: number | null
  region: string | null
}

export type FootballMatch = {
  id: number
  matchDate: string
  status: MatchStatus
  phase: string
  phaseType: string
  groupCode: string | null
  matchday: number | null
  homeScore: number | null
  awayScore: number | null
  currentMinute: number | null
  homeTeam: TeamSummary
  awayTeam: TeamSummary
  stadiumId: number | null
}

export type FootballMatchLive = {
  id: number
  status: MatchStatus
  homeScore: number | null
  awayScore: number | null
  currentMinute: number | null
  finished: boolean
}

export type GroupStanding = {
  team: TeamSummary
  matchesPlayed: number
  wins: number
  draws: number
  losses: number
  points: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
}

export type CompetitionGroup = {
  code: string
  displayOrder: number
  standings: GroupStanding[]
}

export type Player = {
  id: number
  teamId: number | null
  firstName: string
  lastName: string
  position: string
  shirtNumber: number | null
  nationality: string | null
  photoUrl: string | null
  birthDate: string | null
}

export type TeamFormMatch = {
  matchId: number
  matchDate: string
  opponent: TeamSummary
  home: boolean
  teamScore: number | null
  opponentScore: number | null
  result: string
}

export type TeamStatistics = {
  id: number
  team: TeamSummary
  matchesPlayed: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  winRate: number
  averageGoalsFor: number
  averageGoalsAgainst: number
  recentForm: TeamFormMatch[]
}

export type TeamComparison = {
  firstTeamStatistics: TeamStatistics
  secondTeamStatistics: TeamStatistics
}

export type Prediction = {
  id: number
  matchId: number
  homeWinProbability: number
  drawProbability: number
  awayWinProbability: number
  predictedHomeScore: number | null
  predictedAwayScore: number | null
  confidenceScore: number
  modelName: string
  explanation: string
  generatedAt: string
}
