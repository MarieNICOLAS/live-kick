import { apiClient } from './apiClient'
import type { Prediction } from '../types/football'

export async function getMatchPrediction(matchId: number | string) {
  const response = await apiClient.get<Prediction>(`/matches/${matchId}/prediction`)
  return response.data
}

export async function getKnownMatchPredictions() {
  const response = await apiClient.get<Prediction[]>('/matches/predictions')
  return response.data
}

export async function getUpcomingKnownMatchPredictions() {
  const response = await apiClient.get<Prediction[]>('/matches/predictions/upcoming')
  return response.data
}
