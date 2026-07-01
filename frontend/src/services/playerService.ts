import { apiClient } from './apiClient'
import type { Player } from '../types/football'

export async function getPlayers(teamId?: number | string) {
  const response = await apiClient.get<Player[]>('/players', { params: { teamId } })
  return response.data
}

export async function getPlayerById(id: number | string) {
  const response = await apiClient.get<Player>(`/players/${id}`)
  return response.data
}
