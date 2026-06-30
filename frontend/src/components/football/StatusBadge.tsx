import { Badge } from '../ui/Badge'
import type { MatchStatus } from '../../types/football'

type StatusBadgeProps = {
  status: MatchStatus
  minute?: number | null
}

const statusLabel: Record<MatchStatus, string> = {
  SCHEDULED: 'A venir',
  LIVE: 'Live',
  HALF_TIME: 'Mi-temps',
  FINISHED: 'Termine',
  POSTPONED: 'Reporte',
}

export function StatusBadge({ status, minute }: StatusBadgeProps) {
  const variant = status === 'LIVE' ? 'live' : status === 'FINISHED' ? 'success' : status === 'POSTPONED' ? 'danger' : 'default'
  const label = status === 'LIVE' && minute ? `${minute}' LIVE` : statusLabel[status]

  return <Badge variant={variant}>{label}</Badge>
}
