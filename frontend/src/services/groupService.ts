import { apiClient } from './apiClient'

export interface GroupStandingDto {
  team: { id: number; name: string; flagUrl: string; code: string }
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

export interface CompetitionGroupDto {
  code: string
  name: string
  standings: GroupStandingDto[]
}

export async function getGroups(): Promise<CompetitionGroupDto[]> {
  const response = await apiClient.get<CompetitionGroupDto[]>('/groups')
  return response.data
}