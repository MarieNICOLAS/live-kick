# Backend LiveKick

API Spring Boot de LiveKick 2026. Le backend centralise la logique metier, la validation, la securite, l'acces SQLite, le cache du fournisseur football externe et l'orchestration du service IA.

Le backend est la source de verite du MVP. Les reponses exposees au frontend passent par des DTO dedies.

## Stack

- Java 21.
- Spring Boot 3.5.
- Spring Web, Security, Validation, JDBC, Actuator et WebSocket.
- SQLite via `sqlite-jdbc`.
- Springdoc OpenAPI.
- Maven Wrapper.

## Structure

```text
src/main/java/com/livekick/
  config/        Configuration applicative, CORS, securite, integrations
  controller/    Endpoints REST publics du MVP
  dto/           Contrats API exposes au frontend
  exception/     Exceptions metier et gestion globale des erreurs
  integration/   Clients API football et service IA
  mapper/        Conversion payloads externes / DTO LiveKick
  repository/    Acces SQLite via Spring JDBC
  service/       Orchestration football, statistiques, live et predictions
```

## Configuration

Variables principales:

| Variable | Role | Defaut |
| --- | --- | --- |
| `BACKEND_PORT` | Port HTTP | `8080` |
| `BACKEND_CORS_ALLOWED_ORIGINS` | Origines CORS autorisees | `http://localhost:5173` |
| `JWT_SECRET` | Secret JWT | Valeur de dev a remplacer |
| `LIVEKICK_SQLITE_PATH` | Fichier SQLite du profil dev | `livekick.db` |
| `AI_SERVICE_BASE_URL` | URL du service IA | `http://127.0.0.1:8000` |
| `WORLD_CUP_2026_API_BASE_URL` | Fournisseur football externe | `https://worldcup26.ir` |
| `WORLD_CUP_2026_API_BEARER_TOKEN` | Token fournisseur optionnel | vide |

## Stockage SQLite

Le schema MVP est initialise depuis:

```text
src/main/resources/db/sqlite/schema.sql
```

Le profil `dev` cree par defaut `backend/livekick.db` lorsque le serveur est lance depuis le dossier `backend`.

SQLite contient les competitions, groupes, equipes, joueurs, stades, matchs, statistiques et predictions. Les favoris et preferences restent dans le `localStorage` du frontend.

## Donnees de seed

Des donnees de demonstration sont disponibles dans:

```text
src/main/resources/db/seed/seed-livekick-2026.sql
src/main/resources/db/seed/livekick-2026-seed.json
```

Importer le seed depuis la racine du repository:

```powershell
Copy-Item backend/livekick.db backend/livekick.backup.db -Force
python -c "import sqlite3, pathlib; con=sqlite3.connect('backend/livekick.db'); con.executescript(pathlib.Path('backend/src/main/resources/db/seed/seed-livekick-2026.sql').read_text(encoding='utf-8')); con.close()"
```

Verifier les volumes importes:

```powershell
python -c "import sqlite3; con=sqlite3.connect('backend/livekick.db'); cur=con.cursor(); [print(t, cur.execute('SELECT COUNT(*) FROM ' + t).fetchone()[0]) for t in ['competition_group','stadium','team','team_group','football_match','player','prediction']]; con.close()"
```

## Lancement

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Swagger UI: `http://localhost:8080/swagger-ui.html`.

## Endpoints MVP

```text
GET /api/v1/status
GET /api/v1/matches
GET /api/v1/matches/{id}
GET /api/v1/matches/{id}/live
GET /api/v1/matches/{id}/prediction
GET /api/v1/matches/predictions
GET /api/v1/matches/predictions/upcoming
GET /api/v1/teams
GET /api/v1/teams/{id}
GET /api/v1/teams/{id}/statistics
GET /api/v1/teams/compare?firstTeamId=1&secondTeamId=9
GET /api/v1/players
GET /api/v1/players?teamId=1
GET /api/v1/players/{id}
GET /api/v1/groups
GET /api/v1/groups/{code}
GET /api/v1/stadiums
GET /api/v1/stadiums/{id}
```

## Tests

```powershell
.\mvnw.cmd test
```

Le profil de test utilise une base SQLite en memoire et execute le schema MVP.

## Regles backend

- Valider tout payload entrant cote backend.
- Ne jamais exposer `passwordHash`, token, stack trace, requete SQL brute ou secret.
- Garder les tables SQL au singulier et les colonnes en `snake_case`.
- Garder les champs Java en `camelCase`.
- Isoler les integrations externes dans `integration/`.
- Exposer uniquement des DTO au frontend.
