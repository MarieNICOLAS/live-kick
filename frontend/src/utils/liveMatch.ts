import type { FootballMatch, MatchStatus } from '../types/football'
import { getMatchTimestamp } from './formatters'

const liveWindowMinutes = 130
const preKickoffLiveToleranceMinutes = 5

type EffectiveMatchState = {
  status: MatchStatus
  homeScore: number | null
  awayScore: number | null
  currentMinute: number | null
}

function clampLiveMinute(minute: number) {
  return Math.min(liveWindowMinutes, Math.max(1, minute))
}

function getElapsedLiveMinute(footballMatch: FootballMatch, now: number) {
  const kickoffTimestamp = getMatchTimestamp(footballMatch.matchDate, footballMatch.stadiumId)
  const elapsedMinute = Math.floor((now - kickoffTimestamp) / 60_000)

  return elapsedMinute >= 0 && elapsedMinute <= liveWindowMinutes ? clampLiveMinute(elapsedMinute) : null
}

function isClearlyBeforeKickoff(footballMatch: FootballMatch, now: number) {
  const kickoffTimestamp = getMatchTimestamp(footballMatch.matchDate, footballMatch.stadiumId)
  return kickoffTimestamp - now > preKickoffLiveToleranceMinutes * 60_000
}

export function getEffectiveMatchState(footballMatch: FootballMatch, now = Date.now()): EffectiveMatchState {
  if (footballMatch.status === 'LIVE' || footballMatch.status === 'HALF_TIME') {
    if (footballMatch.currentMinute === null && isClearlyBeforeKickoff(footballMatch, now)) {
      return {
        status: 'SCHEDULED',
        homeScore: footballMatch.homeScore,
        awayScore: footballMatch.awayScore,
        currentMinute: null,
      }
    }

    return {
      status: footballMatch.status,
      homeScore: footballMatch.homeScore ?? 0,
      awayScore: footballMatch.awayScore ?? 0,
      currentMinute: footballMatch.currentMinute ?? getElapsedLiveMinute(footballMatch, now),
    }
  }

  if (footballMatch.status === 'SCHEDULED' || footballMatch.status === 'POSTPONED') {
    const elapsedMinute = getElapsedLiveMinute(footballMatch, now)

    if (elapsedMinute !== null) {
      return {
        status: 'LIVE',
        homeScore: footballMatch.homeScore ?? 0,
        awayScore: footballMatch.awayScore ?? 0,
        currentMinute: footballMatch.currentMinute ?? elapsedMinute,
      }
    }
  }

  return {
    status: footballMatch.status,
    homeScore: footballMatch.homeScore,
    awayScore: footballMatch.awayScore,
    currentMinute: footballMatch.currentMinute,
  }
}

export function withEffectiveMatchState(footballMatch: FootballMatch, now = Date.now()): FootballMatch {
  const effectiveState = getEffectiveMatchState(footballMatch, now)

  if (
    effectiveState.status === footballMatch.status &&
    effectiveState.homeScore === footballMatch.homeScore &&
    effectiveState.awayScore === footballMatch.awayScore &&
    effectiveState.currentMinute === footballMatch.currentMinute
  ) {
    return footballMatch
  }

  return {
    ...footballMatch,
    status: effectiveState.status,
    homeScore: effectiveState.homeScore,
    awayScore: effectiveState.awayScore,
    currentMinute: effectiveState.currentMinute,
  }
}

export function isEffectivelyLive(footballMatch: FootballMatch, now = Date.now()) {
  const effectiveStatus = getEffectiveMatchState(footballMatch, now).status
  return effectiveStatus === 'LIVE' || effectiveStatus === 'HALF_TIME'
}
