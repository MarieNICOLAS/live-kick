import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Shirt, Trophy, UserRound } from 'lucide-react'
import { FavoriteButton } from '../../components/football/FavoriteButton'
import { MatchCard } from '../../components/football/MatchCard'
import { TeamFlag } from '../../components/football/TeamFlag'
import { Button } from '../../components/ui/Button'
import { ErrorState } from '../../components/ui/ErrorState'
import { Spinner } from '../../components/ui/Spinner'
import { demoFootballMatches, demoTeams } from '../../fixtures/liveKickDemoData'
import { getFootballMatches } from '../../services/matchService'
import { getPlayerById, getPlayers } from '../../services/playerService'
import { getStadiums } from '../../services/stadiumService'
import { getTeamById, getTeamStatistics } from '../../services/teamService'
import type { FootballMatch, Player, Team, TeamStatistics } from '../../types/football'
import { getTeamDisplayName } from '../../utils/displayNames'
import { formatPlayerPosition, getMatchTimestamp } from '../../utils/formatters'
import { buildStadiumLabelMap, getStadiumLabel, type StadiumLabelMap } from '../../utils/stadiumLabels'

function sortByRecentMatchDate(first: FootballMatch, second: FootballMatch) {
  return getMatchTimestamp(second.matchDate, second.stadiumId) - getMatchTimestamp(first.matchDate, first.stadiumId)
}

function isTeamMatch(footballMatch: FootballMatch, teamId: number) {
  return footballMatch.homeTeam.id === teamId || footballMatch.awayTeam.id === teamId
}

function formatBirthDate(value: string | null) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

