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
    wait 2>/dev/null
    echo "✅ Serveurs arrêtés."
    exit 0
}
trap cleanup INT TERM EXIT

# ── Libérer les ports si occupés ─────────────────────────────────────
for port in 8765 3001; do
    pid=$(lsof -ti :"$port" 2>/dev/null)
    if [ -n "$pid" ]; then
        echo "⚠️  Port $port occupé (PID $pid), arrêt..."
        kill "$pid" 2>/dev/null
        sleep 1
    fi
done

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
    cd frontend && npm install && cd ..
fi

# ── Backend (FastAPI sur port 8765) ──────────────────────────────────
echo "🚀 Démarrage backend (port 8765)..."
python -m uvicorn api.main:app --host 127.0.0.1 --port 8765 &
PID_BACKEND=$!

# ── Frontend (Next.js sur port 3001) ─────────────────────────────────
echo "🚀 Démarrage frontend (port 3001)..."
cd frontend && npm run dev &
PID_FRONTEND=$!
cd ..

echo ""
echo "═══════════════════════════════════════════════"
echo "  Bord - Tableau de bord personnel"
echo "  Frontend : http://localhost:3001"
echo "  API docs : http://localhost:8765/docs"
echo "  Ctrl+C pour arrêter"
echo "═══════════════════════════════════════════════"
echo ""

# ── Ouvrir le navigateur après un court délai ────────────────────────
(sleep 4 && open "http://localhost:3001") &

# ── Attente ──────────────────────────────────────────────────────────
wait
