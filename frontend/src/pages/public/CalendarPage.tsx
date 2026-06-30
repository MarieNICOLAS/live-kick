import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MatchCard } from '../../components/football/MatchCard'
import { ErrorState } from '../../components/ui/ErrorState'
import { Spinner } from '../../components/ui/Spinner'
import { demoFootballMatches } from '../../fixtures/liveKickDemoData'
import { getFootballMatches } from '../../services/matchService'
import { getStadiums } from '../../services/stadiumService'
import type { FootballMatch, MatchStatus } from '../../types/football'
import { getMatchTimestamp } from '../../utils/formatters'
import { buildStadiumLabelMap, getStadiumLabel, type StadiumLabelMap } from '../../utils/stadiumLabels'

type CalendarFilter = MatchStatus | 'ALL' | 'DATES_ONLY'

const statusFilters: Array<{ label: string; value: CalendarFilter }> = [
  { label: 'Tous', value: 'ALL' },
  { label: 'À venir', value: 'SCHEDULED' },
  { label: 'Direct', value: 'LIVE' },
  { label: 'Terminés', value: 'FINISHED' },
  { label: 'Dates futures', value: 'DATES_ONLY' },
]

function getInitialStatusFilter(value: string | null): CalendarFilter {
  if (value === 'LIVE' || value === 'HALF_TIME' || value === 'SCHEDULED' || value === 'POSTPONED' || value === 'FINISHED') {
    return value
  }

  return 'ALL'
}

function sortByMatchDate(first: FootballMatch, second: FootballMatch) {
  return getMatchTimestamp(second.matchDate, second.stadiumId) - getMatchTimestamp(first.matchDate, first.stadiumId)
}

function sortByUpcomingMatchDate(first: FootballMatch, second: FootballMatch) {
  return getMatchTimestamp(first.matchDate, first.stadiumId) - getMatchTimestamp(second.matchDate, second.stadiumId)
}

const statusPriority: Record<MatchStatus, number> = {
  LIVE: 0,
  HALF_TIME: 0,
  SCHEDULED: 1,
  POSTPONED: 1,
  FINISHED: 2,
}

function sortByCalendarPriority(first: FootballMatch, second: FootballMatch) {
  const statusOrder = statusPriority[first.status] - statusPriority[second.status]
  if (statusOrder !== 0) {
    return statusOrder
  }

  if (isUpcomingMatch(first) && isUpcomingMatch(second)) {
    return sortByUpcomingMatchDate(first, second)
  }

  return sortByMatchDate(first, second)
}

function isUpcomingMatch(footballMatch: FootballMatch) {
  return footballMatch.status === 'SCHEDULED' || footballMatch.status === 'POSTPONED'
}

function isKnownTeam(team: FootballMatch['homeTeam']) {
  return team.id !== null && team.fifaCode !== null
}

function hasUnknownTeams(footballMatch: FootballMatch) {
  return !isKnownTeam(footballMatch.homeTeam) || !isKnownTeam(footballMatch.awayTeam)
}

function isUnknownUpcomingMatch(footballMatch: FootballMatch) {
  return isUpcomingMatch(footballMatch) && hasUnknownTeams(footballMatch)
}

function shouldShowMatchForFilter(footballMatch: FootballMatch, statusFilter: CalendarFilter) {
  if (statusFilter === 'DATES_ONLY') {
    return isUnknownUpcomingMatch(footballMatch)
  }

  if (isUnknownUpcomingMatch(footballMatch)) {
    return false
  }

  return statusFilter === 'ALL' || footballMatch.status === statusFilter
}

export function CalendarPage() {
  const [searchParams] = useSearchParams()
  const phaseFilter = searchParams.get('phase')
  const groupFilter = searchParams.get('group')
  const [footballMatches, setFootballMatches] = useState<FootballMatch[]>([])
  const [stadiumLabels, setStadiumLabels] = useState<StadiumLabelMap>({})
  const [statusFilter, setStatusFilter] = useState<CalendarFilter>(() => getInitialStatusFilter(searchParams.get('status')))
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadMatches() {
      try {
        const [matchesResponse, stadiumsResponse] = await Promise.all([
          getFootballMatches(),
          getStadiums(),
        ])

        if (!isMounted) {
          return
        }

        setFootballMatches(matchesResponse)
        setStadiumLabels(buildStadiumLabelMap(stadiumsResponse))
        setError(null)
      } catch {
        if (!isMounted) {
          return
        }

        setFootballMatches(demoFootballMatches)
        setStadiumLabels({})
        setError("L'API du serveur est indisponible, affichage des données de démonstration.")
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadMatches()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredMatches = useMemo(
    () =>
      [...footballMatches]
        .filter((footballMatch) => shouldShowMatchForFilter(footballMatch, statusFilter))
        .filter((footballMatch) => !groupFilter || footballMatch.groupCode === groupFilter.toUpperCase())
        .filter((footballMatch) => !phaseFilter || footballMatch.phase === phaseFilter || footballMatch.phaseType === phaseFilter)
        .sort(sortByCalendarPriority),
    [footballMatches, groupFilter, phaseFilter, statusFilter],
  )

  if (isLoading) {
    return (
      <section className="page-section">
        <Spinner label="Chargement du calendrier..." />
      </section>
    )
  }

  return (
    <section className="page-section">
      {error ? <p className="data-warning">{error}</p> : null}

      <div className="page-heading">
        <span>Calendrier</span>
        <h1>Matchs Coupe du Monde 2026</h1>
        <p>Liste des rencontres avec statut, score et accès rapide au détail du match.</p>
      </div>

      <div className="segmented-control" aria-label="Filtrer les matchs par statut">
        {statusFilters.map((filter) => (
          <button
            className={statusFilter === filter.value ? 'segmented-control__item active' : 'segmented-control__item'}
            key={filter.value}
            type="button"
            onClick={() => setStatusFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {phaseFilter ? <p className="data-warning">Filtre actif : {phaseFilter}</p> : null}
      {groupFilter ? <p className="data-warning">Groupe actif : {groupFilter.toUpperCase()}</p> : null}

      {filteredMatches.length === 0 ? (
        <ErrorState title="Aucun match" message="Aucune rencontre ne correspond a ce filtre." />
      ) : null}

      <div className="match-list match-list--grid">
        {filteredMatches.map((footballMatch) => (
          <MatchCard
            key={footballMatch.id}
            footballMatch={footballMatch}
            venueLabel={getStadiumLabel(stadiumLabels, footballMatch.stadiumId)}
          />
        ))}
      </div>
    </section>
  )
}
