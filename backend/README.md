# Backend LiveKick

Le backend Spring Boot centralise l'API Football, le cache SQLite et
l'orchestration du service IA.

## Stockage SQLite

Le schema MVP est initialise depuis :

```text
src/main/resources/db/sqlite/schema.sql
```

Le profil `dev` cree par defaut `backend/livekick.db`. Son emplacement peut
etre configure avec `LIVEKICK_SQLITE_PATH`.

SQLite contient les equipes, joueurs, groupes, classements, stades, matchs et
predictions. Les favoris et preferences restent dans le `localStorage` du
frontend.

## Donnees de demonstration Coupe du Monde 2026

Des donnees de seed sont disponibles dans :

```text
src/main/resources/db/seed/seed-livekick-2026.sql
src/main/resources/db/seed/livekick-2026-seed.json
```

Les effectifs joueurs proviennent du PDF officiel FIFA Squad List :

```text
https://fdp.fifa.org/assetspublic/ce281/pdf/SquadLists-English.pdf
```

Le fichier SQL alimente les tables SQLite existantes sans les recreer. Depuis la
racine du repo, sauvegarder puis importer les donnees avec :

```powershell
Copy-Item backend/livekick.db backend/livekick.backup.db -Force
python -c "import sqlite3, pathlib; con=sqlite3.connect('backend/livekick.db'); con.executescript(pathlib.Path('backend/src/main/resources/db/seed/seed-livekick-2026.sql').read_text(encoding='utf-8')); con.close()"
```

Verifier les volumes importes :

```powershell
python -c "import sqlite3; con=sqlite3.connect('backend/livekick.db'); cur=con.cursor(); [print(t, cur.execute('SELECT COUNT(*) FROM ' + t).fetchone()[0]) for t in ['competition_group','stadium','team','team_group','football_match','player','prediction']]; con.close()"
```

## Cache API Football

Les donnees recues depuis l'API Football sont enregistrees dans SQLite. Si le
fournisseur externe est indisponible, le backend retourne la derniere version
locale disponible.

## Lancement

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Pour tester les points d'entree http://localhost:8080/swagger-ui/index.html :

```text
GET /api/v1/status
GET /api/v1/matches
GET /api/v1/matches/{id}
GET /api/v1/matches/{id}/live
GET /api/v1/matches/{id}/prediction
GET /api/v1/teams
GET /api/v1/teams/{id}/statistics
GET /api/v1/teams/compare?firstTeamId=1&secondTeamId=9
GET /api/v1/players
GET /api/v1/players?teamId=1
GET /api/v1/groups
GET /api/v1/stadiums
GET /swagger-ui.html
```

## Tests

```powershell
.\mvnw.cmd test
```

Le profil de test utilise une base SQLite en memoire et execute le schema MVP.
