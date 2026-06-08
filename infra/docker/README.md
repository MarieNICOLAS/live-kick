# Docker LiveKick

La configuration Docker principale est a la racine du projet :

```text
docker-compose.yml
```

Elle permet de lancer l'environnement local sans installer tous les services a la main.

## Services disponibles

| Service | Role |
| --- | --- |
| postgres | Base de donnees PostgreSQL |
| redis | Cache / support futur du live |
| backend | API Spring Boot |
| frontend | Interface React servie par Nginx |
| ai-service | Service analytique FastAPI |

## Lancer seulement la base

```powershell
docker compose up -d postgres redis
```

Utile quand on veut lancer le backend et le frontend directement depuis les IDE.

## Lancer toute l'application

```powershell
docker compose --profile app up --build
```

Le profil `app` lance aussi le backend, le frontend et le service IA.

## Arreter les conteneurs

```powershell
docker compose down
```

## Informations PostgreSQL par defaut

```text
host: localhost
port: 5432
database: livekick
user: livekick
password: livekick
```

Ces valeurs peuvent etre surchargees avec un fichier `.env` a la racine du projet.
