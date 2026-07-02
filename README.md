# LiveKick 2026

LiveKick 2026 est une application web responsive dediee au suivi de la Coupe du Monde FIFA 2026.

La plateforme centralise les informations essentielles de la competition : calendrier, matchs, scores, groupes, classements, equipes, joueurs, stades, statistiques et predictions explicables.

## Fonctionnalites

* Consultation du calendrier et des matchs par statut, phase ou groupe.
* Detail d'un match avec score, statut, minute, equipes et stade.
* Suivi live par actualisation reguliere des donnees.
* Consultation des groupes, classements, equipes, joueurs et stades.
* Comparaison statistique entre equipes.
* Predictions IA avec probabilites, score probable, confiance et explication.
* Favoris, preferences, notifications locales et rappels cote navigateur.
* API REST documentee avec Swagger / OpenAPI.

## Architecture

```text
Frontend React
  -> Backend Spring Boot
      -> SQLite
      -> API World Cup 2026 externe
      -> Service IA FastAPI

Frontend React
  -> localStorage pour favoris, preferences, notifications et rappels locaux
```

Le backend est le point d'entree applicatif. Le frontend ne contacte jamais directement SQLite, l'API football externe ou le service IA.

## Stack technique

| Couche | Technologies |
| ----- | ----- |
| Frontend | React 19, TypeScript 6, Vite 8, React Router 7, Zustand, Axios, ESLint |
| Backend | Java 21, Spring Boot 3.5, Spring Web, Spring Security, Spring JDBC, Validation, Actuator, WebSocket |
| Donnees | SQLite, schema SQL initialise par le backend |
| IA | Python 3.12, FastAPI, Pydantic, LM Studio optionnel |
| API | REST / JSON, Springdoc OpenAPI, Swagger UI |
| DevOps | Docker Compose, GitHub Actions |

## Structure du depot

```text
live-kick/
  ai-service/        Service FastAPI de prediction
  backend/           API Spring Boot, securite, SQLite, integrations externes
  docs/              Documentation projet, architecture et contrats API
  frontend/          Application React/Vite
  infra/             Configuration Nginx et notes Docker
  .github/workflows/ Integration continue
  docker-compose.yml Orchestration locale des services
```

## Prerequis

* Java 21.
* Node.js 22 et npm.
* Python 3.12.
* Docker Desktop pour lancer la stack conteneurisee.
* LM Studio optionnel pour les predictions via modele local.

## Configuration

Copier les fichiers d'exemple :

```powershell
Copy-Item .env.example .env
Copy-Item frontend/.env.example frontend/.env
```

Variables principales :

| Variable | Role | Valeur locale courante |
| ----- | ----- | ----- |
| `BACKEND_PORT` | Port HTTP du backend | `8080` |
| `FRONTEND_PORT` | Port expose par Docker pour le frontend | `5173` |
| `BACKEND_CORS_ALLOWED_ORIGINS` | Origines autorisees par le backend | `http://localhost:5173` |
| `JWT_SECRET` | Secret JWT backend | A remplacer hors developpement |
| `LIVEKICK_SQLITE_PATH` | Chemin du fichier SQLite | `livekick.db` ou `/data/livekick.db` sous Docker |
| `AI_SERVICE_BASE_URL` | URL du service IA appelee par le backend | `http://localhost:8000` |
| `AI_SERVICE_PORT` | Port du service IA | `8000` |
| `WORLD_CUP_2026_API_BASE_URL` | URL du fournisseur football externe | `https://worldcup26.ir` |
| `WORLD_CUP_2026_API_BEARER_TOKEN` | Jeton API externe si necessaire | Vide en local |
| `VITE_API_BASE_URL` | URL API consommee par React | `http://localhost:8080/api/v1` |

Ne jamais versionner de secret reel.

## Lancement local

### Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Le backend expose l'API sur :

```text
http://localhost:8080/api/v1
```

Swagger UI :

```text
http://localhost:8080/swagger-ui.html
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Application :

```text
http://localhost:5173
```

### Service IA

```powershell
cd ai-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m fastapi dev app/main.py
```

Service :

```text
http://localhost:8000
```

Verification :

```text
GET http://localhost:8000/health
```

LM Studio peut etre lance en local sur `http://127.0.0.1:1234`. Si le modele local est indisponible, le service IA renvoie une prediction de fallback controlee.

## Lancement Docker

```powershell
docker compose --profile app up --build
```

Services exposes :

| Service | URL |
| ----- | ----- |
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:8080/api/v1` |
| Swagger UI | `http://localhost:8080/swagger-ui.html` |
| Service IA | `http://localhost:8000` |

Le volume Docker `sqlite_data` conserve la base SQLite montee dans `/data/livekick.db`.

## API principale

Base REST :

```text
/api/v1
```

Endpoints publics principaux :

| Methode | Endpoint | Description |
| ----- | ----- | ----- |
| `GET` | `/status` | Etat du backend |
| `GET` | `/matches` | Liste des matchs |
| `GET` | `/matches/{id}` | Detail d'un match |
| `GET` | `/matches/{id}/live` | Etat live d'un match |
| `GET` | `/matches/{id}/prediction` | Prediction IA d'un match |
| `GET` | `/matches/predictions` | Predictions connues |
| `GET` | `/matches/predictions/upcoming` | Predictions des matchs a venir |
| `GET` | `/teams` | Liste des equipes |
| `GET` | `/teams/{id}` | Detail d'une equipe |
| `GET` | `/teams/{id}/statistics` | Statistiques d'une equipe |
| `GET` | `/teams/compare` | Comparaison de deux equipes |
| `GET` | `/players` | Liste des joueurs |
| `GET` | `/players/{id}` | Detail d'un joueur |
| `GET` | `/groups` | Liste des groupes |
| `GET` | `/groups/{code}` | Detail d'un groupe |
| `GET` | `/stadiums` | Liste des stades |
| `GET` | `/stadiums/{id}` | Detail d'un stade |

Contrat detaille :

```text
docs/api/rest/football-data.md
```

## Qualite et verification

Backend :

```powershell
cd backend
.\mvnw.cmd verify
```

Frontend :

```powershell
cd frontend
npm run build
npm run lint
```

Service IA :

```powershell
cd ai-service
python -m compileall app
```

La CI GitHub Actions execute :

* verification Maven du backend ;
* build frontend ;
* compilation Python du service IA.

## Documentation

| Document | Role |
| ----- | ----- |
| `docs/LiveKick2026.md` | Dossier projet complet |
| `docs/ai-context/README.md` | Contexte obligatoire avant modification |
| `docs/api/rest/football-data.md` | Contrat REST football |
| `docs/architecture/mvp-storage.md` | Repartition SQLite / localStorage |
| `docs/architecture/stack-initialization.md` | Initialisation technique |

## Conventions

* Le backend est la source de verite metier.
* Les echanges API passent par des DTO.
* SQL en `snake_case`, tables au singulier.
* Java et TypeScript en `camelCase`.
* Le frontend ne contacte pas directement SQLite, l'API externe ou le service IA.
* Les favoris, preferences, notifications locales et rappels restent dans `localStorage`.
* Aucun secret, token ou detail technique sensible ne doit etre expose.
