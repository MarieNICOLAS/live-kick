import { BarChart3 } from 'lucide-react'
import { demoTeams } from '../../fixtures/liveKickDemoData'

export function StatsPage() {
  return (
    <section className="page-section">
      <div className="page-heading">
        <span>Stats</span>
        <h1>Comparaison</h1>
        <p>Comparez les equipes avec leurs tendances, leur forme et leurs indicateurs de performance.</p>
      </div>

      <section className="info-panel">
        <h2>
          <BarChart3 size={22} aria-hidden="true" />
          Duel populaire
        </h2>
        <dl className="metric-grid">
          <div>
            <dt>{demoTeams[0].name}</dt>
            <dd>56%</dd>
          </div>
          <div>
            <dt>{demoTeams[2].name}</dt>
            <dd>44%</dd>
          </div>
          <div>
            <dt>Indicateur</dt>
            <dd>Forme recente</dd>
          </div>
        </dl>
      </section>
    </section>
  )
}
