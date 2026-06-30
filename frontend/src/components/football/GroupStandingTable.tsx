import type { CompetitionGroup } from '../../types/football'
import { TeamFlag } from './TeamFlag'

type GroupStandingTableProps = {
  group: CompetitionGroup
}

export function GroupStandingTable({ group }: GroupStandingTableProps) {
  return (
    <section className="standing-table" aria-labelledby={`group-${group.code}`}>
      <div className="standing-table__header">
        <h2 id={`group-${group.code}`}>Groupe {group.code}</h2>
        <span>{group.standings.length} equipes</span>
      </div>

      <div className="standing-table__scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Equipe</th>
              <th scope="col">J</th>
              <th scope="col">G</th>
              <th scope="col">N</th>
              <th scope="col">P</th>
              <th scope="col">Diff</th>
              <th scope="col">Pts</th>
            </tr>
          </thead>
          <tbody>
            {group.standings.map((standing, index) => (
              <tr key={standing.team.id ?? standing.team.name}>
                <td>{index + 1}</td>
                <td>
                  <span className="standing-team">
                    <TeamFlag team={standing.team} compact />
                    {standing.team.name}
                  </span>
                </td>
                <td>{standing.matchesPlayed}</td>
                <td>{standing.wins}</td>
                <td>{standing.draws}</td>
                <td>{standing.losses}</td>
                <td>{standing.goalDifference > 0 ? `+${standing.goalDifference}` : standing.goalDifference}</td>
                <td>
                  <strong>{standing.points}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
