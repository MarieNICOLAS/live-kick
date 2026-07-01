# Service IA LiveKick

Service FastAPI dedie aux predictions de match LiveKick 2026.

Architecture cible:

```text
frontend -> backend -> ai-service -> LM Studio
```

Le frontend ne contacte jamais directement ce service. Le backend prepare le contexte de match, appelle l'IA, controle la reponse, persiste la prediction et renvoie un DTO propre au frontend.

## Stack

- Python 3.12.
- FastAPI.
- Pydantic.
- Requests.
- LM Studio local, optionnel en developpement.

## Structure

```text
app/
  api/
    dependencies.py
    routes/Routes.py
  config/
    system_prompt.txt
  models/
    LMStudio.py
  services/
    PredictionService.py
  utils/
    BaseModel.py
    PredictionManager.py
    lifespanManager.py
  main.py
```

## Installation

```powershell
cd ai-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Lancement

```powershell
python -m fastapi dev app/main.py
```

URL locale: `http://localhost:8000`.

Verification:

```powershell
curl http://127.0.0.1:8000/health
```

Reponse attendue:

```json
{
  "status": "UP"
}
```

## LM Studio

Pour utiliser le modele local:

1. Installer LM Studio.
2. Telecharger le modele `google/gemma-4-e2b`.
3. Lancer le serveur local OpenAI-compatible sur `http://127.0.0.1:1234`.
4. Desactiver l'authentification locale.

Si LM Studio est indisponible ou retourne un format invalide, `PredictionService` renvoie automatiquement une prediction de fallback explicite.

## Endpoints

```text
GET /
GET /health
GET /model-status
GET /model_status
POST /predict
```

### POST `/predict`

Exemple de requete:

```json
{
  "match_id": 42,
  "home_team": {
    "name": "France",
    "fifa_code": "FRA"
  },
  "away_team": {
    "name": "Brazil",
    "fifa_code": "BRA"
  },
  "stadium": "MetLife Stadium"
}
```

Exemple de reponse:

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

## Verification

```powershell
python -m compileall app
```

## Regles IA

- Garder les entrees et sorties en JSON.
- Ne pas acceder directement a SQLite depuis ce service.
- Ne jamais gerer les droits, tokens utilisateur ou la persistance ici.
- Retourner des predictions explicables pour l'utilisateur final.
- Laisser le backend filtrer, valider et exposer la reponse finale.
