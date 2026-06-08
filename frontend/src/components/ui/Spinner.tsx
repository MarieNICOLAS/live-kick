type SpinnerProps = {
  label?: string
}

export function Spinner({ label = 'Chargement' }: SpinnerProps) {
  return (
    <div className="ui-spinner" role="status" aria-live="polite">
      <span />
      <p>{label}</p>
    </div>
  )
}
