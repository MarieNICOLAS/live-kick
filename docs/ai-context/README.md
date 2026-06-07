# LiveKick 2026 - Contexte IA

Ce dossier sert de reference stable pour toute IA ou tout developpeur qui travaille sur LiveKick.

Son objectif est d'eviter les incoherences entre :

- le cahier des charges ;
- la conception UML/Merise ;
- le modele de donnees ;
- les noms de variables ;
- le backend Spring Boot ;
- le frontend React ;
- le design system.

## Ordre de lecture obligatoire

1. `01-project-brief.md` : contexte produit, perimetre, architecture et stack.
2. `02-naming-and-data-contract.md` : noms metier, tables, champs et relations.
3. `03-backend-guidelines.md` : architecture backend, services, securite et patterns.
4. `04-frontend-guidelines.md` : architecture frontend, types, etats et appels API.
5. `05-visual-guidelines.md` : charte graphique, couleurs, typographie et UI.
6. `06-ai-working-prompt.md` : prompt a donner a une IA avant une tache de code.

## Regles non negociables

- Le backend est la source de verite metier.
- Le frontend ne contacte jamais directement PostgreSQL, l'API football externe ou le service IA.
- Les noms des entites doivent rester coherents entre SQL, Java, DTO, API et TypeScript.
- Les DTO ne doivent pas exposer directement les entites JPA.
- Toute entree utilisateur doit etre validee cote backend, meme si le frontend valide deja.
- Les erreurs ne doivent jamais exposer de stack trace, secret, requete SQL brute ou detail interne.
- Le design doit respecter la charte LiveKick et ne pas revenir au style Vite par defaut.

## Etat actuel du repo

Le repo contient deja les dossiers cibles :

- `frontend`
- `backend`
- `ai-service`
- `docs`
- `infra`
- `ops`

Le frontend et le backend sont initialises. Certaines briques metier restent a implementer. Les documents de ce dossier decrivent donc le contrat cible, a suivre progressivement pendant le developpement.

## Sources de reference

- Cahier des charges et dossier projet LiveKick 2026.
- Resume Word fourni : `C:\Users\Myo\Documents\master\prompt-ia\LiveKick2026 (1).docx`.
- Conception UML/Merise du dossier projet.
- README et fichiers de configuration du repo actuel.
