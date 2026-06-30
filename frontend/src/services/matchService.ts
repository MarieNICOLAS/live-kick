import { apiClient } from './apiClient'
import type { FootballMatch, FootballMatchLive, MatchQueryParams } from '../types/football'

export async function getFootballMatches(params?: MatchQueryParams) {
  const response = await apiClient.get<FootballMatch[]>('/matches', { params })
  return response.data
}

export async function getFootballMatchById(id: number | string) {
  const response = await apiClient.get<FootballMatch>(`/matches/${id}`)
  return response.data
}

export async function getFootballMatchLiveState(id: number | string) {
  const response = await apiClient.get<FootballMatchLive>(`/matches/${id}/live`)
  return response.data
}
