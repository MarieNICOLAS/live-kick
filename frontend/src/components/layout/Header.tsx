import { Bell, CalendarDays, Activity, Heart, Home, Moon, Search, Sun, BarChart3 } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTheme } from '../../app/themeContext'
import { useState, useRef, useEffect } from 'react'
import iconLogo from '../../assets/logos/simply-color-logo.png'

const mainLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/live', label: 'Live' },
  { to: '/matches', label: 'Calendrier' },
  { to: '/groups', label: 'Groupes' },
  { to: '/bracket', label: 'Tableau final' },
  { to: '/teams', label: 'Équipes' },
  { to: '/favorites', label: 'Favoris' },
]

const mobileLinks = [
  { to: '/', label: 'Accueil', Icon: Home },
  { to: '/live', label: 'Direct', Icon: Activity },
  { to: '/matches', label: 'Matchs', Icon: CalendarDays },
  { to: '/groups', label: 'Groupes', Icon: BarChart3 },
  { to: '/favorites', label: 'Favoris', Icon: Heart },
]

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const ThemeIcon = theme === 'dark' ? Sun : Moon
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setQuery('')
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/matches?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
      inputRef.current?.blur()
    }
  }

  return (
    <>
      <header className="site-header">
        <NavLink className="brand-link" to="/" aria-label="Accueil LiveKick">
          <img src={iconLogo} alt="" />
          <span>LiveKick</span>
        </NavLink>
        <nav className="main-nav" aria-label="Navigation principale">
          {mainLinks.map((link) => (
            <NavLink key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="header-tools">
          <form onSubmit={handleSearch}>
            <label className="search-box" htmlFor="global-search">
              <Search size={21} aria-hidden="true" />
              <input
                id="global-search"
                ref={inputRef}
                type="search"
                placeholder="Rechercher..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <kbd>/</kbd>
            </label>
          </form>
          <button className="icon-button notification-button" type="button" aria-label="Notifications">
            <Bell size={21} aria-hidden="true" />
            <span>3</span>
          </button>
          <button className="icon-button" type="button" onClick={toggleTheme} aria-label="Changer de theme">
            <ThemeIcon size={21} aria-hidden="true" />
          </button>
        </div>
      </header>

      <nav className="mobile-bottom-nav" aria-label="Navigation mobile">
        {mobileLinks.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to}>
            <Icon size={24} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}