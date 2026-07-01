import { Badge } from '../ui/Badge'
import type { MatchStatus } from '../../types/football'
import { formatMatchStatus } from '../../utils/formatters'

type StatusBadgeProps = {
  status: MatchStatus
  minute?: number | null
}

export function StatusBadge({ status, minute }: StatusBadgeProps) {
  const variant =
    status === 'LIVE' || status === 'HALF_TIME'
      ? 'live'
      : status === 'FINISHED'
        ? 'success'
        : status === 'POSTPONED'
          ? 'danger'
          : 'default'
  const label = formatMatchStatus(status, minute)

  return <Badge variant={variant}>{label}</Badge>
}
