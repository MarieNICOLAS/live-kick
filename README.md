# LiveKick 2026

LiveKick est une application web de suivi de la Coupe du Monde FIFA 2026.

## Perimetre MVP

- consulter les matchs par phase ;
- consulter les groupes et classements ;
- consulter le detail d'un match, d'une equipe et d'un joueur ;
- afficher le score et le statut actualises ;
- conserver des favoris et preferences locales ;
- afficher une probabilite de victoire ;
- comparer simplement deux equipes.

## Architecture

```text
Frontend React TypeScript
  -> Backend Spring Boot
      -> API Football
      -> SQLite (stockage local et cache)
      -> Service IA FastAPI

Frontend
  -> localStorage (favoris et preferences uniquement)
```

Le frontend ne contacte jamais directement SQLite, l'API Football ou le
service IA.

## Stack

| Partie | Technologie |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Zustand, Axios |
| Backend | Java 21, Spring Boot 3.5, Spring JDBC |
| Stockage backend | SQLite |
| Preferences locales | localStorage |
| IA | Python, FastAPI, LM Studio |
| Conteneurisation | Docker Compose |

## Lancer le projet

### Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Le fichier `backend/livekick.db` est cree automatiquement. Son emplacement
peut etre modifie avec `LIVEKICK_SQLITE_PATH`.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

### Service IA

```powershell
cd ai-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
fastapi dev
```

LM Studio doit fonctionner sur `http://127.0.0.1:1234`.

## Docker

```powershell
docker compose --profile app up --build
```

Le volume `sqlite_data` conserve le fichier SQLite du backend.

## Verifications

```powershell
cd backend
.\mvnw.cmd test

cd ..\frontend
npm run build
npm run lint

cd ..\ai-service
python -m compileall app
```

## Regles de stockage

- SQLite conserve les donnees football et les predictions.
- SQLite sert de cache de repli lorsque l'API Football est indisponible.
- `localStorage` conserve uniquement les favoris et preferences locales.
- Les secrets et cles d'API ne sont jamais stockes dans le frontend.
- Les noms SQL restent en `snake_case` et au singulier.
