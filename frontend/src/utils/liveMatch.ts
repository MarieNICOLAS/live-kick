import type { FootballMatch, MatchStatus } from '../types/football'
import { getMatchTimestamp } from './formatters'

const liveWindowMinutes = 130

type EffectiveMatchState = {
  status: MatchStatus
  homeScore: number | null
  awayScore: number | null
  currentMinute: number | null
}

function clampLiveMinute(minute: number) {
  return Math.min(liveWindowMinutes, Math.max(1, minute))
}

function getBrowserLocalTimestamp(value: string) {
  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? null : timestamp
}

function getElapsedLiveMinute(footballMatch: FootballMatch, now: number) {
  const timestamps = [
    getMatchTimestamp(footballMatch.matchDate, footballMatch.stadiumId),
    getBrowserLocalTimestamp(footballMatch.matchDate),
  ].filter((timestamp): timestamp is number => timestamp !== null && Number.isFinite(timestamp))

  const liveCandidates = timestamps
    .map((timestamp) => Math.floor((now - timestamp) / 60_000))
    .filter((minute) => minute >= 0 && minute <= liveWindowMinutes)

  return liveCandidates.length > 0 ? clampLiveMinute(Math.min(...liveCandidates)) : null
}

export function getEffectiveMatchState(footballMatch: FootballMatch, now = Date.now()): EffectiveMatchState {
  if (footballMatch.status === 'LIVE' || footballMatch.status === 'HALF_TIME') {
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
