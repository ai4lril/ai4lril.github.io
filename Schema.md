# Voice Data Collection Database Schema

## Overview

This document provides comprehensive documentation of the Voice Data Collection platform's database schema, designed for multilingual voice data collection, annotation, and NLP processing with strong emphasis on data privacy and security.

## Database Technology

- **Database**: YugaByteDB (PostgreSQL-compatible)
- **ORM**: Prisma
- **Migration Tool**: Prisma Migrate
- **Connection**: Connection pooling with retry logic

## Schema Architecture

### Core Entities

## 1. User Model

**Purpose**: Store user profile information with comprehensive demographic and linguistic background data.

**Security Considerations**:

- All personal data is encrypted at rest
- PII fields are masked in logs
- Age and location data require special handling per GDPR
- User consent tracking for data processing

```sql
CREATE TABLE users (
    id                        VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name               VARCHAR NOT NULL,
    last_name                VARCHAR NOT NULL,
    display_name             VARCHAR NOT NULL,
    username                 VARCHAR UNIQUE NOT NULL,
    password                 VARCHAR NOT NULL, -- Bcrypt hashed
    email                    VARCHAR UNIQUE NOT NULL,
    phone_number             VARCHAR, -- Encrypted
    current_residence_pincode VARCHAR, -- Encrypted
    birth_place_pincode      VARCHAR, -- Encrypted
    birth_date               TIMESTAMP, -- Encrypted
    gender                   VARCHAR NOT NULL,
    religion                 VARCHAR,
    mother                   VARCHAR, -- Encrypted (sensitive family data)
    first_language           VARCHAR NOT NULL,
    second_language          VARCHAR,
    third_language           VARCHAR,
    fourth_language          VARCHAR,
    fifth_language           VARCHAR,
    profile_picture_url      VARCHAR,
    created_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at               TIMESTAMP -- Soft delete for GDPR compliance
);
```

### Fields Description

| Field          | Type           | Description               | Security Level | GDPR Consideration |
| -------------- | -------------- | ------------------------- | -------------- | ------------------ |
| `id`           | VARCHAR(25)    | Primary key               | Public         | -                  |
| `first_name`   | VARCHAR        | User's first name         | PII            | Article 6(1)(a)    |
| `last_name`    | VARCHAR        | User's last name          | PII            | Article 6(1)(a)    |
| `username`     | VARCHAR UNIQUE | Unique username           | Public         | -                  |
| `password`     | VARCHAR        | Bcrypt hashed password    | Confidential   | Article 6(1)(c)    |
| `email`        | VARCHAR UNIQUE | Email address             | PII            | Article 6(1)(a)    |
| `phone_number` | VARCHAR        | Phone number (encrypted)  | PII            | Article 6(1)(a)    |
| `birth_date`   | TIMESTAMP      | Date of birth (encrypted) | Sensitive      | Article 9(2)(a)    |
| `gender`       | VARCHAR        | Gender identity           | PII            | Article 6(1)(a)    |
| `mother`       | VARCHAR        | Mother's name (encrypted) | Sensitive      | Article 9(2)(a)    |
| `religion`     | VARCHAR        | Religious affiliation     | Sensitive      | Article 9(2)(a)    |
| `*pincode`     | VARCHAR        | Location data (encrypted) | PII            | Article 6(1)(a)    |
| `*language`    | VARCHAR        | Language proficiency      | PII            | Article 6(1)(a)    |

### Indexes

```sql
CREATE UNIQUE INDEX idx_users_username ON users(username);
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_language ON users(first_language);
```

### Constraints

```sql
ALTER TABLE users ADD CONSTRAINT chk_gender CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'));
ALTER TABLE users ADD CONSTRAINT chk_language_count CHECK (
    (second_language IS NOT NULL OR third_language IS NOT NULL OR fourth_language IS NOT NULL OR fifth_language IS NOT NULL)
    OR (second_language IS NULL AND third_language IS NULL AND fourth_language IS NULL AND fifth_language IS NULL)
);
```

## 2. Sentence Model

**Purpose**: Store text sentences for various NLP tasks with metadata.

