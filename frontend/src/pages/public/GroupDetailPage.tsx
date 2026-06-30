import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getGroup } from '../../services/groupService'
import type { CompetitionGroupDto } from '../../services/groupService'
import { getMatches } from '../../services/matchService'
import type { FootballMatchDto } from '../../services/matchService'
import { Spinner } from '../../components/ui/Spinner'
import { ErrorState } from '../../components/ui/ErrorState'
import { Badge } from '../../components/ui/Badge'
import '../../styles/groupDetail.css'

export function GroupDetailPage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [group, setGroup] = useState<CompetitionGroupDto | null>(null)
  const [matches, setMatches] = useState<FootballMatchDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!code) return
    async function fetchData() {
      try {
        const [groupData, matchesData] = await Promise.all([
          getGroup(code as string),
          getMatches(),
        ])
        setGroup(groupData)
        setMatches(matchesData)
      } catch {
        setError('Impossible de charger ce groupe.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [code])

  if (loading) return <Spinner />
  if (error || !group) return <ErrorState title="Erreur" message={error ?? 'Groupe introuvable'} />

  const groupMatches = matches
    .filter((m) => m.groupCode === code)
    .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="group-detail-page">
      <Link to="/groups" className="back-link">
        <ArrowLeft size={16} /> Retour aux groupes
      </Link>

      <h1 className="group-detail-title">Groupe {group.code}</h1>
      <p className="group-detail-subtitle">Classement et calendrier complet</p>

      <div className="group-detail-table-card">
        <table className="group-detail-table">
          <thead>
            <tr>
              <th className="col-rank">#</th>
              <th className="col-team">Équipe</th>
              <th>MJ</th>
              <th>V</th>
              <th>N</th>
              <th>D</th>
              <th>BP</th>
              <th>BC</th>
              <th>DB</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {group.standings.map((standing, index) => (
              <tr
                key={standing.team.id}
                className={index < 2 ? 'qualified' : ''}
                onClick={() => navigate(`/teams/${standing.team.id}`)}
              >
                <td className="col-rank">{index + 1}</td>
                <td className="col-team">
                  {standing.team.flagUrl && (
                    <img src={standing.team.flagUrl} alt={standing.team.name} className="group-detail-flag" />
                  )}
                  <span>{standing.team.name}</span>
                </td>
                <td>{standing.matchesPlayed}</td>
                <td>{standing.wins}</td>
                <td>{standing.draws}</td>
                <td>{standing.losses}</td>
                <td>{standing.goalsFor}</td>
                <td>{standing.goalsAgainst}</td>
                <td>{standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}</td>
                <td><strong>{standing.points}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="group-detail-matches">
        <h2>Matchs du groupe</h2>
        <div className="group-detail-matches-list">
          {groupMatches.map((match) => (
            <Link key={match.id} to={`/matches/${match.id}`} className="group-match-row">
              <span className="group-match-date">{formatDate(match.matchDate)}</span>
              <div className="group-match-team">
                {match.homeTeam.flagUrl && <img src={match.homeTeam.flagUrl} alt="" />}
                <span>{match.homeTeam.name}</span>
              </div>
              <span className="group-match-result">
                {match.status === 'SCHEDULED'
                  ? formatTime(match.matchDate)
                  : `${match.homeScore} — ${match.awayScore}`}
              </span>
              <div className="group-match-team group-match-team--right">
                <span>{match.awayTeam.name}</span>
                {match.awayTeam.flagUrl && <img src={match.awayTeam.flagUrl} alt="" />}
              </div>
              {match.status === 'LIVE' && <Badge variant="live">● LIVE</Badge>}
              {match.status === 'FINISHED' && <Badge variant="success">FT</Badge>}
              {match.status === 'SCHEDULED' && <Badge variant="warning">À venir</Badge>}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}