# LiveKick 2026 - Contrat REST football

Ce document decrit les endpoints REST football actuellement exposes par le backend Spring Boot. Il sert de reference pour le frontend React et pour toute evolution de l'API.

## Base URL

En local, le frontend consomme par defaut :

```text
http://localhost:8080/api/v1
```

La valeur peut etre surchargee cote frontend avec :

```text
VITE_API_BASE_URL
```

Tous les endpoints publics ci-dessous sont servis par le backend. Le frontend ne doit jamais appeler directement SQLite, l'API football externe ou le service IA.

## Regles de contrat

* Format d'echange : JSON.
* Nommage JSON : `camelCase`.
* Identifiants : nombres entiers.
* Dates : chaines ISO lorsque la donnee est disponible.
* Scores et minutes : `null` si la donnee n'est pas connue.
* Les reponses exposent des DTO, jamais de tables SQL brutes.

## Endpoints matchs

### `GET /matches`

Retourne la liste des matchs.

Parametres optionnels :

| Parametre | Type | Description |
| ----- | ----- | ----- |
| `group` | string | Filtre par groupe, par exemple `A` |
| `phase` | string | Filtre par phase |
| `status` | string | Filtre par statut |

Reponse :

```json
[
  {
    "id": 1,
    "matchDate": "2026-06-11T21:00:00",
    "status": "SCHEDULED",
    "phase": "Group stage",
    "phaseType": "GROUP",
    "groupCode": "A",
    "matchday": 1,
    "homeScore": null,
    "awayScore": null,
    "currentMinute": null,
    "homeTeam": {
      "id": 1,
      "name": "Canada",
      "fifaCode": "CAN",
      "flagUrl": null
    },
    "awayTeam": {
      "id": 2,
      "name": "Mexico",
      "fifaCode": "MEX",
      "flagUrl": null
    },
    "stadiumId": 1
  }
]
```

### `GET /matches/{id}`

Retourne le detail d'un match.

Reponse : `FootballMatchDto`.

### `GET /matches/{id}/live`

Retourne l'etat live simplifie d'un match.

Usage principal : actualisation reguliere cote frontend.

### `GET /matches/{id}/prediction`

Retourne la prediction IA pour un match.

Reponse :

```json
{
  "id": 1,
  "matchId": 1,
  "homeWinProbability": 42.0,
  "drawProbability": 28.0,
  "awayWinProbability": 30.0,
  "predictedHomeScore": 2,
  "predictedAwayScore": 1,
  "confidenceScore": 74.0,
  "modelName": "livekick-ai",
  "explanation": "Prediction basee sur les donnees disponibles.",
  "generatedAt": "2026-06-01T12:00:00Z"
}
```

### `GET /matches/predictions`

Retourne les predictions connues.

### `GET /matches/predictions/upcoming`

Retourne les predictions connues pour les matchs a venir.

## Endpoints equipes

### `GET /teams`

Retourne la liste des equipes.

Parametre optionnel :

| Parametre | Type | Description |
| ----- | ----- | ----- |
| `group` | string | Filtre les equipes par groupe |

### `GET /teams/{id}`

Retourne le detail d'une equipe.

### `GET /teams/{id}/statistics`

Retourne les statistiques agregees d'une equipe.

### `GET /teams/compare`

Compare deux equipes.

Parametres obligatoires :

| Parametre | Type | Description |
| ----- | ----- | ----- |
| `firstTeamId` | number | Identifiant de la premiere equipe |
| `secondTeamId` | number | Identifiant de la seconde equipe |

Exemple :

```text
GET /api/v1/teams/compare?firstTeamId=1&secondTeamId=2
```

## Endpoints joueurs

### `GET /players`

Retourne la liste des joueurs.

### `GET /players/{id}`

Retourne le detail d'un joueur.

## Endpoints groupes

### `GET /groups`

Retourne la liste des groupes de competition avec leurs classements.

### `GET /groups/{code}`

Retourne le detail d'un groupe.

Exemple :

```text
GET /api/v1/groups/A
```

## Endpoints stades

### `GET /stadiums`

Retourne la liste des stades.

### `GET /stadiums/{id}`

Retourne le detail d'un stade.

## Endpoint statut

### `GET /status`

Retourne l'etat applicatif du backend.

Usage principal : verification rapide de disponibilite.

## Statuts match

Les statuts utilises cote frontend sont :

```text
SCHEDULED
LIVE
HALF_TIME
FINISHED
POSTPONED
```

Toute nouvelle valeur doit etre ajoutee cote backend, puis synchronisee dans `frontend/src/types/football.ts`.

## Erreurs

Les erreurs doivent rester lisibles et ne jamais exposer :

* stack trace ;
* requete SQL brute ;
* secret ou token ;
* detail interne d'un service externe.

Le backend possede une gestion centralisee des exceptions dans `GlobalExceptionHandler`.
