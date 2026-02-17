#!/bin/bash
# Database restore script for ILHRF Data Collection Platform
# Usage: ./scripts/restore.sh <backup_file.sql.gz>
# Example: ./scripts/restore.sh ./backups/voice_data_collection_20260208_020000.sql.gz

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <backup_file.sql.gz>"
  echo "Example: $0 ./backups/voice_data_collection_20260208_020000.sql.gz"
  exit 1
fi

BACKUP_FILE="$1"
DB_NAME="${POSTGRES_DB:-voice_data_collection}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_HOST="${POSTGRES_HOST:-postgres}"
DB_PORT="${POSTGRES_PORT:-5432}"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "[$(date)] WARNING: This will overwrite the database. Press Ctrl+C within 5 seconds to cancel."
sleep 5

echo "[$(date)] Restoring from $BACKUP_FILE..."
gunzip -c "$BACKUP_FILE" | PGPASSWORD="${POSTGRES_PASSWORD:-postgres}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" 2>/dev/null || {
  echo "If psql fails, try: createdb first, then run this script again"
  exit 1
}

echo "[$(date)] Restore completed successfully."
