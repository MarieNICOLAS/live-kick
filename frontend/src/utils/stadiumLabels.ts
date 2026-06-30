import type { Stadium } from '../types/football'
import { getCityDisplayName, getStadiumDisplayName } from './displayNames'

export type StadiumLabelMap = Record<number, string>

export function buildStadiumLabelMap(stadiums: Stadium[]): StadiumLabelMap {
  return stadiums.reduce<StadiumLabelMap>((labels, stadium) => {
    labels[stadium.id] = [getStadiumDisplayName(stadium), getCityDisplayName(stadium.city)]
      .filter(Boolean)
      .join(', ')
    return labels
  }, {})
}

export function getStadiumLabel(stadiumLabels: StadiumLabelMap, stadiumId: number | null) {
  if (stadiumId === null) {
    return 'Stade à confirmer'
  }

  return stadiumLabels[stadiumId] ?? 'Stade à confirmer'
}
