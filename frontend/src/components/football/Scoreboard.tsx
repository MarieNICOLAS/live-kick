import type { FootballMatch } from '../../types/football'
import { getTeamDisplayName } from '../../utils/displayNames'
import { getEffectiveMatchState } from '../../utils/liveMatch'
import { TeamFlag } from './TeamFlag'

type ScoreboardProps = {
  footballMatch: FootballMatch
  compact?: boolean
}

function shouldMaskScore(footballMatch: FootballMatch) {
  return footballMatch.status === 'SCHEDULED' || footballMatch.status === 'POSTPONED'
}

function formatScore(score: number | null, masked: boolean) {
  return masked || score === null ? '-' : score
}

export function Scoreboard({ footballMatch, compact = false }: ScoreboardProps) {
  const effectiveState = getEffectiveMatchState(footballMatch)
  const scoreMasked = shouldMaskScore({ ...footballMatch, status: effectiveState.status })

  return (
    <div className={compact ? 'scoreboard scoreboard--compact' : 'scoreboard'}>
      <div className="scoreboard-team">
        <TeamFlag team={footballMatch.homeTeam} compact={compact} />
        <span>{getTeamDisplayName(footballMatch.homeTeam)}</span>
      </div>

      <div className="scoreboard-score" aria-label={scoreMasked ? 'Score à venir' : 'Score du match'}>
        <strong>{formatScore(effectiveState.homeScore, scoreMasked)}</strong>
        <span>-</span>
        <strong>{formatScore(effectiveState.awayScore, scoreMasked)}</strong>
      </div>

      <div className="scoreboard-team scoreboard-team--away">
        <TeamFlag team={footballMatch.awayTeam} compact={compact} />
        <span>{getTeamDisplayName(footballMatch.awayTeam)}</span>
      </div>
    </div>
  )
}
