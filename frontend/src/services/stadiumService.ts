import { apiClient } from './apiClient'
import type { Stadium } from '../types/football'

export async function getStadiums() {
  const response = await apiClient.get<Stadium[]>('/stadiums')
  return response.data
}

export async function getStadiumById(id: number | string) {
  const response = await apiClient.get<Stadium>(`/stadiums/${id}`)
  return response.data
}
