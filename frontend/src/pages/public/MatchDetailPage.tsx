import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Heart, ArrowLeft, MapPin, Users, Calendar } from 'lucide-react'
import { getMatch } from '../../services/matchService'
import type { FootballMatchDto } from '../../services/matchService'
import { getStadium } from '../../services/stadiumService'
import type { StadiumDto } from '../../services/stadiumService'
import { Spinner } from '../../components/ui/Spinner'
import { ErrorState } from '../../components/ui/ErrorState'
import { Badge } from '../../components/ui/Badge'
import { useFavoritesStore } from '../../stores/favoritesStore'
import '../../styles/matchDetail.css'

const phaseLabels: Record<string, string> = {
  GROUP_STAGE: 'Phase de groupes',
  ROUND_OF_32: 'Huitièmes de finale',
  ROUND_OF_16: 'Seizièmes de finale',
  QUARTER_FINAL: 'Quarts de finale',
  SEMI_FINAL: 'Demi-finales',
  THIRD_PLACE: 'Match pour la 3e place',
  FINAL: 'Finale',
}

export function MatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [match, setMatch] = useState<FootballMatchDto | null>(null)
  const [stadium, setStadium] = useState<StadiumDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isFavorite, toggleFavorite } = useFavoritesStore()

  useEffect(() => {
    if (!id) return
    async function fetchData() {
      try {
        const matchData = await getMatch(Number(id))
        setMatch(matchData)
        if (matchData.stadiumId) {
          try {
            const stadiumData = await getStadium(matchData.stadiumId)
            setStadium(stadiumData)
          } catch {
            setStadium(null)
          }
        }
      } catch {
        setError('Impossible de charger ce match.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) return <Spinner />
  if (error || !match) return <ErrorState title="Erreur" message={error ?? 'Match introuvable'} />

  function formatFullDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="match-detail-page">
      <Link to="/matches" className="back-link">
        <ArrowLeft size={16} /> Retour au calendrier
      </Link>

      <div className="match-detail-header">
        <div className="match-detail-meta">
          <span className="match-detail-phase">{phaseLabels[match.phase] ?? match.phase}</span>
          {match.groupCode && match.groupCode.length === 1 && (
            <span className="match-detail-group">· Groupe {match.groupCode}</span>
          )}
        </div>
        {match.status === 'LIVE' && <Badge variant="live">● LIVE {match.currentMinute}'</Badge>}
        {match.status === 'FINISHED' && <Badge variant="success">Match terminé</Badge>}
        {match.status === 'SCHEDULED' && <Badge variant="warning">À venir</Badge>}
      </div>

      <div className="match-detail-scoreboard">
        <div className="match-detail-team">
          {match.homeTeam.flagUrl && <img src={match.homeTeam.flagUrl} alt={match.homeTeam.name} className="match-detail-flag" />}
          <span className="match-detail-team-name">{match.homeTeam.name}</span>
          <span className="match-detail-team-code">{match.homeTeam.fifaCode}</span>
        </div>

        <div className="match-detail-center">
          {match.status === 'SCHEDULED' ? (
            <div className="match-detail-time">{formatTime(match.matchDate)}</div>
          ) : (
            <div className="match-detail-score">{match.homeScore} — {match.awayScore}</div>
          )}
          <button
            className="match-detail-favorite"
            onClick={() => toggleFavorite('MATCH', match.id)}
            style={{ color: isFavorite('MATCH', match.id) ? 'var(--lk-accent)' : undefined }}
          >
            <Heart size={20} fill={isFavorite('MATCH', match.id) ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="match-detail-team">
          {match.awayTeam.flagUrl && <img src={match.awayTeam.flagUrl} alt={match.awayTeam.name} className="match-detail-flag" />}
          <span className="match-detail-team-name">{match.awayTeam.name}</span>
          <span className="match-detail-team-code">{match.awayTeam.fifaCode}</span>
        </div>
      </div>

      <div className="match-detail-info-grid">
        <div className="info-card">
          <Calendar size={18} />
          <div>
            <span className="info-label">Date</span>
            <span className="info-value">{formatFullDate(match.matchDate)} · {formatTime(match.matchDate)}</span>
          </div>
        </div>

        {stadium && (
          <>
            <div className="info-card">
              <MapPin size={18} />
              <div>
                <span className="info-label">Stade</span>
                <span className="info-value">{stadium.name}, {stadium.city}</span>
              </div>
            </div>
            <div className="info-card">
              <Users size={18} />
              <div>
                <span className="info-label">Capacité</span>
                <span className="info-value">{stadium.capacity.toLocaleString('fr-FR')} places</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}