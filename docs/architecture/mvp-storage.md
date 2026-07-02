# LiveKick 2026 - Repartition SQLite / localStorage

Ce document precise ou doivent vivre les donnees de LiveKick dans l'implementation actuelle.

## Principe directeur

SQLite stocke les donnees metier partagees par l'application.

`localStorage` stocke uniquement les donnees personnelles locales au navigateur.

Le frontend ne lit jamais SQLite directement. Il consomme les donnees metier via l'API REST du backend Spring Boot.

## SQLite

SQLite est utilisee par le backend pour conserver les donnees football et les predictions.

Schema de reference :

```text
backend/src/main/resources/db/sqlite/schema.sql
```

Fichier de base en conteneur :

```text
LIVEKICK_SQLITE_PATH=/data/livekick.db
```

### Tables actuelles

| Table | Role |
| ----- | ----- |
| `team` | Equipes de la competition |
| `player` | Joueurs rattaches aux equipes |
| `stadium` | Stades de la competition |
| `competition_group` | Groupes de la phase de groupes |
| `team_group` | Classements et statistiques de groupe |
| `football_match` | Matchs, scores, statuts et rattachements |
| `prediction` | Predictions IA rattachees aux matchs |

### Donnees stockees en SQLite

| Donnee | Stockage | Justification |
| ----- | ----- | ----- |
| Equipes | SQLite | Donnee football partagee |
| Joueurs | SQLite | Donnee football partagee |
| Stades | SQLite | Donnee football partagee |
| Groupes | SQLite | Donnee de competition |
| Classements | SQLite | Donnee de competition |
| Matchs | SQLite | Donnee centrale de l'application |
| Scores et statuts | SQLite | Etat match expose par l'API |
| Predictions IA | SQLite | Resultats generes et reutilisables |

## localStorage

`localStorage` est utilise cote frontend pour conserver une personnalisation simple sans compte utilisateur.

### Stores actuels

| Store frontend | Cle / usage | Donnees |
| ----- | ----- | ----- |
| `favoritesStore.ts` | `livekick-favorites` | Favoris locaux |
| `preferencesStore.ts` | Preferences locales | Theme, affichage, notifications |
| `notificationsStore.ts` | Notifications locales | Notifications et rappels locaux |
| `matchReminders.ts` | Rappels match | Rappels planifies dans le navigateur |

### Donnees autorisees en localStorage

| Donnee | Stockage | Remarque |
| ----- | ----- | ----- |
| Equipes favorites | localStorage | Reference locale par type et identifiant |
| Matchs favoris | localStorage | Reference locale par type et identifiant |
| Joueurs favoris | localStorage | Reference locale par type et identifiant |
| Groupes favoris | localStorage | Reference locale par type et identifiant |
| Stades favoris | localStorage | Reference locale par type et identifiant |
| Theme | localStorage | Preference d'affichage |
| Preferences de notification | localStorage | Parametrage navigateur |
| Rappels de matchs | localStorage / navigateur | Donnee locale non serveur |

## Donnees interdites en localStorage

Ne pas stocker dans `localStorage` :

* cle API football externe ;
* secret JWT backend ;
* mot de passe ;
* donnees sensibles ;
* copie complete de la base football ;
* predictions comme source de verite ;
* donnees serveur critiques.

Le frontend peut conserver un token `livekick_access_token` si une authentification est ajoutee plus tard, mais l'application publique actuelle ne fournit pas de parcours de connexion operationnel.

## Flux de donnees

### Consultation football

```text
Frontend React
  -> Backend Spring Boot /api/v1
    -> SQLite
    -> API World Cup 2026 externe si rafraichissement necessaire
```

### Prediction IA

```text
Frontend React
  -> Backend Spring Boot /api/v1/matches/{id}/prediction
    -> SQLite pour le contexte match
    -> ai-service FastAPI si generation necessaire
    -> SQLite pour persistance
```

### Favoris locaux

```text
Utilisateur
  -> Frontend React
    -> Zustand persist
      -> localStorage
```

## Regles d'evolution

* Ajouter une table SQLite seulement pour une donnee partagee, metier ou persistante cote serveur.
* Ajouter une cle localStorage seulement pour une preference locale non critique.
* Ne pas dupliquer durablement les donnees football en localStorage.
* Ne pas rendre le frontend responsable d'une regle metier critique.
* Documenter toute migration future vers PostgreSQL avant modification du code.
