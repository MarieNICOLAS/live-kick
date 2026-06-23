import { Activity, Bell, CalendarDays, Home, LogIn, Moon, Search, Sun, BarChart3, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useTheme } from '../../app/themeContext'
import iconLogo from '../../assets/logos/simply-color-logo.png'

const mainLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/matches', label: 'Calendrier' },
  { to: '/groups', label: 'Groupes' },
  { to: '/bracket', label: 'Tableau final' },
  { to: '/teams', label: 'Equipes' },
  { to: '/favorites', label: 'Favoris' },
]

const mobileLinks = [
  { to: '/', label: 'Accueil', Icon: Home },
  { to: '/live', label: 'Live', Icon: Activity },
  { to: '/matches', label: 'Matchs', Icon: CalendarDays },
  { to: '/groups', label: 'Stats', Icon: BarChart3 },
  { to: '/profile', label: 'Profil', Icon: User },
]

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const ThemeIcon = theme === 'dark' ? Sun : Moon
  const isAuthenticated = false
  const ProfileIcon = isAuthenticated ? User : LogIn

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
          <label className="search-box" htmlFor="global-search">
            <Search size={21} aria-hidden="true" />
            <input id="global-search" type="search" placeholder="Rechercher..." />
            <kbd>/</kbd>
          </label>

          <button className="icon-button notification-button" type="button" aria-label="Notifications">
            <Bell size={21} aria-hidden="true" />
            <span>3</span>
          </button>

          <button className="icon-button" type="button" onClick={toggleTheme} aria-label="Changer de theme">
            <ThemeIcon size={21} aria-hidden="true" />
          </button>

          <NavLink className="icon-button" to={isAuthenticated ? '/profile' : '/login'} aria-label={isAuthenticated ? 'Profil' : 'Connexion'}>
            <ProfileIcon size={21} aria-hidden="true" />
          </NavLink>
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
