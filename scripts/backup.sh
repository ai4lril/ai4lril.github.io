#!/bin/bash
# Database backup script for Voice Data Collection Platform
# Backs up PostgreSQL to MinIO (S3-compatible storage)
# Usage: ./scripts/backup.sh [backup_dir]
# Run via cron: 0 2 * * * /path/to/scripts/backup.sh

set -e

BACKUP_DIR="${1:-./backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="${POSTGRES_DB:-voice_data_collection}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_HOST="${POSTGRES_HOST:-postgres}"
DB_PORT="${POSTGRES_PORT:-5432}"
MINIO_HOST="${MINIO_HOST:-minio}"
MINIO_PORT="${MINIO_PORT:-9000}"
MINIO_BUCKET="${MINIO_BACKUP_BUCKET:-backups}"
MINIO_ACCESS_KEY="${MINIO_ACCESS_KEY:-minioadmin}"
MINIO_SECRET_KEY="${MINIO_SECRET_KEY:-minioadmin}"

mkdir -p "$BACKUP_DIR"
DUMP_FILE="${BACKUP_DIR}/voice_data_collection_${TIMESTAMP}.sql.gz"

echo "[$(date)] Starting backup of ${DB_NAME}..."
PGPASSWORD="${POSTGRES_PASSWORD:-postgres}" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --no-owner --no-acl 2>/dev/null | gzip > "$DUMP_FILE"

if [ ! -f "$DUMP_FILE" ] || [ ! -s "$DUMP_FILE" ]; then
  echo "[$(date)] ERROR: Backup failed or produced empty file"
  exit 1
fi

echo "[$(date)] Backup created: $DUMP_FILE ($(du -h "$DUMP_FILE" | cut -f1))"

# Upload to MinIO if mc (minio client) is available
if command -v mc &>/dev/null; then
  export MC_HOST_backup="https://${MINIO_ACCESS_KEY}:${MINIO_SECRET_KEY}@${MINIO_HOST}:${MINIO_PORT}"
  mc mb backup/backups --ignore-existing 2>/dev/null || true
  mc cp "$DUMP_FILE" "backup/${MINIO_BUCKET}/" 2>/dev/null && echo "[$(date)] Uploaded to MinIO" || echo "[$(date)] MinIO upload skipped (mc config or network)"
fi

# Retention: remove backups older than RETENTION_DAYS
find "$BACKUP_DIR" -name "voice_data_collection_*.sql.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
echo "[$(date)] Backup completed. Retention: ${RETENTION_DAYS} days"
