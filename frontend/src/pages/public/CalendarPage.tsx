import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MatchCard } from '../../components/football/MatchCard'
import { ErrorState } from '../../components/ui/ErrorState'
import { Spinner } from '../../components/ui/Spinner'
import { demoFootballMatches, demoStadiums } from '../../fixtures/liveKickDemoData'
import { useAutoRefresh } from '../../hooks/useAutoRefresh'
import { getFootballMatches } from '../../services/matchService'
import { getKnownMatchPredictions } from '../../services/predictionService'
import { getStadiums } from '../../services/stadiumService'
import type { FootballMatch, MatchStatus, Prediction, Stadium } from '../../types/football'
import { formatDateKey, getMatchDateKey, getMatchTimestamp } from '../../utils/formatters'
import { withEffectiveMatchState } from '../../utils/liveMatch'
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
  if (value === 'DATES_ONLY') {
    return value
  }

  if (value === 'LIVE' || value === 'HALF_TIME' || value === 'SCHEDULED' || value === 'POSTPONED' || value === 'FINISHED') {
    return value
  }

  return 'ALL'
}

function getInitialOptionFilter(value: string | null) {
  return value?.trim() || 'ALL'
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
  const [searchParams, setSearchParams] = useSearchParams()
  const phaseFilter = searchParams.get('phase')
  const groupFilter = searchParams.get('group')
  const [footballMatches, setFootballMatches] = useState<FootballMatch[]>([])
  const [predictionsByMatchId, setPredictionsByMatchId] = useState<Record<number, Prediction>>({})
  const [stadiums, setStadiums] = useState<Stadium[]>([])
  const [stadiumLabels, setStadiumLabels] = useState<StadiumLabelMap>({})
  const [statusFilter, setStatusFilter] = useState<CalendarFilter>(() => getInitialStatusFilter(searchParams.get('status')))
  const [stadiumFilter, setStadiumFilter] = useState(() => getInitialOptionFilter(searchParams.get('stadium')))
  const [dateFilter, setDateFilter] = useState(() => getInitialOptionFilter(searchParams.get('date')))
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setStatusFilter(getInitialStatusFilter(searchParams.get('status')))
    setStadiumFilter(getInitialOptionFilter(searchParams.get('stadium')))
    setDateFilter(getInitialOptionFilter(searchParams.get('date')))
  }, [searchParams])

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
        setStadiums(stadiumsResponse)
        setStadiumLabels(buildStadiumLabelMap(stadiumsResponse))
        setError(null)

        try {
          const predictionsResponse = await getKnownMatchPredictions()
          if (isMounted) {
            setPredictionsByMatchId(Object.fromEntries(predictionsResponse.map((prediction) => [prediction.matchId, prediction])))
          }
        } catch {
          if (isMounted) {
            setPredictionsByMatchId({})
          }
        }
      } catch {
        if (!isMounted) {
          return
        }

        setFootballMatches(demoFootballMatches)
        setPredictionsByMatchId({})
        setStadiums(demoStadiums)
        setStadiumLabels(buildStadiumLabelMap(demoStadiums))
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

  const refreshMatches = useCallback(async () => {
    try {
      const [matchesResponse, stadiumsResponse] = await Promise.all([
        getFootballMatches(),
        getStadiums(),
      ])

      setFootballMatches(matchesResponse)
      setStadiums(stadiumsResponse)
      setStadiumLabels(buildStadiumLabelMap(stadiumsResponse))
      setError(null)

      try {
        const predictionsResponse = await getKnownMatchPredictions()
        setPredictionsByMatchId(Object.fromEntries(predictionsResponse.map((prediction) => [prediction.matchId, prediction])))
      } catch {
        setPredictionsByMatchId({})
      }
    } catch {
      setError("Actualisation automatique indisponible. Les dernières données chargées restent affichées.")
    }
  }, [])

  useAutoRefresh(refreshMatches, { enabled: !isLoading, intervalMs: 30_000 })

  const updateQueryFilter = useCallback(
    (key: string, value: string) => {
      const nextParams = new URLSearchParams(searchParams)

      if (value === 'ALL') {
        nextParams.delete(key)
      } else {
        nextParams.set(key, value)
      }

      setSearchParams(nextParams, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const dateOptions = useMemo(
    () =>
      Array.from(
        new Set(
          footballMatches
            .map((footballMatch) => getMatchDateKey(footballMatch.matchDate, footballMatch.stadiumId))
            .filter(Boolean),
        ),
      ).sort(),
    [footballMatches],
  )

  const sortedStadiums = useMemo(
    () =>
      [...stadiums].sort((first, second) =>
        getStadiumLabel(stadiumLabels, first.id).localeCompare(getStadiumLabel(stadiumLabels, second.id), 'fr'),
      ),
    [stadiumLabels, stadiums],
  )

  const activeStadiumLabel = stadiumFilter === 'ALL' ? null : getStadiumLabel(stadiumLabels, Number(stadiumFilter))

  const filteredMatches = useMemo(
    () =>
      [...footballMatches]
        .map((footballMatch) => withEffectiveMatchState(footballMatch))
        .filter((footballMatch) => shouldShowMatchForFilter(footballMatch, statusFilter))
        .filter((footballMatch) => !groupFilter || footballMatch.groupCode === groupFilter.toUpperCase())
        .filter((footballMatch) => !phaseFilter || footballMatch.phase === phaseFilter || footballMatch.phaseType === phaseFilter)
        .filter((footballMatch) => stadiumFilter === 'ALL' || String(footballMatch.stadiumId) === stadiumFilter)
        .filter((footballMatch) => dateFilter === 'ALL' || getMatchDateKey(footballMatch.matchDate, footballMatch.stadiumId) === dateFilter)
        .sort(sortByCalendarPriority),
    [dateFilter, footballMatches, groupFilter, phaseFilter, stadiumFilter, statusFilter],
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
            onClick={() => updateQueryFilter('status', filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {phaseFilter ? <p className="data-warning">Filtre actif : {phaseFilter}</p> : null}
      {groupFilter ? <p className="data-warning">Groupe actif : {groupFilter.toUpperCase()}</p> : null}
      {activeStadiumLabel ? <p className="data-warning">Stade actif : {activeStadiumLabel}</p> : null}

      <section className="filter-panel" aria-label="Filtrer le calendrier">
        <label className="filter-field">
          <span>Stade</span>
          <select value={stadiumFilter} onChange={(event) => updateQueryFilter('stadium', event.target.value)}>
            <option value="ALL">Tous les stades</option>
            {sortedStadiums.map((stadium) => (
              <option value={stadium.id} key={stadium.id}>
                {getStadiumLabel(stadiumLabels, stadium.id)}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>Date</span>
          <select value={dateFilter} onChange={(event) => updateQueryFilter('date', event.target.value)}>
            <option value="ALL">Toutes les dates</option>
            {dateOptions.map((date) => (
              <option value={date} key={date}>
                {formatDateKey(date)}
              </option>
            ))}
          </select>
        </label>

        <div className="filter-panel__summary">
          <strong>{filteredMatches.length}</strong>
          <span>matchs visibles</span>
        </div>
      </section>

      {filteredMatches.length === 0 ? (
        <ErrorState title="Aucun match" message="Aucune rencontre ne correspond a ce filtre." />
      ) : null}

      <div className="match-list match-list--grid">
        {filteredMatches.map((footballMatch) => (
          <MatchCard
            key={footballMatch.id}
            footballMatch={footballMatch}
            prediction={predictionsByMatchId[footballMatch.id]}
            venueLabel={getStadiumLabel(stadiumLabels, footballMatch.stadiumId)}
          />
        ))}
      </div>
    </section>
  )
}
