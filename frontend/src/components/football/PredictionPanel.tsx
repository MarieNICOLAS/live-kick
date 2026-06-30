import { BrainCircuit } from 'lucide-react'
import type { Prediction, TeamSummary } from '../../types/football'
import { ProbabilityBar } from './ProbabilityBar'

type PredictionPanelProps = {
  prediction: Prediction
  homeTeam: TeamSummary
  awayTeam: TeamSummary
}

export function PredictionPanel({ prediction, homeTeam, awayTeam }: PredictionPanelProps) {
  const confidence = prediction.confidenceScore > 1 ? prediction.confidenceScore : prediction.confidenceScore * 100

  return (
    <aside className="prediction-panel">
      <div className="prediction-panel__header">
        <BrainCircuit size={22} aria-hidden="true" />
        <div>
          <h2>Prediction IA</h2>
          <p>{prediction.modelName}</p>
        </div>
      </div>

      <div className="prediction-score">
        <span>Score predit</span>
        <strong>
          {prediction.predictedHomeScore ?? '-'} - {prediction.predictedAwayScore ?? '-'}
        </strong>
      </div>

      <div className="prediction-panel__bars">
        <ProbabilityBar label={homeTeam.name} value={prediction.homeWinProbability} />
        <ProbabilityBar label="Nul" value={prediction.drawProbability} />
        <ProbabilityBar label={awayTeam.name} value={prediction.awayWinProbability} />
      </div>

      <p>{prediction.explanation}</p>
      <span className="prediction-confidence">Confiance {Math.min(100, Math.max(0, Math.round(confidence)))}%</span>
    </aside>
  )
}
