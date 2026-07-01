import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Medal, Table2, Trophy } from 'lucide-react'
import { GroupStandingTable } from '../../components/football/GroupStandingTable'
import { TeamFlag } from '../../components/football/TeamFlag'
import { ErrorState } from '../../components/ui/ErrorState'
import { Spinner } from '../../components/ui/Spinner'
import { demoCompetitionGroups } from '../../fixtures/liveKickDemoData'
import { getCompetitionGroups } from '../../services/groupService'
import type { CompetitionGroup, GroupStanding } from '../../types/football'
import { getTeamDisplayName } from '../../utils/displayNames'
import { formatGoalDifference, standingColumnDefinitions } from '../../utils/standings'

type GroupFilter = 'ALL' | string

type OverallStanding = GroupStanding & {
  groupCode: string
}

function sortStanding(first: OverallStanding, second: OverallStanding) {
  return second.points - first.points
    || second.goalDifference - first.goalDifference
    || second.goalsFor - first.goalsFor
    || getTeamDisplayName(first.team).localeCompare(getTeamDisplayName(second.team), 'fr')
}

function countQualified(groups: CompetitionGroup[]) {
  return groups.reduce((total, group) => total + Math.min(2, group.standings.length), 0)
}

function getGroupRank(groups: CompetitionGroup[], standing: OverallStanding) {
  const group = groups.find((item) => item.code === standing.groupCode)
  return group?.standings.findIndex((item) => (item.team.id ?? item.team.name) === (standing.team.id ?? standing.team.name)) ?? -1
}

