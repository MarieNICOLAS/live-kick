import { useEffect, useState } from 'react'
import {
  getMatchReminderKey,
  isReminderActive,
  matchReminderStorageKey,
  readStoredMatchReminders,
  type MatchReminder,
  type ReminderOffset,
  writeStoredMatchReminders,
} from '../utils/matchReminders'

const remindersChangedEvent = 'livekick-match-reminders-changed'

export function notifyMatchRemindersChanged() {
  window.dispatchEvent(new Event(remindersChangedEvent))
}

export function useMatchReminders() {
  const [reminders, setRemindersState] = useState<MatchReminder[]>(() => readStoredMatchReminders())

  useEffect(() => {
    function syncReminders() {
      setRemindersState(readStoredMatchReminders())
    }

    window.addEventListener('storage', syncReminders)
    window.addEventListener(remindersChangedEvent, syncReminders)

    return () => {
      window.removeEventListener('storage', syncReminders)
      window.removeEventListener(remindersChangedEvent, syncReminders)
    }
  }, [])

  function setReminders(nextReminders: MatchReminder[]) {
    writeStoredMatchReminders(nextReminders)
    setRemindersState(nextReminders)
    notifyMatchRemindersChanged()
  }

  function hasReminder(matchId: number, offsetMinutes: ReminderOffset) {
    return isReminderActive(reminders, matchId, offsetMinutes)
  }

  function addReminder(matchId: number, offsetMinutes: ReminderOffset) {
    if (hasReminder(matchId, offsetMinutes)) {
      return false
    }

    setReminders([...reminders, { matchId, offsetMinutes }])
    return true
  }

  function removeReminder(matchId: number, offsetMinutes: ReminderOffset) {
    const key = getMatchReminderKey(matchId, offsetMinutes)
    setReminders(reminders.filter((reminder) => getMatchReminderKey(reminder.matchId, reminder.offsetMinutes) !== key))
  }

  function toggleReminder(matchId: number, offsetMinutes: ReminderOffset) {
    if (hasReminder(matchId, offsetMinutes)) {
      removeReminder(matchId, offsetMinutes)
      return false
    }

    addReminder(matchId, offsetMinutes)
    return true
  }

  return {
    reminders,
    addReminder,
    hasReminder,
    removeReminder,
    setReminders,
    toggleReminder,
    storageKey: matchReminderStorageKey,
  }
}
