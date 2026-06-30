import type { FootballMatch } from '../../types/football'
import { TeamFlag } from './TeamFlag'

type ScoreboardProps = {
  footballMatch: FootballMatch
  compact?: boolean
}

function formatScore(score: number | null) {
  return score === null ? '-' : score
}

export function Scoreboard({ footballMatch, compact = false }: ScoreboardProps) {
  return (
    <div className={compact ? 'scoreboard scoreboard--compact' : 'scoreboard'}>
      <div className="scoreboard-team">
        <TeamFlag team={footballMatch.homeTeam} compact={compact} />
        <span>{footballMatch.homeTeam.name}</span>
      </div>

      <div className="scoreboard-score" aria-label="Score du match">
        <strong>{formatScore(footballMatch.homeScore)}</strong>
        <span>-</span>
        <strong>{formatScore(footballMatch.awayScore)}</strong>
      </div>

      <div className="scoreboard-team scoreboard-team--away">
        <TeamFlag team={footballMatch.awayTeam} compact={compact} />
        <span>{footballMatch.awayTeam.name}</span>
      </div>
    </div>
  )
}
