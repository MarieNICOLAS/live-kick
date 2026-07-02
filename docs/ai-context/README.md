# LiveKick 2026 - Contexte obligatoire avant modification

Ce dossier sert de point d'entree pour toute intervention sur le code LiveKick. Avant de modifier le backend, le frontend, le service IA, la base de donnees, la documentation ou l'infrastructure, il faut verifier que la modification reste coherente avec le dossier projet `docs/LiveKick2026.md` et avec l'implementation actuelle.

## Etat de reference

LiveKick est une application web responsive de suivi de la Coupe du Monde 2026.

L'architecture actuelle repose sur :

| Couche | Implementation |
| ----- | ----- |
| Frontend | React 19, TypeScript 6, Vite 8, React Router 7, Axios, Zustand |
| Backend | Java 21, Spring Boot 3.5, Spring Web, Spring Security, Spring JDBC, Validation, Actuator, WebSocket |
| Donnees | SQLite via `backend/src/main/resources/db/sqlite/schema.sql` |
| IA | Service Python FastAPI separe |
| API externe | API World Cup 2026 configuree par `WORLD_CUP_2026_API_BASE_URL` |
| Conteneurisation | Docker Compose pour frontend, backend et ai-service |
| CI | GitHub Actions dans `.github/workflows/ci.yml` |

Le frontend ne contacte jamais directement SQLite, l'API football externe ou le service IA. Le backend Spring Boot est le point d'entree applicatif et la source de verite metier.

## Documents a consulter selon la modification

| Besoin | Document |
| ----- | ----- |
| Comprendre le dossier projet complet | `docs/LiveKick2026.md` |
| Modifier un endpoint football | `docs/api/rest/football-data.md` |
| Modifier le stockage ou les donnees locales | `docs/architecture/mvp-storage.md` |
| Modifier la stack, le lancement ou l'initialisation | `docs/architecture/stack-initialization.md` |

## Regles non negociables

* Garder le backend comme source de verite.
* Ne pas exposer de secret, token, cle API ou detail technique sensible.
* Ne pas faire appeler l'API football externe ou le service IA directement par le frontend.
* Utiliser des DTO dedies pour les reponses API.
* Garder les champs Java et TypeScript en `camelCase`.
* Garder les tables et colonnes SQL en `snake_case`.
* Ne pas ajouter de compte utilisateur, d'administration ou d'authentification fonctionnelle sans decision explicite.
* Ne pas remplacer SQLite par PostgreSQL dans le code sans decision d'architecture documentee.
* Respecter la charte LiveKick et eviter tout retour au style Vite par defaut.

## Vocabulaire canonique

Utiliser les noms suivants pour conserver la coherence metier :

* `Team`
* `Player`
* `Stadium`
* `CompetitionGroup`
* `FootballMatch`
* `Prediction`

Eviter de melanger `FootballMatch`, `Match`, `Game` et `Fixture` dans les contrats API et les types frontend.

## Etat fonctionnel actuel

Le code actuel couvre principalement :

* accueil et navigation publique ;
* calendrier et liste des matchs ;
* detail match ;
* live par actualisation reguliere ;
* groupes et classements ;
* equipes, joueurs et stades ;
* statistiques et comparaison d'equipes ;
* predictions IA ;
* favoris, preferences et rappels stockes localement dans le navigateur.

Le code actuel ne contient pas :

* espace administrateur fonctionnel ;
* creation de compte utilisateur ;
* login/register operationnels ;
* profil utilisateur serveur ;
* notifications serveur ;
* publication WebSocket metier complete.

## Checklist avant modification

Avant de livrer une modification, verifier :

* Les routes REST restent sous `/api/v1`.
* Les DTO backend et types frontend restent alignes.
* Les donnees persistantes appartiennent bien a SQLite.
* Les favoris, preferences et rappels restent dans `localStorage`.
* Les erreurs restent propres et ne divulguent pas d'informations internes.
* Les variables d'environnement utilisees sont documentees.
* Le build frontend, le build backend ou la validation concernee restent executables.
