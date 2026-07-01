# LiveKick 2026

LiveKick 2026 est une application web fullstack dediee au suivi intelligent de la Coupe du Monde FIFA 2026. Le MVP met l'accent sur la consultation rapide des matchs, groupes, equipes, joueurs, stades, scores live et predictions explicables.

## Perimetre MVP

- Accueil competition et matchs mis en avant.
- Calendrier, detail match, score, statut, minute et evenements live.
- Groupes, classements, equipes, joueurs et stades.
- Favoris, preferences locales et rappels cote navigateur.
- Predictions IA simples et explicables, orchestrees par le backend.
- API REST documentee, securisee et alignee sur les DTO du projet.

Hors MVP: streaming video, paris sportifs, fantasy football, reseau social, chatbot conversationnel et monetisation.

## Architecture

```text
Frontend React
  -> Backend Spring Boot
      -> SQLite
      -> API football externe
      -> Service IA FastAPI

Frontend
  -> localStorage pour favoris, preferences et rappels locaux
```

Le backend est la source de verite metier. Le frontend ne contacte jamais directement SQLite, le fournisseur football externe ou le service IA.

## Stack technique

| Couche | Stack |
| --- | --- |
| Frontend | React 19, TypeScript 6, Vite 8, React Router 7, Zustand, Axios |
| Backend | Java 21, Spring Boot 3.5, Spring Web, Spring Security, Spring JDBC |
| Donnees | SQLite, schema SQL versionne dans le backend |
| IA | Python 3.12, FastAPI, LM Studio avec fallback applicatif |
| Documentation API | Springdoc OpenAPI / Swagger UI |
| Industrialisation | Docker Compose, GitHub Actions |

## Structure du repository

```text
live-kick/
  ai-service/        Service FastAPI de prediction
  backend/           API Spring Boot, securite, SQLite, integrations
  docs/              Contexte IA, architecture et contrats API
  frontend/          Application React/Vite
  infra/             Configuration Nginx et notes Docker
  docker-compose.yml Orchestration locale des services applicatifs
```

Avant toute contribution, lire `docs/ai-context/README.md`. Ces documents fixent les noms canoniques, les contrats DTO, les conventions SQL/Java/TypeScript et la charte visuelle LiveKick.

## Prerequis

- Java 21.
- Node.js 22 et npm.
- Python 3.12.
- Docker Desktop, optionnel mais recommande pour lancer la stack complete.
- LM Studio, optionnel: si le modele local est indisponible, le service IA retourne une prediction de fallback.

## Configuration

Copier les fichiers d'exemple puis adapter les valeurs locales:

```powershell
Copy-Item .env.example .env
Copy-Item frontend/.env.example frontend/.env
```

Variables principales:

| Variable | Role | Defaut local |
| --- | --- | --- |
| `BACKEND_PORT` | Port HTTP du backend | `8080` |
| `FRONTEND_PORT` | Port expose par Docker pour le frontend | `5173` |
| `BACKEND_CORS_ALLOWED_ORIGINS` | Origines autorisees par Spring Security | `http://localhost:5173` |
| `JWT_SECRET` | Secret JWT de developpement | A remplacer hors local |
| `LIVEKICK_SQLITE_PATH` | Chemin du fichier SQLite backend | `livekick.db` |
| `AI_SERVICE_BASE_URL` | URL du service IA appelee par le backend | `http://localhost:8000` |
| `WORLD_CUP_2026_API_BASE_URL` | Fournisseur football externe | `https://worldcup26.ir` |
| `VITE_API_BASE_URL` | Base URL API consommee par React | `http://localhost:8080/api/v1` |

Ne jamais commiter de secret reel dans `.env`.

## Demarrage local

### Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Le profil `dev` cree automatiquement la base SQLite depuis `backend/src/main/resources/db/sqlite/schema.sql`.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

URL locale: `http://localhost:5173`.

### Service IA

```powershell
cd ai-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m fastapi dev app/main.py
```

URL locale: `http://localhost:8000`. Pour activer les predictions LM Studio, lancer le serveur local LM Studio sur `http://127.0.0.1:1234` avec le modele `google/gemma-4-e2b`.

## Demarrage Docker

```powershell
docker compose --profile app up --build
```

Services exposes:

| Service | URL |
| --- | --- |
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:8080/api/v1` |
| Swagger UI | `http://localhost:8080/swagger-ui.html` |
| AI service | `http://localhost:8000` |

Le volume Docker `sqlite_data` conserve `/data/livekick.db`.

## Commandes qualite

```powershell
cd backend
.\mvnw.cmd test

cd ..\frontend
npm run build
npm run lint

cd ..\ai-service
python -m compileall app
```

La CI GitHub execute la verification Maven du backend, le build frontend et la compilation Python du service IA.

## API principale

Base REST: `/api/v1`.

- `GET /status`
- `GET /matches`
- `GET /matches/{id}`
- `GET /matches/{id}/live`
- `GET /matches/{id}/prediction`
- `GET /matches/predictions`
- `GET /matches/predictions/upcoming`
- `GET /teams`
- `GET /teams/{id}`
- `GET /teams/{id}/statistics`
- `GET /teams/compare?firstTeamId=1&secondTeamId=9`
- `GET /players`
- `GET /players/{id}`
- `GET /groups`
- `GET /groups/{code}`
- `GET /stadiums`
- `GET /stadiums/{id}`

## Conventions projet

- Entites canoniques: `User`, `Team`, `Player`, `FootballMatch`, `MatchEvent`, `Prediction`, `Stadium`, `CompetitionGroup`.
- SQL en `snake_case`, tables au singulier, cles primaires prefixees par `id_`.
- Java et TypeScript en `camelCase`.
- Echanges API via DTO dedies.
- Aucune exposition de `passwordHash`, token, secret ou detail technique sensible.
- Validation backend systematique.
- Frontend conforme a la charte LiveKick, sans style starter Vite.

## Documentation utile

- `docs/ai-context/README.md`: contexte obligatoire avant modification.
- `docs/api/rest/football-data.md`: contrat REST football.
- `docs/architecture/mvp-storage.md`: repartition SQLite/localStorage.
- `docs/architecture/stack-initialization.md`: initialisation technique du MVP.
