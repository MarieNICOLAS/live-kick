import type { Stadium, TeamSummary } from '../types/football'

const fallbackTeamNameByRawName: Record<string, string> = {
  Algeria: 'Alg\u00e9rie',
  Australia: 'Australie',
  Austria: 'Autriche',
  Belgium: 'Belgique',
  'Bosnia and Herzegovina': 'Bosnie-Herz\u00e9govine',
  Brazil: 'Br\u00e9sil',
  'Cape Verde': 'Cap-Vert',
  'Czech Republic': 'R\u00e9publique tch\u00e8que',
  'Democratic Republic of the Congo': 'R\u00e9publique d\u00e9mocratique du Congo',
  Ecuador: '\u00c9quateur',
  Egypt: '\u00c9gypte',
  Germany: 'Allemagne',
  Haiti: 'Ha\u00efti',
  Iraq: 'Irak',
  'Ivory Coast': "C\u00f4te d'Ivoire",
  Japan: 'Japon',
  Jordan: 'Jordanie',
  Mexico: 'Mexique',
  Morocco: 'Maroc',
  Netherlands: 'Pays-Bas',
  'New Zealand': 'Nouvelle-Z\u00e9lande',
  Norway: 'Norv\u00e8ge',
  'Saudi Arabia': 'Arabie saoudite',
  Scotland: '\u00c9cosse',
  Senegal: 'S\u00e9n\u00e9gal',
  'South Africa': 'Afrique du Sud',
  'South Korea': 'Cor\u00e9e du Sud',
  Spain: 'Espagne',
  Sweden: 'Su\u00e8de',
  Switzerland: 'Suisse',
  Turkey: 'Turquie',
  'United States': '\u00c9tats-Unis',
  Uzbekistan: 'Ouzb\u00e9kistan',
}

const fallbackStadiumNameByRawName: Record<string, string> = {
  'Arrowhead Stadium': 'Stade Arrowhead',
  'AT&T Stadium': 'Stade AT&T',
  'BC Place': 'Stade BC Place',
  'BMO Field': 'Stade BMO',
  'Estadio Akron': 'Stade Akron',
  'Estadio Banorte': 'Stade Banorte',
  'Estadio BBVA': 'Stade BBVA',
  'Gillette Stadium': 'Stade Gillette',
  'Hard Rock Stadium': 'Stade Hard Rock',
  "Levi's Stadium": "Stade Levi's",
  'Lincoln Financial Field': 'Stade Lincoln Financial Field',
  'Lumen Field': 'Stade Lumen',
  'Mercedes-Benz Stadium': 'Stade Mercedes-Benz',
  'MetLife Stadium': 'Stade MetLife',
  'NRG Stadium': 'Stade NRG',
  'SoFi Stadium': 'Stade SoFi',
}

const fallbackCityNameByRawName: Record<string, string> = {
  'Mexico City': 'Mexico',
  Philadelphia: 'Philadelphie',
  'San Francisco Bay Area (Santa Clara)': 'Baie de San Francisco (Santa Clara)',
}

function translatePlaceholderTeamName(name: string) {
  return name
    .replace(/^Winner Match (\d+)$/i, 'Vainqueur du match $1')
    .replace(/^Loser Match (\d+)$/i, 'Perdant du match $1')
}

export function getTeamDisplayName(team: TeamSummary) {
  return fallbackTeamNameByRawName[team.name] ?? translatePlaceholderTeamName(team.name)
}

export function getStadiumDisplayName(stadium: Stadium) {
  return fallbackStadiumNameByRawName[stadium.name] ?? stadium.name
}

export function getCityDisplayName(city: string) {
  return fallbackCityNameByRawName[city] ?? city
}
