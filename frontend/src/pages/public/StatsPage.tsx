import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Activity, BarChart3, Goal, ShieldCheck, TrendingUp } from 'lucide-react'
import { TeamFlag } from '../../components/football/TeamFlag'
import { Button } from '../../components/ui/Button'
import { ErrorState } from '../../components/ui/ErrorState'
import { Spinner } from '../../components/ui/Spinner'
import { demoFootballMatches, demoTeams } from '../../fixtures/liveKickDemoData'
import { compareTeams, getTeams } from '../../services/teamService'
import type { Team, TeamComparison, TeamFormMatch, TeamStatistics } from '../../types/football'
import { getTeamDisplayName } from '../../utils/displayNames'
import { formatMatchDateTime } from '../../utils/formatters'

type KnownTeam = Team & { id: number }

type ComparisonMetric = {
  key: string
  label: string
  helper: string
  firstValue: number
  secondValue: number
  format?: (value: number) => string
}

function isKnownTeam(team: Team): team is KnownTeam {
  return team.id !== null
}

function resultLabel(result: string) {
  const labels: Record<string, string> = {
    WIN: 'Victoire',
    DRAW: 'Nul',
    LOSS: 'Défaite',
  }

  return labels[result] ?? result
}

function resultClass(result: string) {
  const classes: Record<string, string> = {
    WIN: 'stats-form-result stats-form-result--win',
    DRAW: 'stats-form-result stats-form-result--draw',
    LOSS: 'stats-form-result stats-form-result--loss',
  }

  return classes[result] ?? 'stats-form-result'
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

function formatDecimal(value: number) {
  return value.toFixed(2).replace('.', ',')
}

function buildDemoStatistics(team: KnownTeam): TeamStatistics {
  const teamMatches = demoFootballMatches.filter(
    (footballMatch) => footballMatch.homeTeam.id === team.id || footballMatch.awayTeam.id === team.id,
  )
  const finishedMatches = teamMatches.filter(
    (footballMatch) =>
      footballMatch.status === 'FINISHED' &&
      footballMatch.homeScore !== null &&
      footballMatch.awayScore !== null,
  )

  const recentForm = finishedMatches.map<TeamFormMatch>((footballMatch) => {
    const isHome = footballMatch.homeTeam.id === team.id
    const teamScore = isHome ? footballMatch.homeScore : footballMatch.awayScore
    const opponentScore = isHome ? footballMatch.awayScore : footballMatch.homeScore
    const safeTeamScore = teamScore ?? 0
    const safeOpponentScore = opponentScore ?? 0
    const opponent = isHome ? footballMatch.awayTeam : footballMatch.homeTeam

    return {
      matchId: footballMatch.id,
      matchDate: footballMatch.matchDate,
      opponent,
      home: isHome,
      teamScore: safeTeamScore,
      opponentScore: safeOpponentScore,
      result: safeTeamScore === safeOpponentScore ? 'DRAW' : safeTeamScore > safeOpponentScore ? 'WIN' : 'LOSS',
    }
  })

  const goalsFor = recentForm.reduce((total, match) => total + (match.teamScore ?? 0), 0)
  const goalsAgainst = recentForm.reduce((total, match) => total + (match.opponentScore ?? 0), 0)
  const wins = recentForm.filter((match) => match.result === 'WIN').length
  const draws = recentForm.filter((match) => match.result === 'DRAW').length
  const losses = recentForm.filter((match) => match.result === 'LOSS').length
  const matchesPlayed = recentForm.length

  return {
    id: team.id,
    team,
    matchesPlayed,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    winRate: matchesPlayed === 0 ? 0 : Math.round((wins / matchesPlayed) * 100),
    averageGoalsFor: matchesPlayed === 0 ? 0 : goalsFor / matchesPlayed,
    averageGoalsAgainst: matchesPlayed === 0 ? 0 : goalsAgainst / matchesPlayed,
    recentForm,
  }
}

function buildDemoComparison(firstTeam: KnownTeam, secondTeam: KnownTeam): TeamComparison {
  return {
    firstTeamStatistics: buildDemoStatistics(firstTeam),
    secondTeamStatistics: buildDemoStatistics(secondTeam),
  }
}

function buildComparisonMetrics(comparison: TeamComparison): ComparisonMetric[] {
  const first = comparison.firstTeamStatistics
  const second = comparison.secondTeamStatistics

  return [
    {
      key: 'winRate',
      label: 'Taux de victoire',
      helper: 'Part des matchs gagnés',
      firstValue: first.winRate,
      secondValue: second.winRate,
      format: formatPercent,
    },
    {
      key: 'goalsFor',
      label: 'Buts marqués',
      helper: 'Volume offensif total',
      firstValue: first.goalsFor,
      secondValue: second.goalsFor,
    },
    {
      key: 'goalsAgainst',
      label: 'Buts encaissés',
      helper: 'Plus bas est meilleur',
      firstValue: first.goalsAgainst,
      secondValue: second.goalsAgainst,
    },
    {
      key: 'goalDifference',
      label: 'Différence de buts',
      helper: 'Écart entre buts marqués et encaissés',
      firstValue: first.goalDifference,
      secondValue: second.goalDifference,
    },
    {
      key: 'averageGoalsFor',
      label: 'Moyenne buts pour',
      helper: 'Buts marqués par match',
      firstValue: first.averageGoalsFor,
      secondValue: second.averageGoalsFor,
      format: formatDecimal,
    },
    {
      key: 'averageGoalsAgainst',
      label: 'Moyenne buts contre',
      helper: 'Buts encaissés par match',
      firstValue: first.averageGoalsAgainst,
      secondValue: second.averageGoalsAgainst,
      format: formatDecimal,
    },
  ]
}

function metricWinner(metric: ComparisonMetric) {
  if (metric.firstValue === metric.secondValue) {
    return 'equal'
  }

  if (metric.key === 'goalsAgainst' || metric.key === 'averageGoalsAgainst') {
    return metric.firstValue < metric.secondValue ? 'first' : 'second'
  }

  return metric.firstValue > metric.secondValue ? 'first' : 'second'
}

function getMetricWidth(value: number, oppositeValue: number) {
  const maximum = Math.max(Math.abs(value), Math.abs(oppositeValue), 1)
  return Math.max(8, Math.round((Math.abs(value) / maximum) * 100))
}

export function StatsPage() {
  const [teams, setTeams] = useState<KnownTeam[]>([])
  const [firstTeamId, setFirstTeamId] = useState<number | null>(null)
  const [secondTeamId, setSecondTeamId] = useState<number | null>(null)
  const [comparison, setComparison] = useState<TeamComparison | null>(null)
  const [isLoadingTeams, setIsLoadingTeams] = useState(true)
  const [isLoadingComparison, setIsLoadingComparison] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadTeams() {
      try {
        const teamsResponse = await getTeams()
        const knownTeams = teamsResponse.filter(isKnownTeam)

        if (!isMounted) {
          return
        }

        setTeams(knownTeams)
        setFirstTeamId(knownTeams[0]?.id ?? null)
        setSecondTeamId(knownTeams.find((team) => team.id !== knownTeams[0]?.id)?.id ?? null)
        setError(null)
      } catch {
        if (!isMounted) {
          return
        }

        const fallbackTeams = demoTeams.filter(isKnownTeam)
        setTeams(fallbackTeams)
        setFirstTeamId(fallbackTeams[0]?.id ?? null)
        setSecondTeamId(fallbackTeams.find((team) => team.id !== fallbackTeams[0]?.id)?.id ?? null)
        setError("L'API du serveur est indisponible, affichage des données de démonstration.")
      } finally {
        if (isMounted) {
          setIsLoadingTeams(false)
        }
      }
    }

    loadTeams()

    return () => {
      isMounted = false
    }
  }, [])

  const firstTeam = useMemo(
    () => teams.find((team) => team.id === firstTeamId) ?? null,
    [firstTeamId, teams],
  )
  const secondTeam = useMemo(
    () => teams.find((team) => team.id === secondTeamId) ?? null,
    [secondTeamId, teams],
  )

  async function handleComparisonSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!firstTeam || !secondTeam || firstTeam.id === secondTeam.id) {
      setComparison(null)
      return
    }

    setComparison(null)
    setIsLoadingComparison(true)

    try {
      const comparisonResponse = await compareTeams(firstTeam.id, secondTeam.id)
      setComparison(comparisonResponse)
    } catch {
      setComparison(buildDemoComparison(firstTeam, secondTeam))
    } finally {
      setIsLoadingComparison(false)
    }
  }

  function handleFirstTeamChange(value: number) {
    setFirstTeamId(value)
    setComparison(null)
  }

  function handleSecondTeamChange(value: number) {
    setSecondTeamId(value)
    setComparison(null)
  }

  const comparisonMetrics = useMemo(
    () => (comparison ? buildComparisonMetrics(comparison) : []),
    [comparison],
  )

  if (isLoadingTeams) {
    return (
      <section className="page-section">
        <Spinner label="Chargement des statistiques..." />
      </section>
    )
  }

  if (teams.length < 2) {
    return (
      <ErrorState
        title="Comparaison indisponible"
        message="Il faut au moins deux équipes connues pour comparer les statistiques."
      />
    )
  }

  return (
    <section className="stats-page">
      {error ? <p className="data-warning">{error}</p> : null}

      <div className="page-heading">
        <span>
          <BarChart3 size={16} aria-hidden="true" />
          Statistiques
        </span>
        <h1>Comparer deux équipes</h1>
        <p>Analysez la forme, l'efficacité offensive et la solidité défensive des équipes de la Coupe du Monde 2026.</p>
      </div>

      <form className="stats-selector-panel" onSubmit={handleComparisonSubmit}>
        <TeamSelect
          id="first-team"
          label="Équipe 1"
          teams={teams}
          value={firstTeamId}
          blockedTeamId={secondTeamId}
          disabled={isLoadingComparison}
          onChange={handleFirstTeamChange}
        />
        <span className="stats-versus">VS</span>
        <TeamSelect
          id="second-team"
          label="Équipe 2"
          teams={teams}
          value={secondTeamId}
          blockedTeamId={firstTeamId}
          disabled={isLoadingComparison}
          onChange={handleSecondTeamChange}
        />
        <div className="stats-selector-actions">
          <Button type="submit" disabled={!firstTeam || !secondTeam || firstTeam.id === secondTeam.id || isLoadingComparison}>
            {isLoadingComparison ? 'Calcul en cours...' : 'Comparer'}
          </Button>
        </div>
      </form>

      {isLoadingComparison ? <Spinner label="Calcul de la comparaison..." /> : null}

      {comparison && firstTeam && secondTeam ? (
        <>
          <section className="stats-duel">
            <TeamStatsCard statistics={comparison.firstTeamStatistics} />
            <div className="stats-duel__center">
              <Activity size={24} aria-hidden="true" />
              <strong>{comparison.firstTeamStatistics.matchesPlayed + comparison.secondTeamStatistics.matchesPlayed}</strong>
              <span>matchs analysés</span>
            </div>
            <TeamStatsCard statistics={comparison.secondTeamStatistics} align="right" />
          </section>

          <section className="stats-comparison-panel">
            <div className="section-title">
              <div>
                <span className="eyebrow">
                  <TrendingUp size={16} aria-hidden="true" />
                  Lecture rapide
                </span>
                <h2>Indicateurs comparés</h2>
              </div>
            </div>

            <div className="stats-metric-list">
              {comparisonMetrics.map((metric) => (
                <ComparisonMetricRow
                  firstTeam={comparison.firstTeamStatistics.team}
                  key={metric.key}
                  metric={metric}
                  secondTeam={comparison.secondTeamStatistics.team}
                />
              ))}
            </div>
          </section>

          <section className="stats-form-grid">
            <RecentFormPanel statistics={comparison.firstTeamStatistics} />
            <RecentFormPanel statistics={comparison.secondTeamStatistics} />
          </section>
        </>
      ) : null}
    </section>
  )
}

