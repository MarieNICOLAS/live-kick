# Backend LiveKick

Ce dossier contient l'API metier de LiveKick 2026.

Le backend est developpe avec Spring Boot et Java 21. Il centralise la logique metier, la securite, les acces a PostgreSQL, les appels au service IA et les flux live.

## Role du backend

- Exposer l'API REST en JSON.
- Gerer l'authentification et les droits.
- Valider les donnees envoyees par le frontend.
- Lire et ecrire dans PostgreSQL.
- Appliquer les migrations Flyway.
- Appeler le service IA quand une prediction est demandee.
- Preparer les flux WebSocket pour le live.

## Structure principale

```text
src/main/java/com/livekick/
  config/       Configuration Spring, securite, CORS, WebSocket
  controller/   Endpoints REST
  exception/    Format global des erreurs API
```

Les futurs dossiers metier pourront etre ajoutes progressivement :

```text
dto/
entity/
repository/
service/
mapper/
security/
integration/
```

## Base de donnees

Les migrations Flyway sont dans :

```text
src/main/resources/db/migration/
```

La premiere migration cree le socle des tables principales :

```text
V1__init_core_schema.sql
```

Hibernate est configure en mode `validate`. Cela veut dire qu'il verifie le schema, mais ne cree pas les tables lui-meme.

## Lancer en local

Demarrer d'abord PostgreSQL :

```bash
docker compose up -d postgres redis
```

Puis lancer le backend.

**Windows :**

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

**macOS / Linux :**

```bash
cd backend
mvn spring-boot:run
```

**macOS / Linux — sans PostgreSQL (profil test, port 8090) :**

```bash
cd backend
mvn org.springframework.boot:spring-boot-maven-plugin:3.5.14:run \
  -Dspring-boot.run.profiles=test \
  -Dspring-boot.run.arguments=--server.port=8090
```

Ce mode desactive la datasource et Flyway. Les endpoints football (teams, matches, groups, stadiums) fonctionnent car ils appellent l'API externe, pas PostgreSQL.

## Points d'entree

```text
GET /api/v1/status
GET /swagger-ui.html
GET /actuator/health
```

## Tests

```powershell
cd backend
.\mvnw.cmd test
```

## Regles simples

- Ne jamais exposer `passwordHash`.
- Toujours passer par des DTO pour les reponses API.
- Valider les entrees cote backend.
- Garder les endpoints publics limites aux donnees consultables.
- Garder PostgreSQL comme source de verite des donnees.
