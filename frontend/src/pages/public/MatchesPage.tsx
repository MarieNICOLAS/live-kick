import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Heart, Search } from 'lucide-react'
import { getMatches } from '../../services/matchService'
import type { FootballMatchDto } from '../../services/matchService'
import { getGroups } from '../../services/groupService'
import type { CompetitionGroupDto } from '../../services/groupService'
import { Spinner } from '../../components/ui/Spinner'
import { ErrorState } from '../../components/ui/ErrorState'
import { Badge } from '../../components/ui/Badge'
import { useFavoritesStore } from '../../stores/favoritesStore'
import '../../styles/matches.css'

type StatusFilter = 'ALL' | 'LIVE' | 'SCHEDULED' | 'FINISHED'

export function MatchesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [matches, setMatches] = useState<FootballMatchDto[]>([])
  const [groups, setGroups] = useState<CompetitionGroupDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [groupFilter, setGroupFilter] = useState<string>('ALL')
  const { isFavorite, toggleFavorite } = useFavoritesStore()

  useEffect(() => {
    setSearch(searchParams.get('q') ?? '')
  }, [searchParams])

  useEffect(() => {
    async function fetchData() {
      try {
        const [matchesData, groupsData] = await Promise.all([getMatches(), getGroups()])
        setMatches(matchesData)
        setGroups(groupsData)
      } catch {
        setError('Impossible de charger les matchs.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const phaseLabels: Record<string, string> = {
    GROUP_STAGE: 'Groupes',
    ROUND_OF_32: 'Huitièmes',
    ROUND_OF_16: 'Seizièmes',
    QUARTER_FINAL: 'Quarts',
    SEMI_FINAL: 'Demis',
    FINAL: 'Finale',
  }

  const counts = useMemo(() => ({
    all: matches.length,
    live: matches.filter((m) => m.status === 'LIVE').length,
    scheduled: matches.filter((m) => m.status === 'SCHEDULED').length,
    finished: matches.filter((m) => m.status === 'FINISHED').length,
  }), [matches])

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (statusFilter !== 'ALL' && m.status !== statusFilter) return false
      if (groupFilter !== 'ALL' && m.groupCode !== groupFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        if (!m.homeTeam.name.toLowerCase().includes(q) && !m.awayTeam.name.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [matches, statusFilter, groupFilter, search])

  const matchesByDate = useMemo(() => {
    const grouped: Record<string, FootballMatchDto[]> = {}
    filteredMatches.forEach((m) => {
      const dateKey = new Date(m.matchDate).toLocaleDateString('fr-FR', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
      })
      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey].push(m)
    })
    return grouped
  }, [filteredMatches])

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return <Spinner />
  if (error) return <ErrorState title="Erreur" message={error} />

  const groupCodes = groups.map((g) => g.code).filter((c) => c.length === 1).sort()

  return (
    <div className="matches-page">
      <h1 className="matches-title">Calendrier des matchs</h1>
      <p className="matches-subtitle">{filteredMatches.length} matchs affichés</p>

      <div className="matches-search">
        <Search size={18} />
        <input
          type="search"
          placeholder="Rechercher une équipe..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="matches-filters">
        <button className={`filter-pill ${statusFilter === 'ALL' ? 'active' : ''}`} onClick={() => setStatusFilter('ALL')}>
          Tous {counts.all}
        </button>
        <button className={`filter-pill ${statusFilter === 'LIVE' ? 'active' : ''}`} onClick={() => setStatusFilter('LIVE')}>
          En direct {counts.live}
        </button>
        <button className={`filter-pill ${statusFilter === 'SCHEDULED' ? 'active' : ''}`} onClick={() => setStatusFilter('SCHEDULED')}>
          À venir {counts.scheduled}
        </button>
        <button className={`filter-pill ${statusFilter === 'FINISHED' ? 'active' : ''}`} onClick={() => setStatusFilter('FINISHED')}>
          Terminés {counts.finished}
        </button>
      </div>

      <div className="matches-filters">
        <button className={`group-pill ${groupFilter === 'ALL' ? 'active' : ''}`} onClick={() => setGroupFilter('ALL')}>
          Tous les groupes
        </button>
        {groupCodes.map((code) => (
          <button key={code} className={`group-pill ${groupFilter === code ? 'active' : ''}`} onClick={() => setGroupFilter(code)}>
            Groupe {code}
          </button>
        ))}
      </div>

      {Object.entries(matchesByDate).map(([date, dateMatches]) => (
        <div key={date} className="matches-date-group">
          <h2 className="matches-date-title">{date}</h2>
          <div className="matches-day-grid">
            {dateMatches.map((match) => (
              <div
                key={match.id}
                className={`day-match-card ${match.status === 'LIVE' ? 'live' : ''}`}
                onClick={() => navigate(`/matches/${match.id}`)}
              >
                <div className="day-match-header">
                  <span className="day-match-meta">
                    {phaseLabels[match.phase] ?? match.phase} · {formatTime(match.matchDate)}
                  </span>
                  {match.status === 'LIVE' && <Badge variant="live">● LIVE {match.currentMinute}'</Badge>}
                  {match.status === 'SCHEDULED' && <Badge variant="warning">À venir</Badge>}
                  {match.status === 'FINISHED' && <Badge variant="success">FT</Badge>}
                </div>
                <div className="day-match-teams">
                  <div className="day-match-team">
                    {match.homeTeam.flagUrl && <img src={match.homeTeam.flagUrl} alt={match.homeTeam.name} />}
                    <span>{match.homeTeam.name}</span>
                  </div>
                  <div className="day-match-result">
                    {match.status === 'SCHEDULED'
                      ? formatTime(match.matchDate)
                      : `${match.homeScore} — ${match.awayScore}`}
                  </div>
                  <div className="day-match-team day-match-team--right">
                    <span>{match.awayTeam.name}</span>
                    {match.awayTeam.flagUrl && <img src={match.awayTeam.flagUrl} alt={match.awayTeam.name} />}
                  </div>
                </div>
                <div className="day-match-footer">
                  <span className="day-match-stadium">📍 Stade {match.stadiumId}</span>
                  <button
                    className="day-match-favorite"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite('MATCH', match.id)
                    }}
                    style={{ color: isFavorite('MATCH', match.id) ? 'var(--lk-accent)' : undefined }}
                  >
                    <Heart size={16} fill={isFavorite('MATCH', match.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {filteredMatches.length === 0 && (
        <div className="no-live" style={{ marginTop: '1rem' }}>
          <span>🔍</span>
          <p>Aucun match ne correspond à votre recherche</p>
        </div>
      )}
    </div>
  )
}