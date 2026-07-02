import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { GitBranch } from 'lucide-react'
import { TeamFlag } from '../../components/football/TeamFlag'
import { ErrorState } from '../../components/ui/ErrorState'
import { Spinner } from '../../components/ui/Spinner'
import { demoFootballMatches } from '../../fixtures/liveKickDemoData'
import { getFootballMatches } from '../../services/matchService'
import type { FootballMatch, TeamSummary } from '../../types/football'
import { getTeamDisplayName } from '../../utils/displayNames'
import { formatMatchDateTime, getMatchTimestamp } from '../../utils/formatters'

type BracketRoundKey = 'ROUND_OF_32' | 'ROUND_OF_16' | 'QUARTER_FINAL' | 'SEMI_FINAL' | 'FINAL'

type BracketParticipant = {
  team: TeamSummary
  sourceMatchId: number | null
  label: string
}

type BracketNode = {
  key: string
  match: FootballMatch | null
  matchNumber: string
  roundKey: BracketRoundKey
  home: BracketParticipant
  away: BracketParticipant
  sourceKeys: string[]
  left: number
  top: number
}

type BracketConnection = {
  from: string
  to: string
}

const roundOrder: BracketRoundKey[] = ['ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL']
const roundLabels: Record<BracketRoundKey, string> = {
  ROUND_OF_32: 'Seizièmes',
  ROUND_OF_16: 'Huitièmes',
  QUARTER_FINAL: 'Quarts',
  SEMI_FINAL: 'Demi-finales',
  FINAL: 'Finale',
}

const cardWidth = 236
const cardHeight = 104
const roundGap = 74
const rowGap = 22

