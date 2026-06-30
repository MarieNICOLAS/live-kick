import { apiClient } from './apiClient'

export interface RecentFormMatchDto {
  matchId: number
  matchDate: string
  opponent: { id: number; name: string; fifaCode: string; flagUrl: string }
  home: boolean
  teamScore: number
  opponentScore: number
  result: 'WIN' | 'DRAW' | 'LOSS'
}

export interface TeamStatisticsDto {
  id: number
  team: { id: number; name: string; fifaCode: string; flagUrl: string }
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
  recentForm: RecentFormMatchDto[]
}

export async function getTeamStatistics(teamId: number): Promise<TeamStatisticsDto> {
  const response = await apiClient.get<TeamStatisticsDto>(`/teams/${teamId}/statistics`)
  return response.data
}