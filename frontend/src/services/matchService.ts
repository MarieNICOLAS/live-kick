import { apiClient } from './apiClient'

export interface FootballMatchDto {
  id: number
  matchDate: string
  status: string
  phase: string
  phaseType: string
  groupCode: string
  matchday: number
  homeScore: number | null
  awayScore: number | null
  currentMinute: number | null
  homeTeam: { id: number; name: string; fifaCode: string; flagUrl: string }
  awayTeam: { id: number; name: string; fifaCode: string; flagUrl: string }
  stadiumId: number
}

export async function getMatches(): Promise<FootballMatchDto[]> {
  const response = await apiClient.get<FootballMatchDto[]>('/matches')
  return response.data
}

export async function getMatch(id: number): Promise<FootballMatchDto> {
  const response = await apiClient.get<FootballMatchDto>(`/matches/${id}`)
  return response.data
}