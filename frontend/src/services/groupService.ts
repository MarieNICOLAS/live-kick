import { apiClient } from './apiClient'
import type { CompetitionGroup } from '../types/football'

export async function getCompetitionGroups() {
  const response = await apiClient.get<CompetitionGroup[]>('/groups')
  return response.data
}

export async function getCompetitionGroupByCode(code: string) {
  const response = await apiClient.get<CompetitionGroup>(`/groups/${code}`)
  return response.data
}
