# LiveKick 2026

LiveKick 2026 est une application web fullstack dediee au suivi de la Coupe du Monde FIFA 2026.

L'objectif est de proposer une plateforme claire, moderne et responsive pour consulter les matchs, suivre le live, afficher les groupes, gerer des favoris et afficher des predictions explicables.

## Fonctionnalites cible

- Calendrier et liste des matchs.
- Detail d'un match avec score, statut, minute et evenements.
- Groupes, classements, equipes, joueurs et stades.
- Authentification utilisateur.
- Favoris, preferences et notifications.
- Predictions de match via un service analytique dedie.
- Administration des donnees football.

## Architecture

Le projet est decoupe en plusieurs applications :

```text
frontend React
  -> backend Spring Boot
      -> PostgreSQL
      -> service IA FastAPI
```

Le backend est le point central. Le frontend ne contacte jamais directement la base de donnees ni le service IA.

## Stack technique

| Domaine | Technologie |
| --- | --- |
| Frontend | React + TypeScript + Vite |
| Backend | Spring Boot + Java 21 |
| Base de donnees | PostgreSQL |
| Migrations | Flyway |
| Securite | Spring Security + JWT |
| API | REST / JSON |
| Live | WebSocket + polling |
| IA | FastAPI |
| Conteneurisation | Docker / Docker Compose |

## Structure du projet

```text
live-kick/
  frontend/      Interface utilisateur React
  backend/       API metier Spring Boot
  ai-service/    Service analytique pour les predictions
  infra/         Configuration Docker / Nginx
  docs/          Documentation projet
  ops/           Elements d'exploitation
```

## Demarrage rapide

### 1. Lancer PostgreSQL et Redis

```powershell
docker compose up -d postgres redis
```

### 2. Lancer le backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Le backend sera disponible sur :

```text
http://localhost:8080
```

### 3. Lancer le service IA

```powershell
cd ai-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 4. Lancer le frontend

```powershell
cd frontend
npm install
npm run dev
```

Le frontend sera disponible sur :

```text
http://localhost:5173
```

## Lancer toute la stack avec Docker

```powershell
docker compose --profile app up --build
```

Cette commande lance :

- PostgreSQL
- Redis
- backend
- frontend
- service IA

## Points d'entree utiles

| Service | URL |
| --- | --- |
| Frontend | `http://localhost:5173` |
| Backend status | `http://localhost:8080/api/v1/status` |
| Swagger backend | `http://localhost:8080/swagger-ui.html` |
| Service IA | `http://localhost:8000/health` |

## Commandes de verification

### Frontend

```powershell
cd frontend
npm run build
```

### Backend

```powershell
cd backend
.\mvnw.cmd test
```

### Service IA

```powershell
cd ai-service
python -m compileall app
```

## Conventions principales

- Les tables PostgreSQL sont en `snake_case` et au singulier.
- Le code Java et TypeScript utilise des noms en anglais.
- Les echanges API passent par des DTO.
- Les mots de passe doivent toujours etre hashes.
- Les erreurs API doivent rester lisibles et ne pas exposer de details techniques.

## Etat actuel

Le socle technique est initialise. Les developpeurs peuvent maintenant commencer a coder les fonctionnalites metier : authentification, equipes, matchs, groupes, live, favoris, predictions et administration.
