import { apiClient } from './apiClient'

export interface BackendStatus {
  application: string
  status: string
  apiVersion: string
  aiServiceBaseUrl: string
  timestamp: string
}

export async function getBackendStatus() {
  const response = await apiClient.get<BackendStatus>('/status')
  return response.data
}
