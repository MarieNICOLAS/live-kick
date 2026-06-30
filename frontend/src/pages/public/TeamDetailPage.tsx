import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Heart, ArrowLeft, TrendingUp, Target, Shield } from 'lucide-react'
import { getTeam } from '../../services/teamService'
import type { TeamDto } from '../../services/teamService'
import { getTeamStatistics } from '../../services/teamStatsService'
import type { TeamStatisticsDto } from '../../services/teamStatsService'
import { Spinner } from '../../components/ui/Spinner'
import { ErrorState } from '../../components/ui/ErrorState'
import { useFavoritesStore } from '../../stores/favoritesStore'
import '../../styles/teamDetail.css'

export function TeamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [team, setTeam] = useState<TeamDto | null>(null)
  const [stats, setStats] = useState<TeamStatisticsDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isFavorite, toggleFavorite } = useFavoritesStore()

  useEffect(() => {
    if (!id) return
    async function fetchData() {
      try {
        const [teamData, statsData] = await Promise.all([
          getTeam(Number(id)),
          getTeamStatistics(Number(id)),
        ])
        setTeam(teamData)
        setStats(statsData)
      } catch {
        setError('Impossible de charger cette équipe.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) return <Spinner />
  if (error || !team) return <ErrorState title="Erreur" message={error ?? 'Équipe introuvable'} />

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  }

  const resultLabels: Record<string, { label: string; className: string }> = {
    WIN: { label: 'V', className: 'result-win' },
    DRAW: { label: 'N', className: 'result-draw' },
    LOSS: { label: 'D', className: 'result-loss' },
  }

  return (
    <div className="team-detail-page">
      <Link to="/teams" className="back-link">
        <ArrowLeft size={16} /> Retour aux équipes
      </Link>

      <div className="team-detail-header">
        {team.flagUrl && <img src={team.flagUrl} alt={team.name} className="team-detail-flag" />}
        <div className="team-detail-info">
          <h1>{team.name}</h1>
          <span className="team-detail-meta">
            {team.groupCode && `Groupe ${team.groupCode}`} · {team.fifaCode}
          </span>
        </div>
        <button
          className="team-detail-favorite"
          onClick={() => toggleFavorite('TEAM', team.id)}
          style={{ color: isFavorite('TEAM', team.id) ? 'var(--lk-accent)' : undefined }}
        >
          <Heart size={22} fill={isFavorite('TEAM', team.id) ? 'currentColor' : 'none'} />
        </button>
      </div>

      {stats && (
        <>
          <div className="team-stats-grid">
            <div className="team-stat-card">
              <TrendingUp size={18} />
              <div>
                <span className="team-stat-label">Taux de victoire</span>
                <span className="team-stat-value">{stats.winRate.toFixed(0)}%</span>
              </div>
            </div>
            <div className="team-stat-card">
              <Target size={18} />
              <div>
                <span className="team-stat-label">Buts marqués</span>
                <span className="team-stat-value">{stats.goalsFor} <small>({stats.averageGoalsFor.toFixed(1)}/m)</small></span>
              </div>
            </div>
            <div className="team-stat-card">
              <Shield size={18} />
              <div>
                <span className="team-stat-label">Buts encaissés</span>
                <span className="team-stat-value">{stats.goalsAgainst} <small>({stats.averageGoalsAgainst.toFixed(1)}/m)</small></span>
              </div>
            </div>
          </div>

          <div className="team-record-card">
            <div className="record-item">
              <span className="record-value">{stats.matchesPlayed}</span>
              <span className="record-label">Joués</span>
            </div>
            <div className="record-item">
              <span className="record-value record-win">{stats.wins}</span>
              <span className="record-label">Victoires</span>
            </div>
            <div className="record-item">
              <span className="record-value record-draw">{stats.draws}</span>
              <span className="record-label">Nuls</span>
            </div>
            <div className="record-item">
              <span className="record-value record-loss">{stats.losses}</span>
              <span className="record-label">Défaites</span>
            </div>
            <div className="record-item">
              <span className="record-value">{stats.goalDifference > 0 ? '+' : ''}{stats.goalDifference}</span>
              <span className="record-label">Diff. buts</span>
            </div>
          </div>

          <section className="team-form-section">
            <h2>Derniers matchs</h2>
            <div className="team-form-list">
              {stats.recentForm.map((match) => {
                const result = resultLabels[match.result]
                return (
                  <Link key={match.matchId} to={`/matches/${match.matchId}`} className="team-form-match">
                    <span className={`result-badge ${result.className}`}>{result.label}</span>
                    <span className="team-form-date">{formatDate(match.matchDate)}</span>
                    <div className="team-form-opponent">
                      {match.opponent.flagUrl && <img src={match.opponent.flagUrl} alt={match.opponent.name} />}
                      <span>{match.home ? 'vs' : '@'} {match.opponent.name}</span>
                    </div>
                    <span className="team-form-score">{match.teamScore} — {match.opponentScore}</span>
                  </Link>
                )
              })}
            </div>
          </section>
        </>
      )}
    </div>
  )
}