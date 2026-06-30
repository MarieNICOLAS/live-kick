export type ThemePreference = 'dark' | 'light'

export type LocalPreferences = {
  theme: ThemePreference
  language: 'fr' | 'en'
  timezone: string
  autoRefreshSeconds: number
}

export type FavoriteType = 'TEAM' | 'MATCH' | 'PLAYER' | 'GROUP' | 'STADIUM'

export type LocalFavorite = {
  type: FavoriteType
  targetId: string
  addedAt: string
}

export type LocalNotificationType = 'MATCH' | 'FAVORITE' | 'TOURNAMENT' | 'SYSTEM'

export type LocalNotification = {
  id: string
  title: string
  message: string
  type: LocalNotificationType
  isRead: boolean
  sentAt: string
  targetLink?: string
}
