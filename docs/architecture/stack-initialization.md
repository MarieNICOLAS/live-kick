# Initialisation stack LiveKick

Ce document resume le socle technique MVP initialise pour permettre aux developpeurs de lancer et maintenir LiveKick.

| Domaine | Choix |
| --- | --- |
| frontend | React 19 + TypeScript 6 + Vite 8 |
| backend | Spring Boot 3.5 + Java 21 |
| base de donnees | SQLite |
| schema | SQL initialise par Spring depuis `db/sqlite/schema.sql` |
| securite | Spring Security + JWT cible |
| API | REST / JSON |
| live | WebSocket configure + polling REST de fallback |
| IA | service FastAPI dedie avec fallback applicatif |
| conteneurisation | Docker Compose |

## Ordre de demarrage local

1. Lancer le backend: `cd backend && .\mvnw.cmd spring-boot:run`.
2. Lancer le service IA: `cd ai-service && python -m fastapi dev app/main.py`.
3. Lancer le frontend: `cd frontend && npm run dev`.

Demarrage Docker complet:

```powershell
docker compose --profile app up --build
```

Le backend reste la source de verite metier. Le frontend consomme uniquement l'API backend.
