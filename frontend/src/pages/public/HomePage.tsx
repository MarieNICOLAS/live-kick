import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { getMatches } from '../../services/matchService'
import type { FootballMatchDto } from '../../services/matchService'
import { getGroups } from '../../services/groupService'
import type { CompetitionGroupDto } from '../../services/groupService'
import { Spinner } from '../../components/ui/Spinner'
import { ErrorState } from '../../components/ui/ErrorState'
import { Badge } from '../../components/ui/Badge'
import { useFavoritesStore } from '../../stores/favoritesStore'
import '../../styles/homepage.css'

export function HomePage() {
  const [matches, setMatches] = useState<FootballMatchDto[]>([])
  const [groups, setGroups] = useState<CompetitionGroupDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isFavorite, toggleFavorite, favorites } = useFavoritesStore()

  useEffect(() => {
    async function fetchData() {
      try {
        const [matchesData, groupsData] = await Promise.all([
          getMatches(),
          getGroups(),
        ])
        setMatches(matchesData)
        setGroups(groupsData)
      } catch {
        setError('Impossible de charger les données.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <Spinner />
  if (error) return <ErrorState title="Erreur" message={error} />

  const finishedMatches = matches.filter((m) => m.status === 'FINISHED')
  const liveMatches = matches.filter((m) => m.status === 'LIVE')
  const scheduledMatches = matches.filter((m) => m.status === 'SCHEDULED')
  const totalGoals = finishedMatches.reduce((sum, m) => sum + (m.homeScore ?? 0) + (m.awayScore ?? 0), 0)
  const recentMatches = finishedMatches.slice(-4).reverse()
  const nextMatches = scheduledMatches.slice(0, 6)

  const phaseLabels: Record<string, string> = {
    GROUP_STAGE: 'Groupes',
    ROUND_OF_32: 'Huitièmes',
    ROUND_OF_16: 'Seizièmes',
    QUARTER_FINAL: 'Quarts',
    SEMI_FINAL: 'Demis',
    FINAL: 'Finale',
  }

  const currentPhase = matches.find((m) => m.status === 'SCHEDULED')?.phase ?? 'GROUP_STAGE'

  // Calcul top buteurs depuis les scores
  const teamGoals: Record<string, { name: string; flagUrl: string; goals: number }> = {}
  finishedMatches.forEach((m) => {
    if (!teamGoals[m.homeTeam.name]) teamGoals[m.homeTeam.name] = { name: m.homeTeam.name, flagUrl: m.homeTeam.flagUrl, goals: 0 }
    if (!teamGoals[m.awayTeam.name]) teamGoals[m.awayTeam.name] = { name: m.awayTeam.name, flagUrl: m.awayTeam.flagUrl, goals: 0 }
    teamGoals[m.homeTeam.name].goals += m.homeScore ?? 0
    teamGoals[m.awayTeam.name].goals += m.awayScore ?? 0
  })
  const topTeams = Object.values(teamGoals).sort((a, b) => b.goals - a.goals).slice(0, 3)

  // Favoris équipes
  const favoriteTeamIds = favorites.filter((f) => f.type === 'TEAM').map((f) => f.targetId)
  const favoriteTeams = matches
    .flatMap((m) => [m.homeTeam, m.awayTeam])
    .filter((t, i, arr) => favoriteTeamIds.includes(String(t.id)) && arr.findIndex((x) => x.id === t.id) === i)
    .slice(0, 3)

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })
  }

  return (
    <div className="home-page">

      {/* Hero */}
      <section className="hero-section">
        <span className="hero-tag">🏆 Coupe du Monde FIFA 2026</span>
        <h1>Le foot mondial,<br /><span>en temps réel.</span></h1>
        <p>Scores live, statistiques avancées, groupes, tableau final et prédictions IA — tout ce qu'il faut pour ne rien manquer du Mondial 2026.</p>
        <div className="hero-actions">
          <button className="hero-btn-primary">Voir le calendrier →</button>
          <button className="hero-btn-secondary">Tableau final</button>
        </div>
      </section>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-value">{finishedMatches.length}</span>
          <span className="stat-label">Matchs joués</span>
          <span className="stat-sub">sur {matches.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{totalGoals}</span>
          <span className="stat-label">Buts marqués</span>
          <span className="stat-sub">{finishedMatches.length > 0 ? (totalGoals / finishedMatches.length).toFixed(1) : 0} par match</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">48</span>
          <span className="stat-label">Équipes en lice</span>
          <span className="stat-sub">32 qualifiées</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{phaseLabels[currentPhase] ?? currentPhase}</span>
          <span className="stat-label">Phase actuelle</span>
          <span className="stat-sub">{scheduledMatches.length} restants</span>
        </div>
      </div>

      <div className="home-content">
        <div className="home-main">

          {/* Matchs en direct */}
          {liveMatches.length > 0 && (
            <section className="section">
              <div className="section-header">
                <h2>Matchs en direct</h2>
                <Badge variant="live">● {liveMatches.length} en cours</Badge>
              </div>
              <div className="live-matches-grid">
                {liveMatches.map((match) => (
                  <div key={match.id} className="live-match-card">
                    <div className="live-match-header">
                      <Badge variant="live">● Live</Badge>
                    </div>
                    <div className="live-match-teams">
                      <div className="live-team">
                        {match.homeTeam.flagUrl && <img src={match.homeTeam.flagUrl} alt={match.homeTeam.name} className="live-team-flag" />}
                        <span className="live-team-code">{match.homeTeam.fifaCode}</span>
                        <span className="live-team-name">{match.homeTeam.name}</span>
                      </div>
                      <div className="live-score">{match.homeScore} - {match.awayScore}</div>
                      <div className="live-team">
                        {match.awayTeam.flagUrl && <img src={match.awayTeam.flagUrl} alt={match.awayTeam.name} className="live-team-flag" />}
                        <span className="live-team-code">{match.awayTeam.fifaCode}</span>
                        <span className="live-team-name">{match.awayTeam.name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Prochains matchs */}
          {nextMatches.length > 0 && (
            <section className="section">
              <div className="section-header">
                <h2>Prochains matchs</h2>
                <a className="section-link" href="/matches">Tous les matchs →</a>
              </div>
              <div className="matches-list">
                {nextMatches.map((match) => (
                  <div key={match.id} className="match-list-item">
                    <div className="match-list-meta">
                      <span className="match-list-group">
                        {phaseLabels[match.phase] ?? match.phase}
                        {match.groupCode && match.groupCode !== 'R32' && match.groupCode !== 'R16' && match.groupCode !== 'QF' && match.groupCode !== 'SF' && match.groupCode !== 'FINAL' && match.groupCode !== '3RD'
                          ? ` · Groupe ${match.groupCode}`
                          : ''}
                      </span>
                      <span className="match-list-date">{formatDate(match.matchDate)}</span>
                    </div>
                    <div className="match-list-teams">
                      <div className="match-list-team">
                        {match.homeTeam.flagUrl && <img src={match.homeTeam.flagUrl} alt={match.homeTeam.name} />}
                        <span>{match.homeTeam.name}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--lk-text-muted)' }}>{match.homeTeam.fifaCode}</span>
                      </div>
                      <div className="match-list-team">
                        {match.awayTeam.flagUrl && <img src={match.awayTeam.flagUrl} alt={match.awayTeam.name} />}
                        <span>{match.awayTeam.name}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--lk-text-muted)' }}>{match.awayTeam.fifaCode}</span>
                      </div>
                    </div>
                    <div className="match-list-time">{formatTime(match.matchDate)}</div>
                    <button
                      className="match-list-favorite"
                      onClick={() => toggleFavorite('MATCH', match.id)}
                      style={{ color: isFavorite('MATCH', match.id) ? 'var(--lk-accent)' : undefined }}
                    >
                      <Heart size={16} fill={isFavorite('MATCH', match.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Résultats récents */}
          {recentMatches.length > 0 && (
            <section className="section">
              <div className="section-header">
                <h2>Résultats récents</h2>
              </div>
              <div className="matches-list">
                {recentMatches.map((match) => (
                  <div key={match.id} className="match-list-item">
                    <div className="match-list-meta">
                      <span className="match-list-group">{phaseLabels[match.phase] ?? match.phase}</span>
                      <Badge variant="success">Terminé</Badge>
                    </div>
                    <div className="match-list-teams">
                      <div className="match-list-team">
                          {match.homeTeam.flagUrl && <img src={match.homeTeam.flagUrl} alt={match.homeTeam.name} />}
                          <span>{match.homeTeam.fifaCode}</span>
                        </div>
                        <div className="match-list-team">
                          {match.awayTeam.flagUrl && <img src={match.awayTeam.flagUrl} alt={match.awayTeam.name} />}
                          <span>{match.awayTeam.fifaCode}</span>
</div>
                    </div>
                    <div className="match-list-score">
                      <span>{match.homeScore} - {match.awayScore}</span>
                    </div>
                    <button
                      className="match-list-favorite"
                      onClick={() => toggleFavorite('MATCH', match.id)}
                      style={{ color: isFavorite('MATCH', match.id) ? 'var(--lk-accent)' : undefined }}
                    >
                      <Heart size={16} fill={isFavorite('MATCH', match.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Groupes */}
          {groups.length > 0 && (
            <section className="section">
              <div className="section-header">
                <h2>Groupes</h2>
              </div>
              <div className="groups-grid">
                {groups.slice(0, 4).map((group) => (
                  <div key={group.code} className="group-card">
                    <h3>Groupe {group.code}</h3>
                    <table className="standings-table">
                      <thead>
                        <tr>
                          <th>Équipe</th>
                          <th>J</th>
                          <th>Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.standings.map((standing) => (
                          <tr key={standing.team.id}>
                            <td className="team-cell">
                              {standing.team.flagUrl && <img src={standing.team.flagUrl} alt={standing.team.name} className="flag-sm" />}
                              {standing.team.name}
                            </td>
                            <td>{standing.played}</td>
                            <td><strong>{standing.points}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Sidebar */}
        <div className="home-sidebar">

          {/* Prédiction IA */}
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <h3>Prédiction IA du jour</h3>
            </div>
            {scheduledMatches.length > 0 ? (
              <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--lk-text-muted)', marginBottom: '0.5rem' }}>
                  {scheduledMatches[0].homeTeam.name} vs {scheduledMatches[0].awayTeam.name}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {scheduledMatches[0].homeTeam.flagUrl && <img src={scheduledMatches[0].homeTeam.flagUrl} alt="" style={{ width: 32, height: 22, objectFit: 'cover', borderRadius: 3 }} />}
                  {scheduledMatches[0].awayTeam.flagUrl && <img src={scheduledMatches[0].awayTeam.flagUrl} alt="" style={{ width: 32, height: 22, objectFit: 'cover', borderRadius: 3 }} />}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--lk-text-muted)', fontStyle: 'italic' }}>
                  Service IA indisponible
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--lk-text-muted)' }}>Aucun match à prédire</p>
            )}
          </div>

          {/* Mes favoris */}
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <h3>Mes favoris</h3>
              <a className="sidebar-link" href="/favorites">Gérer →</a>
            </div>
            {favoriteTeams.length > 0 ? (
              favoriteTeams.map((team) => (
                <div key={team.id} className="favorite-item">
                  {team.flagUrl && <img src={team.flagUrl} alt={team.name} className="favorite-flag" />}
                  <div className="favorite-info">
                    <span className="favorite-name">{team.name}</span>
                  </div>
                  <button
                    onClick={() => toggleFavorite('TEAM', team.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--lk-accent)' }}
                  >
                    <Heart size={14} fill="currentColor" />
                  </button>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--lk-text-muted)', margin: 0 }}>
                Ajoutez des équipes en favoris en cliquant sur ❤️ dans les matchs
              </p>
            )}
          </div>

          {/* Top équipes (buts) */}
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <h3>Top équipes (buts)</h3>
            </div>
            {topTeams.map((team, i) => (
              <div key={team.name} className="scorer-item">
                <span className="scorer-rank">{i + 1}</span>
                {team.flagUrl && <img src={team.flagUrl} alt={team.name} className="scorer-flag" />}
                <div className="scorer-info">
                  <span className="scorer-name">{team.name}</span>
                </div>
                <span className="scorer-goals">{team.goals}</span>
              </div>
            ))}
          </div>

          {/* Stats rapides */}
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <h3>Statistiques</h3>
            </div>
            {[
              { label: 'Matchs joués', value: finishedMatches.length },
              { label: 'Buts marqués', value: totalGoals },
              { label: 'Moy. buts/match', value: finishedMatches.length > 0 ? (totalGoals / finishedMatches.length).toFixed(1) : 0 },
              { label: 'Équipes', value: 48 },
            ].map((stat) => (
              <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderTop: '1px solid var(--lk-border)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--lk-text-muted)' }}>{stat.label}</span>
                <strong style={{ fontSize: '0.8rem' }}>{stat.value}</strong>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  )
}