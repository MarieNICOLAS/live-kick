# Service IA LiveKick

Ce dossier contient le service analytique dédié aux prédictions de match.

Il est séparé du backend pour garder une architecture claire :

```text
frontend -> backend -> ai-service
```

Le frontend ne contacte jamais directement ce service. Le backend prépare les données du match, appelle le service IA, puis renvoie une réponse propre au frontend.

## Role du service

- Recevoir un contexte de match.
- Calculer ou simuler une prediction.
- Retourner des probabilités, un score prédit et une explication.


## Installation

### Environnement
```powershell
cd ai-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Installation de LMStudio

Suivre le tutoriel d'installation de [LMStudio](https://lmstudio.ai/).  
Une fois l'installation terminé:
 - Télécharger le model suivant: "google/gemma-4-e2b" (Il s'agit du model utilisé par défaut du projet)
 - Activer le serveur local, qui doit tourner sur le port 1234.  
 - Désactivé également l'authentification.

L'application devrait tourner sans problème.

## Lancer en local

```powershell
fastapi dev
```

URL locale :

```text
http://localhost:8000
```

## Endpoints

```text
GET /health
GET /model_status (WIP)
POST /predict
```

# Details Endpoints

## GET `/health`

Vérifie que le service est opérationnel.

**Entrée :** aucune

**Sortie :**

```json
{
  "status": "UP"
}
```

---

## GET `/model-status`

Retourne l'état du modèle IA. _(Non implémenté — placeholder)_

**Entrée :** aucune

**Sortie :**

```json
{
  "status": "Model status endpoint not yet implemented."
}
```

---

## POST `/predict`

Demande une prédiction pour un match de football.

### Entrée (JSON body)

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `match_id` | `int` | ✅ | Identifiant unique du match |
| `home_team` | `TeamContext` | ✅ | Équipe à domicile |
| `home_team.name` | `string` (min 1 car.) | ✅ | Nom complet de l'équipe |
| `home_team.fifa_code` | `string` (2–3 car.) | ✅ | Code FIFA de l'équipe (ex. `FRA`, `BRZ`) |
| `away_team` | `TeamContext` | ✅ | Équipe à l'extérieur |
| `away_team.name` | `string` (min 1 car.) | ✅ | Nom complet de l'équipe |
| `away_team.fifa_code` | `string` (2–3 car.) | ✅ | Code FIFA de l'équipe |
| `stadium` | `string` (min 1 car.) | ✅ | Nom du stade |

**Exemple de requête :**

```json
{
  "match_id": 42,
  "home_team": {
    "name": "France",
    "fifa_code": "FRA"
  },
  "away_team": {
    "name": "Brazil",
    "fifa_code": "BRZ"
  },
  "stadium": "Stade de France"
}
```

### Sortie (JSON)

| Champ | Type | Description |
|---|---|---|
| `match_id` | `int` | Identifiant du match |
| `home_win_probability` | `float` (0–100) | Probabilité de victoire à domicile (%) |
| `draw_probability` | `float` (0–100) | Probabilité de match nul (%) |
| `away_win_probability` | `float` (0–100) | Probabilité de victoire à l'extérieur (%) |
| `predicted_home_score` | `int` | Score prédit pour l'équipe à domicile |
| `predicted_away_score` | `int` | Score prédit pour l'équipe à l'extérieur |
| `confidence_score` | `float` (0–100) | Niveau de confiance du modèle (%) |
| `model_name` | `string` | Nom du modèle utilisé |
| `explanation` | `string` | Explication textuelle de la prédiction |
| `generated_at` | `datetime` (ISO 8601) | Horodatage de génération (UTC) |

**Exemple de réponse :**

```json
{
  "match_id": 42,
  "home_win_probability": 55.0,
  "draw_probability": 25.0,
  "away_win_probability": 20.0,
  "predicted_home_score": 2,
  "predicted_away_score": 1,
  "confidence_score": 72.0,
  "model_name": "lmstudio-local-model",
  "explanation": "France has a strong home record and recent form advantage.",
  "generated_at": "2026-06-13T10:00:00Z"
}
```

> En cas d'indisponibilité du modèle LMStudio ou de réponse invalide, un résultat de fallback est retourné automatiquement avec une explication appropriée.

---

## Vérification rapide

```powershell
python -m compileall app
```

## Règles simples

- Garder les entrées et sorties en JSON.
- Ne pas acceder directement a PostgreSQL depuis ce service.
- Laisser le backend gérer la sécurité, les droits et la persistance.
- Garder les réponses explicables pour l'utilisateur final.

