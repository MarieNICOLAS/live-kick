import { CalendarClock, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { FootballMatch } from '../../types/football'
import { FavoriteButton } from './FavoriteButton'
import { Scoreboard } from './Scoreboard'
import { StatusBadge } from './StatusBadge'

type MatchCardProps = {
  footballMatch: FootballMatch
  venueLabel?: string
}

function formatMatchDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function MatchCard({ footballMatch, venueLabel }: MatchCardProps) {
  return (
    <article className="match-card">
      <div className="match-card__meta">
        <StatusBadge status={footballMatch.status} minute={footballMatch.currentMinute} />
        <span>Groupe {footballMatch.groupCode ?? '-'}</span>
        <FavoriteButton type="MATCH" targetId={footballMatch.id} label="Ajouter ce match aux favoris" />
      </div>

      <Link className="match-card__link" to={`/matches/${footballMatch.id}`}>
        <Scoreboard footballMatch={footballMatch} compact />
      </Link>

      <div className="match-card__footer">
        <span>
          <CalendarClock size={15} aria-hidden="true" />
          {formatMatchDate(footballMatch.matchDate)}
        </span>
        <span>
          <MapPin size={15} aria-hidden="true" />
          {venueLabel ?? 'Stade a confirmer'}
        </span>
      </div>
    </article>
  )
}
