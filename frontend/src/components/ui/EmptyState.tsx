import type { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  message?: string
  action?: ReactNode
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="state-box">
      <h2>{title}</h2>
      {message ? <p>{message}</p> : null}
      {action ? <div className="state-action">{action}</div> : null}
    </div>
  )
}
