# LiveKick 2026 - Instructions agents IA

Avant de coder dans ce repo, lire et respecter `docs/ai-context/README.md`.

## Priorite de coherence

Le but principal est de garder le code coherent avec :

- le cahier des charges LiveKick 2026 ;
- la conception UML/Merise ;
- le modele de donnees ;
- les conventions de nommage ;
- l'architecture backend Spring Boot ;
- l'architecture frontend React ;
- la charte graphique LiveKick.

## Documents de reference

Lire dans cet ordre :

1. `docs/ai-context/01-project-brief.md`
2. `docs/ai-context/02-naming-and-data-contract.md`
3. `docs/ai-context/03-backend-guidelines.md`
4. `docs/ai-context/04-frontend-guidelines.md`
5. `docs/ai-context/05-visual-guidelines.md`
6. `docs/ai-context/06-ai-working-prompt.md`

## Regles non negociables

- Le backend est la source de verite metier.
- Le frontend ne contacte jamais directement PostgreSQL, l'API football externe ou le service IA.
- Respecter les noms canoniques : `User`, `Team`, `Player`, `FootballMatch`, `MatchEvent`, `Prediction`, `Stadium`, `CompetitionGroup`.
- SQL en `snake_case`, tables au singulier.
- Java et TypeScript en `camelCase` pour les champs.
- Utiliser des DTO dedies pour les echanges API.
- Ne jamais exposer `passwordHash`, token, secret ou detail technique sensible.
- Valider systematiquement cote backend.
- Respecter la palette et le style LiveKick, pas le template Vite par defaut.
