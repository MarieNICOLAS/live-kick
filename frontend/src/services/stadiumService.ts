import { apiClient } from './apiClient'

export interface StadiumDto {
  id: number
  name: string
  fifaName: string
  city: string
  country: string
  capacity: number
  region: string
}

export async function getStadium(id: number): Promise<StadiumDto> {
  const response = await apiClient.get<StadiumDto>(`/stadiums/${id}`)
  return response.data
}