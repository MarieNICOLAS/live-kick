import { GroupStandingTable } from '../../components/football/GroupStandingTable'
import { demoCompetitionGroups } from '../../fixtures/liveKickDemoData'

export function GroupsPage() {
  return (
    <section className="page-section">
      <div className="page-heading">
        <span>Groupes</span>
        <h1>Classements</h1>
        <p>Points, différence de buts et position des équipes par groupe.</p>
      </div>

      <div className="group-grid">
        {demoCompetitionGroups.map((group) => (
          <GroupStandingTable key={group.code} group={group} />
        ))}
      </div>
    </section>
  )
}
