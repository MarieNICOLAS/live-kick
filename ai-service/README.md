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

## Vérification rapide

```powershell
python -m compileall app
```

## Règles simples

- Garder les entrées et sorties en JSON.
- Ne pas acceder directement a PostgreSQL depuis ce service.
- Laisser le backend gérer la sécurité, les droits et la persistance.
- Garder les réponses explicables pour l'utilisateur final.

