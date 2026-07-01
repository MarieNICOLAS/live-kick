# Frontend LiveKick

Interface React de LiveKick 2026. Elle affiche les donnees football du MVP, les etats live, les favoris locaux, les preferences utilisateur et les predictions renvoyees par le backend.

Le frontend consomme uniquement l'API Spring Boot. Il ne contacte jamais SQLite, le fournisseur football externe ou le service IA.

## Stack

- React 19.
- TypeScript 6.
- Vite 8.
- React Router 7.
- Zustand pour les favoris, preferences et notifications locales.
- Axios via un client HTTP centralise.
- ESLint pour la qualite statique.

## Structure

```text
src/
  app/             Router, providers et contexte theme
  assets/          Images et logos LiveKick
  components/      UI, layout, formulaires et composants football
  fixtures/        Donnees de demonstration frontend
  hooks/           Hooks de rafraichissement et rappels
  pages/           Pages publiques et erreurs
  services/        Acces API type via apiClient
  stores/          Stores Zustand persistants
  types/           Contrats TypeScript
  utils/           Formatage, labels et calculs d'affichage
  App.tsx
  App.css
  index.css
```

Les appels HTTP passent par `src/services/apiClient.ts`. Les services metier exposent ensuite des fonctions dediees: `matchService`, `teamService`, `playerService`, `groupService`, `stadiumService`, `predictionService` et `statusService`.

## Installation

```powershell
cd frontend
npm install
```

## Configuration

Copier le fichier d'exemple si une configuration locale est necessaire:

```powershell
Copy-Item .env.example .env
```

Variable disponible:

```text
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

## Lancement

```powershell
npm run dev
```

URL locale: `http://localhost:5173`.

Le backend doit etre disponible sur l'URL definie par `VITE_API_BASE_URL`.

## Scripts

```powershell
npm run dev      # serveur Vite local
npm run build    # typecheck TypeScript + build production
npm run lint     # analyse ESLint
npm run preview  # preview du build Vite
```

## Regles frontend

- Garder les types et proprietes en anglais, alignes sur les DTO backend.
- Utiliser `FootballMatch`, pas `Match`, quand le concept metier est concerne.
- Stocker localement uniquement favoris, preferences, notifications et rappels.
- Eviter toute logique metier critique cote navigateur.
- Respecter la palette LiveKick et ne pas reintroduire d'asset ou de style Vite par defaut.
