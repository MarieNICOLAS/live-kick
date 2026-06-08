import type { ComponentPropsWithoutRef } from 'react'

type InputProps = {
  label: string
  error?: string
} & ComponentPropsWithoutRef<'input'>

export function Input({ id, label, error, ...props }: InputProps) {
  const inputId = id ?? props.name

  return (
    <label className="form-field" htmlFor={inputId}>
      <span>{label}</span>
      <input id={inputId} aria-invalid={Boolean(error)} {...props} />
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  )
}
