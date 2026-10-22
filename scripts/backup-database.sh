#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
# Sheikh Al Kar Restaurant ERP — Automated Daily PostgreSQL Backup Script
# ══════════════════════════════════════════════════════════════════════════════
# Usage:
#   chmod +x scripts/backup-database.sh
#   ./scripts/backup-database.sh
#
# To run automatically every night at 03:00 AM, add to crontab:
#   crontab -e
#   0 3 * * * /absolute/path/to/Restaurant\ ERP/scripts/backup-database.sh >> /var/log/restaurant_erp_backup.log 2>&1
# ══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# Directories
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_DIR/backups}"
mkdir -p "$BACKUP_DIR"

# Timestamp
NOW=$(date +"%Y-%m-%d_%H%M%S")
BACKUP_FILENAME="restaurant_erp_backup_${NOW}.sql.gz"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILENAME"

# Load environment variables if available
if [ -f "$PROJECT_DIR/.env" ]; then
    # shellcheck disable=SC1091
    export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs -0 2>/dev/null || true)
fi

DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-restaurant_erp}"
CONTAINER_NAME="restaurant_erp_db"

echo "=========================================================="
echo " [$(date)] Starting Restaurant ERP Database Backup..."
echo " Target file: $BACKUP_PATH"
echo "=========================================================="

# 1. Determine execution method: Docker container or native pg_dump
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo " -> Found active Docker container: $CONTAINER_NAME"
    echo " -> Running pg_dump inside container..."
    docker exec -e PGPASSWORD="${POSTGRES_PASSWORD:-}" "$CONTAINER_NAME" \
        pg_dump -U "$DB_USER" -d "$DB_NAME" --clean --if-exists --no-owner --no-privileges \
        | gzip -9 > "$BACKUP_PATH"
elif command -v pg_dump >/dev/null 2>&1; then
    echo " -> Running native host pg_dump..."
    PGPASSWORD="${POSTGRES_PASSWORD:-}" pg_dump -h "${PGHOST:-localhost}" -p "${PGPORT:-5432}" -U "$DB_USER" -d "$DB_NAME" --clean --if-exists \
        | gzip -9 > "$BACKUP_PATH"
else
    echo " ERROR: Neither Docker container '${CONTAINER_NAME}' nor native 'pg_dump' is available!"
    exit 1
fi

# 2. Verify Backup Integrity
if [ ! -s "$BACKUP_PATH" ]; then
    echo " ERROR: Backup file was created but is empty (0 bytes)!"
    rm -f "$BACKUP_PATH"
    exit 1
fi

BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
echo " Backup completed successfully! Size: $BACKUP_SIZE"

# 3. Retention policy: Keep daily backups for 7 days, delete older ones
echo " -> Applying retention policy: purging daily backups older than 7 days..."
find "$BACKUP_DIR" -name "restaurant_erp_backup_*.sql.gz" -type f -mtime +7 -exec rm -vf {} \;

echo "=========================================================="
echo " [$(date)] Backup process finished successfully."
echo "=========================================================="
