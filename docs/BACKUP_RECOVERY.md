# Backup & Recovery Guide

## Overview

The ILHRF Data Collection Platform uses automated YugaByteDB (PostgreSQL-compatible) backups with optional SeaweedFS (S3-compatible) storage and configurable retention.

## Backup Strategy

### Automated Backups

- **Schedule**: Daily at 2:00 AM UTC (configurable via cron)
- **Retention**: 7 days by default (`BACKUP_RETENTION_DAYS`)
- **Storage**: Local `./backups` directory and optionally SeaweedFS S3
- **Format**: Compressed SQL dump (`.sql.gz`)

### Manual Backup

```bash
# From project root (with Docker)
docker compose exec yugabytedb pg_dump -U yugabyte -h localhost -p 5433 voice_data_collection | gzip > backup_$(date +%Y%m%d).sql.gz

# Or use the backup script (run from host with postgres client)
PGHOST=localhost PGPORT=5433 PGUSER=yugabyte PGPASSWORD=yugabyte ./scripts/backup.sh
```

### Docker Compose Backup Service

The backup service in `compose.yml` runs daily (with `--profile backup`). It targets YugaByteDB:

```yaml
backup:
  image: postgres:15
  container_name: voice-data-backup
  environment:
    PGHOST: yugabytedb
    PGPORT: 5433
    PGUSER: yugabyte
    PGPASSWORD: yugabyte
    PGDATABASE: voice_data_collection
    BACKUP_RETENTION_DAYS: 7
  volumes:
    - ./backups:/backups
  entrypoint: ["/bin/bash", "-c"]
  command:
    - |
      while true; do
        pg_dump -h yugabytedb -p 5433 -U yugabyte voice_data_collection --no-owner --no-acl | gzip > /backups/voice_data_collection_$$(date +%Y%m%d_%H%M%S).sql.gz
        find /backups -name "voice_data_collection_*.sql.gz" -mtime +7 -delete
        sleep 86400
      done
  depends_on:
    yugabytedb:
      condition: service_healthy
  profiles:
    - backup
```

## Recovery

### Restore from Backup

```bash
# 1. Stop the backend to avoid connections
docker compose stop backend

# 2. Restore (from host)
gunzip -c backups/voice_data_collection_20260208_020000.sql.gz | \
  docker compose exec -T yugabytedb psql -U yugabyte -h localhost -p 5433 voice_data_collection

# Or use the restore script
PGHOST=localhost PGPORT=5433 PGUSER=yugabyte PGPASSWORD=yugabyte ./scripts/restore.sh backups/voice_data_collection_20260208_020000.sql.gz

# 3. Restart backend
docker compose start backend
```

### Recovery from SeaweedFS S3

If backups are stored in SeaweedFS S3:

```bash
mc cp backup/backups/voice_data_collection_20260208_020000.sql.gz ./
./scripts/restore.sh voice_data_collection_20260208_020000.sql.gz
```

## Environment Variables

| Variable                  | Default                             | Description                     |
| ------------------------- | ----------------------------------- | ------------------------------- |
| `PGHOST`                  | yugabytedb (or localhost from host) | Database host                   |
| `PGPORT`                  | 5433                                | Database port (YugaByteDB YSQL) |
| `PGUSER`                  | yugabyte                            | Database user                   |
| `PGPASSWORD`              | yugabyte                            | Database password               |
| `PGDATABASE`              | voice_data_collection               | Database name                   |
| `BACKUP_RETENTION_DAYS`   | 7                                   | Days to keep backups            |
| `SEAWEEDFS_BACKUP_BUCKET` | backups                             | SeaweedFS S3 bucket for backups |

## SeaweedFS Data

SeaweedFS stores media files (audio, video). For full disaster recovery:

1. Backup YugaByteDB (database)
2. Backup SeaweedFS volumes: `docker run --rm -v seaweedfs_master_data:/data -v seaweedfs_volume_data:/vol -v $(pwd):/backup alpine tar czf /backup/seaweedfs_backup.tar.gz -C /data . -C /vol .` (or use S3-compatible tools)
3. Backup Dragonfly cache is optional (cache can be rebuilt)
