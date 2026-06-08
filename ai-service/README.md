# Service IA LiveKick

Ce dossier contient le service analytique dedie aux predictions de match.

Il est separe du backend pour garder une architecture claire :

```text
frontend -> backend -> ai-service
```

Le frontend ne contacte jamais directement ce service. Le backend prepare les donnees du match, appelle le service IA, puis renvoie une reponse propre au frontend.

## Role du service

- Recevoir un contexte de match.
- Calculer ou simuler une prediction.
- Retourner des probabilites, un score predit et une explication.

Pour l'instant, le service contient une prediction de base. Il sert de point de depart pour brancher ensuite un vrai modele analytique.

## Installation

```powershell
cd ai-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Lancer en local

```powershell
uvicorn app.main:app --reload --port 8000
```

URL locale :

```text
http://localhost:8000
```

## Endpoints

```text
GET /health
POST /predict
```

## Verification rapide

```powershell
python -m compileall app
```

## Regles simples

- Garder les entrees et sorties en JSON.
- Ne pas acceder directement a PostgreSQL depuis ce service.
- Laisser le backend gerer la securite, les droits et la persistance.
- Garder les reponses explicables pour l'utilisateur final.
