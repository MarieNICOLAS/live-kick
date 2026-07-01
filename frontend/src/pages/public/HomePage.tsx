import { useCallback, useEffect, useMemo, useState } from 'react'
import { Activity, BarChart3, CalendarDays, TrendingUp, Trophy } from 'lucide-react'
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
import { useAutoRefresh } from '../../hooks/useAutoRefresh'
import { getCompetitionGroups } from '../../services/groupService'
import { getFootballMatches } from '../../services/matchService'
import { getKnownMatchPredictions, getMatchPrediction } from '../../services/predictionService'
import { getStadiums } from '../../services/stadiumService'
import type { CompetitionGroup, FootballMatch, Prediction } from '../../types/football'
import { formatMatchContext, formatMatchday, getMatchTimestamp } from '../../utils/formatters'
import { withEffectiveMatchState } from '../../utils/liveMatch'
import { buildStadiumLabelMap, getStadiumLabel, type StadiumLabelMap } from '../../utils/stadiumLabels'

function sortByMatchDate(first: FootballMatch, second: FootballMatch) {
  return getMatchTimestamp(first.matchDate, first.stadiumId) - getMatchTimestamp(second.matchDate, second.stadiumId)
}

function pickFeaturedMatch(footballMatches: FootballMatch[]) {
  const now = Date.now()
  const effectiveMatches = footballMatches.map((footballMatch) => withEffectiveMatchState(footballMatch, now))
  const liveMatch = effectiveMatches.find((footballMatch) => footballMatch.status === 'LIVE')
  const nextMatch = footballMatches
    .filter((footballMatch) => getMatchTimestamp(footballMatch.matchDate, footballMatch.stadiumId) >= now)
    .sort(sortByMatchDate)[0]

  return liveMatch ?? nextMatch ?? footballMatches[0]
}

function getSettledValue<T>(result: PromiseSettledResult<T>, fallback: T) {
  return result.status === 'fulfilled' ? result.value : fallback
}

function buildHomeDataWarning(results: PromiseSettledResult<unknown>[]) {
  return results.some((result) => result.status === 'rejected')
    ? "Certaines donnees n'ont pas pu etre actualisees. LiveKick affiche les dernieres donnees disponibles depuis le backend."
    : null
}

