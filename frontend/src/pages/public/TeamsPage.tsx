import { Link } from 'react-router-dom'
import { FavoriteButton } from '../../components/football/FavoriteButton'
import { TeamFlag } from '../../components/football/TeamFlag'
import { demoTeams } from '../../fixtures/liveKickDemoData'

export function TeamsPage() {
  return (
    <section className="page-section">
      <div className="page-heading">
        <span>Equipes</span>
        <h1>Nations qualifiees</h1>
        <p>Acces aux fiches equipes et aux joueurs du tournoi.</p>
      </div>

      <div className="team-grid">
        {demoTeams.map((team) => (
          <article className="team-card" key={team.id}>
            <TeamFlag team={team} />
            <div>
              <h2>{team.name}</h2>
              <p>
                {team.fifaCode} · Groupe {team.groupCode}
              </p>
            </div>
            <FavoriteButton type="TEAM" targetId={team.id ?? team.name} label={`Ajouter ${team.name} aux favoris`} />
            <Link to={`/teams/${team.id ?? team.name}`}>Voir l'equipe</Link>
          </article>
        ))}
      </div>
    </section>
  )
}
