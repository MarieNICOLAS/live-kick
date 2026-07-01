import { CalendarClock, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { FootballMatch, Prediction } from '../../types/football'
import { getTeamDisplayName } from '../../utils/displayNames'
import { formatMatchContext, formatMatchDateTime, isGroupPhase } from '../../utils/formatters'
import { FavoriteButton } from './FavoriteButton'
import { MatchReminderButton } from './MatchReminderButton'
import { PredictionSummary } from './PredictionSummary'
import { Scoreboard } from './Scoreboard'
import { StatusBadge } from './StatusBadge'

type MatchCardProps = {
  footballMatch: FootballMatch
  prediction?: Prediction
  venueLabel?: string
}

export function MatchCard({ footballMatch, prediction, venueLabel }: MatchCardProps) {
  const matchLabel = `${getTeamDisplayName(footballMatch.homeTeam)} contre ${getTeamDisplayName(footballMatch.awayTeam)}`
  const matchContext = formatMatchContext(footballMatch.groupCode, footballMatch.phaseType, footballMatch.phase)
  const groupLinkTarget =
    footballMatch.groupCode && isGroupPhase(footballMatch.phaseType ?? footballMatch.phase)
      ? `/groups/${footballMatch.groupCode}`
      : null

  return (
    <article className="match-card">
      <div className="match-card__meta">
        <StatusBadge status={footballMatch.status} minute={footballMatch.currentMinute} />
        {groupLinkTarget ? (
          <Link className="inline-card-link" to={groupLinkTarget}>
            {matchContext}
          </Link>
        ) : (
          <Link className="inline-card-link" to={`/calendar?phase=${footballMatch.phaseType}`}>
            {matchContext}
          </Link>
        )}
        <div className="match-card__actions">
          <MatchReminderButton footballMatch={footballMatch} />
          <FavoriteButton type="MATCH" targetId={footballMatch.id} label="Ajouter ce match aux favoris" />
        </div>
      </div>

      <div className="match-card__link">
        <Scoreboard footballMatch={footballMatch} compact />
      </div>

      <div className="match-card__footer">
        <span>
          <CalendarClock size={15} aria-hidden="true" />
          {formatMatchDateTime(footballMatch.matchDate, footballMatch.stadiumId)}
        </span>
        <span>
          <MapPin size={15} aria-hidden="true" />
          {venueLabel ?? 'Stade à confirmer'}
        </span>
      </div>

      {prediction ? (
        <PredictionSummary
          prediction={prediction}
          homeTeam={footballMatch.homeTeam}
          awayTeam={footballMatch.awayTeam}
        />
      ) : null}

      <Link className="card-overlay-link" to={`/matches/${footballMatch.id}`} aria-label={`Voir le détail : ${matchLabel}`} />
    </article>
  )
}
