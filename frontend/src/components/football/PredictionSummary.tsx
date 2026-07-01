import type { Prediction, TeamSummary } from '../../types/football'
import { getTeamDisplayName } from '../../utils/displayNames'
import { getPredictionInsight } from '../../utils/predictionInsight'
import { ProbabilityBar } from './ProbabilityBar'

type PredictionSummaryProps = {
  prediction: Prediction
  homeTeam: TeamSummary
  awayTeam: TeamSummary
}

export function PredictionSummary({ prediction, homeTeam, awayTeam }: PredictionSummaryProps) {
  return (
    <div className="prediction-summary">
      <div className="prediction-summary__header">
        <span>Prédiction IA</span>
        <strong>
          {prediction.predictedHomeScore ?? '-'} - {prediction.predictedAwayScore ?? '-'}
        </strong>
      </div>
      <div className="prediction-summary__bars">
        <ProbabilityBar label={getTeamDisplayName(homeTeam)} value={prediction.homeWinProbability} />
        <ProbabilityBar label={getTeamDisplayName(awayTeam)} value={prediction.awayWinProbability} />
      </div>
      <p>{getPredictionInsight(prediction, homeTeam, awayTeam)}</p>
    </div>
  )
}
