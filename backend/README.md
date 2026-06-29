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

## Cache API Football

Les donnees recues depuis l'API Football sont enregistrees dans SQLite. Si le
fournisseur externe est indisponible, le backend retourne la derniere version
locale disponible.

## Lancement

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Pour tester les points d'entrée http://localhost:8080/swagger-ui/index.html :

```text
GET /api/v1/status
GET /api/v1/matches
GET /api/v1/matches/{id}
GET /api/v1/matches/{id}/live
GET /api/v1/teams
GET /api/v1/groups
GET /api/v1/stadiums
GET /swagger-ui.html
```

## Tests

```powershell
.\mvnw.cmd test
```

Le profil de test utilise une base SQLite en memoire et execute le schema MVP.
