import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Globe2, MapPin, Search } from 'lucide-react'
import { FavoriteButton } from '../../components/football/FavoriteButton'
import { Button } from '../../components/ui/Button'
import { ErrorState } from '../../components/ui/ErrorState'
import { Spinner } from '../../components/ui/Spinner'
import { demoFootballMatches, demoStadiums } from '../../fixtures/liveKickDemoData'
import { getFootballMatches } from '../../services/matchService'
import { getStadiums } from '../../services/stadiumService'
import type { FootballMatch, Stadium } from '../../types/football'
import { getCityDisplayName, getStadiumDisplayName } from '../../utils/displayNames'
import { formatDateKey, formatMatchDate, getMatchDateKey, getMatchTimestamp } from '../../utils/formatters'

function sortByKickoffDate(first: FootballMatch, second: FootballMatch) {
  return getMatchTimestamp(first.matchDate, first.stadiumId) - getMatchTimestamp(second.matchDate, second.stadiumId)
}

function sortByStadiumName(first: Stadium, second: Stadium) {
  return getStadiumDisplayName(first).localeCompare(getStadiumDisplayName(second), 'fr')
}

function formatCapacity(capacity: number | null) {
  return capacity === null ? 'Capacité inconnue' : `${new Intl.NumberFormat('fr-FR').format(capacity)} places`
}

function buildCalendarUrl(stadiumId: number, dateFilter: string) {
  const params = new URLSearchParams({ stadium: String(stadiumId) })

  if (dateFilter !== 'ALL') {
    params.set('date', dateFilter)
  }

  return `/calendar?${params.toString()}`
}

