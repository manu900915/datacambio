#!/usr/bin/env bash
# ==============================================================================
# Script de Actualización Automática / Manual en PC Local - CambioCuba PRO
# ==============================================================================
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}====================================================${NC}"
echo -e "${GREEN}🔄 Actualizando CambioCuba PRO desde GitHub...${NC}"
echo -e "${BLUE}====================================================${NC}"

# Obtener directorio del proyecto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

# 1. Verificar cambios remotos
echo -e "${YELLOW}📡 Descargando últimos cambios de origin/main...${NC}"
git fetch origin main

CURRENT_HASH=$(git rev-parse HEAD)
LATEST_HASH=$(git rev-parse origin/main)

if [ "$CURRENT_HASH" = "$LATEST_HASH" ]; then
    echo -e "${GREEN}✅ Tu código ya está en la última versión (${CURRENT_HASH:0:7}). No hay cambios nuevos.${NC}"
else
    echo -e "${YELLOW}⬇️ Nuevos cambios detectados. Aplicando cambios...${NC}"
    # Guardar cambios locales sin commitear si existen
    git stash || true
    git pull --rebase origin main

    # 2. Actualizar dependencias de Node.js si cambiaron
    if git diff --name-only "$CURRENT_HASH" "$LATEST_HASH" | grep -q 'package.json'; then
        echo -e "${YELLOW}📦 Cambios detectados en package.json. Actualizando dependencias npm...${NC}"
        npm install
    fi

    # 3. Si se usa Docker Compose
    if [ -f "docker/docker-compose.yml" ] && command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
        echo -e "${YELLOW}🐳 Verificando contenedores Docker...${NC}"
        docker compose -f docker/docker-compose.yml up -d --build || true
    fi

    # 4. Si se usa Laravel backend y Composer
    if [ -d "laravel-backend" ] && [ -f "laravel-backend/artisan" ] && command -v php >/dev/null 2>&1; then
        if git diff --name-only "$CURRENT_HASH" "$LATEST_HASH" | grep -q 'laravel-backend'; then
            echo -e "${YELLOW}🐘 Actualizando Laravel backend...${NC}"
            cd "$PROJECT_DIR/laravel-backend"
            php artisan migrate --force || true
            php artisan config:clear || true
            cd "$PROJECT_DIR"
        fi
    fi

    echo -e "${GREEN}🎉 ¡Actualización completada exitosamente a la versión ${LATEST_HASH:0:7}!${NC}"
fi

echo -e "${BLUE}====================================================${NC}"
