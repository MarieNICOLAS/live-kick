# LiveKick 2026 - Guide backend

## Role du backend

Le backend Spring Boot est le coeur fonctionnel de LiveKick. Il centralise la logique metier, la securite, la validation, l'acces aux donnees, les integrations externes et l'orchestration IA.

Le backend est la source de verite. Toute regle metier critique doit etre appliquee cote backend.

## Stack

- Java 21
- Spring Boot 3.5
- Spring Web
- Spring Security
- Spring JDBC
- Spring Validation
- SQLite JDBC
- Lombok
- Actuator
- Maven

## Architecture en couches

Organisation cible :

```text
com.livekick
  config
  controller
  dto
  entity
  repository
  service
    auth
    football
    live
    ai
    admin
  integration
    footballapi
    ai
  security
    jwt
    rbac
    validation
  exception
  mapper
```

Responsabilites :

- `controller` : endpoints REST, validation d'entree, statut HTTP.
- `dto` : contrats API, jamais d'entite JPA exposee directement.
- `service` : logique metier et orchestration.
- `repository` : acces SQLite via Spring JDBC.
- `entity` : modele metier historique ; les echanges API utilisent les DTO.
- `mapper` : conversion entity/DTO.
- `integration` : appels API football externe et service IA.
- `security` : JWT, RBAC, configuration Spring Security.
- `exception` : gestion centralisee des erreurs.

## Patterns a appliquer

- Layered Architecture.
- DTO pattern.
- Repository pattern via Spring JDBC.
- Service layer pour la logique metier.
- Mapper dedie pour eviter la logique de conversion dans les controllers.
- Adapter/Gateway pour les services externes.
- Strategy si plusieurs fournisseurs IA/API football sont supportes.

## Principes SOLID

- Single Responsibility : un controller expose, un service orchestre, un repository persiste.
- Open/Closed : ajouter un provider IA/API sans casser les services existants.
- Liskov : les implementations d'interfaces doivent respecter le meme contrat.
- Interface Segregation : interfaces courtes par usage metier.
- Dependency Inversion : les services dependent d'abstractions quand plusieurs implementations sont possibles.

## Regles API

Base cible recommandee :

```text
/api/v1
```

Exemples :

```text
GET /api/v1/matches
GET /api/v1/matches/{id}
GET /api/v1/matches/{id}/live
GET /api/v1/matches/{id}/prediction
GET /api/v1/teams
GET /api/v1/players/{id}
GET /api/v1/groups
GET /api/v1/stadiums
POST /api/v1/auth/register
POST /api/v1/auth/login
GET /api/v1/me/favorites
POST /api/v1/me/favorites
```

Ne pas inventer un endpoint sans verifier :

- le cas d'utilisation ;
- l'entite concernee ;
- le DTO attendu ;
- les droits necessaires.

## Securite

Principes :

- Security by design.
- Least privilege.
- Defence in depth.
- Fail secure.
- Input never trusted.

Mecanismes :

- JWT stateless.
- BCrypt pour les mots de passe.
- RBAC pour `VISITOR`, `USER`, `ADMIN`, `SUPER_ADMIN` si necessaire.
- CORS restrictif.
- Validation Bean Validation.
- DTO dedies.
- Gestion centralisee des exceptions.
- Rate limiting cible pour auth et endpoints sensibles.

Interdictions :

- Ne jamais stocker un mot de passe en clair.
- Ne jamais exposer `passwordHash`.
- Ne jamais faire confiance au role envoye par le frontend.
- Ne jamais laisser une stack trace dans une reponse API.
- Ne jamais mettre de secret dans Git.
- Ne jamais appeler le service IA directement depuis le frontend.

## Validation

Tout payload entrant doit etre valide avec :

- annotations Bean Validation ;
- contraintes metier dans le service ;
- verification des droits cote backend ;
- verification d'existence des references.

La validation frontend est utile pour l'UX, mais elle ne remplace jamais la validation backend.

## Gestion des erreurs

Prevoir un format stable :

```json
{
  "timestamp": "2026-06-07T00:00:00Z",
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "Invalid request payload",
  "path": "/api/v1/matches"
}
```

Les messages doivent etre clairs pour le frontend, sans fuite technique.

## Persistance

- SQLite est la base relationnelle du MVP.
- Le schema est initialise par `db/sqlite/schema.sql`.
- Le schema respecte `snake_case` et les tables au singulier.
- Les contraintes d'integrite doivent etre posees en base quand elles sont critiques.
- Les requetes custom doivent rester dans les repositories.
- Les favoris et preferences locales restent dans le `localStorage` du frontend.

## Live

Approche cible :

- WebSocket pour les mises a jour live.
- Polling controle en fallback.
- Le frontend doit recevoir des payloads normalises : score, minute, statut, evenement.

## IA

Le backend orchestre l'IA :

```text
Frontend -> Backend -> AI service -> Backend -> SQLite -> Frontend
```

Le backend doit :

- charger le contexte match/statistiques ;
- appeler le service IA ;
- controler la reponse ;
- persister la prediction ;
- retourner une explication courte et lisible.

## Tests

Priorites :

- tests unitaires services ;
- tests repositories si requetes custom ;
- tests controllers avec Spring Security ;
- tests de validation DTO ;
- tests d'integration pour auth, match detail et prediction.
