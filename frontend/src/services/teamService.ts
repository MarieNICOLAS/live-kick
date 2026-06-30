import { apiClient } from './apiClient'
import type { Team, TeamComparison, TeamStatistics } from '../types/football'

export async function getTeams(group?: string) {
  const response = await apiClient.get<Team[]>('/teams', { params: { group } })
  return response.data
}

export async function getTeamById(id: number | string) {
  const response = await apiClient.get<Team>(`/teams/${id}`)
  return response.data
}

export async function getTeamStatistics(id: number | string) {
  const response = await apiClient.get<TeamStatistics>(`/teams/${id}/statistics`)
  return response.data
}

export async function compareTeams(firstTeamId: number | string, secondTeamId: number | string) {
  const response = await apiClient.get<TeamComparison>('/teams/compare', {
    params: { firstTeamId, secondTeamId },
  })
  return response.data
}