export function PlayerDetailPage() {
  const { id } = useParams()
  const [player, setPlayer] = useState<Player | null>(null)
  const [team, setTeam] = useState<Team | null>(null)
  const [teamStatistics, setTeamStatistics] = useState<TeamStatistics | null>(null)
  const [teammates, setTeammates] = useState<Player[]>([])
  const [footballMatches, setFootballMatches] = useState<FootballMatch[]>([])
  const [stadiumLabels, setStadiumLabels] = useState<StadiumLabelMap>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadPlayerDetail() {
      if (!id) {
        setIsLoading(false)
        return
      }

      try {
        const playerResponse = await getPlayerById(id)
        const [teamResponse, teammatesResponse, matchesResponse, stadiumsResponse, statisticsResponse] = await Promise.all([
          playerResponse.teamId === null ? Promise.resolve(null) : getTeamById(playerResponse.teamId),
          playerResponse.teamId === null ? Promise.resolve([]) : getPlayers(playerResponse.teamId),
          getFootballMatches(),
          getStadiums(),
          playerResponse.teamId === null ? Promise.resolve(null) : getTeamStatistics(playerResponse.teamId).catch(() => null),
        ])

        if (!isMounted) {
          return
        }

        setPlayer(playerResponse)
        setTeam(teamResponse)
        setTeammates(teammatesResponse.filter((item) => item.id !== playerResponse.id).slice(0, 6))
        setFootballMatches(matchesResponse)
        setStadiumLabels(buildStadiumLabelMap(stadiumsResponse))
        setTeamStatistics(statisticsResponse)
      } catch {
        if (!isMounted) {
          return
        }

        setPlayer(null)
        setTeam(demoTeams[0] ?? null)
        setTeammates([])
        setFootballMatches(demoFootballMatches)
        setStadiumLabels({})
        setTeamStatistics(null)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadPlayerDetail()

    return () => {
      isMounted = false
    }
  }, [id])

  const teamMatches = useMemo(
    () => {
      const teamId = player?.teamId
      return teamId == null ? [] : footballMatches.filter((footballMatch) => isTeamMatch(footballMatch, teamId)).sort(sortByRecentMatchDate)
    },
    [footballMatches, player],
  )

  if (isLoading) {
    return (
      <section className="page-section">
        <Spinner label="Chargement du joueur..." />
      </section>
    )
  }

  if (!player) {
    return (
      <ErrorState
        title="Joueur introuvable"
        message="Cette fiche joueur n'est pas disponible."
        action={
          <Button as={Link} to="/teams">
            Retour aux équipes
          </Button>
        }
      />
    )
  }

  return (
    <section className="detail-page">
      <div className="entity-hero">
        <div className="entity-hero__identity">
          <span className="entity-icon">
            <UserRound size={26} aria-hidden="true" />
          </span>
          <div>
            <span className="eyebrow">Joueur</span>
            <h1>
              {player.firstName} {player.lastName}
            </h1>
            <p>
              {formatPlayerPosition(player.position)} · N° {player.shirtNumber ?? '-'} · {player.nationality ?? '-'}
            </p>
          </div>
        </div>
        <FavoriteButton type="PLAYER" targetId={player.id} label={`Ajouter ${player.firstName} ${player.lastName} aux favoris`} />
      </div>

      <div className="dashboard-grid">
        <section className="info-panel dashboard-column--wide">
          <h2>
            <Shirt size={20} aria-hidden="true" />
            Profil
          </h2>
          <dl className="metric-grid">
            <div>
              <dt>Poste</dt>
              <dd>{formatPlayerPosition(player.position)}</dd>
            </div>
            <div>
              <dt>Numéro</dt>
              <dd>{player.shirtNumber ?? '-'}</dd>
            </div>
            <div>
              <dt>Naissance</dt>
              <dd>{formatBirthDate(player.birthDate)}</dd>
            </div>
            <div>
              <dt>Nationalité</dt>
              <dd>{player.nationality ?? '-'}</dd>
            </div>
            <div>
              <dt>Matchs équipe</dt>
              <dd>{teamStatistics?.matchesPlayed ?? teamMatches.length}</dd>
            </div>
            <div>
              <dt>Taux victoire</dt>
              <dd>{teamStatistics ? `${Math.round(teamStatistics.winRate)}%` : '-'}</dd>
            </div>
          </dl>
        </section>

        <section className="info-panel">
          <h2>
            <Trophy size={20} aria-hidden="true" />
            Équipe
          </h2>
          {team ? (
            <Link className="entity-side-link" to={`/teams/${team.id}`}>
              <TeamFlag team={team} compact />
              <span>{getTeamDisplayName(team)}</span>
            </Link>
          ) : (
            <p className="panel-copy">Équipe indisponible.</p>
          )}
        </section>

        <section className="players-panel dashboard-column--wide">
          <div className="players-panel__header">
            <h2>Coéquipiers</h2>
            <span>{team ? getTeamDisplayName(team) : 'Équipe indisponible'}</span>
          </div>
          {teammates.length > 0 ? (
            <div className="player-card-grid player-card-grid--compact">
              {teammates.map((teammate) => (
                <Link className="player-card" to={`/players/${teammate.id}`} key={teammate.id}>
                  <span>{teammate.shirtNumber ?? '-'}</span>
                  <strong>
                    {teammate.firstName} {teammate.lastName}
                  </strong>
                  <em>{formatPlayerPosition(teammate.position)}</em>
                </Link>
              ))}
            </div>
          ) : (
            <p className="panel-copy">Aucun coéquipier disponible pour le moment.</p>
          )}
        </section>
      </div>

      <section className="page-section">
        <div className="section-title">
          <div>
            <span className="eyebrow">Calendrier</span>
            <h2>Matchs de son équipe</h2>
          </div>
          {team ? <Link to={`/teams/${team.id}`}>Voir l'équipe</Link> : <Link to="/teams">Voir les équipes</Link>}
        </div>

        {teamMatches.length > 0 ? (
          <div className="match-list match-list--grid">
            {teamMatches.map((footballMatch) => (
              <MatchCard
                footballMatch={footballMatch}
                key={footballMatch.id}
                venueLabel={getStadiumLabel(stadiumLabels, footballMatch.stadiumId)}
              />
            ))}
          </div>
        ) : (
          <ErrorState title="Aucun match" message="Aucune rencontre n'est associée à cette équipe pour le moment." />
        )}
      </section>
    </section>
  )
}
