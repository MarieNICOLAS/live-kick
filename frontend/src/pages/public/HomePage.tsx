import { useEffect, useMemo, useState } from 'react'
import { Activity, CalendarDays, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { GroupStandingTable } from '../../components/football/GroupStandingTable'
import { MatchCard } from '../../components/football/MatchCard'
import { PredictionPanel } from '../../components/football/PredictionPanel'
import { PredictionSummary } from '../../components/football/PredictionSummary'
import { Scoreboard } from '../../components/football/Scoreboard'
import { StatusBadge } from '../../components/football/StatusBadge'
import { Button } from '../../components/ui/Button'
import { ErrorState } from '../../components/ui/ErrorState'
import { Spinner } from '../../components/ui/Spinner'
import { demoCompetitionGroups, demoFootballMatches, demoPrediction } from '../../fixtures/liveKickDemoData'
import { getCompetitionGroups } from '../../services/groupService'
import { getFootballMatches } from '../../services/matchService'
import { getMatchPrediction } from '../../services/predictionService'
import { getStadiums } from '../../services/stadiumService'
import type { CompetitionGroup, FootballMatch, Prediction } from '../../types/football'
import { formatMatchday } from '../../utils/formatters'
import { buildStadiumLabelMap, getStadiumLabel, type StadiumLabelMap } from '../../utils/stadiumLabels'

function sortByMatchDate(first: FootballMatch, second: FootballMatch) {
  return new Date(first.matchDate).getTime() - new Date(second.matchDate).getTime()
}

function pickFeaturedMatch(footballMatches: FootballMatch[]) {
  const now = Date.now()
  const liveMatch = footballMatches.find((footballMatch) => footballMatch.status === 'LIVE')
  const nextMatch = footballMatches
    .filter((footballMatch) => new Date(footballMatch.matchDate).getTime() >= now)
    .sort(sortByMatchDate)[0]

  return liveMatch ?? nextMatch ?? footballMatches[0]
}

export function HomePage() {
  const [footballMatches, setFootballMatches] = useState<FootballMatch[]>([])
  const [competitionGroups, setCompetitionGroups] = useState<CompetitionGroup[]>([])
  const [stadiumLabels, setStadiumLabels] = useState<StadiumLabelMap>({})
  const [featuredPrediction, setFeaturedPrediction] = useState<Prediction>(demoPrediction)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadHomeData() {
      try {
        const [matchesResponse, groupsResponse, stadiumsResponse] = await Promise.all([
          getFootballMatches(),
          getCompetitionGroups(),
          getStadiums(),
        ])

        if (!isMounted) {
          return
        }

        setFootballMatches(matchesResponse)
        setCompetitionGroups(groupsResponse)
        setStadiumLabels(buildStadiumLabelMap(stadiumsResponse))
        setError(null)
      } catch {
        if (!isMounted) {
          return
        }

        setFootballMatches(demoFootballMatches)
        setCompetitionGroups(demoCompetitionGroups)
        setStadiumLabels({})
        setError("L'API du serveur est indisponible, affichage des données de démonstration.")
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadHomeData()

    return () => {
      isMounted = false
    }
  }, [])

  const featuredMatch = useMemo(() => pickFeaturedMatch(footballMatches), [footballMatches])

  useEffect(() => {
    let isMounted = true

    async function loadFeaturedPrediction() {
      if (!featuredMatch) {
        return
      }

      try {
        const predictionResponse = await getMatchPrediction(featuredMatch.id)
        if (isMounted) {
          setFeaturedPrediction(predictionResponse)
        }
      } catch {
        if (isMounted) {
          setFeaturedPrediction({ ...demoPrediction, matchId: featuredMatch.id })
        }
      }
    }

    loadFeaturedPrediction()

    return () => {
      isMounted = false
    }
  }, [featuredMatch])

  const visibleMatches = useMemo(
    () =>
      [...footballMatches]
        .sort(sortByMatchDate)
        .filter((footballMatch) => footballMatch.status === 'LIVE' || footballMatch.status === 'SCHEDULED')
        .slice(0, 6),
    [footballMatches],
  )
  const firstGroup = competitionGroups[0]

  if (isLoading) {
    return (
      <section className="page-section">
        <Spinner label="Chargement des données LiveKick..." />
      </section>
    )
  }

  if (!featuredMatch) {
    return (
      <ErrorState
        title="Aucun match disponible"
        message="Le serveur ne retourne pas encore de calendrier exploitable."
      />
    )
  }

  return (
    <section className="home-page">
      {error ? <p className="data-warning">{error}</p> : null}

      <div className="home-hero">
        <div className="home-hero__content">
          <span className="eyebrow">
            <Activity size={16} aria-hidden="true" />
            Coupe du Monde 2026
          </span>
          <h1>LiveKick</h1>
          <p>Scores instantanés, classements et prédiction IA dans une interface pensée pour le mobile.</p>
          <div className="home-hero__actions">
            <Button as={Link} to="/calendar">
              Voir le calendrier
            </Button>
            <Button as={Link} to={`/matches/${featuredMatch.id}`} variant="secondary">
              Détail du match
            </Button>
          </div>
        </div>

        <Link className="featured-match featured-match--link" to={`/matches/${featuredMatch.id}`} aria-label="Voir le détail du match principal">
          <div className="featured-match__top">
            <StatusBadge status={featuredMatch.status} minute={featuredMatch.currentMinute} />
            <span>Groupe {featuredMatch.groupCode ?? '-'}</span>
          </div>
          <Scoreboard footballMatch={featuredMatch} compact />
          <div className="featured-match__meta">
            <span>{formatMatchday(featuredMatch.matchday)}</span>
            <span>{getStadiumLabel(stadiumLabels, featuredMatch.stadiumId)}</span>
          </div>
          <PredictionSummary
            prediction={featuredPrediction}
            homeTeam={featuredMatch.homeTeam}
            awayTeam={featuredMatch.awayTeam}
          />
        </Link>
      </div>

      <section className="dashboard-grid" aria-label="Aperçu LiveKick">
        <div className="dashboard-column dashboard-column--wide">
          <div className="section-title">
            <div>
              <span className="eyebrow">
                <CalendarDays size={16} aria-hidden="true" />
                Scores d'abord
              </span>
              <h2>Matchs a suivre</h2>
            </div>
            <Link to="/calendar">Tout voir</Link>
          </div>

          <div className="match-list">
            {visibleMatches.map((footballMatch) => (
              <MatchCard
                key={footballMatch.id}
                footballMatch={footballMatch}
                venueLabel={getStadiumLabel(stadiumLabels, footballMatch.stadiumId)}
              />
            ))}
          </div>
        </div>

        <Link className="prediction-panel-link" to={`/matches/${featuredMatch.id}`} aria-label="Voir la prédiction détaillée du match">
          <PredictionPanel
            prediction={featuredPrediction}
            homeTeam={featuredMatch.homeTeam}
            awayTeam={featuredMatch.awayTeam}
          />
        </Link>

        <div className="dashboard-column dashboard-column--wide">
          <div className="section-title">
            <div>
              <span className="eyebrow">
                <Trophy size={16} aria-hidden="true" />
                Classement
              </span>
              <h2>Groupes</h2>
            </div>
            <Link to="/groups">Voir les groupes</Link>
          </div>
          {firstGroup ? <GroupStandingTable group={firstGroup} /> : null}
        </div>
      </section>
    </section>
  )
}
