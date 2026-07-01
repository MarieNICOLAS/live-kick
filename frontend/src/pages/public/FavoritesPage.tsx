import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, MapPin, Star, Trophy, UserRound, Users } from 'lucide-react'
import { MatchCard } from '../../components/football/MatchCard'
import { TeamFlag } from '../../components/football/TeamFlag'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { getCompetitionGroups } from '../../services/groupService'
import { getFootballMatches } from '../../services/matchService'
import { getPlayerById } from '../../services/playerService'
import { getStadiums } from '../../services/stadiumService'
import { getTeams } from '../../services/teamService'
import { useFavoritesStore } from '../../stores/favoritesStore'
import type { CompetitionGroup, FootballMatch, Player, Stadium, Team } from '../../types/football'
import type { FavoriteType, LocalFavorite } from '../../types/local'
import { getCityDisplayName, getStadiumDisplayName, getTeamDisplayName } from '../../utils/displayNames'
import { formatPlayerPosition } from '../../utils/formatters'
import { buildStadiumLabelMap, getStadiumLabel, type StadiumLabelMap } from '../../utils/stadiumLabels'

type FavoriteFilter = 'ALL' | FavoriteType | 'OTHER'

const favoriteFilters: Array<{ label: string; value: FavoriteFilter }> = [
  { label: 'Tous', value: 'ALL' },
  { label: 'Matchs', value: 'MATCH' },
  { label: 'Equipes', value: 'TEAM' },
  { label: 'Joueurs', value: 'PLAYER' },
  { label: 'Autres', value: 'OTHER' },
]

function filterFavorite(favorite: LocalFavorite, filter: FavoriteFilter) {
  if (filter === 'ALL') {
    return true
  }

  if (filter === 'OTHER') {
    return favorite.type === 'GROUP' || favorite.type === 'STADIUM'
  }

  return favorite.type === filter
}

function formatFavoriteDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function FavoritesPage() {
  const favorites = useFavoritesStore((state) => state.favorites)
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite)
  const [filter, setFilter] = useState<FavoriteFilter>('ALL')
  const [footballMatches, setFootballMatches] = useState<FootballMatch[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [competitionGroups, setCompetitionGroups] = useState<CompetitionGroup[]>([])
  const [stadiums, setStadiums] = useState<Stadium[]>([])
  const [stadiumLabels, setStadiumLabels] = useState<StadiumLabelMap>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadFavoriteDetails() {
      if (favorites.length === 0) {
        return
      }

      setIsLoading(true)

      try {
        const [matchesResponse, teamsResponse, groupsResponse, stadiumsResponse] = await Promise.all([
          getFootballMatches(),
          getTeams(),
          getCompetitionGroups(),
          getStadiums(),
        ])

        const playerFavorites = favorites.filter((favorite) => favorite.type === 'PLAYER')
        const playersResponse = await Promise.all(
          playerFavorites.map((favorite) => getPlayerById(favorite.targetId).catch(() => null)),
        )

        if (!isMounted) {
          return
        }

        setFootballMatches(matchesResponse)
        setTeams(teamsResponse)
        setCompetitionGroups(groupsResponse)
        setStadiums(stadiumsResponse)
        setStadiumLabels(buildStadiumLabelMap(stadiumsResponse))
        setPlayers(playersResponse.filter((player): player is Player => player !== null))
        setError(null)
      } catch {
        if (isMounted) {
          setError("Impossible de charger le détail des favoris pour le moment.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadFavoriteDetails()

    return () => {
      isMounted = false
    }
  }, [favorites])

  const favoriteMatches = useMemo(
    () => new Map(footballMatches.map((footballMatch) => [String(footballMatch.id), footballMatch])),
    [footballMatches],
  )
  const favoriteTeams = useMemo(
    () =>
      new Map(
        teams.flatMap((team) => [
          [String(team.id), team],
          [team.name, team],
        ]),
      ),
    [teams],
  )
  const favoritePlayers = useMemo(
    () => new Map(players.map((player) => [String(player.id), player])),
    [players],
  )
  const favoriteGroups = useMemo(
    () => new Map(competitionGroups.map((group) => [group.code, group])),
    [competitionGroups],
  )
  const favoriteStadiums = useMemo(
    () => new Map(stadiums.map((stadium) => [String(stadium.id), stadium])),
    [stadiums],
  )

  const filteredFavorites = useMemo(
    () => favorites.filter((favorite) => filterFavorite(favorite, filter)),
    [favorites, filter],
  )

  if (favorites.length === 0) {
    return (
      <EmptyState
        title="Aucun favori"
        message="Ajoutez une équipe, un joueur ou un match pour personnaliser votre suivi LiveKick."
      />
    )
  }

  return (
    <section className="page-section">
      {error ? <p className="data-warning">{error}</p> : null}

      <div className="page-heading">
        <span>Favoris</span>
        <h1>Votre suivi</h1>
        <p>Retrouvez vos matchs, équipes et joueurs favoris sans chercher dans tout le calendrier.</p>
      </div>

      <div className="segmented-control" aria-label="Filtrer les favoris par type">
        {favoriteFilters.map((item) => (
          <button
            className={filter === item.value ? 'segmented-control__item active' : 'segmented-control__item'}
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading ? <Spinner label="Chargement des favoris..." /> : null}

      {!isLoading && filteredFavorites.length === 0 ? (
        <EmptyState
          title="Aucun favori dans ce filtre"
          message="Changez de filtre pour afficher le reste de votre suivi."
        />
      ) : null}

      <div className="favorite-list">
        {!isLoading
          ? filteredFavorites.map((favorite) => {
              if (favorite.type === 'MATCH') {
                const footballMatch = favoriteMatches.get(favorite.targetId)

                return footballMatch ? (
                  <MatchCard
                    key={`${favorite.type}-${favorite.targetId}`}
                    footballMatch={footballMatch}
                    venueLabel={getStadiumLabel(stadiumLabels, footballMatch.stadiumId)}
                  />
                ) : (
                  <MissingFavoriteCard favorite={favorite} key={`${favorite.type}-${favorite.targetId}`} onRemove={removeFavorite} />
                )
              }

              if (favorite.type === 'TEAM') {
                const team = favoriteTeams.get(favorite.targetId)

                return team ? (
                  <TeamFavoriteCard favorite={favorite} key={`${favorite.type}-${favorite.targetId}`} onRemove={removeFavorite} team={team} />
                ) : (
                  <MissingFavoriteCard favorite={favorite} key={`${favorite.type}-${favorite.targetId}`} onRemove={removeFavorite} />
                )
              }

              if (favorite.type === 'PLAYER') {
                const player = favoritePlayers.get(favorite.targetId)
                const team = player?.teamId ? favoriteTeams.get(String(player.teamId)) : undefined

                return player ? (
                  <PlayerFavoriteCard
                    favorite={favorite}
                    key={`${favorite.type}-${favorite.targetId}`}
                    onRemove={removeFavorite}
                    player={player}
                    team={team}
                  />
                ) : (
                  <MissingFavoriteCard favorite={favorite} key={`${favorite.type}-${favorite.targetId}`} onRemove={removeFavorite} />
                )
              }

              if (favorite.type === 'GROUP') {
                return (
                  <GroupFavoriteCard
                    favorite={favorite}
                    group={favoriteGroups.get(favorite.targetId)}
                    key={`${favorite.type}-${favorite.targetId}`}
                    onRemove={removeFavorite}
                  />
                )
              }

              return (
                <StadiumFavoriteCard
                  favorite={favorite}
                  key={`${favorite.type}-${favorite.targetId}`}
                  onRemove={removeFavorite}
                  stadium={favoriteStadiums.get(favorite.targetId)}
                />
              )
            })
          : null}
      </div>
    </section>
  )
}

function FavoriteCardShell({
  children,
  favorite,
  icon,
  onRemove,
  to,
}: {
  children: ReactNode
  favorite: LocalFavorite
  icon: React.ReactNode
  onRemove: (type: FavoriteType, targetId: string | number) => void
  to: string
}) {
  return (
    <article className="favorite-card">
      <div className="favorite-card__icon" aria-hidden="true">
        {icon}
      </div>
      <div className="favorite-card__body">{children}</div>
      <div className="favorite-card__side">
        <span>Ajouté le {formatFavoriteDate(favorite.addedAt)}</span>
        <button type="button" onClick={() => onRemove(favorite.type, favorite.targetId)}>
          Retirer
        </button>
      </div>
      <Link className="card-overlay-link" to={to} aria-label="Voir le détail du favori" />
    </article>
  )
}

function TeamFavoriteCard({
  favorite,
  onRemove,
  team,
}: {
  favorite: LocalFavorite
  onRemove: (type: FavoriteType, targetId: string | number) => void
  team: Team
}) {
  return (
    <FavoriteCardShell favorite={favorite} icon={<TeamFlag compact team={team} />} onRemove={onRemove} to={team.id === null ? '/teams' : `/teams/${team.id}`}>
      <span className="eyebrow">Equipe</span>
      <h2>{getTeamDisplayName(team)}</h2>
      <p>Groupe {team.groupCode ?? '-'} · {team.fifaCode ?? 'Code FIFA indisponible'}</p>
    </FavoriteCardShell>
  )
}

function PlayerFavoriteCard({
  favorite,
  onRemove,
  player,
  team,
}: {
  favorite: LocalFavorite
  onRemove: (type: FavoriteType, targetId: string | number) => void
  player: Player
  team?: Team
}) {
  return (
    <FavoriteCardShell favorite={favorite} icon={<UserRound size={22} />} onRemove={onRemove} to={`/players/${player.id}`}>
      <span className="eyebrow">Joueur</span>
      <h2>{player.firstName} {player.lastName}</h2>
      <p>
        {formatPlayerPosition(player.position)}
        {player.shirtNumber ? ` · Numéro ${player.shirtNumber}` : ''}
        {team ? ` · ${getTeamDisplayName(team)}` : ''}
      </p>
    </FavoriteCardShell>
  )
}

function GroupFavoriteCard({
  favorite,
  group,
  onRemove,
}: {
  favorite: LocalFavorite
  group?: CompetitionGroup
  onRemove: (type: FavoriteType, targetId: string | number) => void
}) {
  return (
    <FavoriteCardShell favorite={favorite} icon={<Trophy size={22} />} onRemove={onRemove} to={`/groups/${favorite.targetId}`}>
      <span className="eyebrow">Groupe</span>
      <h2>Groupe {group?.code ?? favorite.targetId}</h2>
      <p>{group ? `${group.standings.length} équipes suivies dans ce groupe.` : 'Détail du groupe à recharger.'}</p>
    </FavoriteCardShell>
  )
}

function StadiumFavoriteCard({
  favorite,
  onRemove,
  stadium,
}: {
  favorite: LocalFavorite
  onRemove: (type: FavoriteType, targetId: string | number) => void
  stadium?: Stadium
}) {
  return (
    <FavoriteCardShell favorite={favorite} icon={<MapPin size={22} />} onRemove={onRemove} to={`/stadiums/${favorite.targetId}`}>
      <span className="eyebrow">Stade</span>
      <h2>{stadium ? getStadiumDisplayName(stadium) : `Stade ${favorite.targetId}`}</h2>
      <p>{stadium ? `${getCityDisplayName(stadium.city)} · ${stadium.capacity?.toLocaleString('fr-FR') ?? 'Capacité inconnue'} places` : 'Détail du stade à recharger.'}</p>
    </FavoriteCardShell>
  )
}

function MissingFavoriteCard({
  favorite,
  onRemove,
}: {
  favorite: LocalFavorite
  onRemove: (type: FavoriteType, targetId: string | number) => void
}) {
  return (
    <article className="favorite-card favorite-card--missing">
      <div className="favorite-card__icon" aria-hidden="true">
        {favorite.type === 'MATCH' ? <CalendarDays size={22} /> : favorite.type === 'TEAM' ? <Users size={22} /> : <Star size={22} />}
      </div>
      <div className="favorite-card__body">
        <span className="eyebrow">Favori</span>
        <h2>{favorite.type}</h2>
        <p>Identifiant {favorite.targetId}. Le détail n'est pas disponible pour le moment.</p>
      </div>
      <div className="favorite-card__side">
        <span>Ajouté le {formatFavoriteDate(favorite.addedAt)}</span>
        <button type="button" onClick={() => onRemove(favorite.type, favorite.targetId)}>
          Retirer
        </button>
      </div>
    </article>
  )
}
