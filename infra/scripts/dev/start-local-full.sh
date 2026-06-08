#!/usr/bin/env bash
# start-local-full.sh — Lance l'environnement de développement LiveKick complet.
#
# Ce script:
#   1. Charge la configuration locale depuis .env à la racine du projet.
#   2. Démarre PostgreSQL et Redis via Docker Compose.
#   3. Attend que PostgreSQL soit prêt (healthcheck).
#   4. Lance le frontend Vite en arrière-plan.
#   5. Lance le backend Spring Boot au premier plan.
#   6. À l'arrêt (Ctrl+C), coupe proprement le frontend.
#
# Usage:
#   ./infra/scripts/dev/start-local-full.sh
#
# Prérequis:
#   - Docker (docker compose)
#   - Java 21+, Maven (mvn)
#   - Node.js + npm
#   - Fichier .env à la racine du projet (copier .env.example si absent)

set -euo pipefail

# ── Racine du projet (dossier parent de infra/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# ── Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${CYAN}[livekick]${NC} $*"; }
ok()   { echo -e "${GREEN}[livekick]${NC} $*"; }
warn() { echo -e "${YELLOW}[livekick]${NC} $*"; }
err()  { echo -e "${RED}[livekick]${NC} $*"; }

# Charger .env
ENV_FILE="$ROOT_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
  warn ".env introuvable. Copie de .env.example..."
  cp "$ROOT_DIR/.env.example" "$ENV_FILE"
  warn "Pense à renseigner JWT_SECRET dans .env avant de continuer."
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

ok ".env chargé (Postgres: localhost:${POSTGRES_PORT}, Redis: localhost:${REDIS_PORT})"

# PostgreSQL et Redis
log "Démarrage de PostgreSQL et Redis via Docker Compose..."
docker compose -f "$ROOT_DIR/docker-compose.yml" --env-file "$ENV_FILE" up -d postgres redis

log "Attente de PostgreSQL (healthcheck)..."
RETRIES=20
until docker compose -f "$ROOT_DIR/docker-compose.yml" ps postgres \
  | grep -q "(healthy)" || [ "$RETRIES" -eq 0 ]; do
  RETRIES=$((RETRIES - 1))
  sleep 2
done

if [ "$RETRIES" -eq 0 ]; then
  err "PostgreSQL ne répond pas après 40 secondes. Vérifie 'docker compose logs postgres'."
  exit 1
fi

ok "PostgreSQL est prêt."

# Check status des ports, les tue si déjà utilisés
EXISTING_FRONT_PID=$(lsof -ti tcp:"${FRONTEND_PORT}" || true)
if [ -n "$EXISTING_FRONT_PID" ]; then
  warn "Port ${FRONTEND_PORT} déjà utilisé (PID ${EXISTING_FRONT_PID}). Arrêt du processus..."
  kill "$EXISTING_FRONT_PID" 2>/dev/null || true
  sleep 1
  ok "Port ${FRONTEND_PORT} libéré."
fi

EXISTING_PID=$(lsof -ti tcp:"${BACKEND_PORT}" || true)
if [ -n "$EXISTING_PID" ]; then
  warn "Port ${BACKEND_PORT} déjà utilisé (PID ${EXISTING_PID}). Arrêt du processus..."
  kill "$EXISTING_PID" 2>/dev/null || true
  sleep 2
  ok "Port ${BACKEND_PORT} libéré."
fi

# Lancer le front en arrière-plan
log "Démarrage du frontend Vite sur http://localhost:${FRONTEND_PORT}..."
cd "$ROOT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!
ok "Frontend démarré (PID ${FRONTEND_PID})."

# Définie comment arrêter le frontend à la fin du script
trap 'log "Arrêt du frontend (PID ${FRONTEND_PID})..."; kill "$FRONTEND_PID" 2>/dev/null || true; ok "Frontend arrêté."' EXIT

# Lancer le backend
JDBC_URL="jdbc:postgresql://localhost:${POSTGRES_PORT}/${POSTGRES_DB}"

# Affichage des URLs locales
echo ""
echo -e "${CYAN}┌─────────────────────────────────────────────────────┐${NC}"
echo -e "${CYAN}│              LiveKick — URLs locales                 │${NC}"
echo -e "${CYAN}├─────────────────────────────────────────────────────┤${NC}"
echo -e "${CYAN}│${NC}  Frontend       ${GREEN}http://localhost:${FRONTEND_PORT}${NC}"
echo -e "${CYAN}│${NC}  Backend        ${GREEN}http://localhost:${BACKEND_PORT}/api/v1/status${NC}"
echo -e "${CYAN}│${NC}  Swagger UI     ${GREEN}http://localhost:${BACKEND_PORT}/swagger-ui.html${NC}"
echo -e "${CYAN}│${NC}  Actuator       ${GREEN}http://localhost:${BACKEND_PORT}/actuator/health${NC}"
echo -e "${CYAN}│${NC}  Service IA     ${GREEN}http://localhost:${AI_SERVICE_PORT}/health${NC}"
echo -e "${CYAN}│${NC}  PostgreSQL     ${YELLOW}localhost:${POSTGRES_PORT}${NC}  (db: ${POSTGRES_DB})"
echo -e "${CYAN}│${NC}  Redis          ${YELLOW}localhost:${REDIS_PORT}${NC}"
echo -e "${CYAN}└─────────────────────────────────────────────────────┘${NC}"
echo ""
log "Démarrage du backend Spring Boot sur http://localhost:${BACKEND_PORT} (premier plan)..."
log "  JDBC URL : $JDBC_URL"

cd "$ROOT_DIR/backend"
SPRING_DATASOURCE_URL="$JDBC_URL" \
SPRING_DATASOURCE_USERNAME="$POSTGRES_USER" \
SPRING_DATASOURCE_PASSWORD="$POSTGRES_PASSWORD" \
mvn spring-boot:run || {
  exit_code=$?
  # 143 = SIGTERM (128+15) : arrêt normal via Ctrl+C ou kill — pas une erreur.
  if [ "$exit_code" -eq 143 ] || [ "$exit_code" -eq 130 ]; then
    ok "Backend arrêté proprement."
    exit 0
  fi
  err "Le backend s'est arrêté avec le code $exit_code."
  exit "$exit_code"
}
