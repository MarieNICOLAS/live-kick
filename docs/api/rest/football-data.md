# Football Data REST API

Le backend LiveKick expose les donnees utiles de la Coupe du Monde 2026 via `/api/v1`.
Le frontend ne contacte jamais directement le fournisseur externe `worldcup26.ir`.

## Fournisseur externe

Source utilisee par le backend : `https://github.com/rezarahiminia/worldcup2026`.

Endpoints fournisseur consommes :

- `GET /get/teams`
- `GET /get/games`
- `GET /get/groups`
- `GET /get/stadiums`

Configuration backend :

- `WORLD_CUP_2026_API_BASE_URL`, defaut `https://worldcup26.ir`
- `WORLD_CUP_2026_API_BEARER_TOKEN`, optionnel si le fournisseur impose un JWT

## Endpoints LiveKick

### Teams

```http
GET /api/v1/teams
GET /api/v1/teams?group=A
GET /api/v1/teams/{id}
```

### Matches

```http
GET /api/v1/matches
GET /api/v1/matches?group=A
GET /api/v1/matches?phase=GROUP_STAGE
GET /api/v1/matches?status=FINISHED
GET /api/v1/matches/{id}
GET /api/v1/matches/{id}/live
```

Valeurs `phase` normalisees :

- `GROUP_STAGE`
- `ROUND_OF_32`
- `ROUND_OF_16`
- `QUARTER_FINAL`
- `SEMI_FINAL`
- `THIRD_PLACE`
- `FINAL`

Valeurs `status` normalisees :

- `SCHEDULED`
- `LIVE`
- `HALF_TIME`
- `FINISHED`
- `POSTPONED`
- `CANCELLED`

### Groups

```http
GET /api/v1/groups
GET /api/v1/groups/{code}
```

### Stadiums

```http
GET /api/v1/stadiums
GET /api/v1/stadiums/{id}
```