# LiveKick 2026 - Prompt de travail IA

Copier ce prompt au debut d'une conversation IA quand une tache de code concerne LiveKick.

```text
Tu travailles sur LiveKick 2026, une application web fullstack de suivi intelligent de la Coupe du Monde FIFA 2026.

Avant toute modification, lis et respecte les fichiers du dossier docs/ai-context :
- README.md
- 01-project-brief.md
- 02-naming-and-data-contract.md
- 03-backend-guidelines.md
- 04-frontend-guidelines.md
- 05-visual-guidelines.md

Objectif prioritaire :
garder la coherence entre le cahier des charges, la conception UML/Merise, le modele de donnees, le backend Spring Boot, le frontend React et les noms de variables.

Regles non negociables :
- Le backend est la source de verite.
- Le frontend ne contacte jamais PostgreSQL, l'API football externe ou le service IA directement.
- Respecte les noms canoniques : User, Team, Player, FootballMatch, MatchEvent, Prediction, Stadium, CompetitionGroup.
- SQL en snake_case et tables au singulier.
- Java/TypeScript en camelCase pour les champs.
- DTO dedies pour les echanges API.
- Ne jamais exposer passwordHash ou un secret.
- Validation backend obligatoire.
- Securite : JWT stateless, Spring Security, RBAC, BCrypt, CORS restrictif.
- Design : respecter la palette LiveKick et supprimer le style starter Vite.

Quand tu codes :
1. Inspecte d'abord l'existant.
2. Identifie si la demande concerne frontend, backend, data, IA, securite ou design.
3. Verifie le contrat de nommage avant d'ajouter une entite, un DTO, un type ou un champ.
4. Fais des changements minimaux et coherents.
5. Ajoute ou adapte les tests quand le risque le justifie.
6. Explique les ecarts si une decision contredit la conception.

Stack actuelle :
- Frontend : React 19, TypeScript, Vite, React Router, Zustand, Axios.
- Backend : Java 21, Spring Boot 3.5, Spring Web, Spring Security, Spring Data JPA, Validation, Flyway, PostgreSQL.
- IA cible : FastAPI.
- Infrastructure cible : Docker Compose, PostgreSQL, Redis si necessaire.

Ne renomme jamais un concept metier sans raison documentee.
```

## Checklist avant livraison IA

- Les noms sont-ils alignes avec `02-naming-and-data-contract.md` ?
- Le frontend appelle-t-il uniquement le backend ?
- Les DTO evitent-ils d'exposer les entites ou champs sensibles ?
- La validation backend est-elle presente ?
- Les erreurs sont-elles propres et securisees ?
- Les couleurs et composants respectent-ils `05-visual-guidelines.md` ?
- L'etat actuel du repo est-il respecte, sans supposer des dossiers/fichiers inexistants ?
