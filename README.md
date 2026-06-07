# LiveKick 2026

LiveKick 2026 est une application web fullstack de suivi intelligent de la Coupe du Monde FIFA 2026.

Le projet vise a proposer une experience sportive moderne combinant consultation des matchs, suivi live, personnalisation utilisateur, administration des donnees football et analyses predictives assistees par IA.

## Objectifs produit

- Consulter les matchs par phase, groupe, equipe et statut.
- Suivre les scores, minutes et evenements importants en temps reel.
- Afficher les groupes, classements, equipes, joueurs et stades.
- Permettre aux utilisateurs connectes de gerer favoris, preferences et notifications.
- Fournir des predictions IA explicables sur les matchs.
- Proposer un back-office securise pour administrer les donnees metier.

## Architecture

LiveKick suit une architecture client/serveur decouplee.

- `frontend` : interface React + TypeScript.
- `backend` : API metier Spring Boot.
- `ai-service` : service analytique IA cible, expose par FastAPI.
- `docs` : documentation technique, API, decisions et contexte IA.
- `infra` : scripts et configuration d'infrastructure cible.
- `ops` : elements d'exploitation, monitoring et runbooks cible.

Principe central : le frontend ne dialogue jamais directement avec la base de donnees, l'API football externe ou le service IA. Toutes les integrations passent par le backend.

## Stack actuelle

### Frontend

- React 19
- TypeScript 6
- Vite 8
- React Router 7
- Zustand 5
- Axios
- ESLint
- Vitest + Testing Library

### Backend

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
- Maven

### Donnees et infrastructure cible

- PostgreSQL 16+
- Redis pour cache/live si necessaire
- Docker et Docker Compose
- Swagger/OpenAPI pour documentation API
- FastAPI pour le service IA cible

## Conventions essentielles

- PostgreSQL : noms en `snake_case`, tables au singulier.
- Java : classes en `PascalCase`, champs en `camelCase`.
- TypeScript : types/interfaces en `PascalCase`, proprietes en `camelCase`.
- API : DTO dedies, validation backend obligatoire, reponses JSON stables.
- Securite : JWT stateless, RBAC, Spring Security, BCrypt, validation serveur.

La reference complete pour l'IA et les developpeurs se trouve dans `docs/ai-context/README.md`.

## Commandes utiles

### Frontend

```powershell
cd frontend
npm install
npm run dev
npm run build
npm run lint
```

### Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
.\mvnw.cmd test
```

## Regle de coherence

Avant toute implementation, verifier les documents de contexte IA dans `docs/ai-context`.

Si le code contredit le cahier des charges, les diagrammes UML/Merise ou le dictionnaire de donnees, ne pas improviser : aligner le code sur la conception ou documenter clairement la decision d'ecart.