function TeamSelect({
  blockedTeamId,
  disabled = false,
  id,
  label,
  onChange,
  teams,
  value,
}: {
  blockedTeamId: number | null
  disabled?: boolean
  id: string
  label: string
  onChange: (value: number) => void
  teams: KnownTeam[]
  value: number | null
}) {
  return (
    <label className="stats-team-select" htmlFor={id}>
      <span>{label}</span>
      <select
        id={id}
        disabled={disabled}
        value={value ?? ''}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {teams.map((team) => (
          <option disabled={team.id === blockedTeamId} key={team.id} value={team.id}>
            {getTeamDisplayName(team)}
          </option>
        ))}
      </select>
    </label>
  )
}

function TeamStatsCard({ align = 'left', statistics }: { align?: 'left' | 'right'; statistics: TeamStatistics }) {
  const teamName = getTeamDisplayName(statistics.team)

  return (
    <article className={align === 'right' ? 'stats-team-card stats-team-card--right' : 'stats-team-card'}>
      <TeamFlag team={statistics.team} />
      <div>
        <span className="eyebrow">Groupe de données</span>
        <h2>{teamName}</h2>
        <Link to={statistics.team.id === null ? '/teams' : `/teams/${statistics.team.id}`}>Voir la fiche équipe</Link>
      </div>
      <dl>
        <div>
          <dt>Matchs</dt>
          <dd>{statistics.matchesPlayed}</dd>
        </div>
        <div>
          <dt>Victoires</dt>
          <dd>{statistics.wins}</dd>
        </div>
        <div>
          <dt>Nuls</dt>
          <dd>{statistics.draws}</dd>
        </div>
        <div>
          <dt>Défaites</dt>
          <dd>{statistics.losses}</dd>
        </div>
      </dl>
    </article>
  )
}

