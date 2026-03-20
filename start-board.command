#!/bin/bash
# ── start-board.command ──────────────────────────────────────────────
# Lance le tableau de bord : backend (FastAPI:8765) + frontend (Next.js:3001)
# Double-clic sur Mac pour démarrer.
# ─────────────────────────────────────────────────────────────────────

cd "$(dirname "$0")"

# ── Cleanup à la fermeture ───────────────────────────────────────────
cleanup() {
    echo ""
    echo "🛑 Arrêt des serveurs..."
    [ -n "$PID_BACKEND" ] && kill "$PID_BACKEND" 2>/dev/null
    [ -n "$PID_FRONTEND" ] && kill "$PID_FRONTEND" 2>/dev/null
    # Tuer les processus enfants aussi (node, python)
    kill 0 2>/dev/null
    wait 2>/dev/null
    echo "✅ Serveurs arrêtés."
    exit 0
}
trap cleanup INT TERM EXIT

# ── Libérer les ports si occupés ─────────────────────────────────────
free_port() {
    local port=$1
    local pids
    pids=$(lsof -ti :"$port" 2>/dev/null)
    if [ -n "$pids" ]; then
        echo "⚠️  Port $port occupé, arrêt des processus..."
        echo "$pids" | xargs kill -9 2>/dev/null
        # Attendre que le port soit vraiment libre
        local attempts=0
        while lsof -ti :"$port" >/dev/null 2>&1 && [ $attempts -lt 10 ]; do
            sleep 0.3
            attempts=$((attempts + 1))
        done
        if lsof -ti :"$port" >/dev/null 2>&1; then
            echo "❌ Port $port toujours occupé après 3s"
            return 1
        fi
        echo "   ✅ Port $port libéré"
    fi
    return 0
}

free_port 8765 || exit 1
free_port 3001 || exit 1

# ── Activation du venv Python ────────────────────────────────────────
if [ -d ".venv" ]; then
    source .venv/bin/activate
else
    echo "❌ Venv introuvable. Créez-le avec : python3.12 -m venv .venv && .venv/bin/pip install -r requirements.txt"
    exit 1
fi

# ── Vérification node_modules ────────────────────────────────────────
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installation des dépendances frontend..."
    (cd frontend && npm install)
fi

# ── Backend (FastAPI sur port 8765) ──────────────────────────────────
echo "🚀 Démarrage backend (port 8765)..."
python -m uvicorn api.main:app --host 127.0.0.1 --port 8765 &
PID_BACKEND=$!

# Attendre que le backend soit prêt
echo -n "   Attente backend"
for i in $(seq 1 20); do
    if curl -s http://127.0.0.1:8765/api/dashboard >/dev/null 2>&1; then
        echo " ✅"
        break
    fi
    echo -n "."
    sleep 0.5
done

# ── Frontend (Next.js sur port 3001) ─────────────────────────────────
echo "🚀 Démarrage frontend (port 3001)..."
npm run dev --prefix frontend &
PID_FRONTEND=$!

echo ""
echo "═══════════════════════════════════════════════"
echo "  Bord - Tableau de bord personnel"
echo "  Frontend : http://localhost:3001"
echo "  API docs : http://localhost:8765/docs"
echo "  Ctrl+C pour arrêter"
echo "═══════════════════════════════════════════════"
echo ""

# ── Ouvrir le navigateur après un court délai ────────────────────────
(sleep 3 && open "http://localhost:3001") &

# ── Attente ──────────────────────────────────────────────────────────
wait
