import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CalendarDays, Trophy, Users } from 'lucide-react'
import { GroupStandingTable } from '../../components/football/GroupStandingTable'
import { MatchCard } from '../../components/football/MatchCard'
import { Button } from '../../components/ui/Button'
import { ErrorState } from '../../components/ui/ErrorState'
import { Spinner } from '../../components/ui/Spinner'
import { demoCompetitionGroups, demoFootballMatches } from '../../fixtures/liveKickDemoData'
import { getCompetitionGroupByCode } from '../../services/groupService'
import { getFootballMatches } from '../../services/matchService'
import { getStadiums } from '../../services/stadiumService'
import type { CompetitionGroup, FootballMatch } from '../../types/football'
import { getTeamDisplayName } from '../../utils/displayNames'
import { getMatchTimestamp } from '../../utils/formatters'
import { buildStadiumLabelMap, getStadiumLabel, type StadiumLabelMap } from '../../utils/stadiumLabels'

function sortByKickoffDate(first: FootballMatch, second: FootballMatch) {
  return getMatchTimestamp(first.matchDate, first.stadiumId) - getMatchTimestamp(second.matchDate, second.stadiumId)
}

export function GroupDetailPage() {
  const { code } = useParams()
  const normalizedCode = code?.toUpperCase() ?? ''
  const [group, setGroup] = useState<CompetitionGroup | null>(null)
  const [footballMatches, setFootballMatches] = useState<FootballMatch[]>([])
  const [stadiumLabels, setStadiumLabels] = useState<StadiumLabelMap>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadGroupDetail() {
      if (!normalizedCode) {
        setIsLoading(false)
        return
      }

      try {
        const [groupResponse, matchesResponse, stadiumsResponse] = await Promise.all([
          getCompetitionGroupByCode(normalizedCode),
          getFootballMatches({ group: normalizedCode }),
          getStadiums(),
        ])

        if (!isMounted) {
          return
        }

        setGroup(groupResponse)
        setFootballMatches(matchesResponse)
        setStadiumLabels(buildStadiumLabelMap(stadiumsResponse))
      } catch {
        if (!isMounted) {
          return
        }

        setGroup(demoCompetitionGroups.find((item) => item.code === normalizedCode) ?? null)
        setFootballMatches(demoFootballMatches.filter((footballMatch) => footballMatch.groupCode === normalizedCode))
        setStadiumLabels({})
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadGroupDetail()

    return () => {
      isMounted = false
    }
  }, [normalizedCode])

  const sortedMatches = useMemo(
    () => [...footballMatches].sort(sortByKickoffDate),
    [footballMatches],
  )

  const totalGoals = group?.standings.reduce((total, standing) => total + standing.goalsFor, 0) ?? 0
  const qualifiedTeams = group?.standings.slice(0, 2) ?? []

  if (isLoading) {
    return (
      <section className="page-section">
        <Spinner label="Chargement du groupe..." />
      </section>
    )
  }

  if (!group) {
    return (
      <ErrorState
        title="Groupe introuvable"
        message="Ce groupe n'est pas disponible dans les classements."
        action={
          <Button as={Link} to="/groups">
            Retour aux classements
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
            <Trophy size={26} aria-hidden="true" />
          </span>
          <div>
            <span className="eyebrow">Classement</span>
            <h1>Groupe {group.code}</h1>
            <p>{group.standings.length} équipes · {sortedMatches.length} matchs · {totalGoals} buts</p>
          </div>
        </div>
        <Button as={Link} to="/groups" variant="secondary">
          Tous les classements
        </Button>
      </div>

      <div className="dashboard-grid">
        <section className="info-panel dashboard-column--wide">
          <h2>
            <Users size={20} aria-hidden="true" />
            Qualification
          </h2>
          <div className="qualified-list">
            {qualifiedTeams.map((standing, index) => (
              <Link key={standing.team.id ?? standing.team.name} to={standing.team.id === null ? '/teams' : `/teams/${standing.team.id}`}>
                <span>{index + 1}</span>
                <strong>{getTeamDisplayName(standing.team)}</strong>
                <em>{standing.points} pts</em>
              </Link>
            ))}
          </div>
        </section>

        <section className="info-panel">
          <h2>
            <CalendarDays size={20} aria-hidden="true" />
            Calendrier
          </h2>
          <p className="panel-copy">Tous les matchs du groupe sont disponibles avec leur statut, score et stade.</p>
          <Button as={Link} to={`/calendar?group=${group.code}`} variant="secondary">
            Voir le calendrier
          </Button>
        </section>
      </div>

      <GroupStandingTable group={group} />

      <section className="page-section">
        <div className="section-title">
          <div>
            <span className="eyebrow">Matchs</span>
            <h2>Rencontres du groupe</h2>
          </div>
          <Link to="/calendar">Calendrier complet</Link>
        </div>

        {sortedMatches.length > 0 ? (
          <div className="match-list match-list--grid">
            {sortedMatches.map((footballMatch) => (
              <MatchCard
                footballMatch={footballMatch}
                key={footballMatch.id}
                venueLabel={getStadiumLabel(stadiumLabels, footballMatch.stadiumId)}
              />
            ))}
          </div>
        ) : (
          <ErrorState title="Aucun match" message="Aucune rencontre n'est encore associée à ce groupe." />
        )}
      </section>
    </section>
  )
}
