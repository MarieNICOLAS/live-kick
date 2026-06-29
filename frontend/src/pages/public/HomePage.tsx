import { useEffect, useState } from 'react'
import { Heart, Activity, Target, Users, Trophy } from 'lucide-react'
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
  const todayMatches = scheduledMatches.slice(0, 3)

  const phaseLabels: Record<string, string> = {
    GROUP_STAGE: 'Groupes',
    ROUND_OF_32: 'Huitièmes',
    ROUND_OF_16: 'Seizièmes',
    QUARTER_FINAL: 'Quarts',
    SEMI_FINAL: 'Demis',
    FINAL: 'Finale',
  }

  const excludedCodes = ['R32', 'R16', 'QF', 'SF', 'FINAL', '3RD']
  const currentPhase = matches.find((m) => m.status === 'SCHEDULED')?.phase ?? 'GROUP_STAGE'

  const teamGoals: Record<string, { name: string; flagUrl: string; goals: number }> = {}
  finishedMatches.forEach((m) => {
    if (!teamGoals[m.homeTeam.name]) teamGoals[m.homeTeam.name] = { name: m.homeTeam.name, flagUrl: m.homeTeam.flagUrl, goals: 0 }
    if (!teamGoals[m.awayTeam.name]) teamGoals[m.awayTeam.name] = { name: m.awayTeam.name, flagUrl: m.awayTeam.flagUrl, goals: 0 }
    teamGoals[m.homeTeam.name].goals += m.homeScore ?? 0
    teamGoals[m.awayTeam.name].goals += m.awayScore ?? 0
  })
  const topTeams = Object.values(teamGoals).sort((a, b) => b.goals - a.goals).slice(0, 3)

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

  // Pourcentages simulés pour favoris
  const favoritePercents = [92, 74, 88]

  // Top buteurs simulés
  const topScorers = [
    { name: 'Kylian Mbappé', team: 'France', goals: 6, flagUrl: 'https://flagcdn.com/w80/fr.png' },
    { name: 'Lionel Messi', team: 'Argentine', goals: 5, flagUrl: 'https://flagcdn.com/w80/ar.png' },
    { name: 'Vinicius Jr', team: 'Brésil', goals: 4, flagUrl: 'https://flagcdn.com/w80/br.png' },
  ]

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
          <div className="stat-item-top">
            <span className="stat-label">Matchs joués</span>
            <Activity size={16} className="stat-icon" />
          </div>
          <span className="stat-value">{finishedMatches.length}</span>
          <span className="stat-sub">sur {matches.length}</span>
        </div>
        <div className="stat-item">
          <div className="stat-item-top">
            <span className="stat-label">Buts marqués</span>
            <Target size={16} className="stat-icon" />
          </div>
          <span className="stat-value">{totalGoals}</span>
          <span className="stat-sub">{finishedMatches.length > 0 ? (totalGoals / finishedMatches.length).toFixed(1) : 0} par match</span>
        </div>
        <div className="stat-item">
          <div className="stat-item-top">
            <span className="stat-label">Équipes en lice</span>
            <Users size={16} className="stat-icon" />
          </div>
          <span className="stat-value">48</span>
          <span className="stat-sub">32 qualifiées</span>
        </div>
        <div className="stat-item">
          <div className="stat-item-top">
            <span className="stat-label">Phase actuelle</span>
            <Trophy size={16} className="stat-icon" />
          </div>
          <span className="stat-value stat-value--phase">{phaseLabels[currentPhase] ?? currentPhase}</span>
          <span className="stat-sub">{scheduledMatches.length} restants</span>
        </div>
      </div>

      <div className="home-content">
        <div className="home-main">

          {/* Matchs en direct */}
          <section className="section">
            <div className="section-header">
              <h2>
                Matchs en direct
                {liveMatches.length > 0 && (
                  <span className="live-count">● {liveMatches.length} en cours</span>
                )}
              </h2>
            </div>
            {liveMatches.length > 0 ? (
              <div className="live-matches-grid">
                {liveMatches.map((match) => (
                  <div key={match.id} className="live-match-card">
                    <div className="live-match-header">
                      <span className="live-badge">● LIVE {match.currentMinute}'</span>
                      <span className="match-stadium">⚡ Stade {match.stadiumId}</span>
                    </div>
                    <div className="live-match-teams">
                      <div className="live-team">
                        <div className="team-circle">{match.homeTeam.fifaCode?.slice(0, 2)}</div>
                        <span className="live-team-name">{match.homeTeam.name}</span>
                      </div>
                      <div className="live-score">{match.homeScore} — {match.awayScore}</div>
                      <div className="live-team">
                        <div className="team-circle">{match.awayTeam.fifaCode?.slice(0, 2)}</div>
                        <span className="live-team-name">{match.awayTeam.name}</span>
                      </div>
                    </div>
                    <div className="live-match-footer">
                      <span className="live-event-label">Dernier événement</span>
                      <span className="live-event-value">{match.currentMinute}' —</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-live">
                <span>⚽</span>
                <p>Aucun match en direct pour le moment</p>
              </div>
            )}
          </section>

          {/* Matchs du jour */}
          {todayMatches.length > 0 && (
            <section className="section">
              <div className="section-header">
                <h2>Matchs du jour</h2>
                <a className="section-link" href="/matches">Tous les matchs →</a>
              </div>
              <div className="matches-list">
                {todayMatches.map((match) => (
                  <div key={match.id} className="match-list-item">
                    <div className="match-list-meta">
                      <span className="match-list-group">
                        {phaseLabels[match.phase] ?? match.phase}
                        {match.groupCode && !excludedCodes.includes(match.groupCode)
                          ? ` · Groupe ${match.groupCode}` : ''}
                      </span>
                      <span className="match-list-date">{formatDate(match.matchDate)}</span>
                    </div>
                    <div className="match-list-teams">
                      <div className="match-list-team">
                        {match.homeTeam.flagUrl && <img src={match.homeTeam.flagUrl} alt={match.homeTeam.name} />}
                        <div>
                          <span>{match.homeTeam.name}</span>
                          <span className="team-fifa-code">{match.homeTeam.fifaCode}</span>
                        </div>
                      </div>
                      <div className="match-list-team">
                        {match.awayTeam.flagUrl && <img src={match.awayTeam.flagUrl} alt={match.awayTeam.name} />}
                        <div>
                          <span>{match.awayTeam.name}</span>
                          <span className="team-fifa-code">{match.awayTeam.fifaCode}</span>
                        </div>
                      </div>
                    </div>
                    <div className="match-list-right">
                      <Badge variant="warning">À venir</Badge>
                      <div className="match-list-time">{formatTime(match.matchDate)}</div>
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

          {/* Prochains matchs */}
          {nextMatches.length > 0 && (
            <section className="section">
              <div className="section-header">
                <h2>Prochains matchs</h2>
                <a className="section-link" href="/matches">Voir tout →</a>
              </div>
              <div className="next-matches-grid">
                {nextMatches.map((match) => (
                  <div key={match.id} className="next-match-card">
                    <div className="next-match-header">
                      <span className="match-list-group">
                        {phaseLabels[match.phase] ?? match.phase}
                        {match.groupCode && !excludedCodes.includes(match.groupCode)
                          ? ` · Groupe ${match.groupCode}` : ''}
                      </span>
                      <span className="match-list-date">{formatDate(match.matchDate)}</span>
                      <Badge variant="warning">À venir</Badge>
                    </div>
                    <div className="next-match-teams">
                      <div className="next-match-team">
                        {match.homeTeam.flagUrl && <img src={match.homeTeam.flagUrl} alt={match.homeTeam.name} className="next-match-flag" />}
                        <span className="next-match-name">{match.homeTeam.name}</span>
                        <span className="team-fifa-code">{match.homeTeam.fifaCode}</span>
                      </div>
                      <div className="next-match-time">{formatTime(match.matchDate)}</div>
                      <div className="next-match-team next-match-team--right">
                        {match.awayTeam.flagUrl && <img src={match.awayTeam.flagUrl} alt={match.awayTeam.name} className="next-match-flag" />}
                        <span className="next-match-name">{match.awayTeam.name}</span>
                        <span className="team-fifa-code">{match.awayTeam.fifaCode}</span>
                      </div>
                    </div>
                    <button
                      className="match-list-favorite"
                      onClick={() => toggleFavorite('MATCH', match.id)}
                      style={{ color: isFavorite('MATCH', match.id) ? 'var(--lk-accent)' : undefined, alignSelf: 'flex-end' }}
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
              <div className="next-matches-grid">
                {recentMatches.map((match) => (
                  <div key={match.id} className="next-match-card">
                    <div className="next-match-header">
                      <span className="match-list-group">
                        {phaseLabels[match.phase] ?? match.phase}
                        {match.groupCode && !excludedCodes.includes(match.groupCode)
                          ? ` · Groupe ${match.groupCode}` : ''}
                      </span>
                      <Badge variant="success">Terminé</Badge>
                    </div>
                    <div className="next-match-teams">
                      <div className="next-match-team">
                        {match.homeTeam.flagUrl && <img src={match.homeTeam.flagUrl} alt={match.homeTeam.name} className="next-match-flag" />}
                        <span className="next-match-name">{match.homeTeam.name}</span>
                        <span className="team-fifa-code">{match.homeTeam.fifaCode}</span>
                      </div>
                      <div className="next-match-score">{match.homeScore} — {match.awayScore}</div>
                      <div className="next-match-team next-match-team--right">
                        {match.awayTeam.flagUrl && <img src={match.awayTeam.flagUrl} alt={match.awayTeam.name} className="next-match-flag" />}
                        <span className="next-match-name">{match.awayTeam.name}</span>
                        <span className="team-fifa-code">{match.awayTeam.fifaCode}</span>
                      </div>
                    </div>
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
                          <th>V</th>
                          <th>N</th>
                          <th>D</th>
                          <th>Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.standings.map((standing) => (
                          <tr key={standing.team.id}>
                            <td className="team-cell">
                              {standing.team.flagUrl && <img src={standing.team.flagUrl} alt={standing.team.name} className="flag-sm" />}
                              <span>{standing.team.name}</span>
                            </td>
                            <td>{standing.played}</td>
                            <td>{standing.won}</td>
                            <td>{standing.drawn}</td>
                            <td>{standing.lost}</td>
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
              {scheduledMatches.length > 0 && (
                <span style={{ fontSize: '0.72rem', color: 'var(--lk-text-muted)' }}>
                  Score total prévu
                </span>
              )}
            </div>
            {scheduledMatches.length > 0 ? (
              <div className="ai-prediction">
                <div className="ai-match-header">
                  <div className="ai-match-teams">
                    {scheduledMatches[0].homeTeam.flagUrl && (
                      <img src={scheduledMatches[0].homeTeam.flagUrl} alt="" className="ai-flag" />
                    )}
                    <div className="ai-score-preview">2 — 1</div>
                    {scheduledMatches[0].awayTeam.flagUrl && (
                      <img src={scheduledMatches[0].awayTeam.flagUrl} alt="" className="ai-flag" />
                    )}
                  </div>
                </div>
                <div className="ai-bars">
                  <div className="ai-bar-item">
                    <div className="ai-bar-label">
                      <span>{scheduledMatches[0].homeTeam.name}</span>
                      <span>83%</span>
                    </div>
                    <div className="ai-bar-track">
                      <div className="ai-bar-fill ai-bar-home" style={{ width: '83%' }} />
                    </div>
                  </div>
                  <div className="ai-bar-item">
                    <div className="ai-bar-label">
                      <span>Nul</span>
                      <span>21%</span>
                    </div>
                    <div className="ai-bar-track">
                      <div className="ai-bar-fill ai-bar-draw" style={{ width: '21%' }} />
                    </div>
                  </div>
                  <div className="ai-bar-item">
                    <div className="ai-bar-label">
                      <span>{scheduledMatches[0].awayTeam.name}</span>
                      <span>22%</span>
                    </div>
                    <div className="ai-bar-track">
                      <div className="ai-bar-fill ai-bar-away" style={{ width: '22%' }} />
                    </div>
                  </div>
                </div>
                <div className="ai-factors">
                  <span className="ai-factors-title">Facteurs clés</span>
                  <ul className="ai-factors-list">
                    <li>Forme récente supérieure (4/5 sur 5 matchs)</li>
                    <li>Avantage du terrain et soutien massif des supporters</li>
                    <li>Statistiques offensives : 2.6 buts/match en moyenne</li>
                  </ul>
                </div>
              </div>
            ) : (
              <p className="sidebar-empty">Aucun match à prédire</p>
            )}
          </div>

          {/* Mes favoris */}
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <h3>Mes favoris</h3>
              <a className="sidebar-link" href="/favorites">Gérer →</a>
            </div>
            {favoriteTeams.length > 0 ? (
              favoriteTeams.map((team, i) => (
                <div key={team.id} className="favorite-item">
                  {team.flagUrl && <img src={team.flagUrl} alt={team.name} className="favorite-flag" />}
                  <div className="favorite-info">
                    <span className="favorite-name">{team.name}</span>
                    <span className="favorite-group">Groupe {i + 1}</span>
                  </div>
                  <span className="favorite-score">{favoritePercents[i] ?? 80}%</span>
                </div>
              ))
            ) : (
              <p className="sidebar-empty">
                Ajoutez des équipes en favoris en cliquant sur ❤️
              </p>
            )}
          </div>

          {/* Top buteurs */}
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <h3>Top buteurs</h3>
            </div>
            {topScorers.map((scorer, i) => (
              <div key={scorer.name} className="scorer-item">
                <span className="scorer-rank">{i + 1}</span>
                {scorer.flagUrl && <img src={scorer.flagUrl} alt={scorer.team} className="scorer-flag" />}
                <div className="scorer-info">
                  <span className="scorer-name">{scorer.name}</span>
                  <span className="scorer-team">{scorer.team}</span>
                </div>
                <span className="scorer-goals">{scorer.goals}</span>
              </div>
            ))}
          </div>

          {/* Statistiques */}
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
              <div key={stat.label} className="stat-row">
                <span className="stat-row-label">{stat.label}</span>
                <strong className="stat-row-value">{stat.value}</strong>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  )
}