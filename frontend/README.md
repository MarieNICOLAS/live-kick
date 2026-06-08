# Frontend LiveKick

Ce dossier contient l'interface utilisateur de LiveKick 2026.

Le frontend est developpe avec React, TypeScript et Vite. Il consomme uniquement l'API du backend Spring Boot.

## Role du frontend

- Afficher les matchs, scores, groupes, equipes, joueurs et stades.
- Gerer les pages publiques et les pages utilisateur.
- Afficher les etats live recus du backend.
- Appeler les endpoints REST du backend.
- Afficher les predictions fournies par le backend.

Le frontend ne doit pas appeler directement PostgreSQL, le service IA ou une API football externe.

## Structure actuelle

```text
src/
  App.tsx
  App.css
  index.css
  services/
    apiClient.ts
    statusService.ts
```

`apiClient.ts` centralise les appels HTTP avec Axios.

`statusService.ts` contient le premier appel API vers :

```text
GET /api/v1/status
```

## Installation

```powershell
cd frontend
npm install
```

## Lancer en local

```powershell
npm run dev
```

URL locale :

```text
http://localhost:5173
```

## Variables d'environnement

Copier `frontend/.env.example` en `frontend/.env` si besoin.

Variable principale :

```text
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

## Commandes utiles

```powershell
npm run build
npm run lint
```

## Regles simples

- Garder les types TypeScript en anglais.
- Passer par `services/apiClient.ts` pour les appels HTTP.
- Ne pas mettre de logique metier critique dans le frontend.
- Respecter le style visuel LiveKick, pas le style par defaut Vite.
