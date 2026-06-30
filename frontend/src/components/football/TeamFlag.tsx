import type { TeamSummary } from '../../types/football'
import { getTeamDisplayName } from '../../utils/displayNames'

type TeamFlagProps = {
  team: TeamSummary
  compact?: boolean
}

export function TeamFlag({ team, compact = false }: TeamFlagProps) {
  const code = team.fifaCode?.slice(0, 3) ?? 'ÀD'

  return (
    <span className={compact ? 'team-flag team-flag--compact' : 'team-flag'} aria-label={getTeamDisplayName(team)}>
      {team.flagUrl ? <img src={team.flagUrl} alt="" /> : <span>{code}</span>}
    </span>
  )
}
