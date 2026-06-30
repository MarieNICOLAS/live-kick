import { useEffect, useState } from 'react'
import { demoFootballMatches } from '../../fixtures/liveKickDemoData'
import { useMatchReminders } from '../../hooks/useMatchReminders'
import { getFootballMatches } from '../../services/matchService'
import { useNotificationsStore } from '../../stores/notificationsStore'
import type { FootballMatch } from '../../types/football'
import { getMatchTimestamp } from '../../utils/formatters'
import { getMatchLabel } from '../../utils/matchReminders'

function sendBrowserNotification(footballMatch: FootballMatch, offsetMinutes: number) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return
  }

  new Notification('LiveKick - Match bientôt en direct', {
    body: `${getMatchLabel(footballMatch)} commence dans ${offsetMinutes === 60 ? '1 heure' : '5 minutes'}.`,
  })
}

export function MatchReminderScheduler() {
  const [footballMatches, setFootballMatches] = useState<FootballMatch[]>([])
  const { reminders } = useMatchReminders()
  const addNotification = useNotificationsStore((state) => state.addNotification)

  useEffect(() => {
    let isMounted = true

    async function loadMatches() {
      try {
        const matchesResponse = await getFootballMatches()
        if (isMounted) {
          setFootballMatches(matchesResponse)
        }
      } catch {
        if (isMounted) {
          setFootballMatches(demoFootballMatches)
        }
      }
    }

    loadMatches()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const timeoutIds = reminders
      .map((reminder) => {
        const footballMatch = footballMatches.find((match) => match.id === reminder.matchId)
        if (!footballMatch || footballMatch.status !== 'SCHEDULED') {
          return null
        }

        const triggerTime = getMatchTimestamp(footballMatch.matchDate, footballMatch.stadiumId) - reminder.offsetMinutes * 60_000
        const delay = triggerTime - Date.now()
        if (delay <= 0) {
          return null
        }

        return window.setTimeout(() => {
          sendBrowserNotification(footballMatch, reminder.offsetMinutes)
          addNotification({
            type: 'MATCH',
            title: 'Match bientôt en direct',
            message: `${getMatchLabel(footballMatch)} commence dans ${
              reminder.offsetMinutes === 60 ? '1 heure' : '5 minutes'
            }.`,
            targetLink: `/matches/${footballMatch.id}`,
          })
        }, delay)
      })
      .filter((timeoutId): timeoutId is number => timeoutId !== null)

    return () => timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId))
  }, [addNotification, footballMatches, reminders])

  return null
}
