import { useEffect, useMemo, useState } from 'react'
import { Bell, BellRing, Clock3, Radio } from 'lucide-react'
import { MatchCard } from '../../components/football/MatchCard'
import { ErrorState } from '../../components/ui/ErrorState'
import { Spinner } from '../../components/ui/Spinner'
import { demoFootballMatches } from '../../fixtures/liveKickDemoData'
import { getFootballMatches } from '../../services/matchService'
import { getStadiums } from '../../services/stadiumService'
import type { FootballMatch } from '../../types/football'
import { getTeamDisplayName } from '../../utils/displayNames'
import { formatMatchDateTime, getMatchTimestamp } from '../../utils/formatters'
import { buildStadiumLabelMap, getStadiumLabel, type StadiumLabelMap } from '../../utils/stadiumLabels'

type ReminderOffset = 60 | 5

type Reminder = {
  matchId: number
  offsetMinutes: ReminderOffset
}

const reminderStorageKey = 'livekick-match-reminders'

function sortByKickoffDate(first: FootballMatch, second: FootballMatch) {
  return getMatchTimestamp(first.matchDate, first.stadiumId) - getMatchTimestamp(second.matchDate, second.stadiumId)
}

function getReminderKey(matchId: number, offsetMinutes: ReminderOffset) {
  return `${matchId}:${offsetMinutes}`
}

function readStoredReminders(): Reminder[] {
  try {
    const rawValue = localStorage.getItem(reminderStorageKey)
    return rawValue ? JSON.parse(rawValue) : []
  } catch {
    return []
  }
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

function getMatchLabel(footballMatch: FootballMatch) {
  return `${getTeamDisplayName(footballMatch.homeTeam)} - ${getTeamDisplayName(footballMatch.awayTeam)}`
}

function sendMatchNotification(footballMatch: FootballMatch, offsetMinutes: ReminderOffset) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return
  }

  new Notification('LiveKick - Match bientôt en direct', {
    body: `${getMatchLabel(footballMatch)} commence dans ${offsetMinutes === 60 ? '1 heure' : '5 minutes'}.`,
  })
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
  const [stadiumLabels, setStadiumLabels] = useState<StadiumLabelMap>({})
  const [reminders, setReminders] = useState<Reminder[]>(() => readStoredReminders())
  const [now, setNow] = useState(() => Date.now())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

    loadLiveData()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    localStorage.setItem(reminderStorageKey, JSON.stringify(reminders))
  }, [reminders])

  useEffect(() => {
    const timeoutIds = reminders
      .map((reminder) => {
        const footballMatch = footballMatches.find((match) => match.id === reminder.matchId)
        if (!footballMatch) {
          return null
        }

        const triggerTime = getMatchTimestamp(footballMatch.matchDate, footballMatch.stadiumId) - reminder.offsetMinutes * 60_000
        const delay = triggerTime - now
        if (delay <= 0) {
          return null
        }

        return window.setTimeout(() => sendMatchNotification(footballMatch, reminder.offsetMinutes), delay)
      })
      .filter((timeoutId): timeoutId is number => timeoutId !== null)

    return () => timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId))
  }, [footballMatches, now, reminders])

  const liveMatches = useMemo(
    () =>
      footballMatches
        .filter((footballMatch) => footballMatch.status === 'LIVE' || footballMatch.status === 'HALF_TIME')
        .sort(sortByKickoffDate),
    [footballMatches],
  )

  const upcomingMatches = useMemo(
    () =>
      footballMatches
        .filter((footballMatch) => {
          const kickoffTime = getMatchTimestamp(footballMatch.matchDate, footballMatch.stadiumId)
          return footballMatch.status === 'SCHEDULED' && kickoffTime >= now
        })
        .sort(sortByKickoffDate)
        .slice(0, 2),
    [footballMatches, now],
  )

  function isReminderActive(matchId: number, offsetMinutes: ReminderOffset) {
    const key = getReminderKey(matchId, offsetMinutes)
    return reminders.some((reminder) => getReminderKey(reminder.matchId, reminder.offsetMinutes) === key)
  }

  async function toggleReminder(matchId: number, offsetMinutes: ReminderOffset) {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }

    const key = getReminderKey(matchId, offsetMinutes)
    setReminders((currentReminders) => {
      const exists = currentReminders.some(
        (reminder) => getReminderKey(reminder.matchId, reminder.offsetMinutes) === key,
      )

      if (exists) {
        return currentReminders.filter(
          (reminder) => getReminderKey(reminder.matchId, reminder.offsetMinutes) !== key,
        )
      }

      return [...currentReminders, { matchId, offsetMinutes }]
    })
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
        <h1>Centre live</h1>
        <p>Suivez les matchs en cours ou préparez les prochains coups d'envoi.</p>
      </div>

      {liveMatches.length > 0 ? (
        <div className="match-list match-list--grid">
          {liveMatches.map((footballMatch) => (
            <MatchCard
              key={footballMatch.id}
              footballMatch={footballMatch}
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
                venueLabel={getStadiumLabel(stadiumLabels, footballMatch.stadiumId)}
              />

              <div className="reminder-actions" aria-label="Rappels du match">
                <ReminderButton
                  active={isReminderActive(footballMatch.id, 60)}
                  offsetMinutes={60}
                  onClick={() => toggleReminder(footballMatch.id, 60)}
                />
                <ReminderButton
                  active={isReminderActive(footballMatch.id, 5)}
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
