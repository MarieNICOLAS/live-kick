import { Activity, BarChart3, Bell, CalendarDays, Home, MapPin, Moon, Star, Sun, Trophy } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useTheme } from '../../app/themeContext'
import iconLogo from '../../assets/logos/simply-color-logo.png'
import { useNotificationsStore } from '../../stores/notificationsStore'

const mainLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/calendar', label: 'Calendrier' },
  { to: '/groups', label: 'Groupes' },
  { to: '/stadiums', label: 'Stades' },
  { to: '/teams', label: 'Equipes' },
  { to: '/stats', label: 'Statistiques' },
  { to: '/favorites', label: 'Favoris' },
]

const mobileLinks = [
  { to: '/', label: 'Accueil', Icon: Home },
  { to: '/live', label: 'Direct', Icon: Activity },
  { to: '/calendar', label: 'Matchs', Icon: CalendarDays },
  { to: '/groups', label: 'Groupes', Icon: Trophy },
  { to: '/stats', label: 'Stats', Icon: BarChart3 },
]

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const unreadCount = useNotificationsStore((state) => state.unreadCount())
  const ThemeIcon = theme === 'dark' ? Sun : Moon

  return (
    <>
      <header className="mobile-top-header">
        <NavLink className="brand-link" to="/" aria-label="Accueil LiveKick">
          <img src={iconLogo} alt="" />
          <span>LiveKick</span>
        </NavLink>

        <div className="header-tools">
          <NavLink className="icon-button" to="/favorites" aria-label="Favoris">
            <Star size={20} aria-hidden="true" />
          </NavLink>

          <NavLink className="icon-button" to="/stadiums" aria-label="Stades">
            <MapPin size={20} aria-hidden="true" />
          </NavLink>

          <NavLink className="icon-button notification-button" to="/notifications" aria-label="Notifications">
            <Bell size={20} aria-hidden="true" />
            {unreadCount > 0 ? <span>{unreadCount}</span> : null}
          </NavLink>

          <button className="icon-button" type="button" onClick={toggleTheme} aria-label="Changer de theme">
            <ThemeIcon size={20} aria-hidden="true" />
          </button>
        </div>
      </header>

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
          <NavLink className="icon-button notification-button" to="/notifications" aria-label="Notifications">
            <Bell size={21} aria-hidden="true" />
            {unreadCount > 0 ? <span>{unreadCount}</span> : null}
          </NavLink>

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
