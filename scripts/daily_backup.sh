#!/bin/bash
# ==============================================================================
# CambioCuba Pro - Script de Copias de Seguridad Diarias Automatizadas
# Ejecución diaria recomendada vía Cron en la PC del Cliente:
# 59 23 * * * /opt/cambiocuba/scripts/daily_backup.sh >> /var/log/cambiocuba_backups.log 2>&1
# ==============================================================================

set -e

# Configuración
APP_DIR="/opt/cambiocuba"
BACKUP_DIR="${APP_DIR}/backups"
DB_CONTAINER="cambiocuba_mysql"
DB_NAME="cambiocuba_db"
DB_USER="cambiocuba_user"
DB_PASS="CambioCubaSecure2026!"
DATE_STR=$(date +"%Y_%m_%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/cambiocuba_backup_${DATE_STR}.sql.gz"
RETENTION_DAYS=30

echo "[$(date '+%Y-%m-%d %H:%M:%S')] === Iniciando Respaldo Diario Automatizado ==="

# Crear directorio si no existe
mkdir -p "${BACKUP_DIR}"

# 1. Volcado de la base de datos MySQL comprimido con gzip
echo "Generando volcado de la base de datos: ${DB_NAME}..."
docker exec -e MYSQL_PWD="${DB_PASS}" "${DB_CONTAINER}" \
    mysqldump -u "${DB_USER}" --single-transaction --routines --triggers "${DB_NAME}" | gzip > "${BACKUP_FILE}"

# Verificar tamaño del archivo generado
FILESIZE=$(ls -lh "${BACKUP_FILE}" | awk '{print $5}')
echo "✅ Copia de seguridad creada con éxito: ${BACKUP_FILE} (Tamaño: ${FILESIZE})"

# 2. Registrar en la tabla de auditoría de Laravel
docker exec "${DB_CONTAINER}" mysql -u "${DB_USER}" -p"${DB_PASS}" "${DB_NAME}" -e \
    "INSERT INTO audit_logs (action, entity, entity_id, user_id, user_name, details, created_at, updated_at) 
     VALUES ('BACKUP_DIARIO', 'SystemBackup', '${DATE_STR}', 1, 'Sistema Cron Automatizado', 'Backup diario generado: ${BACKUP_FILE} (${FILESIZE})', NOW(), NOW());" 2>/dev/null || true

# 3. Limpieza de respaldos antiguos (Política de retención: conservar últimos 30 días)
echo "Limpiando respaldos con más de ${RETENTION_DAYS} días de antigüedad..."
find "${BACKUP_DIR}" -type f -name "cambiocuba_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -exec rm -f {} \;

echo "[$(date '+%Y-%m-%d %H:%M:%S')] === Respaldo finalizado correctamente ==="
