import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PredictionPanel } from '../../components/football/PredictionPanel'
import { Scoreboard } from '../../components/football/Scoreboard'
import { StatusBadge } from '../../components/football/StatusBadge'
import { Button } from '../../components/ui/Button'
import { ErrorState } from '../../components/ui/ErrorState'
import { Spinner } from '../../components/ui/Spinner'
import { demoFootballMatches, demoPrediction } from '../../fixtures/liveKickDemoData'
import { useAutoRefresh } from '../../hooks/useAutoRefresh'
import { getFootballMatchById, getFootballMatchLiveState } from '../../services/matchService'
import { getMatchPrediction } from '../../services/predictionService'
import { getPlayers } from '../../services/playerService'
import { getStadiumById } from '../../services/stadiumService'
import type { FootballMatch, Player, Prediction, Stadium, TeamSummary } from '../../types/football'
import { getCityDisplayName, getStadiumDisplayName, getTeamDisplayName } from '../../utils/displayNames'
import {
  formatMatchContext,
  formatMatchStatus,
  formatMatchday,
  formatPhase,
  formatPlayerPosition,
  isGroupPhase,
} from '../../utils/formatters'
import { getEffectiveMatchState } from '../../utils/liveMatch'

type TeamSummaryWithId = TeamSummary & { id: number }

function canLoadTeamPlayers(team: TeamSummary): team is TeamSummaryWithId {
  return team.id !== null
}

export function MatchDetailPage() {
  const { id } = useParams()
  const [footballMatch, setFootballMatch] = useState<FootballMatch | null>(null)
  const [stadium, setStadium] = useState<Stadium | null>(null)
  const [homePlayers, setHomePlayers] = useState<Player[]>([])
  const [awayPlayers, setAwayPlayers] = useState<Player[]>([])
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

        try {
          const [homePlayersResponse, awayPlayersResponse] = await Promise.all([
            canLoadTeamPlayers(matchResponse.homeTeam) ? getPlayers(matchResponse.homeTeam.id) : Promise.resolve([]),
            canLoadTeamPlayers(matchResponse.awayTeam) ? getPlayers(matchResponse.awayTeam.id) : Promise.resolve([]),
          ])

          if (isMounted) {
            setHomePlayers(homePlayersResponse)
            setAwayPlayers(awayPlayersResponse)
          }
        } catch {
          if (isMounted) {
            setHomePlayers([])
            setAwayPlayers([])
          }
        }
      } catch {
        if (isMounted) {
          setFootballMatch(demoFootballMatches.find((item) => String(item.id) === id) ?? null)
          setStadium(null)
          setHomePlayers([])
          setAwayPlayers([])
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

  const refreshMatchLiveState = useCallback(async () => {
    if (!id) {
      return
    }

    try {
      const liveState = await getFootballMatchLiveState(id)
      setFootballMatch((currentMatch) => {
        if (!currentMatch || currentMatch.id !== liveState.id) {
          return currentMatch
        }

        return {
          ...currentMatch,
          status: liveState.status,
          homeScore: liveState.homeScore,
          awayScore: liveState.awayScore,
          currentMinute: liveState.currentMinute,
        }
      })
    } catch {
      // Le détail complet reste affiché si le live ponctuel échoue.
    }
  }, [id])

  useAutoRefresh(refreshMatchLiveState, {
    enabled: !isLoading && footballMatch !== null && footballMatch.status !== 'FINISHED',
    intervalMs: 15_000,
  })

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

  const matchContext = formatMatchContext(footballMatch.groupCode, footballMatch.phaseType, footballMatch.phase)
  const effectiveState = getEffectiveMatchState(footballMatch)
  const groupLinkTarget =
    footballMatch.groupCode && isGroupPhase(footballMatch.phaseType ?? footballMatch.phase)
      ? `/groups/${footballMatch.groupCode}`
      : null

  return (
    <section className="match-detail-page">
      <div className="match-detail-hero">
        <div className="match-detail-hero__meta">
          <StatusBadge status={effectiveState.status} minute={effectiveState.currentMinute} />
          {groupLinkTarget ? (
            <Link to={groupLinkTarget}>{matchContext}</Link>
          ) : (
            <Link to={`/calendar?phase=${footballMatch.phaseType}`}>{matchContext}</Link>
          )}
          <span>{formatMatchday(footballMatch.matchday, footballMatch.phaseType, footballMatch.phase)}</span>
        </div>
        <Scoreboard footballMatch={footballMatch} compact />
        <p>
          {stadium ? (
            <Link to={`/stadiums/${stadium.id}`}>
              {getStadiumDisplayName(stadium)}, {getCityDisplayName(stadium.city)}
            </Link>
          ) : (
            'Stade à confirmer'
          )}{' '}
          - {formatPhase(footballMatch.phase)}
        </p>
      </div>

      <div className="dashboard-grid">
        <section className="info-panel dashboard-column--wide">
          <h2>Statut du match</h2>
          <dl className="metric-grid">
            <div>
              <dt>Minute</dt>
              <dd>{effectiveState.currentMinute ? `${effectiveState.currentMinute}'` : '-'}</dd>
            </div>
            <div>
              <dt>Statut</dt>
              <dd>
                <Link className="metric-link" to={`/calendar?status=${effectiveState.status}`}>
                  {formatMatchStatus(effectiveState.status, effectiveState.currentMinute)}
                </Link>
              </dd>
            </div>
            <div>
              <dt>Phase</dt>
              <dd>
                <Link className="metric-link" to={`/calendar?phase=${footballMatch.phaseType}`}>
                  {formatPhase(footballMatch.phaseType)}
                </Link>
              </dd>
            </div>
          </dl>
        </section>

        <PredictionPanel
          prediction={prediction}
          homeTeam={footballMatch.homeTeam}
          awayTeam={footballMatch.awayTeam}
        />

        <section className="players-panel dashboard-column--wide">
          <div className="players-panel__header">
            <h2>Effectifs des équipes</h2>
            <span>Joueurs renseignés</span>
          </div>

          <div className="players-grid">
            <TeamPlayersList team={footballMatch.homeTeam} players={homePlayers} />
            <TeamPlayersList team={footballMatch.awayTeam} players={awayPlayers} />
          </div>
        </section>
      </div>
    </section>
  )
}

function TeamPlayersList({ team, players }: { team: TeamSummary; players: Player[] }) {
  return (
    <article className="team-players">
      <Link to={team.id === null ? '/teams' : `/teams/${team.id}`}>
        {getTeamDisplayName(team)}
      </Link>

      {players.length > 0 ? (
        <ul>
          {players.map((player) => (
            <li key={player.id}>
              <span>{player.shirtNumber ?? '-'}</span>
              <strong>
                <Link to={`/players/${player.id}`}>{player.firstName} {player.lastName}</Link>
              </strong>
              <em>{formatPlayerPosition(player.position)}</em>
            </li>
          ))}
        </ul>
      ) : (
        <p>Joueurs indisponibles pour le moment.</p>
      )}
    </article>
  )
}
