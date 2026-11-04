#!/usr/bin/env bash
# ==============================================================================
# Demonio de Auto-Sincronización en segundo plano (Daemon / Watcher)
# Ejecuta este script en tu PC con: nohup ./scripts/auto-sync-daemon.sh > /dev/null 2>&1 &
# O simplemente en una terminal: ./scripts/auto-sync-daemon.sh
# ==============================================================================

INTERVAL_SECONDS=${1:-30} # Cada 30 segundos por defecto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "=========================================================="
echo "🚀 Demonio de auto-despliegue iniciado para CambioCuba"
echo "📂 Directorio: $PROJECT_DIR"
echo "⏱️  Intervalo de sondeo: cada $INTERVAL_SECONDS segundos"
echo "=========================================================="

while true; do
    # Consultar servidor de GitHub
    git fetch origin main --quiet 2>/dev/null || true
    
    LOCAL=$(git rev-parse HEAD 2>/dev/null || echo "local_err")
    REMOTE=$(git rev-parse origin/main 2>/dev/null || echo "remote_err")
    
    if [ "$LOCAL" != "$REMOTE" ] && [ "$REMOTE" != "remote_err" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔔 ¡Nuevo commit detectado en GitHub ($REMOTE)! Actualizando PC..."
        bash "$PROJECT_DIR/scripts/update-local.sh"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Despliegue en PC finalizado."
    fi
    
    sleep "$INTERVAL_SECONDS"
done
