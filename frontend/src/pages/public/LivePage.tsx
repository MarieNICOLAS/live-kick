import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, RefreshCw } from 'lucide-react'
import { getMatches } from '../../services/matchService'
import type { FootballMatchDto } from '../../services/matchService'
import { Spinner } from '../../components/ui/Spinner'
import { ErrorState } from '../../components/ui/ErrorState'
import { Badge } from '../../components/ui/Badge'
import { useFavoritesStore } from '../../stores/favoritesStore'
import '../../styles/live.css'

export function LivePage() {
  const navigate = useNavigate()
  const [matches, setMatches] = useState<FootballMatchDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [refreshing, setRefreshing] = useState(false)
  const { isFavorite, toggleFavorite } = useFavoritesStore()

  async function fetchMatches(showRefreshing = false) {
    if (showRefreshing) setRefreshing(true)
    try {
      const data = await getMatches()
      setMatches(data)
      setLastUpdated(new Date())
    } catch {
      setError('Impossible de charger les matchs en direct.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchMatches()
    const interval = setInterval(() => fetchMatches(), 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <Spinner />
  if (error) return <ErrorState title="Erreur" message={error} />

  const liveMatches = matches.filter((m) => m.status === 'LIVE')
  const upcomingToday = matches
    .filter((m) => m.status === 'SCHEDULED')
    .slice(0, 6)
  const recentlyFinished = matches
    .filter((m) => m.status === 'FINISHED')
    .slice(-4)
    .reverse()

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const phaseLabels: Record<string, string> = {
    GROUP_STAGE: 'Groupes',
    ROUND_OF_32: 'Huitièmes',
    ROUND_OF_16: 'Seizièmes',
    QUARTER_FINAL: 'Quarts',
    SEMI_FINAL: 'Demis',
    FINAL: 'Finale',
  }

  return (
    <div className="live-page">
      <div className="live-page-header">
        <div>
          <h1 className="live-page-title">
            Matchs en direct
            {liveMatches.length > 0 && (
              <span className="live-count-badge">● {liveMatches.length} en cours</span>
            )}
          </h1>
          <p className="live-page-subtitle">
            Mis à jour à {lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
        <button
          className={`refresh-btn ${refreshing ? 'spinning' : ''}`}
          onClick={() => fetchMatches(true)}
          aria-label="Rafraîchir"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {liveMatches.length === 0 ? (
        <div className="live-empty">
          <span className="live-empty-icon">⚽</span>
          <h2>Aucun match en direct</h2>
          <p>Les prochains matchs commencent bientôt. La page se rafraîchit automatiquement toutes les 30 secondes.</p>
        </div>
      ) : (
        <div className="live-matches-section">
          <div className="live-cards-grid">
            {liveMatches.map((match) => (
              <div
                key={match.id}
                className="live-card"
                onClick={() => navigate(`/matches/${match.id}`)}
              >
                <div className="live-card-header">
                  <span className="live-card-badge">● LIVE {match.currentMinute}'</span>
                  <span className="live-card-phase">{phaseLabels[match.phase] ?? match.phase}</span>
                </div>
                <div className="live-card-teams">
                  <div className="live-card-team">
                    <div className="live-card-circle">{match.homeTeam.fifaCode?.slice(0, 2)}</div>
                    <span>{match.homeTeam.name}</span>
                  </div>
                  <div className="live-card-score">
                    {match.homeScore} — {match.awayScore}
                  </div>
                  <div className="live-card-team live-card-team--right">
                    <div className="live-card-circle">{match.awayTeam.fifaCode?.slice(0, 2)}</div>
                    <span>{match.awayTeam.name}</span>
                  </div>
                </div>
                <div className="live-card-footer">
                  <span className="live-card-stadium">Stade {match.stadiumId}</span>
                  <button
                    className="live-card-favorite"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite('MATCH', match.id)
                    }}
                    style={{ color: isFavorite('MATCH', match.id) ? 'var(--lk-accent)' : undefined }}
                  >
                    <Heart size={16} fill={isFavorite('MATCH', match.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {upcomingToday.length > 0 && (
        <section className="live-section">
          <h2>Prochains matchs</h2>
          <div className="live-list">
            {upcomingToday.map((match) => (
              <div
                key={match.id}
                className="live-list-row"
                onClick={() => navigate(`/matches/${match.id}`)}
              >
                <Badge variant="warning">À venir</Badge>
                <span className="live-list-time">{formatTime(match.matchDate)}</span>
                <div className="live-list-team">
                  {match.homeTeam.flagUrl && <img src={match.homeTeam.flagUrl} alt="" />}
                  <span>{match.homeTeam.name}</span>
                </div>
                <span className="live-list-vs">vs</span>
                <div className="live-list-team">
                  {match.awayTeam.flagUrl && <img src={match.awayTeam.flagUrl} alt="" />}
                  <span>{match.awayTeam.name}</span>
                </div>
                <button
                  className="live-card-favorite"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite('MATCH', match.id)
                  }}
                  style={{ color: isFavorite('MATCH', match.id) ? 'var(--lk-accent)' : undefined }}
                >
                  <Heart size={16} fill={isFavorite('MATCH', match.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {recentlyFinished.length > 0 && (
        <section className="live-section">
          <h2>Résultats récents</h2>
          <div className="live-list">
            {recentlyFinished.map((match) => (
              <div
                key={match.id}
                className="live-list-row"
                onClick={() => navigate(`/matches/${match.id}`)}
              >
                <Badge variant="success">FT</Badge>
                <span className="live-list-time">{formatTime(match.matchDate)}</span>
                <div className="live-list-team">
                  {match.homeTeam.flagUrl && <img src={match.homeTeam.flagUrl} alt="" />}
                  <span>{match.homeTeam.name}</span>
                </div>
                <span className="live-list-score">{match.homeScore} — {match.awayScore}</span>
                <div className="live-list-team">
                  {match.awayTeam.flagUrl && <img src={match.awayTeam.flagUrl} alt="" />}
                  <span>{match.awayTeam.name}</span>
                </div>
                <button
                  className="live-card-favorite"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite('MATCH', match.id)
                  }}
                  style={{ color: isFavorite('MATCH', match.id) ? 'var(--lk-accent)' : undefined }}
                >
                  <Heart size={16} fill={isFavorite('MATCH', match.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}