export function GroupsPage() {
  const [groups, setGroups] = useState<CompetitionGroup[]>([])
  const [groupFilter, setGroupFilter] = useState<GroupFilter>('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadGroups() {
      try {
        const response = await getCompetitionGroups()

        if (!isMounted) {
          return
        }

        setGroups(response)
        setError(null)
      } catch {
        if (!isMounted) {
          return
        }

        setGroups(demoCompetitionGroups)
        setError("L'API du serveur est indisponible, affichage des données de démonstration.")
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadGroups()

    return () => {
      isMounted = false
    }
  }, [])

  const visibleGroups = useMemo(
    () => groupFilter === 'ALL' ? groups : groups.filter((group) => group.code === groupFilter),
    [groupFilter, groups],
  )

  const overallStandings = useMemo(
    () =>
      groups
        .flatMap((group) => group.standings.map((standing) => ({ ...standing, groupCode: group.code })))
        .sort(sortStanding),
    [groups],
  )

  const totalTeams = overallStandings.length
  const totalGoals = overallStandings.reduce((total, standing) => total + standing.goalsFor, 0)
  const qualifiedCount = countQualified(groups)

  if (isLoading) {
    return (
      <section className="page-section">
        <Spinner label="Chargement des classements..." />
      </section>
    )
  }

  return (
    <section className="page-section standings-page">
      {error ? <p className="data-warning">{error}</p> : null}

      <div className="page-heading">
        <span>
          <Trophy size={16} aria-hidden="true" />
          Classements
        </span>
        <h1>Groupes Coupe du Monde 2026</h1>
        <p>Positions, points, différence de buts et dynamique de qualification par groupe.</p>
      </div>

      <div className="standing-summary-grid">
        <article className="standing-summary-card">
          <span>
            <Table2 size={18} aria-hidden="true" />
            Groupes
          </span>
          <strong>{groups.length}</strong>
          <p>Groupes suivis dans la compétition.</p>
        </article>
        <article className="standing-summary-card">
          <span>
            <Medal size={18} aria-hidden="true" />
            Qualification
          </span>
          <strong>{qualifiedCount}</strong>
          <p>Places directes estimées sur les deux premiers de chaque groupe.</p>
        </article>
        <article className="standing-summary-card">
          <span>Équipes</span>
          <strong>{totalTeams}</strong>
          <p>Nations présentes dans les classements.</p>
        </article>
        <article className="standing-summary-card">
          <span>Buts</span>
          <strong>{totalGoals}</strong>
          <p>Buts marqués cumulés dans les groupes.</p>
        </article>
      </div>

      <div className="segmented-control" aria-label="Filtrer le classement par groupe">
        <button
          className={groupFilter === 'ALL' ? 'segmented-control__item active' : 'segmented-control__item'}
          type="button"
          onClick={() => setGroupFilter('ALL')}
        >
          Tous
        </button>
        {groups.map((group) => (
          <button
            className={groupFilter === group.code ? 'segmented-control__item active' : 'segmented-control__item'}
            key={group.code}
            type="button"
            onClick={() => setGroupFilter(group.code)}
          >
            Groupe {group.code}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <ErrorState title="Aucun classement" message="Le serveur ne retourne pas encore de groupes exploitables." />
      ) : null}

      <section className="standing-guide" aria-label="Aide de lecture du classement">
        <div>
          <span className="eyebrow">Lecture rapide</span>
          <h2>Ce qu'il faut regarder d'abord</h2>
        </div>
        <ol>
          <li>
            <strong>Pts</strong>
            <span>Plus une équipe a de points, mieux elle est classée.</span>
          </li>
          <li>
            <strong>Diff</strong>
            <span>Départage les équipes proches : buts marqués moins buts encaissés.</span>
          </li>
          <li>
            <strong>Qualif.</strong>
            <span>Les deux premiers de chaque groupe sont mis en évidence.</span>
          </li>
        </ol>
      </section>

      {groupFilter === 'ALL' && overallStandings.length > 0 ? (
        <OverallStandingAccordion standings={overallStandings} groups={groups} />
      ) : null}

      <div className="group-grid">
        {visibleGroups.map((group) => (
          <GroupStandingTable key={group.code} group={group} variant="accordion" />
        ))}
      </div>
    </section>
  )
}

function OverallStandingAccordion({
  groups,
  standings,
}: {
  groups: CompetitionGroup[]
  standings: OverallStanding[]
}) {
  const firstStanding = standings[0]
  const [openStandingKey, setOpenStandingKey] = useState(() => getOverallStandingKey(firstStanding))

  useEffect(() => {
    setOpenStandingKey(getOverallStandingKey(firstStanding))
  }, [firstStanding])

  return (
    <section className="standing-table standing-table--accordion standing-table--overall" aria-labelledby="overall-standing">
      <div className="standing-table__header">
        <div>
          <h2 id="overall-standing">Classement général</h2>
          <span>Toutes les équipes, triées par points puis différence de buts</span>
        </div>
      </div>

      <div className="standing-accordion">
        {standings.map((standing, index) => {
          const standingKey = getOverallStandingKey(standing)
          const groupRank = getGroupRank(groups, standing)
          const isOpen = openStandingKey === standingKey
          const isQualified = groupRank >= 0 && groupRank < 2

          return (
            <article className={isOpen ? 'standing-accordion__item open' : 'standing-accordion__item'} key={standingKey}>
              <button
                className="standing-accordion__toggle"
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenStandingKey(isOpen ? '' : standingKey)}
              >
                <span className="standing-accordion__rank">
                  <span className={isQualified ? 'rank-badge rank-badge--qualified' : 'rank-badge'}>{index + 1}</span>
                  {isQualified ? <span className="standing-status">Qualif.</span> : null}
                </span>

                <span className="standing-accordion__team">
                  <TeamFlag team={standing.team} compact />
                  <strong>{getTeamDisplayName(standing.team)}</strong>
                </span>

                <ChevronDown className="standing-accordion__icon" size={18} aria-hidden="true" />
              </button>

              {isOpen ? (
                <dl className="standing-accordion__stats">
                  <div>
                    <dt>Groupe</dt>
                    <dd>
                      <Link className="metric-link" to={`/groups/${standing.groupCode}`}>
                        {standing.groupCode}
                      </Link>
                    </dd>
                  </div>
                  {standingColumnDefinitions.map((column) => (
                    <div key={column.shortLabel}>
                      <dt>{column.fullLabel}</dt>
                      <dd>{formatStandingValue(column.shortLabel, standing)}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}

function getOverallStandingKey(standing: OverallStanding | undefined) {
  return standing ? `${standing.groupCode}-${standing.team.id ?? standing.team.name}` : ''
}

function formatStandingValue(shortLabel: string, standing: OverallStanding) {
  if (shortLabel === 'J') {
    return standing.matchesPlayed
  }

  if (shortLabel === 'G') {
    return standing.wins
  }

  if (shortLabel === 'N') {
    return standing.draws
  }

  if (shortLabel === 'P') {
    return standing.losses
  }

  if (shortLabel === 'BP') {
    return standing.goalsFor
  }

  if (shortLabel === 'BC') {
    return standing.goalsAgainst
  }

  if (shortLabel === 'Diff') {
    return formatGoalDifference(standing.goalDifference)
  }

  return standing.points
}
