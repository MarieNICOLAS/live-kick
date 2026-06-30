import type { Stadium } from '../types/football'

export type StadiumLabelMap = Record<number, string>

export function buildStadiumLabelMap(stadiums: Stadium[]): StadiumLabelMap {
  return stadiums.reduce<StadiumLabelMap>((labels, stadium) => {
    labels[stadium.id] = [stadium.name, stadium.city].filter(Boolean).join(', ')
    return labels
  }, {})
}

export function getStadiumLabel(stadiumLabels: StadiumLabelMap, stadiumId: number | null) {
  if (stadiumId === null) {
    return 'Stade a confirmer'
  }

  return stadiumLabels[stadiumId] ?? 'Stade a confirmer'
}
