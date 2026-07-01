import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BarChart3, Shield, Users } from 'lucide-react'
import { FavoriteButton } from '../../components/football/FavoriteButton'
import { MatchCard } from '../../components/football/MatchCard'
import { TeamFlag } from '../../components/football/TeamFlag'
import { Button } from '../../components/ui/Button'
import { ErrorState } from '../../components/ui/ErrorState'
import { Spinner } from '../../components/ui/Spinner'
import { demoFootballMatches, demoTeams } from '../../fixtures/liveKickDemoData'
import { getFootballMatches } from '../../services/matchService'
import { getPlayers } from '../../services/playerService'
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

export function TeamDetailPage() {
  const { id } = useParams()
  const [team, setTeam] = useState<Team | null>(null)
  const [teamStatistics, setTeamStatistics] = useState<TeamStatistics | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [footballMatches, setFootballMatches] = useState<FootballMatch[]>([])
  const [stadiumLabels, setStadiumLabels] = useState<StadiumLabelMap>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadTeamDetail() {
      if (!id) {
        setIsLoading(false)
        return
      }

      try {
        const [teamResponse, playersResponse, matchesResponse, stadiumsResponse, statisticsResponse] = await Promise.all([
          getTeamById(id),
          getPlayers(id),
          getFootballMatches(),
          getStadiums(),
          getTeamStatistics(id).catch(() => null),
        ])

        if (!isMounted) {
          return
        }

        setTeam(teamResponse)
        setPlayers(playersResponse)
        setFootballMatches(matchesResponse)
        setStadiumLabels(buildStadiumLabelMap(stadiumsResponse))
        setTeamStatistics(statisticsResponse)
      } catch {
        if (!isMounted) {
          return
        }

        const fallbackTeam = demoTeams.find((item) => String(item.id) === id) ?? null
        setTeam(fallbackTeam)
        setPlayers([])
        setFootballMatches(demoFootballMatches)
        setStadiumLabels({})
        setTeamStatistics(null)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadTeamDetail()

    return () => {
      isMounted = false
    }
  }, [id])

  const teamMatches = useMemo(
    () => {
      const teamId = team?.id
      return teamId == null ? [] : footballMatches.filter((footballMatch) => isTeamMatch(footballMatch, teamId)).sort(sortByRecentMatchDate)
    },
    [footballMatches, team],
  )

  if (isLoading) {
    return (
      <section className="page-section">
        <Spinner label="Chargement de l'équipe..." />
      </section>
    )
  }

  if (!team || team.id === null) {
    return (
      <ErrorState
        title="Équipe introuvable"
        message="Cette fiche équipe n'est pas disponible."
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
          <TeamFlag team={team} />
          <div>
            <span className="eyebrow">
              <Shield size={16} aria-hidden="true" />
              Équipe
            </span>
            <h1>{getTeamDisplayName(team)}</h1>
            <p>
              {team.country} · Groupe {team.groupCode ?? '-'} · {team.fifaCode ?? 'Code FIFA indisponible'}
            </p>
          </div>
        </div>
        <FavoriteButton type="TEAM" targetId={team.id} label={`Ajouter ${getTeamDisplayName(team)} aux favoris`} />
      </div>

      <div className="dashboard-grid">
        <section className="info-panel dashboard-column--wide">
          <h2>
            <BarChart3 size={20} aria-hidden="true" />
            Repères
          </h2>
          <dl className="metric-grid">
            <div>
              <dt>Matchs</dt>
              <dd>{teamStatistics?.matchesPlayed ?? teamMatches.length}</dd>
            </div>
            <div>
              <dt>Victoires</dt>
              <dd>{teamStatistics?.wins ?? '-'}</dd>
            </div>
            <div>
              <dt>Nuls</dt>
              <dd>{teamStatistics?.draws ?? '-'}</dd>
            </div>
            <div>
              <dt>Buts marqués</dt>
              <dd>{teamStatistics?.goalsFor ?? '-'}</dd>
            </div>
            <div>
              <dt>Buts encaissés</dt>
              <dd>{teamStatistics?.goalsAgainst ?? '-'}</dd>
            </div>
            <div>
              <dt>Taux victoire</dt>
              <dd>{teamStatistics ? `${Math.round(teamStatistics.winRate)}%` : '-'}</dd>
            </div>
          </dl>
        </section>

        <section className="info-panel">
          <h2>
            <Users size={20} aria-hidden="true" />
            Effectif
          </h2>
          <p className="panel-copy">{players.length} joueurs disponibles dans l'effectif.</p>
          {team.groupCode ? (
            <Button as={Link} to={`/groups/${team.groupCode}`} variant="secondary">
              Voir le groupe
            </Button>
          ) : null}
        </section>

        <section className="players-panel dashboard-column--wide">
          <div className="players-panel__header">
            <h2>Joueurs</h2>
            <span>{getTeamDisplayName(team)}</span>
          </div>
          {players.length > 0 ? (
            <div className="player-card-grid">
              {players.map((player) => (
                <Link className="player-card" to={`/players/${player.id}`} key={player.id}>
                  <span>{player.shirtNumber ?? '-'}</span>
                  <strong>
                    {player.firstName} {player.lastName}
                  </strong>
                  <em>{formatPlayerPosition(player.position)}</em>
                </Link>
              ))}
            </div>
          ) : (
            <p className="panel-copy">Aucun joueur disponible pour cette équipe.</p>
          )}
        </section>
      </div>

      <section className="page-section">
        <div className="section-title">
          <div>
            <span className="eyebrow">Calendrier</span>
            <h2>Matchs de l'équipe</h2>
          </div>
          <Link to="/calendar">Tous les matchs</Link>
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
