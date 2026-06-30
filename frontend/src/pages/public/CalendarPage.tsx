import { useEffect, useMemo, useState } from 'react'
import { MatchCard } from '../../components/football/MatchCard'
import { ErrorState } from '../../components/ui/ErrorState'
import { Spinner } from '../../components/ui/Spinner'
import { demoFootballMatches } from '../../fixtures/liveKickDemoData'
import { getFootballMatches } from '../../services/matchService'
import { getStadiums } from '../../services/stadiumService'
import type { FootballMatch, MatchStatus } from '../../types/football'
import { buildStadiumLabelMap, getStadiumLabel, type StadiumLabelMap } from '../../utils/stadiumLabels'

const statusFilters: Array<{ label: string; value: MatchStatus | 'ALL' }> = [
  { label: 'Tous', value: 'ALL' },
  { label: 'A venir', value: 'SCHEDULED' },
  { label: 'Live', value: 'LIVE' },
  { label: 'Termines', value: 'FINISHED' },
]

function sortByMatchDate(first: FootballMatch, second: FootballMatch) {
  return new Date(first.matchDate).getTime() - new Date(second.matchDate).getTime()
}

export function CalendarPage() {
  const [footballMatches, setFootballMatches] = useState<FootballMatch[]>([])
  const [stadiumLabels, setStadiumLabels] = useState<StadiumLabelMap>({})
  const [statusFilter, setStatusFilter] = useState<MatchStatus | 'ALL'>('ALL')
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
        setError("L'API backend est indisponible, affichage des donnees de demonstration.")
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
        .filter((footballMatch) => statusFilter === 'ALL' || footballMatch.status === statusFilter)
        .sort(sortByMatchDate),
    [footballMatches, statusFilter],
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
        <p>Liste des rencontres avec statut, score et acces rapide au match center.</p>
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