export function HomePage() {
  const [footballMatches, setFootballMatches] = useState<FootballMatch[]>([])
  const [competitionGroups, setCompetitionGroups] = useState<CompetitionGroup[]>([])
  const [predictionsByMatchId, setPredictionsByMatchId] = useState<Record<number, Prediction>>({})
  const [stadiumLabels, setStadiumLabels] = useState<StadiumLabelMap>({})
  const [featuredPrediction, setFeaturedPrediction] = useState<Prediction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadHomeData() {
      const [matchesResult, groupsResult, stadiumsResult] = await Promise.allSettled([
        getFootballMatches(),
        getCompetitionGroups(),
        getStadiums(),
      ])

        if (!isMounted) {
          return
        }

        const matchesResponse = getSettledValue<FootballMatch[]>(matchesResult, [])
        const groupsResponse = getSettledValue<CompetitionGroup[]>(groupsResult, [])
        const stadiumsResponse = getSettledValue(stadiumsResult, [])

        setFootballMatches(matchesResponse)
        setCompetitionGroups(groupsResponse)
        setStadiumLabels(buildStadiumLabelMap(stadiumsResponse))
        setError(buildHomeDataWarning([matchesResult, groupsResult, stadiumsResult]))

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
      if (isMounted) {
        setIsLoading(false)
      }
    }

    loadHomeData()

    return () => {
      isMounted = false
    }
  }, [])

  const refreshHomeData = useCallback(async () => {
    const [matchesResult, groupsResult, stadiumsResult] = await Promise.allSettled([
      getFootballMatches(),
      getCompetitionGroups(),
      getStadiums(),
    ])

    if (matchesResult.status === 'fulfilled') {
      setFootballMatches(matchesResult.value)
    }

    if (groupsResult.status === 'fulfilled') {
      setCompetitionGroups(groupsResult.value)
    }

    if (stadiumsResult.status === 'fulfilled') {
      setStadiumLabels(buildStadiumLabelMap(stadiumsResult.value))
    }

    setError(buildHomeDataWarning([matchesResult, groupsResult, stadiumsResult]))

    try {
      const predictionsResponse = await getKnownMatchPredictions()
      setPredictionsByMatchId(Object.fromEntries(predictionsResponse.map((prediction) => [prediction.matchId, prediction])))
    } catch {
      setPredictionsByMatchId({})
    }
  }, [])

  useAutoRefresh(refreshHomeData, { enabled: !isLoading, intervalMs: 45_000 })

  const featuredMatch = useMemo(() => pickFeaturedMatch(footballMatches), [footballMatches])

  useEffect(() => {
    let isMounted = true

    async function loadFeaturedPrediction() {
      if (!featuredMatch) {
        return
      }

      setFeaturedPrediction(null)

      try {
        const predictionResponse = await getMatchPrediction(featuredMatch.id)
        if (isMounted) {
          setFeaturedPrediction(predictionResponse)
        }
      } catch {
        if (isMounted) {
          setFeaturedPrediction(null)
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
        .map((footballMatch) => withEffectiveMatchState(footballMatch))
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
            <Button as={Link} to="/bracket" variant="secondary">
              Voir le tableau
            </Button>
          </div>
        </div>

        <Link className="featured-match featured-match--link" to={`/matches/${featuredMatch.id}`} aria-label="Voir le détail du match principal">
          <div className="featured-match__top">
            <StatusBadge status={featuredMatch.status} minute={featuredMatch.currentMinute} />
            <span>{formatMatchContext(featuredMatch.groupCode, featuredMatch.phaseType, featuredMatch.phase)}</span>
          </div>
          <Scoreboard footballMatch={featuredMatch} compact />
          <div className="featured-match__meta">
            <span>{formatMatchday(featuredMatch.matchday, featuredMatch.phaseType, featuredMatch.phase)}</span>
            <span>{getStadiumLabel(stadiumLabels, featuredMatch.stadiumId)}</span>
          </div>
          {featuredPrediction ? (
            <PredictionSummary
              prediction={featuredPrediction}
              homeTeam={featuredMatch.homeTeam}
              awayTeam={featuredMatch.awayTeam}
            />
          ) : null}
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
                prediction={predictionsByMatchId[footballMatch.id]}
                venueLabel={getStadiumLabel(stadiumLabels, footballMatch.stadiumId)}
              />
            ))}
          </div>
        </div>

        {featuredPrediction ? (
          <Link className="prediction-panel-link" to={`/matches/${featuredMatch.id}`} aria-label="Voir la prédiction détaillée du match">
            <PredictionPanel
              prediction={featuredPrediction}
              homeTeam={featuredMatch.homeTeam}
              awayTeam={featuredMatch.awayTeam}
            />
          </Link>
        ) : null}

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
          {firstGroup ? <GroupStandingTable group={firstGroup} variant="accordion" /> : null}
        </div>
      </section>

      <Link className="home-stats-card" to="/stats" aria-label="Comparer les statistiques des équipes">
        <div className="home-stats-card__content">
          <span className="eyebrow">
            <BarChart3 size={16} aria-hidden="true" />
            Statistiques
          </span>
          <h2>Comparer les équipes</h2>
          <p>
            Analysez les formes récentes, les buts marqués et les tendances avant les prochains matchs.
          </p>
        </div>
        <div className="home-stats-card__metrics" aria-hidden="true">
          <span>
            <strong>2</strong>
            équipes
          </span>
          <span>
            <strong>8</strong>
            indicateurs
          </span>
          <span>
            <TrendingUp size={22} />
            duel
          </span>
        </div>
      </Link>
    </section>
  )
}
