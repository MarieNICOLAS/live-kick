import { useEffect, useState } from 'react'
import { getGroups } from '../../services/groupService'
import type { CompetitionGroupDto } from '../../services/groupService'
import { Spinner } from '../../components/ui/Spinner'
import { ErrorState } from '../../components/ui/ErrorState'
import '../../styles/groups.css'

export function GroupsPage() {
  const [groups, setGroups] = useState<CompetitionGroupDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getGroups()
        setGroups(data)
      } catch {
        setError('Impossible de charger les groupes.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <Spinner />
  if (error) return <ErrorState title="Erreur" message={error} />

  function getQualificationStatus(index: number, totalPlayed: number) {
    if (totalPlayed < 3) {
      if (index < 2) return { label: 'En tête', className: 'status-leading' }
      return { label: 'Barrage', className: 'status-barrage' }
    }
    if (index < 2) return { label: 'Qualifié', className: 'status-qualified' }
    return { label: 'Éliminé', className: 'status-eliminated' }
  }

  return (
    <div className="groups-page">
      <h1 className="groups-page-title">Groupes & classements</h1>
      <p className="groups-page-subtitle">
        Phase de groupes — les deux premiers de chaque groupe se qualifient.
      </p>

      <div className="groups-page-grid">
        {groups.map((group) => (
          <div key={group.code} className="groups-page-card">
            <div className="groups-page-card-header">
              <h2>Groupe {group.code}</h2>
            </div>
            <table className="groups-page-table">
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
                {group.standings.map((standing, index) => {
                  const status = getQualificationStatus(index, standing.matchesPlayed)
                  return (
                    <tr key={standing.team.id} className={index < 2 ? 'qualified' : ''}>
                      <td className="col-rank">{index + 1}</td>
                      <td className="col-team">
                        <div className="team-info">
                          {standing.team.flagUrl && (
                            <img src={standing.team.flagUrl} alt={standing.team.name} className="groups-page-flag" />
                          )}
                          <div className="team-name-block">
                            <span className="team-name">{standing.team.name}</span>
                            <span className={`status-badge ${status.className}`}>{status.label}</span>
                          </div>
                        </div>
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
                  )
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <div className="groups-page-legend-box">
        <strong>Légende :</strong> MJ = matchs joués · V = victoires · N = nuls · D = défaites · BP = buts pour · BC = buts contre · DB = différence de buts · Pts = points.
      </div>
    </div>
  )
}