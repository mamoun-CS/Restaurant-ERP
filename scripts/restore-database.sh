#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
# Sheikh Al Kar Restaurant ERP — PostgreSQL Safe Restore Script
# ══════════════════════════════════════════════════════════════════════════════
# Usage:
#   ./scripts/restore-database.sh backups/restaurant_erp_backup_2026-10-21_030000.sql.gz
# ══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <path-to-backup-file.sql.gz>"
    exit 1
fi

BACKUP_FILE="$1"
if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file '$BACKUP_FILE' does not exist."
    exit 1
fi

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Load environment
if [ -f "$PROJECT_DIR/.env" ]; then
    # shellcheck disable=SC1091
    export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs -0 2>/dev/null || true)
fi

DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-restaurant_erp}"
CONTAINER_NAME="restaurant_erp_db"

echo "=========================================================="
echo " ⚠️  WARNING: You are about to restore the database!"
echo " Source backup: $BACKUP_FILE"
echo " Target DB: $DB_NAME"
echo "=========================================================="
read -r -p "Are you sure you want to proceed? This will overwrite existing data! (type 'yes' to proceed): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled by user."
    exit 0
fi

# 1. Take a safety snapshot of current database state before restoring
echo " -> Creating safety snapshot of current DB before restore..."
"$PROJECT_DIR/scripts/backup-database.sh" || true

# 2. Perform restoration
echo " -> Restoring database from $BACKUP_FILE..."
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    gunzip -c "$BACKUP_FILE" | docker exec -i -e PGPASSWORD="${POSTGRES_PASSWORD:-}" "$CONTAINER_NAME" \
        psql -U "$DB_USER" -d "$DB_NAME"
elif command -v psql >/dev/null 2>&1; then
    gunzip -c "$BACKUP_FILE" | PGPASSWORD="${POSTGRES_PASSWORD:-}" psql -h "${PGHOST:-localhost}" -p "${PGPORT:-5432}" -U "$DB_USER" -d "$DB_NAME"
else
    echo "ERROR: Neither Docker container '${CONTAINER_NAME}' nor 'psql' is available."
    exit 1
fi

echo "=========================================================="
echo " Database restoration completed successfully!"
echo "=========================================================="
