import type { FormEvent, ReactNode } from 'react'

type FormShellProps = {
  title?: string
  children: ReactNode
  actions?: ReactNode
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function FormShell({ title, children, actions, onSubmit }: FormShellProps) {
  return (
    <form className="form-shell" onSubmit={onSubmit}>
      {title ? <h2>{title}</h2> : null}
      <div className="form-content">{children}</div>
      {actions ? <div className="form-actions">{actions}</div> : null}
    </form>
  )
}
