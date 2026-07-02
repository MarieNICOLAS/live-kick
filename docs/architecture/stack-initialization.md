# LiveKick 2026 - Initialisation technique du MVP

Ce document decrit la stack technique actuelle et les points d'initialisation du projet.

## Structure du depot

```text
live-kick
  backend
  frontend
  ai-service
  docs
  infra
  .github/workflows
  docker-compose.yml
```

## Frontend

Localisation :

```text
frontend
```

Stack :

| Element | Version / outil |
| ----- | ----- |
| Framework | React 19 |
| Langage | TypeScript 6 |
| Bundler | Vite 8 |
| Routing | React Router 7 |
| Etat global | Zustand |
| HTTP | Axios |
| Qualite | ESLint |

Commandes principales :

```text
npm install
npm run dev
npm run build
```

Variable principale :

```text
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

Point d'entree API :

```text
frontend/src/services/apiClient.ts
```

## Backend

Localisation :

```text
backend
```

Stack :

| Element | Version / outil |
| ----- | ----- |
| Langage | Java 21 |
| Framework | Spring Boot 3.5 |
| API | Spring Web |
| Securite | Spring Security, OAuth2 Resource Server, JWT decoder |
| Donnees | Spring JDBC |
| Base | SQLite |
| Documentation API | Springdoc OpenAPI |
| Build | Maven Wrapper |

Commandes principales :

```text
./mvnw spring-boot:run
./mvnw verify
```

Sous Windows :

```text
mvnw.cmd spring-boot:run
mvnw.cmd verify
```

Base API :

```text
/api/v1
```

Endpoints techniques :

```text
/api/v1/status
/actuator/health
/api-docs
/swagger-ui.html
```

Variables principales :

```text
BACKEND_PORT=8080
BACKEND_CORS_ALLOWED_ORIGINS=http://localhost:5173
JWT_SECRET=replace-with-a-strong-secret-of-at-least-32-characters
LIVEKICK_SQLITE_PATH=/data/livekick.db
AI_SERVICE_BASE_URL=http://127.0.0.1:8000
WORLD_CUP_2026_API_BASE_URL=https://worldcup26.ir
WORLD_CUP_2026_API_BEARER_TOKEN=
```

Schema SQLite :

```text
backend/src/main/resources/db/sqlite/schema.sql
```

## Service IA

Localisation :

```text
ai-service
```

Stack :

| Element | Outil |
| ----- | ----- |
| Langage | Python |
| API | FastAPI |
| Serveur | Uvicorn |
| Client modele local | LM Studio |

Commandes principales :

```text
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Le backend appelle ce service via :

```text
AI_SERVICE_BASE_URL
```

Le frontend ne doit jamais appeler le service IA directement.

## Docker Compose

Le fichier `docker-compose.yml` permet de lancer les services applicatifs avec le profil `app`.

Services declares :

| Service | Role |
| ----- | ----- |
| `frontend` | Interface React servie par Nginx |
| `backend` | API Spring Boot |
| `ai-service` | API FastAPI |
| `sqlite_data` | Volume de persistance SQLite |

Commande :

```text
docker compose --profile app up --build
```

Ports par defaut :

| Service | Port |
| ----- | ----- |
| Frontend | `5173` |
| Backend | `8080` |
| AI service | `8000` |

## Integration continue

Workflow :

```text
.github/workflows/ci.yml
```

Verifications actuelles :

| Brique | Verification |
| ----- | ----- |
| Backend | Java 21 puis `./mvnw --batch-mode verify` |
| Frontend | Node.js 22 puis `npm ci` et `npm run build` |
| AI service | Python 3.12 puis `pip install -r requirements.txt` et `python -m compileall app` |

Declencheurs :

* push sur `main` ou `dev` ;
* pull request vers `main` ou `dev` ;
* lancement manuel `workflow_dispatch`.

## Ordre de lancement local recommande

1. Lancer le service IA si les predictions doivent appeler le moteur Python.
2. Lancer le backend Spring Boot.
3. Lancer le frontend Vite.
4. Verifier `/api/v1/status` et l'affichage frontend.

## Points de vigilance

* Le backend initialise SQLite avec `schema.sql`.
* Le frontend consomme uniquement `/api/v1`.
* Les favoris et preferences restent dans `localStorage`.
* Les secrets restent dans les variables d'environnement.
* Le WebSocket backend est configure sous `/ws/live`, mais le live fonctionnel repose principalement sur polling cote frontend.
