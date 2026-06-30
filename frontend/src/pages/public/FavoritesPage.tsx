import { useEffect, useMemo, useState } from 'react'
import { Heart, Bell, Globe, Moon } from 'lucide-react'
import { useFavoritesStore } from '../../stores/favoritesStore'
import { useTheme } from '../../app/themeContext'
import { getTeams } from '../../services/teamService'
import type { TeamDto } from '../../services/teamService'
import { getMatches } from '../../services/matchService'
import type { FootballMatchDto } from '../../services/matchService'
import { Spinner } from '../../components/ui/Spinner'
import { ErrorState } from '../../components/ui/ErrorState'
import { Badge } from '../../components/ui/Badge'
import '../../styles/favorites.css'

type Tab = 'teams' | 'matches' | 'preferences'

const NOTIFICATION_OPTIONS = [
  { key: 'kickoff', label: 'Début de match' },
  { key: 'goals', label: 'Buts' },
  { key: 'redCards', label: 'Cartons rouges' },
  { key: 'halftime', label: 'Mi-temps' },
  { key: 'fulltime', label: 'Fin de match' },
  { key: 'aiAlerts', label: 'Alertes IA' },
]

export function FavoritesPage() {
  const { favorites, toggleFavorite } = useFavoritesStore()
  const { theme, toggleTheme } = useTheme()
  const [teams, setTeams] = useState<TeamDto[]>([])
  const [matches, setMatches] = useState<FootballMatchDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('teams')
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    kickoff: true,
    goals: true,
    redCards: true,
    halftime: false,
    fulltime: true,
    aiAlerts: true,
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [teamsData, matchesData] = await Promise.all([getTeams(), getMatches()])
        setTeams(teamsData)
        setMatches(matchesData)
      } catch {
        setError('Impossible de charger les favoris.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const favoriteTeamIds = useMemo(
    () => favorites.filter((f) => f.type === 'TEAM').map((f) => f.targetId),
    [favorites]
  )
  const favoriteMatchIds = useMemo(
    () => favorites.filter((f) => f.type === 'MATCH').map((f) => f.targetId),
    [favorites]
  )

  const favoriteTeams = teams.filter((t) => favoriteTeamIds.includes(String(t.id)))
  const favoriteMatches = matches.filter((m) => favoriteMatchIds.includes(String(m.id)))

  const phaseLabels: Record<string, string> = {
    GROUP_STAGE: 'Groupe',
    ROUND_OF_32: 'Huitièmes de finale',
    ROUND_OF_16: 'Seizièmes de finale',
    QUARTER_FINAL: 'Quarts de finale',
    SEMI_FINAL: 'Demi-finales',
    FINAL: 'Finale',
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  function toggleNotification(key: string) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  if (loading) return <Spinner />
  if (error) return <ErrorState title="Erreur" message={error} />

  return (
    <div className="favorites-page">
      <h1 className="favorites-title">Favoris & profil</h1>
      <p className="favorites-subtitle">Personnalise ton suivi du Mondial 2026.</p>

      <div className="favorites-tabs">
        <button
          className={`favorites-tab ${activeTab === 'teams' ? 'active' : ''}`}
          onClick={() => setActiveTab('teams')}
        >
          Équipes favorites
        </button>
        <button
          className={`favorites-tab ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          Matchs favoris
        </button>
        <button
          className={`favorites-tab ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          Préférences
        </button>
      </div>

      {activeTab === 'teams' && (
        <>
          {favoriteTeams.length === 0 ? (
            <div className="favorites-empty">
              <Heart size={32} />
              <h2>Aucune équipe favorite</h2>
              <p>Ajoutez des équipes en favoris depuis la page Équipes.</p>
            </div>
          ) : (
            <div className="favorites-teams-grid">
              {favoriteTeams.map((team) => (
                <div key={team.id} className="favorite-team-card">
                  {team.flagUrl && <img src={team.flagUrl} alt={team.name} className="favorite-team-flag" />}
                  <div className="favorite-team-info">
                    <span className="favorite-team-name">{team.name}</span>
                    <span className="favorite-team-meta">Groupe {team.groupCode} · {team.fifaCode}</span>
                  </div>
                  <button
                    className="favorite-remove-btn"
                    onClick={() => toggleFavorite('TEAM', team.id)}
                    aria-label="Retirer des favoris"
                  >
                    <Heart size={18} fill="currentColor" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'matches' && (
        <>
          {favoriteMatches.length === 0 ? (
            <div className="favorites-empty">
              <Heart size={32} />
              <h2>Aucun match suivi</h2>
              <p>Ajoutez des matchs en favoris depuis le calendrier ou l'accueil.</p>
            </div>
          ) : (
            <div className="favorites-matches-grid">
              {favoriteMatches.map((match) => (
                <div key={match.id} className={`favorite-match-card ${match.status === 'LIVE' ? 'live' : ''}`}>
                  <div className="favorite-match-meta">
                    <span>{phaseLabels[match.phase] ?? match.phase}</span>
                    <span>· {formatDate(match.matchDate)}</span>
                    {match.status === 'LIVE' && <Badge variant="live">● LIVE {match.currentMinute}'</Badge>}
                    {match.status === 'FINISHED' && <Badge variant="success">Terminé</Badge>}
                    {match.status === 'SCHEDULED' && <Badge variant="warning">À venir</Badge>}
                  </div>
                  <div className="favorite-match-teams">
                    <div className="favorite-match-team">
                      <div className="favorite-team-circle">{match.homeTeam.fifaCode?.slice(0, 2)}</div>
                      <div>
                        <span className="favorite-match-team-name">{match.homeTeam.name}</span>
                        <span className="favorite-match-team-code">{match.homeTeam.fifaCode}</span>
                      </div>
                    </div>
                    <span className="favorite-match-result">
                      {match.status === 'SCHEDULED' ? formatTime(match.matchDate) : `${match.homeScore} — ${match.awayScore}`}
                    </span>
                    <div className="favorite-match-team favorite-match-team--right">
                      <div>
                        <span className="favorite-match-team-name">{match.awayTeam.name}</span>
                        <span className="favorite-match-team-code">{match.awayTeam.fifaCode}</span>
                      </div>
                      <div className="favorite-team-circle">{match.awayTeam.fifaCode?.slice(0, 2)}</div>
                    </div>
                  </div>
                  <div className="favorite-match-footer">
                    <span>📍 Stade {match.stadiumId}</span>
                    <button
                      className="favorite-remove-btn"
                      onClick={() => toggleFavorite('MATCH', match.id)}
                      aria-label="Retirer des favoris"
                    >
                      <Heart size={16} fill="currentColor" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'preferences' && (
        <div className="preferences-grid">
          <div className="preferences-card">
            <div className="preferences-card-header">
              <Bell size={18} />
              <h2>Notifications</h2>
            </div>
            <div className="preferences-list">
              {NOTIFICATION_OPTIONS.map((option) => (
                <div key={option.key} className="preference-row">
                  <span>{option.label}</span>
                  <button
                    className={`toggle-switch ${notifications[option.key] ? 'on' : ''}`}
                    onClick={() => toggleNotification(option.key)}
                    aria-label={`Activer ${option.label}`}
                  >
                    <span className="toggle-knob" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="preferences-card">
            <div className="preferences-card-header">
              <Globe size={18} />
              <h2>Langue & fuseau horaire</h2>
            </div>
            <div className="preferences-form">
              <label>
                <span>Langue</span>
                <select defaultValue="fr">
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </label>
              <label>
                <span>Fuseau horaire</span>
                <select defaultValue="europe-paris">
                  <option value="europe-paris">Europe/Paris (UTC+1)</option>
                  <option value="america-newyork">America/New_York (UTC-5)</option>
                </select>
              </label>
              <div className="preference-row preference-row--theme">
                <div>
                  <strong>Apparence</strong>
                  <span className="preference-hint">Thème sombre ou clair</span>
                </div>
                <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Changer de thème">
                  <Moon size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}