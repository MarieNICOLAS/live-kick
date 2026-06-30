import type { TeamSummary } from '../../types/football'

type TeamFlagProps = {
  team: TeamSummary
  compact?: boolean
}

export function TeamFlag({ team, compact = false }: TeamFlagProps) {
  const code = team.fifaCode?.slice(0, 3) ?? 'TBD'

  return (
    <span className={compact ? 'team-flag team-flag--compact' : 'team-flag'} aria-label={team.name}>
      {team.flagUrl ? <img src={team.flagUrl} alt="" /> : <span>{code}</span>}
    </span>
  )
}
