import { useEffect, useMemo, type PropsWithChildren } from 'react'
import { usePreferencesStore } from '../stores/preferencesStore'
import { ThemeContext } from './themeContext'

export function AppProviders({ children }: PropsWithChildren) {
  const theme = usePreferencesStore((state) => state.theme)
  const toggleTheme = usePreferencesStore((state) => state.toggleTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
    }),
    [theme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
