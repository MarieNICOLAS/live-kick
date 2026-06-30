import { useState } from 'react'
import { Bell, BellRing } from 'lucide-react'
import { useMatchReminders } from '../../hooks/useMatchReminders'
import { useNotificationsStore } from '../../stores/notificationsStore'
import type { FootballMatch } from '../../types/football'
import { getMatchTimestamp } from '../../utils/formatters'
import { getMatchLabel, type ReminderOffset } from '../../utils/matchReminders'

type MatchReminderButtonProps = {
  footballMatch: FootballMatch
}

const reminderOptions: Array<{ label: string; value: ReminderOffset }> = [
  { label: '1 h avant', value: 60 },
  { label: '5 min avant', value: 5 },
]

function isUpcomingMatch(footballMatch: FootballMatch) {
  return footballMatch.status === 'SCHEDULED' && getMatchTimestamp(footballMatch.matchDate, footballMatch.stadiumId) >= Date.now()
}

export function MatchReminderButton({ footballMatch }: MatchReminderButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { hasReminder, toggleReminder } = useMatchReminders()
  const addNotification = useNotificationsStore((state) => state.addNotification)

  if (!isUpcomingMatch(footballMatch)) {
    return null
  }

  const hasAnyReminder = reminderOptions.some((option) => hasReminder(footballMatch.id, option.value))
  const Icon = hasAnyReminder ? BellRing : Bell

  async function handleToggle(offsetMinutes: ReminderOffset) {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }

    const isActive = toggleReminder(footballMatch.id, offsetMinutes)

    addNotification({
      type: 'MATCH',
      title: isActive ? 'Rappel de match activé' : 'Rappel de match désactivé',
      message: `${getMatchLabel(footballMatch)} : alerte ${isActive ? 'prévue' : 'retirée'} ${offsetMinutes === 60 ? '1 h' : '5 min'} avant le coup d’envoi.`,
      targetLink: `/matches/${footballMatch.id}`,
    })
    setIsOpen(false)
  }

  return (
    <div className="match-reminder">
      <button
        className={hasAnyReminder ? 'match-reminder__trigger match-reminder__trigger--active' : 'match-reminder__trigger'}
        type="button"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setIsOpen((currentValue) => !currentValue)
        }}
        aria-expanded={isOpen}
        aria-label="Gérer les rappels du match"
      >
        <Icon size={17} aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="match-reminder__menu" onClick={(event) => event.stopPropagation()}>
          {reminderOptions.map((option) => {
            const active = hasReminder(footballMatch.id, option.value)

            return (
              <button
                className={active ? 'match-reminder__option active' : 'match-reminder__option'}
                type="button"
                key={option.value}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  handleToggle(option.value)
                }}
                aria-pressed={active}
              >
                <span>{option.label}</span>
                {active ? <BellRing size={14} aria-hidden="true" /> : <Bell size={14} aria-hidden="true" />}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
