import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'live' | 'success' | 'warning' | 'danger'

type BadgeProps = {
  children: ReactNode
  variant?: BadgeVariant
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return <span className={`ui-badge ui-badge--${variant}`}>{children}</span>
}
