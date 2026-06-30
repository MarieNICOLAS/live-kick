import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PredictionPanel } from '../../components/football/PredictionPanel'
import { Scoreboard } from '../../components/football/Scoreboard'
import { StatusBadge } from '../../components/football/StatusBadge'
import { Button } from '../../components/ui/Button'
import { ErrorState } from '../../components/ui/ErrorState'
import { Spinner } from '../../components/ui/Spinner'
import { demoFootballMatches, demoPrediction } from '../../fixtures/liveKickDemoData'
import { getFootballMatchById } from '../../services/matchService'
import { getMatchPrediction } from '../../services/predictionService'
import { getStadiumById } from '../../services/stadiumService'
import type { FootballMatch, Prediction, Stadium } from '../../types/football'
import { getCityDisplayName, getStadiumDisplayName } from '../../utils/displayNames'
import { formatMatchStatus, formatMatchday, formatPhase } from '../../utils/formatters'

export function MatchDetailPage() {
  const { id } = useParams()
  const [footballMatch, setFootballMatch] = useState<FootballMatch | null>(null)
  const [stadium, setStadium] = useState<Stadium | null>(null)
  const [prediction, setPrediction] = useState<Prediction>(demoPrediction)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadMatchDetail() {
      if (!id) {
        setIsLoading(false)
        return
      }

      try {
        const matchResponse = await getFootballMatchById(id)

        if (!isMounted) {
          return
        }

        setFootballMatch(matchResponse)

        if (matchResponse.stadiumId !== null) {
          try {
            const stadiumResponse = await getStadiumById(matchResponse.stadiumId)
            if (isMounted) {
              setStadium(stadiumResponse)
            }
          } catch {
            if (isMounted) {
              setStadium(null)
            }
          }
        }

        try {
          const predictionResponse = await getMatchPrediction(id)
          if (isMounted) {
            setPrediction(predictionResponse)
          }
        } catch {
          if (isMounted) {
            setPrediction({ ...demoPrediction, matchId: matchResponse.id })
          }
        }
      } catch {
        if (isMounted) {
          setFootballMatch(demoFootballMatches.find((item) => String(item.id) === id) ?? null)
          setStadium(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadMatchDetail()

    return () => {
      isMounted = false
    }
  }, [id])

  if (isLoading) {
    return (
      <section className="page-section">
        <Spinner label="Chargement du détail du match..." />
      </section>
    )
  }

  if (!footballMatch) {
    return (
      <ErrorState
        title="Match introuvable"
        message="Cette rencontre n'est pas disponible dans le calendrier."
        action={
          <Button as={Link} to="/calendar">
            Retour au calendrier
          </Button>
        }
      />
    )
  }

  return (
    <section className="match-detail-page">
      <div className="match-detail-hero">
        <div className="match-detail-hero__meta">
          <StatusBadge status={footballMatch.status} minute={footballMatch.currentMinute} />
          <span>Groupe {footballMatch.groupCode}</span>
          <span>{formatMatchday(footballMatch.matchday)}</span>
        </div>
        <Scoreboard footballMatch={footballMatch} />
        <p>
          {stadium
            ? `${getStadiumDisplayName(stadium)}, ${getCityDisplayName(stadium.city)}`
            : 'Stade à confirmer'}{' '}
          - {formatPhase(footballMatch.phase)}
        </p>
      </div>

      <div className="dashboard-grid">
        <section className="info-panel dashboard-column--wide">
          <h2>Statut du match</h2>
          <dl className="metric-grid">
            <div>
              <dt>Minute</dt>
              <dd>{footballMatch.currentMinute ? `${footballMatch.currentMinute}'` : '-'}</dd>
            </div>
            <div>
              <dt>Statut</dt>
              <dd>{formatMatchStatus(footballMatch.status, footballMatch.currentMinute)}</dd>
            </div>
            <div>
              <dt>Phase</dt>
              <dd>{formatPhase(footballMatch.phaseType)}</dd>
            </div>
          </dl>
        </section>

        <PredictionPanel
          prediction={prediction}
          homeTeam={footballMatch.homeTeam}
          awayTeam={footballMatch.awayTeam}
        />
      </div>
    </section>
  )
}
