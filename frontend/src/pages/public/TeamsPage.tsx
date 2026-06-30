import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FavoriteButton } from '../../components/football/FavoriteButton'
import { TeamFlag } from '../../components/football/TeamFlag'
import { ErrorState } from '../../components/ui/ErrorState'
import { Spinner } from '../../components/ui/Spinner'
import { demoTeams } from '../../fixtures/liveKickDemoData'
import { getTeams } from '../../services/teamService'
import type { Team } from '../../types/football'
import { getTeamDisplayName } from '../../utils/displayNames'

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadTeams() {
      try {
        const response = await getTeams()

        if (!isMounted) {
          return
        }

        setTeams(response)
        setError(null)
      } catch {
        if (!isMounted) {
          return
        }

        setTeams(demoTeams)
        setError("L'API du serveur est indisponible, affichage des données de démonstration.")
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadTeams()

    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return (
      <section className="page-section">
        <Spinner label="Chargement des équipes..." />
      </section>
    )
  }

  return (
    <section className="page-section">
      {error ? <p className="data-warning">{error}</p> : null}

      <div className="page-heading">
        <span>Équipes</span>
        <h1>Nations qualifiées</h1>
        <p>Accès aux fiches équipes et aux joueurs du tournoi.</p>
      </div>

      {teams.length === 0 ? (
        <ErrorState title="Aucune équipe" message="Le serveur ne retourne pas encore d'équipes exploitables." />
      ) : null}

      <div className="team-grid">
        {teams.map((team) => (
          <article className="team-card" key={team.id ?? team.name}>
            <TeamFlag team={team} />
            <div>
              <h2>{getTeamDisplayName(team)}</h2>
              <p>
                {team.fifaCode ?? '-'} · Groupe {team.groupCode ?? '-'}
              </p>
            </div>
            <FavoriteButton type="TEAM" targetId={team.id ?? team.name} label={`Ajouter ${getTeamDisplayName(team)} aux favoris`} />
            <Link to={team.id === null ? '/teams' : `/teams/${team.id}`}>Voir l'équipe</Link>
          </article>
        ))}
      </div>
    </section>
  )
}