export function BracketPage() {
  const [footballMatches, setFootballMatches] = useState<FootballMatch[]>([])
  const [expandedMobileNodeKey, setExpandedMobileNodeKey] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadBracket() {
      try {
        const response = await getFootballMatches()

        if (!isMounted) {
          return
        }

        setFootballMatches(response)
        setError(null)
      } catch {
        if (!isMounted) {
          return
        }

        setFootballMatches(demoFootballMatches)
        setError("L'API du serveur est indisponible, affichage des données de démonstration.")
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadBracket()

    return () => {
      isMounted = false
    }
  }, [])

  const bracket = useMemo(() => buildBracket(footballMatches), [footballMatches])

  if (isLoading) {
    return (
      <section className="page-section">
        <Spinner label="Chargement du tableau final..." />
      </section>
    )
  }

  return (
    <section className="page-section bracket-page">
      {error ? <p className="data-warning">{error}</p> : null}

      <div className="page-heading">
        <span>
          <GitBranch size={16} aria-hidden="true" />
          Tableau compétition
        </span>
        <p>Suivez les relations entre les matchs et le chemin des vainqueurs vers la finale.</p>
      </div>

      {bracket.nodes.length === 0 ? (
        <ErrorState
          title="Tableau indisponible"
          message="Aucun match à élimination directe n'est encore disponible."
        />
      ) : (
        <div className="bracket-scroll" aria-label="Tableau final horizontal">
          <div className="bracket-board" style={{ width: bracket.width, height: bracket.height }}>
            <svg className="bracket-connectors" width={bracket.width} height={bracket.height} aria-hidden="true">
              {bracket.connections.map((connection) => {
                const fromNode = bracket.nodeMap.get(connection.from)
                const toNode = bracket.nodeMap.get(connection.to)

                if (!fromNode || !toNode) {
                  return null
                }

                const startX = fromNode.left + cardWidth
                const startY = fromNode.top + cardHeight / 2
                const endX = toNode.left
                const endY = toNode.top + cardHeight / 2
                const bend = Math.max(28, (endX - startX) / 2)

                return (
                  <path
                    d={`M ${startX} ${startY} C ${startX + bend} ${startY}, ${endX - bend} ${endY}, ${endX} ${endY}`}
                    key={`${connection.from}-${connection.to}`}
                  />
                )
              })}
            </svg>

            {roundOrder.map((roundKey, index) => (
              <h2 className="bracket-round-title" style={{ left: index * (cardWidth + roundGap), top: 0 }} key={roundKey}>
                {roundLabels[roundKey]}
              </h2>
            ))}

            {bracket.nodes.map((node) => (
              <BracketMatchCard
                isMobileExpanded={expandedMobileNodeKey === node.key}
                node={node}
                key={node.key}
                onMobileToggle={() => setExpandedMobileNodeKey((currentKey) => (currentKey === node.key ? null : node.key))}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function BracketMatchCard({
  isMobileExpanded,
  node,
  onMobileToggle,
}: {
  isMobileExpanded: boolean
  node: BracketNode
  onMobileToggle: () => void
}) {
  const content = (
    <>
      <div className="bracket-match__meta">
        <span>{node.matchNumber}</span>
        {node.match ? <time dateTime={node.match.matchDate}>{formatMatchDateTime(node.match.matchDate, node.match.stadiumId)}</time> : <span>À programmer</span>}
      </div>
      <BracketTeamRow participant={node.home} match={node.match} side="home" />
      <BracketTeamRow participant={node.away} match={node.match} side="away" />
    </>
  )
  const mobileLabel = `${node.home.label} contre ${node.away.label}`
  const mobileCard = (
    <button
      className={isMobileExpanded ? 'bracket-match-mobile expanded' : 'bracket-match-mobile'}
      style={{ left: node.left, top: node.top }}
      type="button"
      onClick={onMobileToggle}
      aria-expanded={isMobileExpanded}
      aria-label={`Afficher ${mobileLabel}`}
    >
      <div className="bracket-match-mobile__flags" aria-hidden="true">
        <BracketMobileFlag participant={node.home} />
        <BracketMobileFlag participant={node.away} />
      </div>
      {isMobileExpanded ? <div className="bracket-match-mobile__card">{content}</div> : null}
    </button>
  )

  if (node.match) {
    return (
      <>
        <Link className="bracket-match" style={{ left: node.left, top: node.top }} to={`/matches/${node.match.id}`}>
          {content}
        </Link>
        {mobileCard}
      </>
    )
  }

  return (
    <>
      <article className="bracket-match bracket-match--virtual" style={{ left: node.left, top: node.top }}>
        {content}
      </article>
      {mobileCard}
    </>
  )
}

function BracketMobileFlag({ participant }: { participant: BracketParticipant }) {
  if (participant.team.id === null) {
    return <span className="bracket-match-mobile__placeholder">{participant.label.slice(0, 1)}</span>
  }

  return <TeamFlag team={participant.team} compact />
}

function BracketTeamRow({
  match,
  participant,
  side,
}: {
  match: FootballMatch | null
  participant: BracketParticipant
  side: 'home' | 'away'
}) {
  const hasScore = match?.status === 'FINISHED' || match?.status === 'LIVE' || match?.status === 'HALF_TIME'
  const isWinner =
    match?.status === 'FINISHED' &&
    match.homeScore !== null &&
    match.awayScore !== null &&
    match.homeScore !== match.awayScore &&
    ((side === 'home' && match.homeScore > match.awayScore) || (side === 'away' && match.awayScore > match.homeScore))
  const score = hasScore ? (side === 'home' ? match?.homeScore : match?.awayScore) : null

  return (
    <div className={isWinner ? 'bracket-team winner' : 'bracket-team'}>
      {participant.team.id === null ? <span className="bracket-team__placeholder">{participant.label.slice(0, 3)}</span> : <TeamFlag team={participant.team} compact />}
      <span>{participant.label}</span>
      <strong>{score ?? '-'}</strong>
    </div>
  )
}

function buildBracket(footballMatches: FootballMatch[]) {
  const knockoutMatches = footballMatches
    .filter(isBracketMatch)
    .sort((first, second) => getMatchTimestamp(first.matchDate, first.stadiumId) - getMatchTimestamp(second.matchDate, second.stadiumId))
  const matchesById = new Map(knockoutMatches.map((match) => [match.id, match]))
  const rounds = new Map<BracketRoundKey, BracketNode[]>()

  roundOrder.forEach((roundKey) => rounds.set(roundKey, []))

  knockoutMatches.forEach((match) => {
    const roundKey = detectRoundKey(match)

    if (!roundKey) {
      return
    }

    rounds.get(roundKey)?.push(createNodeFromMatch(match, roundKey, matchesById))
  })

  roundOrder.forEach((roundKey, roundIndex) => {
    const nodes = rounds.get(roundKey) ?? []

    if (nodes.length > 0 || roundIndex === 0) {
      return
    }

    const previousRound = rounds.get(roundOrder[roundIndex - 1]) ?? []
    const generatedNodes = []

    for (let index = 0; index < previousRound.length; index += 2) {
      const firstSource = previousRound[index]
      const secondSource = previousRound[index + 1]

      if (!firstSource || !secondSource) {
        continue
      }

      generatedNodes.push(createVirtualNode(roundKey, generatedNodes.length, firstSource, secondSource))
    }

    rounds.set(roundKey, generatedNodes)
  })

  const nodes: BracketNode[] = []
  const connections: BracketConnection[] = []
  const nodeMap = new Map<string, BracketNode>()

  roundOrder.forEach((roundKey, roundIndex) => {
    const roundNodes = rounds.get(roundKey) ?? []
    const left = roundIndex * (cardWidth + roundGap)

    roundNodes.forEach((node, index) => {
      if (!node) {
        return
      }

      if (roundIndex > 0 && node.sourceKeys.length === 0) {
        const previousRound = rounds.get(roundOrder[roundIndex - 1]) ?? []
        const firstSource = previousRound[index * 2]
        const secondSource = previousRound[index * 2 + 1]

        node.sourceKeys = [firstSource?.key, secondSource?.key].filter((key): key is string => Boolean(key))
      }

      const sourceNodes = node.sourceKeys.map((sourceKey) => nodeMap.get(sourceKey)).filter((item): item is BracketNode => Boolean(item))
      const top =
        sourceNodes.length > 0
          ? sourceNodes.reduce((total, sourceNode) => total + sourceNode.top + cardHeight / 2, 0) / sourceNodes.length - cardHeight / 2
          : 44 + index * (cardHeight + rowGap)

      node.left = left
      node.top = Math.max(44, top)
      nodes.push(node)
      nodeMap.set(node.key, node)

      node.sourceKeys.forEach((sourceKey) => {
        connections.push({ from: sourceKey, to: node.key })
      })
    })
  })

  const width = roundOrder.length * cardWidth + (roundOrder.length - 1) * roundGap
  const height = Math.max(360, ...nodes.map((node) => node.top + cardHeight + 24))

  return { connections, height, nodeMap, nodes, width }
}

function createNodeFromMatch(match: FootballMatch, roundKey: BracketRoundKey, matchesById: Map<number, FootballMatch>): BracketNode {
  const homeSourceMatchId = getSourceMatchId(match.homeTeam?.name)
  const awaySourceMatchId = getSourceMatchId(match.awayTeam?.name)
  const homeSourceMatch = homeSourceMatchId === null ? null : matchesById.get(homeSourceMatchId) ?? null
  const awaySourceMatch = awaySourceMatchId === null ? null : matchesById.get(awaySourceMatchId) ?? null
  const sourceKeys = [homeSourceMatchId, awaySourceMatchId]
    .filter((id): id is number => id !== null)
    .map((id) => `match-${id}`)

  return {
    key: `match-${match.id}`,
    match,
    matchNumber: `Match ${match.id}`,
    roundKey,
    home: resolveParticipant(match.homeTeam, homeSourceMatchId, homeSourceMatch),
    away: resolveParticipant(match.awayTeam, awaySourceMatchId, awaySourceMatch),
    sourceKeys,
    left: 0,
    top: 0,
  }
}

function createVirtualNode(roundKey: BracketRoundKey, index: number, firstSource: BracketNode | null, secondSource: BracketNode | null): BracketNode {
  return {
    key: `virtual-${roundKey}-${index}`,
    match: null,
    matchNumber: `${roundLabels[roundKey]} ${index + 1}`,
    roundKey,
    home: buildVirtualParticipant(firstSource),
    away: buildVirtualParticipant(secondSource),
    sourceKeys: [firstSource?.key, secondSource?.key].filter((key): key is string => Boolean(key)),
    left: 0,
    top: 0,
  }
}

function buildVirtualParticipant(sourceNode: BracketNode | null): BracketParticipant {
  if (!sourceNode) {
    return buildPlaceholderParticipant('Vainqueur à confirmer', null)
  }

  const winner = getWinnerTeam(sourceNode.match)

  if (winner) {
    return {
      team: winner,
      sourceMatchId: sourceNode.match?.id ?? null,
      label: getTeamDisplayName(winner),
    }
  }

  const sourceMatchId = sourceNode.match?.id ?? null
  const label = sourceMatchId === null ? `Vainqueur ${sourceNode.matchNumber}` : `Vainqueur du match ${sourceMatchId}`

  return {
    team: { id: null, name: label, fifaCode: null, flagUrl: null },
    sourceMatchId,
    label,
  }
}

function resolveParticipant(team: TeamSummary | null, sourceMatchId: number | null, sourceMatch: FootballMatch | null): BracketParticipant {
  const winner = getWinnerTeam(sourceMatch)

  if (winner) {
    return {
      team: winner,
      sourceMatchId,
      label: getTeamDisplayName(winner),
    }
  }

  if (!team) {
    return buildPlaceholderParticipant(sourceMatchId === null ? 'Équipe à confirmer' : `Vainqueur du match ${sourceMatchId}`, sourceMatchId)
  }

  return {
    team,
    sourceMatchId,
    label: getTeamDisplayName(team),
  }
}

function buildPlaceholderParticipant(label: string, sourceMatchId: number | null): BracketParticipant {
  return {
    team: { id: null, name: label, fifaCode: null, flagUrl: null },
    sourceMatchId,
    label,
  }
}

function getWinnerTeam(match: FootballMatch | null) {
  if (!match || match.status !== 'FINISHED' || match.homeScore === null || match.awayScore === null || match.homeScore === match.awayScore) {
    return null
  }

  return match.homeScore > match.awayScore ? match.homeTeam : match.awayTeam
}

function getSourceMatchId(teamName: string | null | undefined) {
  if (!teamName) {
    return null
  }

  const match = teamName.match(/^(?:Winner Match|Winner M|Vainqueur du match|Vainqueur match|Vainqueur M)\s*(\d+)$/i)

  return match ? Number(match[1]) : null
}

function isBracketMatch(match: FootballMatch | null | undefined): match is FootballMatch {
  return Boolean(match?.id && match.matchDate && detectRoundKey(match) !== null)
}

function detectRoundKey(match: FootballMatch): BracketRoundKey | null {
  const normalizedPhase = normalizeRoundValue(`${match.phase} ${match.phaseType}`)

  if (normalizedPhase.includes('SEMI') || normalizedPhase.includes('SF')) {
    return 'SEMI_FINAL'
  }

  if (normalizedPhase.includes('QUARTER') || normalizedPhase.includes('QF')) {
    return 'QUARTER_FINAL'
  }

  if (normalizedPhase.includes('ROUND_OF_16') || normalizedPhase.includes('ROUND_16') || normalizedPhase.includes('R16')) {
    return 'ROUND_OF_16'
  }

  if (
    normalizedPhase.includes('ROUND_OF_32') ||
    normalizedPhase.includes('ROUND_32') ||
    normalizedPhase.includes('R32') ||
    normalizedPhase.includes('KNOCKOUT')
  ) {
    return 'ROUND_OF_32'
  }

  if (normalizedPhase.includes('FINAL') && !normalizedPhase.includes('THIRD')) {
    return 'FINAL'
  }

  return null
}

function normalizeRoundValue(value: string) {
  return value.trim().replaceAll('-', '_').replaceAll(' ', '_').toUpperCase()
}
