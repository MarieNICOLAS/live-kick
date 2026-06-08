import { useEffect, useState } from 'react'
import './App.css'
import { getBackendStatus, type BackendStatus } from './services/statusService'

function App() {
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null)
  const [statusState, setStatusState] = useState<'loading' | 'ready' | 'offline'>('loading')

  useEffect(() => {
    getBackendStatus()
      .then((status) => {
        setBackendStatus(status)
        setStatusState('ready')
      })
      .catch(() => {
        setStatusState('offline')
      })
  }, [])

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div>
          <p className="eyebrow">Live football intelligence</p>
          <h1>LiveKick 2026</h1>
        </div>
        <span className={`status-pill status-pill--${statusState}`}>
          {statusState === 'ready' ? 'Backend online' : statusState === 'offline' ? 'Backend offline' : 'Checking'}
        </span>
      </header>

      <section className="scoreboard" aria-label="LiveKick platform status">
        <article className="metric">
          <span>Frontend</span>
          <strong>React TS</strong>
        </article>
        <article className="metric">
          <span>Backend</span>
          <strong>{backendStatus?.apiVersion ?? 'v1'}</strong>
        </article>
        <article className="metric">
          <span>Database</span>
          <strong>PostgreSQL</strong>
        </article>
        <article className="metric">
          <span>Live</span>
          <strong>WebSocket</strong>
        </article>
      </section>

      <section className="match-strip" aria-label="Match preview">
        <div className="team-name">Canada</div>
        <div className="score-block">
          <span className="live-badge">LIVE</span>
          <strong>1 - 1</strong>
          <span>62'</span>
        </div>
        <div className="team-name">Mexico</div>
      </section>

      <section className="foundation-grid">
        {[
          ['API', 'REST / JSON'],
          ['Security', 'JWT + RBAC'],
          ['AI', backendStatus?.aiServiceBaseUrl ?? 'FastAPI'],
          ['Cloud', 'Docker ready'],
        ].map(([label, value]) => (
          <article className="foundation-item" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>
    </main>
  )
}

export default App
