# Initialisation stack LiveKick

Ce document resume le socle technique initialise pour permettre aux developpeurs de commencer a coder.

| Domaine | Choix |
| --- | --- |
| frontend | React + TypeScript + Vite |
| backend | Spring Boot |
| base de donnees | PostgreSQL |
| migrations | Flyway |
| securite | JWT + Spring Security |
| API | REST / JSON |
| live | WebSocket STOMP + polling cible |
| IA | service analytique FastAPI dedie |
| conteneurisation | Docker / Docker Compose |

## Ordre de demarrage local

1. Lancer PostgreSQL et Redis : `docker compose up -d postgres redis`.
2. Lancer le backend : `cd backend && .\mvnw.cmd spring-boot:run`.
3. Lancer le service IA : `cd ai-service && uvicorn app.main:app --reload --port 8000`.
4. Lancer le frontend : `cd frontend && npm run dev`.

Le backend reste la source de verite metier. Le frontend consomme uniquement l'API backend.
