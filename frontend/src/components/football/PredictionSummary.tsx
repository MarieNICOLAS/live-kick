import type { Prediction, TeamSummary } from '../../types/football'
import { getTeamDisplayName } from '../../utils/displayNames'
import { ProbabilityBar } from './ProbabilityBar'

type PredictionSummaryProps = {
  prediction: Prediction
  homeTeam: TeamSummary
  awayTeam: TeamSummary
}

export function getPredictionInsight(prediction: Prediction, homeTeam: TeamSummary, awayTeam: TeamSummary) {
  const homeTeamName = getTeamDisplayName(homeTeam)
  const awayTeamName = getTeamDisplayName(awayTeam)
  const homeProbability = normalizeProbability(prediction.homeWinProbability)
  const drawProbability = normalizeProbability(prediction.drawProbability)
  const awayProbability = normalizeProbability(prediction.awayWinProbability)

  if (drawProbability >= homeProbability && drawProbability >= awayProbability) {
    return `La prédiction voit un match équilibré entre ${homeTeamName} et ${awayTeamName}, avec le nul comme scénario principal.`
  }

  const favoriteName = homeProbability >= awayProbability ? homeTeamName : awayTeamName
  const favoriteProbability = Math.max(homeProbability, awayProbability)

  return `La prédiction donne ${favoriteName} favori avec ${favoriteProbability}% de chances de victoire.`
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

function normalizeProbability(value: number) {
  const normalizedValue = value > 1 ? value : value * 100
  return Math.min(100, Math.max(0, Math.round(normalizedValue)))
}
