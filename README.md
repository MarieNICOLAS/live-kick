# LiveKick 2026

LiveKick 2026 est une application web fullstack pour suivre la Coupe du Monde FIFA 2026 : matchs, live, groupes, equipes, favoris et predictions.

## Objectif du projet

LiveKick a pour but de proposer une experience claire et responsive autour de la Coupe du Monde 2026.

L'application doit permettre de :

- consulter les matchs et leur detail ;
- suivre les scores et evenements en live ;
- visualiser les groupes, classements, equipes, joueurs et stades ;
- creer un compte utilisateur ;
- gerer des favoris et preferences ;
- afficher des predictions explicables ;
- administrer les donnees football.

## Fonctionnalites cible

| Domaine | Fonctionnalites |
| --- | --- |
| Public | Accueil, calendrier, groupes, equipes, matchs, details |
| Live | Statut du match, score, minute, evenements |
| Utilisateur | Authentification, profil, favoris, preferences |
| IA | Prediction de match et explication courte |
| Admin | Gestion des donnees football et synchronisations |

## Stack

| Partie | Technologie |
| --- | --- |
| Frontend | React + TypeScript + Vite |
| Backend | Spring Boot + Java 21 |
| Base de donnees | PostgreSQL |
| Migrations | Flyway |
| Securite | Spring Security + JWT |
| IA | FastAPI |
| Conteneurisation | Docker / Docker Compose |

## Architecture

```text
frontend React
  -> backend Spring Boot
      -> PostgreSQL
      -> ai-service FastAPI
```

Le frontend appelle uniquement le backend. Il ne contacte jamais directement PostgreSQL ni le service IA.

## Structure

```text
live-kick/
  frontend/      Application React
  backend/       API Spring Boot
  ai-service/    Service analytique FastAPI
  infra/         Configuration infra
  docs/          Documentation projet
  ops/           Exploitation et runbooks
```

## Variables d'environnement

Le fichier `.env.example` donne les valeurs attendues pour un environnement de developpement.

Ne jamais commit de fichier `.env` contenant de vrais secrets.

Pour le developpement local sans Docker, le backend lit principalement :

```text
SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD
BACKEND_PORT
JWT_SECRET
AI_SERVICE_BASE_URL
```

Si aucune variable n'est definie, le profil `dev` utilise les valeurs par defaut de `backend/src/main/resources/application-dev.yaml`.

## Lancer le projet en local

Ce mode utilise PostgreSQL installe sur la machine, sans Docker.

### 1. Prerequis

Installer :

- Java 21
- Node.js et npm
- Python 3
- PostgreSQL
- DBeaver ou pgAdmin pour visualiser la base

### 2. Creer la base PostgreSQL locale

Dans pgAdmin, DBeaver ou psql, creer :

```sql
CREATE USER livekick WITH PASSWORD 'livekick';
CREATE DATABASE livekick OWNER livekick;
```

Si l'utilisateur existe deja, il suffit de verifier que la base `livekick` lui appartient ou qu'il a les droits necessaires.

Configuration attendue en local :

```text
Host: localhost
Port: 5432
Database: livekick
Username: livekick
Password: livekick
```

Le backend utilise cette configuration via `backend/src/main/resources/application-dev.yaml`.

### 3. Lancer le backend

Depuis la racine du projet :

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

Si Maven Wrapper n'est pas executable, utiliser `mvn` directement.

**macOS / Linux — sans PostgreSQL (profil test, port 8090) :**

```bash
cd backend
mvn org.springframework.boot:spring-boot-maven-plugin:3.5.14:run \
  -Dspring-boot.run.profiles=test \
  -Dspring-boot.run.arguments=--server.port=8090
```

Ce mode desactive la datasource et Flyway. Utile pour tester les endpoints qui appellent l'API externe (teams, matches, groups, stadiums) sans avoir PostgreSQL en local.

Le backend demarre sur :

```text
http://localhost:8080
```

Au demarrage, Flyway execute les migrations SQL et cree les tables dans PostgreSQL.

Avec IntelliJ, il est aussi possible de lancer directement la classe `BackendApplication` avec le bouton vert.

Endpoints utiles cote backend :

```text
GET /api/v1/status
GET /swagger-ui.html
GET /actuator/health
```

### 4. Lancer le frontend

Dans un deuxieme terminal :

```powershell
cd frontend
npm install
npm run dev
```

Le frontend demarre sur :

```text
http://localhost:5173
```

Le frontend doit appeler le backend via l'API REST. Il ne doit pas appeler PostgreSQL, le service IA ou une API football externe directement.

### 5. Lancer le service IA

Dans un troisieme terminal :

```powershell
cd ai-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Le service IA demarre sur :

```text
http://localhost:8000
```

## Verifier que tout fonctionne

| Service | URL |
| --- | --- |
| Frontend | `http://localhost:5173` |
| Backend status | `http://localhost:8080/api/v1/status` |
| Swagger backend | `http://localhost:8080/swagger-ui.html` |
| Service IA | `http://localhost:8000/health` |

