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
