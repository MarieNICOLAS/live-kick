import type { FootballMatch } from '../types/football'
import { getTeamDisplayName } from './displayNames'

export type ReminderOffset = 60 | 5

export type MatchReminder = {
  matchId: number
  offsetMinutes: ReminderOffset
}

export const matchReminderStorageKey = 'livekick-match-reminders'

export function getMatchReminderKey(matchId: number, offsetMinutes: ReminderOffset) {
  return `${matchId}:${offsetMinutes}`
}

export function readStoredMatchReminders(): MatchReminder[] {
  try {
    const rawValue = localStorage.getItem(matchReminderStorageKey)
    return rawValue ? JSON.parse(rawValue) : []
  } catch {
    return []
  }
}

export function writeStoredMatchReminders(reminders: MatchReminder[]) {
  localStorage.setItem(matchReminderStorageKey, JSON.stringify(reminders))
}

export function getMatchLabel(footballMatch: FootballMatch) {
  return `${getTeamDisplayName(footballMatch.homeTeam)} - ${getTeamDisplayName(footballMatch.awayTeam)}`
}

export function isReminderActive(reminders: MatchReminder[], matchId: number, offsetMinutes: ReminderOffset) {
  const key = getMatchReminderKey(matchId, offsetMinutes)
  return reminders.some((reminder) => getMatchReminderKey(reminder.matchId, reminder.offsetMinutes) === key)
}