Dans DBeaver, ouvrir la connexion PostgreSQL locale :

```text
localhost:5432
database: livekick
user: livekick
password: livekick
```

Les tables sont visibles dans :

```text
livekick -> Schemas -> public -> Tables
```

Si aucune table n'apparait, verifier que le backend a bien demarre jusqu'au bout. Les tables sont creees par Flyway au demarrage du backend.

## Commandes utiles

### Backend

Lancer (Windows) :

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Lancer (macOS / Linux) :

```bash
cd backend
mvn spring-boot:run
```

Lancer sans PostgreSQL — profil test, port 8090 (macOS / Linux) :

```bash
cd backend
mvn org.springframework.boot:spring-boot-maven-plugin:3.5.14:run \
  -Dspring-boot.run.profiles=test \
  -Dspring-boot.run.arguments=--server.port=8090
```

Tester (Windows) :

```powershell
cd backend
.\mvnw.cmd test
```

Tester (macOS / Linux) :

```bash
cd backend
mvn test
```

Build (Windows) :

```powershell
cd backend
.\mvnw.cmd clean package
```

Build (macOS / Linux) :

```bash
cd backend
mvn clean package
```

Le projet utilise Maven Wrapper (`mvnw.cmd` sur Windows, `mvnw` sur macOS/Linux). Si le wrapper n'est pas executable, utiliser `mvn` directement.

### Frontend

Lancer :

```powershell
cd frontend
npm run dev
```

Build :

```powershell
cd frontend
npm run build
```

### Service IA

Verifier le code Python :

```powershell
cd ai-service
python -m compileall app
```

## Base de donnees et migrations

La structure de la base est geree par Flyway.

Les fichiers SQL sont dans :

```text
backend/src/main/resources/db/migration
```

Regles principales :

- les migrations sont des fichiers SQL ;
- le nom commence par `V` puis un numero, par exemple `V1__init_core_schema.sql` ;
- les tables sont en `snake_case` et au singulier ;
- les migrations ne doivent pas etre modifiees apres avoir ete partagees et appliquees par d'autres devs ;
- pour changer la base apres coup, ajouter une nouvelle migration `V2`, `V3`, etc.

Exemple :

```text
V1__init_core_schema.sql
V2__complete_core_schema_constraints.sql
```

## Lancer avec Docker

Docker permet de lancer les services dans des conteneurs, sans dependre des installations locales.

Lancer PostgreSQL et Redis seulement :

```powershell
docker compose up -d postgres redis
```

Lancer toute la stack Docker :

```powershell
docker compose --profile app up --build
```

Dans Docker, PostgreSQL ecoute dans le conteneur sur `5432`, mais il est expose sur la machine en `55432` pour eviter les conflits avec un PostgreSQL local deja installe.

Connexion DBeaver pour la base Docker :

```text
Host: localhost
Port: 55432
Database: livekick
Username: livekick
Password: livekick
```

Arreter les conteneurs :

```powershell
docker compose down
```

Attention : supprimer les volumes Docker efface les donnees de la base Docker.

```powershell
docker compose down -v
```

## Workflow de developpement conseille

1. Mettre a jour sa branche.
2. Lancer PostgreSQL local.
3. Lancer le backend.
4. Lancer le frontend.
5. Coder une fonctionnalite par petit bloc coherent.
6. Verifier le build ou les tests utiles.
7. Committer avec un message clair.

Exemples de messages de commit :

```text
feat: add match list endpoint
feat: add frontend layout foundation
fix: correct database constraint
chore: update project readme
```

## Depannage

### Verifier les ports ouverts

```cmd
netstat -ano | findstr :5432
netstat -ano | findstr :8080
netstat -ano | findstr :5173
```

Voir quel programme utilise un PID :

```cmd
tasklist /FI "PID eq 8124"
```

### PostgreSQL refuse la connexion

Verifier dans DBeaver :

```text
Host: localhost
Port: 5432
Database: livekick
Username: livekick
Password: livekick
```

Verifier aussi que le service PostgreSQL Windows est demarre.

### Le backend demarre mais les tables ne sont pas visibles

Verifier :

- que le backend utilise bien la base `livekick` ;
- que Flyway n'a pas affiche d'erreur au demarrage ;
- que DBeaver affiche le schema `public` de la bonne base.

### Le port 8080 est deja utilise

Fermer l'application qui utilise le port ou definir un autre port :

```powershell
$env:BACKEND_PORT=8081
cd backend
.\mvnw.cmd spring-boot:run
```

## Notes

- Le backend est la source de verite metier.
- Les migrations de base de donnees sont gerees par Flyway.
- Les tables PostgreSQL sont en `snake_case` et au singulier.
- Le code Java et TypeScript utilise des noms en anglais.
- Les echanges API passent par des DTO.
- Aucun secret ne doit etre commit dans Git.

## Etat du projet

Le socle technique est initialise. Les prochaines fonctionnalites peuvent etre developpees par domaine : authentification, matchs, equipes, groupes, live, favoris, predictions et administration.
