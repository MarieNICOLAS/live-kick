type ProbabilityBarProps = {
  label: string
  value: number
}

export function ProbabilityBar({ label, value }: ProbabilityBarProps) {
  const normalizedValue = value > 1 ? value : value * 100
  const percentage = Math.min(100, Math.max(0, Math.round(normalizedValue)))

  return (
    <div className="probability-bar">
      <div className="probability-bar__label">
        <span>{label}</span>
        <strong>{percentage}%</strong>
      </div>
      <div className="probability-bar__track" aria-hidden="true">
        <span style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
