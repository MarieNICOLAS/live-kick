import type { ReactNode } from 'react'

type ErrorStateProps = {
  title: string
  message?: string
  action?: ReactNode
}

export function ErrorState({ title, message, action }: ErrorStateProps) {
  return (
    <div className="state-box state-box--error">
      <h2>{title}</h2>
      {message ? <p>{message}</p> : null}
      {action ? <div className="state-action">{action}</div> : null}
    </div>
  )
}
