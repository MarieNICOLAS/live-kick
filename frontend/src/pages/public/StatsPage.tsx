import { BarChart3 } from 'lucide-react'
import { demoTeams } from '../../fixtures/liveKickDemoData'
import { getTeamDisplayName } from '../../utils/displayNames'

export function StatsPage() {
  return (
    <section className="page-section">
      <div className="page-heading">
        <span>Statistiques</span>
        <h1>Comparaison</h1>
        <p>Comparez les équipes avec leurs tendances, leur forme et leurs indicateurs de performance.</p>
      </div>

      <section className="info-panel">
        <h2>
          <BarChart3 size={22} aria-hidden="true" />
          Duel populaire
        </h2>
        <dl className="metric-grid">
          <div>
            <dt>{getTeamDisplayName(demoTeams[0])}</dt>
            <dd>56%</dd>
          </div>
          <div>
            <dt>{getTeamDisplayName(demoTeams[2])}</dt>
            <dd>44%</dd>
          </div>
          <div>
            <dt>Indicateur</dt>
            <dd>Forme récente</dd>
          </div>
        </dl>
      </section>
    </section>
  )
}
