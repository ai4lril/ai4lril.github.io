# Backup & Recovery Guide

## Overview

The Voice Data Collection Platform uses automated PostgreSQL backups with optional MinIO storage and configurable retention.

## Backup Strategy

### Automated Backups

- **Schedule**: Daily at 2:00 AM UTC (configurable via cron)
- **Retention**: 7 days by default (`BACKUP_RETENTION_DAYS`)
- **Storage**: Local `./backups` directory and optionally MinIO
- **Format**: Compressed SQL dump (`.sql.gz`)

### Manual Backup

```bash
# From project root (with Docker)
docker compose exec postgres pg_dump -U postgres voice_data_collection | gzip > backup_$(date +%Y%m%d).sql.gz

# Or use the backup script (run from host with postgres client)
POSTGRES_HOST=localhost POSTGRES_PORT=5432 ./scripts/backup.sh
```

### Docker Compose Backup Service

Add to `compose.yml` to run backups daily:

```yaml
backup:
  image: postgres:15
  container_name: voice-data-backup
  environment:
    POSTGRES_HOST: postgres
    POSTGRES_PASSWORD: postgres
    BACKUP_RETENTION_DAYS: 7
  volumes:
    - ./backups:/backups
  entrypoint: ["/bin/sh", "-c"]
  command:
    - |
      apk add --no-cache postgresql-client
      while true; do
        pg_dump -h postgres -U postgres voice_data_collection | gzip > /backups/backup_$$(date +%Y%m%d_%H%M%S).sql.gz
        find /backups -name "backup_*.sql.gz" -mtime +7 -delete
        sleep 86400
      done
  depends_on:
    - postgres
```

## Recovery

### Restore from Backup

```bash
# 1. Stop the backend to avoid connections
docker compose stop backend

# 2. Restore (from host)
gunzip -c backups/voice_data_collection_20260208_020000.sql.gz | \
  docker compose exec -T postgres psql -U postgres voice_data_collection

# Or use the restore script
POSTGRES_HOST=localhost ./scripts/restore.sh backups/voice_data_collection_20260208_020000.sql.gz

# 3. Restart backend
docker compose start backend
```

### Recovery from MinIO

If backups are stored in MinIO:

```bash
mc cp backup/backups/voice_data_collection_20260208_020000.sql.gz ./
./scripts/restore.sh voice_data_collection_20260208_020000.sql.gz
```

## Environment Variables

| Variable                | Default               | Description              |
| ----------------------- | --------------------- | ------------------------ |
| `POSTGRES_HOST`         | postgres              | Database host            |
| `POSTGRES_PORT`         | 5432                  | Database port            |
| `POSTGRES_USER`         | postgres              | Database user            |
| `POSTGRES_PASSWORD`     | postgres              | Database password        |
| `POSTGRES_DB`           | voice_data_collection | Database name            |
| `BACKUP_RETENTION_DAYS` | 7                     | Days to keep backups     |
| `MINIO_BACKUP_BUCKET`   | backups               | MinIO bucket for backups |

## MinIO Data

MinIO stores media files (audio, video). For full disaster recovery:

1. Backup PostgreSQL (database)
2. Backup MinIO volume: `docker run --rm -v minio_data:/data -v $(pwd):/backup alpine tar czf /backup/minio_backup.tar.gz -C /data .`
3. Backup Dragonfly cache is optional (cache can be rebuilt)