```sql
CREATE TABLE sentences (
    id            VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
    text          TEXT NOT NULL,
    language_code VARCHAR NOT NULL,
    is_active     BOOLEAN DEFAULT TRUE,
    difficulty    VARCHAR CHECK (difficulty IN ('easy', 'medium', 'hard')),
    task_type     VARCHAR NOT NULL, -- 'ner', 'translation', 'sentiment', etc.
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Fields Description

| Field           | Type        | Description        | Constraints        |
| --------------- | ----------- | ------------------ | ------------------ |
| `id`            | VARCHAR(25) | Primary key        | Auto-generated     |
| `text`          | TEXT        | Sentence content   | Not null, max 10MB |
| `language_code` | VARCHAR     | ISO language code  | Required           |
| `is_active`     | BOOLEAN     | Active status      | Default true       |
| `difficulty`    | VARCHAR     | Difficulty level   | easy/medium/hard   |
| `task_type`     | VARCHAR     | NLP task type      | Required           |
| `created_at`    | TIMESTAMP   | Creation timestamp | Auto               |
| `updated_at`    | TIMESTAMP   | Last update        | Auto               |

### Indexes

```sql
CREATE INDEX idx_sentences_language_code ON sentences(language_code);
CREATE INDEX idx_sentences_task_type ON sentences(task_type);
CREATE INDEX idx_sentences_active ON sentences(is_active);
CREATE INDEX idx_sentences_created_at ON sentences(created_at);
```

## 3. TranslationMapping Model

**Purpose**: Map source sentences to their translations with validation status.

```sql
CREATE TABLE translation_mappings (
    id            VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
    src_sentence_id VARCHAR(25) NOT NULL,
    tgt_sentence_id VARCHAR(25) NOT NULL,
    user_id       VARCHAR(25),
    is_validated  BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (src_sentence_id) REFERENCES sentences(id),
    FOREIGN KEY (tgt_sentence_id) REFERENCES sentences(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(src_sentence_id, tgt_sentence_id, user_id)
);
```

### Relationships

- **Source Sentence**: One-to-many with Sentence
- **Target Sentence**: One-to-many with Sentence
- **User**: Many-to-one with User (optional for anonymous contributions)

### Indexes

```sql
CREATE INDEX idx_translation_mappings_src ON translation_mappings(src_sentence_id);
CREATE INDEX idx_translation_mappings_tgt ON translation_mappings(tgt_sentence_id);
CREATE INDEX idx_translation_mappings_user ON translation_mappings(user_id);
CREATE INDEX idx_translation_mappings_validated ON translation_mappings(is_validated);
```

## 4. NerAnnotation Model

**Purpose**: Store named entity recognition annotations with token-level details.

```sql
CREATE TABLE ner_annotations (
    id           VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
    sentence_id  VARCHAR(25) NOT NULL,
    user_id      VARCHAR(25),
    annotations  JSONB NOT NULL, -- Token-level annotations
    language_code VARCHAR NOT NULL,
    is_validated BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (sentence_id) REFERENCES sentences(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Annotation Structure

```json
{
  "tokens": [
    {
      "text": "John",
      "start": 0,
      "end": 4,
      "label": "PERSON",
      "confidence": 0.95
    },
    {
      "text": "New York",
      "start": 10,
      "end": 18,
      "label": "LOCATION",
      "confidence": 0.89
    }
  ],
  "metadata": {
    "annotator": "user_123",
    "model_version": "v1.2.3",
    "processing_time": 245
  }
}
```

### Indexes

```sql
CREATE INDEX idx_ner_annotations_sentence ON ner_annotations(sentence_id);
CREATE INDEX idx_ner_annotations_user ON ner_annotations(user_id);
CREATE INDEX idx_ner_annotations_validated ON ner_annotations(is_validated);
CREATE INDEX idx_ner_annotations_language ON ner_annotations(language_code);
```

## Security Features

### Data Encryption

1. **At Rest Encryption**

   ```sql
   -- Sensitive fields are encrypted using AES-256
   -- Encryption keys are managed by AWS KMS
   -- All backups are encrypted
   ```

2. **In Transit Encryption**

   - TLS 1.3 for all connections
   - Certificate pinning for mobile apps
   - Perfect forward secrecy enabled

3. **Field-Level Encryption**
   ```sql
   -- PII fields: phone_number, birth_date, mother, *pincode
   -- Encrypted before storage, decrypted on retrieval with proper auth
   ```

### Access Control

```sql
-- Row Level Security (RLS) policies
CREATE POLICY user_data_isolation ON users
    FOR ALL USING (auth.uid() = id);

CREATE POLICY sentence_access ON sentences
    FOR SELECT USING (is_active = true OR auth.role() = 'admin');

-- Audit logging for sensitive operations
CREATE TRIGGER audit_user_changes
    AFTER UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_user_data_changes();
```

### GDPR Compliance Features

1. **Right to Erasure**

   ```sql
   -- Soft delete with data anonymization
   UPDATE users SET
       first_name = 'Deleted',
       last_name = 'User',
       email = CONCAT('deleted_', id, '@anonymous.com'),
       phone_number = NULL,
       deleted_at = CURRENT_TIMESTAMP
   WHERE id = $1;
   ```

2. **Data Portability**

   ```sql
   -- Export user data in structured format
   SELECT json_build_object(
       'user', row_to_json(u),
       'annotations', json_agg(na.annotations),
       'translations', json_agg(tm.*)
   ) FROM users u
   LEFT JOIN ner_annotations na ON u.id = na.user_id
   LEFT JOIN translation_mappings tm ON u.id = tm.user_id
   WHERE u.id = $1;
   ```

3. **Consent Management**
   ```sql
   CREATE TABLE user_consents (
       id VARCHAR(25) PRIMARY KEY,
       user_id VARCHAR(25) NOT NULL,
       consent_type VARCHAR NOT NULL,
       granted_at TIMESTAMP,
       revoked_at TIMESTAMP,
       ip_address INET,
       user_agent TEXT
   );
   ```

## Performance Optimizations

### Indexing Strategy

```sql
-- Composite indexes for common queries
CREATE INDEX idx_sentences_active_language_task
ON sentences(is_active, language_code, task_type);

CREATE INDEX idx_annotations_user_validated
ON ner_annotations(user_id, is_validated);

-- Partial indexes for active data
CREATE INDEX idx_active_sentences
ON sentences(created_at) WHERE is_active = true;
```

### Partitioning Strategy

```sql
-- Partition sentences by creation month for better performance
CREATE TABLE sentences_y2024m01 PARTITION OF sentences
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Partition annotations by language for distributed processing
CREATE TABLE ner_annotations_hi PARTITION OF ner_annotations
    FOR VALUES FROM ('hi') TO ('hj');
```

### Caching Strategy

```sql
-- Redis cache keys structure
-- sentences:{language}:{task}:active
-- annotations:{sentence_id}:latest
-- user:{user_id}:profile:public
-- translations:{src_lang}:{tgt_lang}:recent
```

## Monitoring and Alerting

### Key Metrics to Monitor

1. **Performance Metrics**

   - Query execution time > 100ms
   - Cache hit rate < 80%
   - Connection pool utilization > 80%

2. **Security Metrics**

   - Failed login attempts > 5 per minute
   - Sensitive data access patterns
   - GDPR data export requests

3. **Data Quality Metrics**
   - Annotation validation rate
   - Translation quality scores
   - User engagement metrics

### Alerting Rules

```sql
-- Performance alerts
CREATE OR REPLACE FUNCTION alert_slow_queries()
RETURNS trigger AS $$
BEGIN
    IF NEW.duration > 5000 THEN
        PERFORM pg_notify('alert_channel',
            json_build_object(
                'type', 'slow_query',
                'query', NEW.query,
                'duration', NEW.duration
            )::text
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Backup and Recovery

### Backup Strategy

```bash
# Daily full backups
pg_dump --format=custom --compress=9 --no-owner --no-privileges \
    -h $DB_HOST -U $DB_USER -d $DB_NAME > backup_$(date +%Y%m%d).dump

# Incremental backups every 6 hours
pg_dump --format=directory --compress=9 --no-owner --no-privileges \
    -h $DB_HOST -U $DB_USER -d $DB_NAME -j 4 > incremental_$(date +%Y%m%d_%H%M%S)

# Encrypted offsite storage
aws s3 cp backup_*.dump s3://voice-data-backups/encrypted/
```

### Recovery Testing

```bash
# Point-in-time recovery test
pg_restore --format=custom --create --clean \
    --if-exists -h $RECOVERY_HOST -U $DB_USER \
    -d recovery_test backup_20241201.dump
```

## Data Retention Policies

### Retention Periods

| Data Type             | Retention Period       | Deletion Method     |
| --------------------- | ---------------------- | ------------------- |
| User sessions         | 30 days                | Hard delete         |
| Failed login attempts | 90 days                | Hard delete         |
| Audit logs            | 7 years                | Archive then delete |
| User data (active)    | Until deletion request | Soft delete         |
| Annotations           | Indefinite             | Archive only        |
| Sentences             | Indefinite             | Keep active         |

### Automated Cleanup

```sql
-- Clean up old sessions
DELETE FROM user_sessions
WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';

-- Anonymize old audit logs
UPDATE audit_logs
SET user_id = 'anonymized',
    ip_address = NULL,
    user_agent = NULL
WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '2 years';
```

## Migration Strategy

### Version Control

```sql
-- Migration files structure
migrations/
├── 001_initial_schema.sql
├── 002_add_encryption.sql
├── 003_gdpr_compliance.sql
├── 004_performance_indexes.sql
└── 005_partitioning.sql
```

### Rollback Procedures

```sql
-- Safe rollback with data preservation
BEGIN;
    -- Create backup
    CREATE TABLE users_backup AS SELECT * FROM users;

    -- Rollback migration
    ALTER TABLE users DROP COLUMN new_field;

    -- Verify data integrity
    SELECT COUNT(*) FROM users;
COMMIT;
```

This comprehensive schema ensures data privacy, security, performance, and compliance with regulations like GDPR while supporting the complex requirements of multilingual voice data collection and NLP processing.
