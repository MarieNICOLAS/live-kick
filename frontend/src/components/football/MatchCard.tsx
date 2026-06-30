import { CalendarClock, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { FootballMatch } from '../../types/football'
import { getTeamDisplayName } from '../../utils/displayNames'
import { formatMatchDateTime } from '../../utils/formatters'
import { FavoriteButton } from './FavoriteButton'
import { Scoreboard } from './Scoreboard'
import { StatusBadge } from './StatusBadge'

type MatchCardProps = {
  footballMatch: FootballMatch
  venueLabel?: string
}

export function MatchCard({ footballMatch, venueLabel }: MatchCardProps) {
  const matchLabel = `${getTeamDisplayName(footballMatch.homeTeam)} contre ${getTeamDisplayName(footballMatch.awayTeam)}`

  return (
    <article className="match-card">
      <div className="match-card__meta">
        <StatusBadge status={footballMatch.status} minute={footballMatch.currentMinute} />
        {footballMatch.groupCode ? (
          <Link className="inline-card-link" to={`/groups/${footballMatch.groupCode}`}>
            Groupe {footballMatch.groupCode}
          </Link>
        ) : (
          <span>Groupe -</span>
        )}
        <FavoriteButton type="MATCH" targetId={footballMatch.id} label="Ajouter ce match aux favoris" />
      </div>

      <div className="match-card__link">
        <Scoreboard footballMatch={footballMatch} compact />
      </div>

      <div className="match-card__footer">
        <span>
          <CalendarClock size={15} aria-hidden="true" />
          {formatMatchDateTime(footballMatch.matchDate)}
        </span>
        <span>
          <MapPin size={15} aria-hidden="true" />
          {venueLabel ?? 'Stade à confirmer'}
        </span>
      </div>

      <Link className="card-overlay-link" to={`/matches/${footballMatch.id}`} aria-label={`Voir le détail : ${matchLabel}`} />
    </article>
  )
}
