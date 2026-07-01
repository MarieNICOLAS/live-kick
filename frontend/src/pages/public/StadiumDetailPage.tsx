import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CalendarDays, MapPin, Trophy } from 'lucide-react'
import { FavoriteButton } from '../../components/football/FavoriteButton'
import { MatchCard } from '../../components/football/MatchCard'
import { Button } from '../../components/ui/Button'
import { ErrorState } from '../../components/ui/ErrorState'
import { Spinner } from '../../components/ui/Spinner'
import { demoFootballMatches } from '../../fixtures/liveKickDemoData'
import { getFootballMatches } from '../../services/matchService'
import { getStadiumById } from '../../services/stadiumService'
import type { FootballMatch, Stadium } from '../../types/football'
import { getCityDisplayName, getStadiumDisplayName } from '../../utils/displayNames'
import { getMatchTimestamp } from '../../utils/formatters'

function sortByKickoffDate(first: FootballMatch, second: FootballMatch) {
  return getMatchTimestamp(first.matchDate, first.stadiumId) - getMatchTimestamp(second.matchDate, second.stadiumId)
}

function formatCapacity(capacity: number | null) {
  return capacity === null ? '-' : new Intl.NumberFormat('fr-FR').format(capacity)
}

export function StadiumDetailPage() {
  const { id } = useParams()
  const [stadium, setStadium] = useState<Stadium | null>(null)
  const [footballMatches, setFootballMatches] = useState<FootballMatch[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadStadiumDetail() {
      if (!id) {
        setIsLoading(false)
        return
      }

      try {
        const [stadiumResponse, matchesResponse] = await Promise.all([
          getStadiumById(id),
          getFootballMatches(),
        ])

        if (!isMounted) {
          return
        }

        setStadium(stadiumResponse)
        setFootballMatches(matchesResponse)
      } catch {
        if (!isMounted) {
          return
        }

        setStadium(null)
        setFootballMatches(demoFootballMatches)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadStadiumDetail()

    return () => {
      isMounted = false
    }
  }, [id])

  const stadiumMatches = useMemo(
    () => (stadium ? footballMatches.filter((footballMatch) => footballMatch.stadiumId === stadium.id).sort(sortByKickoffDate) : []),
    [footballMatches, stadium],
  )

  if (isLoading) {
    return (
      <section className="page-section">
        <Spinner label="Chargement du stade..." />
      </section>
    )
  }

  if (!stadium) {
    return (
      <ErrorState
        title="Stade introuvable"
        message="Cette fiche stade n'est pas disponible."
        action={
          <Button as={Link} to="/calendar">
            Retour au calendrier
          </Button>
        }
      />
    )
  }

  const stadiumLabel = `${getStadiumDisplayName(stadium)}, ${getCityDisplayName(stadium.city)}`

  return (
    <section className="detail-page">
      <div className="entity-hero">
        <div className="entity-hero__identity">
          <span className="entity-icon">
            <MapPin size={26} aria-hidden="true" />
          </span>
          <div>
            <span className="eyebrow">Stade</span>
            <h1>{getStadiumDisplayName(stadium)}</h1>
            <p>
              {getCityDisplayName(stadium.city)} · {stadium.country}
            </p>
          </div>
        </div>
        <FavoriteButton type="STADIUM" targetId={stadium.id} label={`Ajouter ${getStadiumDisplayName(stadium)} aux favoris`} />
      </div>

      <div className="dashboard-grid">
        <section className="info-panel dashboard-column--wide">
          <h2>
            <Trophy size={20} aria-hidden="true" />
            Informations
          </h2>
          <dl className="metric-grid">
            <div>
              <dt>Ville</dt>
              <dd>{getCityDisplayName(stadium.city)}</dd>
            </div>
            <div>
              <dt>Pays</dt>
              <dd>{stadium.country}</dd>
            </div>
            <div>
              <dt>Capacité</dt>
              <dd>{formatCapacity(stadium.capacity)}</dd>
            </div>
            <div>
              <dt>Nom FIFA</dt>
              <dd>{stadium.fifaName ?? '-'}</dd>
            </div>
            <div>
              <dt>Région</dt>
              <dd>{stadium.region ?? '-'}</dd>
            </div>
            <div>
              <dt>Matchs</dt>
              <dd>{stadiumMatches.length}</dd>
            </div>
          </dl>
        </section>

        <section className="info-panel">
          <h2>
            <CalendarDays size={20} aria-hidden="true" />
            Programme
          </h2>
          <p className="panel-copy">
            Retrouvez les rencontres programmées dans ce stade avec les horaires convertis en heure de Paris.
          </p>
          <Button as={Link} to="/calendar" variant="secondary">
            Voir le calendrier
          </Button>
        </section>
      </div>

      <section className="page-section">
        <div className="section-title">
          <div>
            <span className="eyebrow">Matchs</span>
            <h2>Rencontres au stade</h2>
          </div>
          <Link to="/calendar">Tout voir</Link>
        </div>

        {stadiumMatches.length > 0 ? (
          <div className="match-list match-list--grid">
            {stadiumMatches.map((footballMatch) => (
              <MatchCard footballMatch={footballMatch} key={footballMatch.id} venueLabel={stadiumLabel} />
            ))}
          </div>
        ) : (
          <ErrorState title="Aucun match" message="Aucune rencontre n'est associée à ce stade pour le moment." />
        )}
      </section>
    </section>
  )
}
