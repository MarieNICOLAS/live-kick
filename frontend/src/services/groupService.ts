import { apiClient } from './apiClient'

export interface GroupStandingDto {
  team: { id: number; name: string; flagUrl: string; fifaCode: string }
  matchesPlayed: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

export interface CompetitionGroupDto {
  code: string
  displayOrder: number
  standings: GroupStandingDto[]
}

export async function getGroups(): Promise<CompetitionGroupDto[]> {
  const response = await apiClient.get<CompetitionGroupDto[]>('/groups')
  return response.data
}

export async function getGroup(code: string): Promise<CompetitionGroupDto> {
  const response = await apiClient.get<CompetitionGroupDto>(`/groups/${code}`)
  return response.data
}