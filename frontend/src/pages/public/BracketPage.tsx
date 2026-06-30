import { useEffect, useState } from 'react'
import { getMatches } from '../../services/matchService'
import type { FootballMatchDto } from '../../services/matchService'
import { Spinner } from '../../components/ui/Spinner'
import { ErrorState } from '../../components/ui/ErrorState'
import '../../styles/bracket.css'

const ROUNDS = [
  { phase: 'ROUND_OF_32', label: 'Huitièmes de finale' },
  { phase: 'ROUND_OF_16', label: 'Seizièmes de finale' },
  { phase: 'QUARTER_FINAL', label: 'Quarts de finale' },
  { phase: 'SEMI_FINAL', label: 'Demi-finales' },
  { phase: 'FINAL', label: 'Finale' },
]

export function BracketPage() {
  const [matches, setMatches] = useState<FootballMatchDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getMatches()
        setMatches(data)
      } catch {
        setError('Impossible de charger le tableau final.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <Spinner />
  if (error) return <ErrorState title="Erreur" message={error} />

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  }

  function teamLabel(team: FootballMatchDto['homeTeam']) {
    return team.name ?? 'À déterminer'
  }

  return (
    <div className="bracket-page">
      <h1 className="bracket-title">Tableau final</h1>
      <p className="bracket-subtitle">Phases à élimination directe — Coupe du Monde FIFA 2026</p>

      <div className="bracket-rounds">
        {ROUNDS.map((round) => {
          const roundMatches = matches.filter((m) => m.phase === round.phase)
          if (roundMatches.length === 0) return null

          return (
            <div key={round.phase} className="bracket-round">
              <h2 className="bracket-round-title">{round.label}</h2>
              <div className="bracket-round-matches">
                {roundMatches.map((match) => (
                  <div key={match.id} className={`bracket-match ${match.status === 'LIVE' ? 'live' : ''} ${match.status === 'FINISHED' ? 'finished' : ''}`}>
                    <div className="bracket-match-date">{formatDate(match.matchDate)}</div>
                    <div className="bracket-match-team">
                      {match.homeTeam.flagUrl && <img src={match.homeTeam.flagUrl} alt="" className="bracket-flag" />}
                      <span className={match.status === 'FINISHED' && (match.homeScore ?? 0) > (match.awayScore ?? 0) ? 'winner' : ''}>
                        {teamLabel(match.homeTeam)}
                      </span>
                      <span className="bracket-score">{match.status !== 'SCHEDULED' ? match.homeScore : ''}</span>
                    </div>
                    <div className="bracket-match-team">
                      {match.awayTeam.flagUrl && <img src={match.awayTeam.flagUrl} alt="" className="bracket-flag" />}
                      <span className={match.status === 'FINISHED' && (match.awayScore ?? 0) > (match.homeScore ?? 0) ? 'winner' : ''}>
                        {teamLabel(match.awayTeam)}
                      </span>
                      <span className="bracket-score">{match.status !== 'SCHEDULED' ? match.awayScore : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}