import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LocalPreferences, ThemePreference } from '../types/local'

type PreferencesState = LocalPreferences & {
  setTheme: (theme: ThemePreference) => void
  toggleTheme: () => void
  setLanguage: (language: LocalPreferences['language']) => void
  setTimezone: (timezone: string) => void
  setAutoRefreshSeconds: (seconds: number) => void
}

function getInitialTheme(): ThemePreference {
  try {
    return localStorage.getItem('livekick-theme') === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: getInitialTheme(),
      language: 'fr',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Paris',
      autoRefreshSeconds: 30,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setLanguage: (language) => set({ language }),
      setTimezone: (timezone) => set({ timezone }),
      setAutoRefreshSeconds: (seconds) =>
        set({ autoRefreshSeconds: Math.min(300, Math.max(10, Math.round(seconds))) }),
    }),
    {
      name: 'livekick-preferences',
      partialize: ({ theme, language, timezone, autoRefreshSeconds }) => ({
        theme,
        language,
        timezone,
        autoRefreshSeconds,
      }),
    },
  ),
)
