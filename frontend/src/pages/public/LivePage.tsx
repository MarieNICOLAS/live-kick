import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bell, BellRing, Clock3, Radio } from 'lucide-react'
import { MatchCard } from '../../components/football/MatchCard'
import { ErrorState } from '../../components/ui/ErrorState'
import { Spinner } from '../../components/ui/Spinner'
import { demoFootballMatches } from '../../fixtures/liveKickDemoData'
import { useAutoRefresh } from '../../hooks/useAutoRefresh'
import { useMatchReminders } from '../../hooks/useMatchReminders'
import { getFootballMatches } from '../../services/matchService'
import { getKnownMatchPredictions } from '../../services/predictionService'
import { getStadiums } from '../../services/stadiumService'
import { useNotificationsStore } from '../../stores/notificationsStore'
import type { FootballMatch, Prediction } from '../../types/football'
import { formatMatchDateTime, getMatchTimestamp } from '../../utils/formatters'
import { isEffectivelyLive, withEffectiveMatchState } from '../../utils/liveMatch'
import { getMatchLabel, type ReminderOffset } from '../../utils/matchReminders'
import { buildStadiumLabelMap, getStadiumLabel, type StadiumLabelMap } from '../../utils/stadiumLabels'

function sortByKickoffDate(first: FootballMatch, second: FootballMatch) {
  return getMatchTimestamp(first.matchDate, first.stadiumId) - getMatchTimestamp(second.matchDate, second.stadiumId)
}

function formatCountdown(footballMatch: FootballMatch, now: number) {
  const diffMs = Math.max(0, getMatchTimestamp(footballMatch.matchDate, footballMatch.stadiumId) - now)
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (days === 0 && hours === 0) {
    return `${minutes} min`
  }

  return `${days} j - ${hours} h`
}

function ReminderButton({
  active,
  offsetMinutes,
  onClick,
}: {
  active: boolean
  offsetMinutes: ReminderOffset
  onClick: () => void
}) {
  const Icon = active ? BellRing : Bell

  return (
    <button
      className={active ? 'reminder-button reminder-button--active' : 'reminder-button'}
      type="button"
      onClick={onClick}
      aria-pressed={active}
    >
      <Icon size={16} aria-hidden="true" />
      {offsetMinutes === 60 ? '1 h avant' : '5 min avant'}
    </button>
  )
}

