# Docker LiveKick

La configuration Docker principale est a la racine du projet:

```text
docker-compose.yml
```

Elle lance les services applicatifs du MVP sans installer chaque runtime localement.

## Services disponibles

| Service | Role |
| --- | --- |
| backend | API Spring Boot |
| frontend | Interface React servie par Nginx |
| ai-service | Service analytique FastAPI |
| sqlite_data | Volume Docker contenant `/data/livekick.db` |

## Lancer l'application

```powershell
docker compose --profile app up --build
```

Ports exposes par defaut:

| Service | URL |
| --- | --- |
| frontend | `http://localhost:5173` |
| backend | `http://localhost:8080` |
| Swagger UI | `http://localhost:8080/swagger-ui.html` |
| ai-service | `http://localhost:8000` |

Les ports et variables principales peuvent etre surchargees avec un fichier `.env` a la racine du repository.

## Arreter les conteneurs

```powershell
docker compose down
```

Supprimer aussi le volume SQLite local:

```powershell
docker compose down -v
```

## Notes

- Le frontend Docker est servi par Nginx avec `infra/nginx/frontend.conf`.
- Le backend utilise `LIVEKICK_SQLITE_PATH=/data/livekick.db` dans Docker.
- Le service IA peut fonctionner avec son fallback si LM Studio n'est pas disponible depuis le conteneur.
