import { apiClient } from './apiClient'

export interface TeamDto {
  id: number
  name: string
  fifaCode: string
  country: string
  flagUrl: string
  groupCode: string
}

export async function getTeams(): Promise<TeamDto[]> {
  const response = await apiClient.get<TeamDto[]>('/teams')
  return response.data
}

export async function getTeam(id: number): Promise<TeamDto> {
  const response = await apiClient.get<TeamDto>(`/teams/${id}`)
  return response.data
}