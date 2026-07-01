export const standingColumnDefinitions = [
  {
    shortLabel: 'J',
    fullLabel: 'Matchs joués',
    help: 'Nombre de matchs déjà joués.',
  },
  {
    shortLabel: 'G',
    fullLabel: 'Victoires',
    help: 'Matchs gagnés.',
  },
  {
    shortLabel: 'N',
    fullLabel: 'Nuls',
    help: 'Matchs terminés à égalité.',
  },
  {
    shortLabel: 'P',
    fullLabel: 'Défaites',
    help: 'Matchs perdus.',
  },
  {
    shortLabel: 'BP',
    fullLabel: 'Buts pour',
    help: 'Buts marqués par l’équipe.',
  },
  {
    shortLabel: 'BC',
    fullLabel: 'Buts contre',
    help: 'Buts encaissés par l’équipe.',
  },
  {
    shortLabel: 'Diff',
    fullLabel: 'Différence de buts',
    help: 'Buts pour moins buts contre.',
  },
  {
    shortLabel: 'Pts',
    fullLabel: 'Points',
    help: 'Total de points au classement.',
  },
] as const

export function formatGoalDifference(value: number) {
  return value > 0 ? `+${value}` : String(value)
}
