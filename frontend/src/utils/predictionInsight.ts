import type { Prediction, TeamSummary } from '../types/football'
import { getTeamDisplayName } from './displayNames'

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

function normalizeProbability(value: number) {
  const normalizedValue = value > 1 ? value : value * 100
  return Math.min(100, Math.max(0, Math.round(normalizedValue)))
}
