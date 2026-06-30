import { useEffect, useMemo, useState } from 'react'
import { Heart, Search } from 'lucide-react'
import { getTeams } from '../../services/teamService'
import type { TeamDto } from '../../services/teamService'
import { getMatches } from '../../services/matchService'
import type { FootballMatchDto } from '../../services/matchService'
import { Spinner } from '../../components/ui/Spinner'
import { ErrorState } from '../../components/ui/ErrorState'
import { useFavoritesStore } from '../../stores/favoritesStore'
import '../../styles/teams.css'

type FormResult = 'W' | 'D' | 'L'

export function TeamsPage() {
  const [teams, setTeams] = useState<TeamDto[]>([])
  const [matches, setMatches] = useState<FootballMatchDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [groupFilter, setGroupFilter] = useState('ALL')
  const { isFavorite, toggleFavorite } = useFavoritesStore()

  useEffect(() => {
    async function fetchData() {
      try {
        const [teamsData, matchesData] = await Promise.all([getTeams(), getMatches()])
        setTeams(teamsData)
        setMatches(matchesData)
      } catch {
        setError('Impossible de charger les équipes.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const groupCodes = useMemo(() => {
    const codes = new Set(teams.map((t) => t.groupCode).filter(Boolean))
    return Array.from(codes).sort()
  }, [teams])

  function getTeamForm(teamId: number): FormResult[] {
    const teamMatches = matches
      .filter((m) => m.status === 'FINISHED' && (m.homeTeam.id === teamId || m.awayTeam.id === teamId))
      .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime())
      .slice(0, 5)

    return teamMatches.map((m) => {
      const isHome = m.homeTeam.id === teamId
      const teamScore = isHome ? m.homeScore : m.awayScore
      const opponentScore = isHome ? m.awayScore : m.homeScore
      if ((teamScore ?? 0) > (opponentScore ?? 0)) return 'W'
      if ((teamScore ?? 0) < (opponentScore ?? 0)) return 'L'
      return 'D'
    }).reverse()
  }

  function getQualifPercent(form: FormResult[]): number {
    if (form.length === 0) return 50
    const wins = form.filter((r) => r === 'W').length
    const draws = form.filter((r) => r === 'D').length
    const base = (wins * 3 + draws) / (form.length * 3)
    return Math.round(40 + base * 55)
  }

  const filteredTeams = useMemo(() => {
    let result = teams
    if (groupFilter !== 'ALL') {
      result = result.filter((t) => t.groupCode === groupFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((t) => t.name.toLowerCase().includes(q))
    }
    return result
  }, [teams, search, groupFilter])

  if (loading) return <Spinner />
  if (error) return <ErrorState title="Erreur" message={error} />

  return (
    <div className="teams-page">
      <h1 className="teams-title">Équipes</h1>
      <p className="teams-subtitle">{teams.length} équipes qualifiées · {filteredTeams.length} affichées</p>

      <div className="teams-search">
        <Search size={18} />
        <input
          type="search"
          placeholder="Rechercher une équipe..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="teams-filters">
        <button className={`filter-pill ${groupFilter === 'ALL' ? 'active' : ''}`} onClick={() => setGroupFilter('ALL')}>
          Tous
        </button>
        {groupCodes.map((code) => (
          <button key={code} className={`filter-pill ${groupFilter === code ? 'active' : ''}`} onClick={() => setGroupFilter(code)}>
            Groupe {code}
          </button>
        ))}
      </div>

      <div className="teams-grid">
        {filteredTeams.map((team) => {
          const form = getTeamForm(team.id)
          const qualifPercent = getQualifPercent(form)
          return (
            <div key={team.id} className={`team-card ${isFavorite('TEAM', team.id) ? 'is-favorite' : ''}`}>
              <div className="team-card-top">
                {team.flagUrl && <img src={team.flagUrl} alt={team.name} className="team-card-flag" />}
                <div className="team-card-info">
                  <span className="team-card-name">{team.name}</span>
                  <span className="team-card-meta">
                    {team.groupCode && `Groupe ${team.groupCode}`} · {team.fifaCode}
                  </span>
                </div>
                <button
                  className="team-card-favorite"
                  onClick={() => toggleFavorite('TEAM', team.id)}
                  style={{ color: isFavorite('TEAM', team.id) ? 'var(--lk-accent)' : undefined }}
                >
                  <Heart size={18} fill={isFavorite('TEAM', team.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
              <div className="team-card-bottom">
                <div className="team-card-form">
                  <span className="form-label">Forme récente</span>
                  <div className="form-dots">
                    {form.length > 0 ? form.map((r, i) => (
                      <span key={i} className={`form-dot form-${r.toLowerCase()}`}>{r}</span>
                    )) : <span className="form-empty">—</span>}
                  </div>
                </div>
                <div className="team-card-qualif">
                  <span className="qualif-label">QUALIF.</span>
                  <span className="qualif-value">{qualifPercent}%</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredTeams.length === 0 && (
        <div className="no-live" style={{ marginTop: '1rem' }}>
          <span>🔍</span>
          <p>Aucune équipe ne correspond à votre recherche</p>
        </div>
      )}
    </div>
  )
}