export function StadiumsPage() {
  const [stadiums, setStadiums] = useState<Stadium[]>([])
  const [footballMatches, setFootballMatches] = useState<FootballMatch[]>([])
  const [dateFilter, setDateFilter] = useState('ALL')
  const [countryFilter, setCountryFilter] = useState('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadStadiumsPage() {
      try {
        const [stadiumsResponse, matchesResponse] = await Promise.all([
          getStadiums(),
          getFootballMatches(),
        ])

        if (!isMounted) {
          return
        }

        setStadiums(stadiumsResponse)
        setFootballMatches(matchesResponse)
        setError(null)
      } catch {
        if (!isMounted) {
          return
        }

        setStadiums(demoStadiums)
        setFootballMatches(demoFootballMatches)
        setError("L'API du serveur est indisponible, affichage des données de démonstration.")
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadStadiumsPage()

    return () => {
      isMounted = false
    }
  }, [])

  const matchesByStadiumId = useMemo(() => {
    const matchesMap = new Map<number, FootballMatch[]>()

    footballMatches.forEach((footballMatch) => {
      if (footballMatch.stadiumId === null) {
        return
      }

      const stadiumMatches = matchesMap.get(footballMatch.stadiumId) ?? []
      stadiumMatches.push(footballMatch)
      matchesMap.set(footballMatch.stadiumId, stadiumMatches)
    })

    matchesMap.forEach((stadiumMatches) => {
      stadiumMatches.sort(sortByKickoffDate)
    })

    return matchesMap
  }, [footballMatches])

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

  const countryOptions = useMemo(
    () => Array.from(new Set(stadiums.map((stadium) => stadium.country))).sort((first, second) => first.localeCompare(second, 'fr')),
    [stadiums],
  )

  const filteredStadiums = useMemo(
    () =>
      [...stadiums]
        .filter((stadium) => countryFilter === 'ALL' || stadium.country === countryFilter)
        .filter((stadium) => {
          if (dateFilter === 'ALL') {
            return true
          }

          return (matchesByStadiumId.get(stadium.id) ?? []).some(
            (footballMatch) => getMatchDateKey(footballMatch.matchDate, footballMatch.stadiumId) === dateFilter,
          )
        })
        .sort(sortByStadiumName),
    [countryFilter, dateFilter, matchesByStadiumId, stadiums],
  )

  if (isLoading) {
    return (
      <section className="page-section">
        <Spinner label="Chargement des stades..." />
      </section>
    )
  }

  return (
    <section className="page-section">
      {error ? <p className="data-warning">{error}</p> : null}

      <div className="page-heading page-heading--with-action">
        <div>
          <span>
            <MapPin size={16} aria-hidden="true" />
            Stades
          </span>
          <h1>Stades Coupe du Monde 2026</h1>
          <p>Accédez rapidement aux lieux de match et filtrez les enceintes selon les dates du calendrier.</p>
        </div>
        <Button as={Link} to="/calendar" variant="secondary">
          Voir le calendrier
        </Button>
      </div>

      <section className="filter-panel" aria-label="Filtrer les stades">
        <label className="filter-field">
          <span>Date</span>
          <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}>
            <option value="ALL">Toutes les dates</option>
            {dateOptions.map((date) => (
              <option value={date} key={date}>
                {formatDateKey(date)}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>Pays</span>
          <select value={countryFilter} onChange={(event) => setCountryFilter(event.target.value)}>
            <option value="ALL">Tous les pays</option>
            {countryOptions.map((country) => (
              <option value={country} key={country}>
                {country}
              </option>
            ))}
          </select>
        </label>

        <div className="filter-panel__summary">
          <Search size={18} aria-hidden="true" />
          <strong>{filteredStadiums.length}</strong>
          <span>stades visibles</span>
        </div>
      </section>

      {filteredStadiums.length === 0 ? (
        <ErrorState title="Aucun stade" message="Aucun stade ne correspond à ces filtres." />
      ) : null}

      <div className="stadium-grid">
        {filteredStadiums.map((stadium) => (
          <StadiumCard
            dateFilter={dateFilter}
            key={stadium.id}
            matches={matchesByStadiumId.get(stadium.id) ?? []}
            stadium={stadium}
          />
        ))}
      </div>
    </section>
  )
}

function StadiumCard({
  dateFilter,
  matches,
  stadium,
}: {
  dateFilter: string
  matches: FootballMatch[]
  stadium: Stadium
}) {
  const visibleMatches =
    dateFilter === 'ALL'
      ? matches.slice(0, 3)
      : matches.filter((footballMatch) => getMatchDateKey(footballMatch.matchDate, footballMatch.stadiumId) === dateFilter)

  return (
    <article className="stadium-card">
      <div className="stadium-card__header">
        <span className="stadium-card__icon" aria-hidden="true">
          <MapPin size={22} />
        </span>
        <FavoriteButton type="STADIUM" targetId={stadium.id} label={`Ajouter ${getStadiumDisplayName(stadium)} aux favoris`} />
      </div>

      <div className="stadium-card__body">
        <span className="eyebrow">{getCityDisplayName(stadium.city)}</span>
        <h2>{getStadiumDisplayName(stadium)}</h2>
        <p>{stadium.country} · {formatCapacity(stadium.capacity)}</p>
      </div>

      <div className="stadium-card__metrics">
        <span>
          <CalendarDays size={16} aria-hidden="true" />
          {matches.length} matchs
        </span>
        <span>
          <Globe2 size={16} aria-hidden="true" />
          {stadium.region ?? 'Région à confirmer'}
        </span>
      </div>

      <div className="stadium-card__dates">
        {visibleMatches.length > 0 ? (
          visibleMatches.map((footballMatch) => (
            <Link to={`/matches/${footballMatch.id}`} key={footballMatch.id}>
              {formatMatchDate(footballMatch.matchDate, footballMatch.stadiumId)}
            </Link>
          ))
        ) : (
          <span>Aucune date renseignée</span>
        )}
      </div>

      <div className="stadium-card__actions">
        <Button as={Link} to={`/stadiums/${stadium.id}`} variant="secondary">
          Fiche stade
        </Button>
        <Button as={Link} to={buildCalendarUrl(stadium.id, dateFilter)}>
          Matchs au stade
        </Button>
      </div>
    </article>
  )
}
