import { Link } from 'react-router-dom'
import { FavoriteButton } from '../../components/football/FavoriteButton'
import { TeamFlag } from '../../components/football/TeamFlag'
import { demoTeams } from '../../fixtures/liveKickDemoData'
import { getTeamDisplayName } from '../../utils/displayNames'

export function TeamsPage() {
  return (
    <section className="page-section">
      <div className="page-heading">
        <span>Équipes</span>
        <h1>Nations qualifiées</h1>
        <p>Accès aux fiches équipes et aux joueurs du tournoi.</p>
      </div>

      <div className="team-grid">
        {demoTeams.map((team) => (
          <article className="team-card" key={team.id}>
            <TeamFlag team={team} />
            <div>
              <h2>{getTeamDisplayName(team)}</h2>
              <p>
                {team.fifaCode} · Groupe {team.groupCode}
              </p>
            </div>
            <FavoriteButton type="TEAM" targetId={team.id ?? team.name} label={`Ajouter ${getTeamDisplayName(team)} aux favoris`} />
            <Link to={`/teams/${team.id ?? team.name}`}>Voir l'équipe</Link>
          </article>
        ))}
      </div>
    </section>
  )
}
