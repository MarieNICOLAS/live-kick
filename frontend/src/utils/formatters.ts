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
  group: 'Phase de groupes',
  ROUND_OF_32: 'Seizièmes de finale',
  r32: 'Seizièmes de finale',
  ROUND_OF_16: 'Huitièmes de finale',
  r16: 'Huitièmes de finale',
  QUARTER_FINAL: 'Quart de finale',
  qf: 'Quart de finale',
  SEMI_FINAL: 'Demi-finale',
  sf: 'Demi-finale',
  THIRD_PLACE: 'Match pour la troisième place',
  third: 'Match pour la troisième place',
  FINAL: 'Finale',
  final: 'Finale',
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

  return phaseLabels[value] ?? value.replaceAll('_', ' ').toLowerCase()
}

export function formatMatchday(matchday: number | null) {
  return matchday ? `Journée ${matchday}` : 'Journée à confirmer'
}

export function formatMatchDateTime(value: string) {
  const date = new Date(value)
  const datePart = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
  const timePart = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)

  return `${datePart} à ${timePart}`
}