function ComparisonMetricRow({
  firstTeam,
  metric,
  secondTeam,
}: {
  firstTeam: TeamStatistics['team']
  metric: ComparisonMetric
  secondTeam: TeamStatistics['team']
}) {
  const winner = metricWinner(metric)
  const firstWidth = getMetricWidth(metric.firstValue, metric.secondValue)
  const secondWidth = getMetricWidth(metric.secondValue, metric.firstValue)
  const format = metric.format ?? ((value: number) => String(value))

  return (
    <article className="stats-metric-row">
      <div className="stats-metric-row__header">
        <div>
          <h3>{metric.label}</h3>
          <p>{metric.helper}</p>
        </div>
        <ShieldCheck size={18} aria-hidden="true" />
      </div>

      <div className="stats-metric-bars">
        <div className={winner === 'first' ? 'stats-metric-side stats-metric-side--winner' : 'stats-metric-side'}>
          <span>{getTeamDisplayName(firstTeam)}</span>
          <strong>{format(metric.firstValue)}</strong>
          <div aria-hidden="true">
            <i style={{ width: `${firstWidth}%` }} />
          </div>
        </div>

        <div className={winner === 'second' ? 'stats-metric-side stats-metric-side--winner' : 'stats-metric-side'}>
          <span>{getTeamDisplayName(secondTeam)}</span>
          <strong>{format(metric.secondValue)}</strong>
          <div aria-hidden="true">
            <i style={{ width: `${secondWidth}%` }} />
          </div>
        </div>
      </div>
    </article>
  )
}

function RecentFormPanel({ statistics }: { statistics: TeamStatistics }) {
  return (
    <section className="stats-form-panel">
      <div className="section-title">
        <div>
          <span className="eyebrow">
            <Goal size={16} aria-hidden="true" />
            Forme récente
          </span>
          <h2>{getTeamDisplayName(statistics.team)}</h2>
        </div>
      </div>

      {statistics.recentForm.length > 0 ? (
        <div className="stats-form-list">
          {statistics.recentForm.map((match) => (
            <Link className="stats-form-match" to={`/matches/${match.matchId}`} key={match.matchId}>
              <span className={resultClass(match.result)}>{resultLabel(match.result)}</span>
              <div>
                <strong>{match.home ? 'vs' : '@'} {getTeamDisplayName(match.opponent)}</strong>
                <time dateTime={match.matchDate}>{formatMatchDateTime(match.matchDate)}</time>
              </div>
              <em>
                {match.teamScore ?? '-'} - {match.opponentScore ?? '-'}
              </em>
            </Link>
          ))}
        </div>
      ) : (
        <p className="panel-copy">Aucun match terminé disponible pour calculer la forme récente.</p>
      )}
    </section>
  )
}
