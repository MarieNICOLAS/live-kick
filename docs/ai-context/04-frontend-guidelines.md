# LiveKick 2026 - Guide frontend

## Role du frontend

Le frontend React est la couche de presentation de LiveKick. Il affiche les donnees football, les etats live, les predictions IA et les espaces utilisateur/admin.

Le frontend ne porte pas les regles metier critiques. Il consomme les DTO du backend et applique une validation UX sans remplacer la validation serveur.

## Stack

- React 19
- TypeScript 6
- Vite 8
- React Router 7
- Zustand
- Axios
- ESLint
- Vitest
- Testing Library

## Architecture cible

```text
src
  app
    router.tsx
    providers.tsx
  pages
    public
    auth
    user
    admin
    errors
  components
    ui
    layout
    football
    ai
  services
    apiClient.ts
    authService.ts
    matchService.ts
    teamService.ts
    playerService.ts
    liveService.ts
    predictionService.ts
    adminService.ts
  hooks
  stores
  types
  utils
  assets
  styles
```

## Pages metier

Pages principales a garder coherentes avec le cahier des charges :

- Home / matchs du jour.
- Calendrier.
- Detail match.
- Live.
- Groupes et classements.
- Tableau final.
- Equipes.
- Joueurs.
- Stades.
- Login/Register.
- Profil utilisateur.
- Favoris.
- Preferences.
- Prediction IA.
- Admin.

## Types TypeScript

Les types doivent suivre `02-naming-and-data-contract.md`.

Exemple :

```ts
export interface FootballMatch {
  id: string
  matchDate: string
  status: MatchStatus
  homeScore: number | null
  awayScore: number | null
  currentMinute: number | null
  extraTime: number | null
  homeTeam: Team
  awayTeam: Team
  stadium: Stadium
  phase: CompetitionPhase
}
```

Ne pas utiliser plusieurs noms pour le meme concept. Par exemple, ne pas melanger `matchDate`, `kickoffAt`, `date` et `startTime` sans decision claire.

## Appels API

Tous les appels HTTP passent par `apiClient.ts`.

Responsabilites de `apiClient.ts` :

- base URL ;
- headers communs ;
- injection JWT si utilisateur connecte ;
- gestion des erreurs reseau ;
- interception `401`;
- timeout raisonnable.

Les services metier exposent des fonctions typpees :

```ts
getMatches(params)
getMatchById(id)
getMatchLiveState(id)
getPrediction(matchId)
addFavorite(payload)
```

## Gestion d'etat

Utiliser Zustand pour les etats partages :

- session/auth ;
- profil utilisateur ;
- favoris ;
- preferences ;
- etats live si necessaire.

Garder local dans les composants :

- etat de formulaire simple ;
- ouverture modale ;
- filtre local temporaire ;
- onglet selectionne.

## UX attendue

LiveKick doit etre rapide a consulter :

- information critique visible immediatement ;
- score, statut et minute faciles a scanner ;
- filtres simples ;
- chargement, vide, erreur et succes traites ;
- responsive mobile-first ;
- navigation claire.

## Regles UI

- Utiliser des composants reutilisables pour boutons, cards, badges, tabs, inputs.
- Eviter la duplication de styles.
- Ne pas laisser le style Vite par defaut dans les pages metier.
- Les couleurs doivent venir de variables/tokens LiveKick.
- Les composants football doivent utiliser le vocabulaire projet : `Team`, `FootballMatch`, `CompetitionGroup`, `Prediction`.

## Securite frontend

- Ne jamais stocker de secret frontend.
- Ne jamais exposer un token dans l'URL.
- Ne jamais faire confiance aux droits affiches cote frontend.
- Ne jamais appeler PostgreSQL, API football externe ou service IA directement.
- Utiliser l'escaping React naturel, eviter `dangerouslySetInnerHTML`.
- Masquer les pages admin cote UI, mais laisser le backend refuser l'acces.

## Performance

- Charger les donnees par page.
- Eviter les re-renders globaux inutiles.
- Memoiser seulement quand cela apporte un gain clair.
- Prevoir pagination/filtres backend pour les listes longues.
- Pour le live, eviter un polling trop agressif.

## Tests

Priorites :

- rendu des composants metier critiques ;
- parcours login ;
- affichage match detail ;
- etats loading/error/empty ;
- services API avec mocks ;
- stores Zustand si logique significative.