export function LivePage() {
  const [footballMatches, setFootballMatches] = useState<FootballMatch[]>([])
  const [predictionsByMatchId, setPredictionsByMatchId] = useState<Record<number, Prediction>>({})
  const [stadiumLabels, setStadiumLabels] = useState<StadiumLabelMap>({})
  const { hasReminder, toggleReminder: toggleStoredReminder } = useMatchReminders()
  const [now, setNow] = useState(() => Date.now())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const addNotification = useNotificationsStore((state) => state.addNotification)

  useEffect(() => {
    let isMounted = true

    async function loadLiveData() {
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
        setStadiumLabels({})
        setError("L'API du serveur est indisponible, affichage des données de démonstration.")
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadLiveData()

    return () => {
      isMounted = false
    }
  }, [])

  const refreshLiveData = useCallback(async () => {
    try {
      const [matchesResponse, stadiumsResponse] = await Promise.all([
        getFootballMatches(),
        getStadiums(),
      ])

      setFootballMatches(matchesResponse)
      setStadiumLabels(buildStadiumLabelMap(stadiumsResponse))
      setNow(Date.now())
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

  useAutoRefresh(refreshLiveData, { enabled: !isLoading, intervalMs: 20_000 })

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(intervalId)
  }, [])

  const effectiveFootballMatches = useMemo(
    () => footballMatches.map((footballMatch) => withEffectiveMatchState(footballMatch, now)),
    [footballMatches, now],
  )

  const liveMatches = useMemo(
    () =>
      effectiveFootballMatches
        .filter((footballMatch) => footballMatch.status === 'LIVE' || footballMatch.status === 'HALF_TIME')
        .sort(sortByKickoffDate),
    [effectiveFootballMatches],
  )

  const upcomingMatches = useMemo(
    () =>
      effectiveFootballMatches
        .filter((footballMatch) => {
          const kickoffTime = getMatchTimestamp(footballMatch.matchDate, footballMatch.stadiumId)
          return footballMatch.status === 'SCHEDULED' && kickoffTime >= now && !isEffectivelyLive(footballMatch, now)
        })
        .sort(sortByKickoffDate)
        .slice(0, 2),
    [effectiveFootballMatches, now],
  )

  async function toggleReminder(matchId: number, offsetMinutes: ReminderOffset) {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }

    const isActive = toggleStoredReminder(matchId, offsetMinutes)

    const footballMatch = footballMatches.find((match) => match.id === matchId)
    if (footballMatch) {
      addNotification({
        type: 'MATCH',
        title: isActive ? 'Rappel de match activé' : 'Rappel de match désactivé',
        message: `${getMatchLabel(footballMatch)} : alerte ${isActive ? 'prévue' : 'retirée'} ${offsetMinutes === 60 ? '1 h' : '5 min'} avant le coup d’envoi.`,
        targetLink: `/matches/${footballMatch.id}`,
      })
    }
  }

  if (isLoading) {
    return (
      <section className="page-section">
        <Spinner label="Chargement du direct..." />
      </section>
    )
  }

  return (
    <section className="live-page">
      {error ? <p className="data-warning">{error}</p> : null}

      <div className="page-heading">
        <span>
          <Radio size={16} aria-hidden="true" />
          Direct
        </span>
        <h1>
          Centre live
          {liveMatches.length > 0 ? (
            <span className="live-heading-count">
              <span aria-hidden="true" />
              {liveMatches.length} en cours
            </span>
          ) : null}
        </h1>
        <p>Suivez les matchs en cours ou préparez les prochains coups d'envoi.</p>
      </div>

      {liveMatches.length > 0 ? (
        <div className="match-list match-list--grid">
          {liveMatches.map((footballMatch) => (
            <MatchCard
              key={footballMatch.id}
              footballMatch={footballMatch}
              prediction={predictionsByMatchId[footballMatch.id]}
              venueLabel={getStadiumLabel(stadiumLabels, footballMatch.stadiumId)}
            />
          ))}
        </div>
      ) : null}

      {liveMatches.length === 0 && upcomingMatches.length > 0 ? (
        <div className="match-list match-list--grid">
          {upcomingMatches.map((footballMatch) => (
            <article className="live-upcoming-card" key={footballMatch.id}>
              <div className="live-upcoming-card__header">
                <div>
                  <span className="eyebrow">Prochain direct</span>
                  <strong>{formatMatchDateTime(footballMatch.matchDate, footballMatch.stadiumId)}</strong>
                </div>
                <div className="live-countdown" aria-label="Décompte avant le direct">
                  <Clock3 size={18} aria-hidden="true" />
                  {formatCountdown(footballMatch, now)}
                </div>
              </div>

              <MatchCard
                footballMatch={footballMatch}
                prediction={predictionsByMatchId[footballMatch.id]}
                venueLabel={getStadiumLabel(stadiumLabels, footballMatch.stadiumId)}
              />

              <div className="reminder-actions" aria-label="Rappels du match">
                <ReminderButton
                  active={hasReminder(footballMatch.id, 60)}
                  offsetMinutes={60}
                  onClick={() => toggleReminder(footballMatch.id, 60)}
                />
                <ReminderButton
                  active={hasReminder(footballMatch.id, 5)}
                  offsetMinutes={5}
                  onClick={() => toggleReminder(footballMatch.id, 5)}
                />
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {liveMatches.length === 0 && upcomingMatches.length === 0 ? (
        <ErrorState title="Aucun direct à venir" message="Aucune rencontre future n'est disponible pour le moment." />
      ) : null}
    </section>
  )
}
