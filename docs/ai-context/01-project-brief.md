# LiveKick 2026 - Brief projet

## Vision

LiveKick 2026 est une plateforme web responsive pour suivre la Coupe du Monde FIFA 2026 avec une experience plus intelligente qu'un simple site de scores.

Le produit combine :

- information football centralisee ;
- consultation rapide des matchs ;
- suivi live ;
- personnalisation utilisateur ;
- prediction IA explicable ;
- administration securisee.

Positionnement visuel et produit :

> Live football intelligence. Real-time. Premium. Global.

## Utilisateurs

- `VISITOR` : consulte les donnees publiques.
- `USER` : gere son profil, ses favoris, preferences et notifications.
- `ADMIN` : administre equipes, joueurs, matchs, groupes, phases et synchronisations.
- `SUPER_ADMIN` : role cible pour administration avancee si le perimetre le justifie.

## Perimetre MVP

Fonctionnalites prioritaires :

- accueil competition ;
- calendrier et liste des matchs ;
- detail match ;
- suivi live score/statut/minute/evenements ;
- groupes et classements ;
- fiches equipes, joueurs et stades ;
- authentification ;
- favoris et preferences utilisateur ;
- prediction IA simple et explicable ;
- administration des donnees metier ;
- API documentee et securisee.

Hors perimetre :

- streaming video ;
- paris sportifs ;
- fantasy football ;
- reseau social ;
- chatbot conversationnel ;
- monetisation ;
- recommandations comportementales avancees.

## EPIC projet

- `EPIC-ANALYSE-DESIGN` : structurer le produit avant developpement.
- `EPIC-FONDATION` : mettre en place le socle technique.
- `EPIC-AUTH` : securiser les acces utilisateurs.
- `EPIC-FOOTBALL-DATA` : gerer le coeur metier football.
- `EPIC-LIVE` : proposer le suivi temps reel.
- `EPIC-USER` : enrichir l'experience personnalisee.
- `EPIC-IA` : integrer une couche analytique differenciante.
- `EPIC-ADMIN` : administrer et superviser la plateforme.
- `EPIC-QA` : garantir qualite et robustesse.
- `EPIC-DEPLOYMENT` : industrialiser la livraison.

## Architecture cible

LiveKick adopte une architecture client/serveur decouplee.

```text
Frontend React
  -> Backend Spring Boot
      -> PostgreSQL
      -> API football externe
      -> AI service FastAPI
```

Le backend centralise :

- logique metier ;
- securite ;
- validation ;
- acces donnees ;
- integration services externes ;
- orchestration IA ;
- publication live.

## Stack technique

### Frontend actuel

- React 19
- TypeScript 6
- Vite 8
- React Router 7
- Zustand
- Axios
- ESLint
- Vitest
- Testing Library

### Backend actuel

- Java 21
- Spring Boot 3.5
- Spring Web
- Spring Security
- Spring Data JPA
- Spring Validation
- Flyway
- PostgreSQL Driver
- Lombok
- Actuator
- Maven Wrapper

### Cible data/IA/infra

- PostgreSQL 16+
- Redis pour cache/live si besoin
- FastAPI pour `ai-service`
- Docker Compose
- Swagger/OpenAPI

## Principes d'architecture

- Backend as source of truth.
- Separation stricte frontend/backend/data/IA.
- Architecture backend en couches.
- Architecture frontend orientee composants.
- DTO dedies pour les echanges API.
- Integration externe isolee dans des services d'integration.
- Validation backend systematique.
- Securite by design.

## Flux majeurs

### Liste des matchs

```text
Frontend -> GET /api/matches?phase=group -> Backend -> MatchService -> PostgreSQL
```

Si les donnees locales sont insuffisantes :

```text
MatchService -> API football externe -> mapping -> upsert PostgreSQL
```

### Detail live

```text
Frontend -> GET /api/matches/{id}
Frontend -> WebSocket /topic/match/{id}
Fallback -> GET /api/matches/{id}/live
```

### Prediction IA

```text
Frontend -> GET /api/matches/{id}/prediction
Backend -> charge contexte match/statistiques
Backend -> POST ai-service /predict
Backend -> persiste prediction
Backend -> retourne PredictionDTO
```

## Definition of Done contextuelle

Une fonctionnalite est coherente si :

- elle respecte le vocabulaire metier du projet ;
- les noms SQL/Java/TypeScript/API restent alignes ;
- le backend valide et protege les donnees ;
- le frontend consomme uniquement les API backend ;
- le design respecte la charte LiveKick ;
- les erreurs et etats vides sont traites ;
- les tests pertinents sont ajoutes ou mis a jour.
