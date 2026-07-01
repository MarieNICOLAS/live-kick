import type { MatchStatus } from '../types/football'

const statusLabels: Record<MatchStatus, string> = {
  SCHEDULED: 'À venir',
  LIVE: 'Direct',
  HALF_TIME: 'Mi-temps',
  FINISHED: 'Terminé',
  POSTPONED: 'Reporté',
}

const phaseLabels: Record<string, string> = {
  GROUP: 'Phase de groupes',
  GROUP_STAGE: 'Phase de groupes',
  KNOCKOUT: 'Phase finale',
  ROUND_OF_32: '16e de finale',
  ROUND_32: '16e de finale',
  R32: '16e de finale',
  ROUND_OF_16: '8e de finale',
  ROUND_16: '8e de finale',
  R16: '8e de finale',
  QUARTER_FINAL: 'Quart de finale',
  QUARTER_FINALS: 'Quart de finale',
  QF: 'Quart de finale',
  SEMI_FINAL: 'Demi-finale',
  SEMI_FINALS: 'Demi-finale',
  SF: 'Demi-finale',
  THIRD_PLACE: 'Match pour la troisième place',
  THIRD: 'Match pour la troisième place',
  FINAL: 'Finale',
}

const playerPositionLabels: Record<string, string> = {
  GK: 'Gardien',
  DF: 'Défenseur',
  MF: 'Milieu',
  FW: 'Attaquant',
}

const stadiumTimeZones: Record<number, string> = {
  1: 'America/Mexico_City',
  2: 'America/Mexico_City',
  3: 'America/Monterrey',
  4: 'America/Toronto',
  5: 'America/Vancouver',
  6: 'America/New_York',
  7: 'America/Los_Angeles',
  8: 'America/Los_Angeles',
  9: 'America/New_York',
  10: 'America/New_York',
  11: 'America/New_York',
  12: 'America/New_York',
  13: 'America/Chicago',
  14: 'America/Chicago',
  15: 'America/Chicago',
  16: 'America/Los_Angeles',
}

export function formatMatchStatus(status: MatchStatus, minute?: number | null) {
  if (status === 'LIVE' && minute) {
    return `${minute}' · Direct`
  }

  return statusLabels[status] ?? status
}

export function formatPhase(value: string | null | undefined) {
  if (!value) {
    return 'Phase à confirmer'
  }

  const normalizedKey = normalizePhaseKey(value)

  return phaseLabels[normalizedKey] ?? value.replaceAll('_', ' ').toLowerCase()
}

export function isGroupPhase(value: string | null | undefined) {
  const normalizedPhase = normalizePhaseKey(value)

  return normalizedPhase === 'GROUP' || normalizedPhase === 'GROUP_STAGE'
}

export function formatMatchContext(
  groupCode: string | null | undefined,
  phaseType?: string | null,
  phase?: string | null,
) {
  const phaseTypeValue = phaseType ?? phase
  const phaseLabelValue = phase ?? phaseType

  if (groupCode && isGroupPhase(phaseTypeValue)) {
    return `Groupe ${groupCode}`
  }

  const normalizedGroupCode = normalizePhaseKey(groupCode)

  if (normalizedGroupCode && phaseLabels[normalizedGroupCode]) {
    return phaseLabels[normalizedGroupCode]
  }

  return formatPhase(phaseLabelValue)
}

export function formatMatchday(matchday: number | null, phaseType?: string | null, phase?: string | null) {
  if (isGroupPhase(phaseType ?? phase)) {
    return matchday != null && matchday >= 1 && matchday <= 3 ? `Journée ${matchday}` : 'Phase de groupes'
  }

  return formatPhase(phaseType ?? phase)
}

export function formatPlayerPosition(position: string | null | undefined) {
  if (!position) {
    return '-'
  }

  const normalizedPosition = position.trim().toUpperCase()

  return playerPositionLabels[normalizedPosition] ?? position
}

function normalizePhaseKey(value: string | null | undefined) {
  return value?.trim().replaceAll('-', '_').replaceAll(' ', '_').toUpperCase() ?? ''
}

const parisTimeZone = 'Europe/Paris'

type LocalDateTimeParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

function parseLocalDateTimeParts(value: string): LocalDateTimeParts | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/)
  if (!match) {
    return null
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    second: Number(match[6] ?? 0),
  }
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((accumulator, part) => {
      accumulator[part.type] = part.value
      return accumulator
    }, {})

  const zonedTimestamp = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  )

  return zonedTimestamp - date.getTime()
}

function getSourceTimeZone(stadiumId?: number | null) {
  return stadiumId == null ? parisTimeZone : stadiumTimeZones[stadiumId] ?? parisTimeZone
}

export function getMatchDate(value: string, stadiumId?: number | null) {
  if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(value)) {
    return new Date(value)
  }

  const parts = parseLocalDateTimeParts(value)
  if (!parts) {
    return new Date(value)
  }

  const sourceTimeZone = getSourceTimeZone(stadiumId)
  const localTimestamp = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
  const firstGuess = new Date(localTimestamp)
  const firstOffset = getTimeZoneOffsetMs(firstGuess, sourceTimeZone)
  const correctedGuess = new Date(localTimestamp - firstOffset)
  const correctedOffset = getTimeZoneOffsetMs(correctedGuess, sourceTimeZone)

  return new Date(localTimestamp - correctedOffset)
}

export function getMatchTimestamp(value: string, stadiumId?: number | null) {
  return getMatchDate(value, stadiumId).getTime()
}

export function formatMatchDateTime(value: string, stadiumId?: number | null) {
  const date = getMatchDate(value, stadiumId)
  const datePart = new Intl.DateTimeFormat('fr-FR', {
    timeZone: parisTimeZone,
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
  const timePart = new Intl.DateTimeFormat('fr-FR', {
    timeZone: parisTimeZone,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)

  return `${datePart} à ${timePart}`
}
