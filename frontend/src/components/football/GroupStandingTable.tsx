import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CompetitionGroup } from '../../types/football'
import { getTeamDisplayName } from '../../utils/displayNames'
import { formatGoalDifference, standingColumnDefinitions } from '../../utils/standings'
import { TeamFlag } from './TeamFlag'

type GroupStandingTableProps = {
  group: CompetitionGroup
  variant?: 'table' | 'accordion'
}

export function GroupStandingTable({ group, variant = 'table' }: GroupStandingTableProps) {
  if (variant === 'accordion') {
    return <GroupStandingAccordion group={group} />
  }

  return (
    <section className="standing-table" aria-labelledby={`group-${group.code}`}>
      <div className="standing-table__header">
        <div>
          <h2 id={`group-${group.code}`}>Groupe {group.code}</h2>
          <span>{group.standings.length} équipes</span>
        </div>
        <Link to={`/groups/${group.code}`}>Détail</Link>
      </div>

      <div className="standing-table__scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Équipe</th>
              {standingColumnDefinitions.map((column) => (
                <th scope="col" key={column.shortLabel}>
                  <abbr title={column.fullLabel}>{column.shortLabel}</abbr>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {group.standings.map((standing, index) => (
              <tr key={standing.team.id ?? standing.team.name}>
                <td data-label="Position">
                  <span className="rank-cell">
                    <span className={index < 2 ? 'rank-badge rank-badge--qualified' : 'rank-badge'}>{index + 1}</span>
                    {index < 2 ? <span className="standing-status">Qualif.</span> : null}
                  </span>
                </td>
                <td data-label="Équipe">
                  <Link className="standing-team" to={standing.team.id === null ? '/teams' : `/teams/${standing.team.id}`}>
                    <TeamFlag team={standing.team} compact />
                    {getTeamDisplayName(standing.team)}
                  </Link>
                </td>
                <td data-label="Matchs joués">{standing.matchesPlayed}</td>
                <td data-label="Victoires">{standing.wins}</td>
                <td data-label="Nuls">{standing.draws}</td>
                <td data-label="Défaites">{standing.losses}</td>
                <td data-label="Buts marqués">{standing.goalsFor}</td>
                <td data-label="Buts encaissés">{standing.goalsAgainst}</td>
                <td data-label="Différence">{formatGoalDifference(standing.goalDifference)}</td>
                <td data-label="Points">
                  <strong>{standing.points}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details className="standing-help">
        <summary>Lire le classement</summary>
        <dl>
          {standingColumnDefinitions.map((column) => (
            <div key={column.shortLabel}>
              <dt>{column.shortLabel}</dt>
              <dd>
                <strong>{column.fullLabel}</strong>
                <span>{column.help}</span>
              </dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  )
}

function GroupStandingAccordion({ group }: { group: CompetitionGroup }) {
  const firstStanding = group.standings[0]
  const [openStandingKey, setOpenStandingKey] = useState(() => getStandingKey(firstStanding))

  useEffect(() => {
    setOpenStandingKey(getStandingKey(firstStanding))
  }, [firstStanding])

  return (
    <section className="standing-table standing-table--accordion" aria-labelledby={`group-${group.code}`}>
      <div className="standing-table__header">
        <div>
          <h2 id={`group-${group.code}`}>Groupe {group.code}</h2>
          <span>{group.standings.length} équipes</span>
        </div>
        <Link to={`/groups/${group.code}`}>Détail</Link>
      </div>

      <div className="standing-accordion">
        {group.standings.map((standing, index) => {
          const standingKey = getStandingKey(standing)
          const isOpen = openStandingKey === standingKey
          const isQualified = index < 2

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

function getStandingKey(standing: CompetitionGroup['standings'][number] | undefined) {
  return String(standing?.team.id ?? standing?.team.name ?? '')
}

function formatStandingValue(shortLabel: string, standing: CompetitionGroup['standings'][number]) {
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
