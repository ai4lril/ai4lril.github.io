# ILHRF Data Collection Database Schema

**Last Updated:** February 20, 2026

## Overview

This document provides comprehensive documentation of the ILHRF Data Collection platform's database schema, designed for multilingual voice data collection, annotation, and NLP processing with strong emphasis on data privacy and security.

**Source of truth:** [backend/prisma/schema.prisma](backend/prisma/schema.prisma)

## Database Technology

- **Database**: YugaByteDB (PostgreSQL-compatible)
- **ORM**: Prisma
- **Migration Tool**: Prisma Migrate
- **Connection**: Connection pooling with retry logic
- **IDs**: CUID (default) for all primary keys

---

## Model Summary

| Model                   | Table                      | Purpose                                   |
| ----------------------- | -------------------------- | ----------------------------------------- |
| User                    | users                      | User profiles, OAuth, gamification, role  |
| PasswordResetToken      | password_reset_tokens      | Password reset flow                       |
| Sentence                | sentences                  | Text sentences for NLP/speech tasks       |
| TranslationMapping      | translation_mappings       | Source-to-target sentence mappings        |
| SpeechRecording         | speech_recordings          | Audio/video recordings (SeaweedFS links)  |
| QuestionSubmission      | question_submissions       | Q&A crowdsourcing submissions             |
| AnswerRecording         | answer_recordings          | Spontaneous speech answers                |
| NerAnnotation           | ner_annotations            | NER token-level annotations               |
| NerResult               | ner_results                | NER entity results                        |
| PosResult               | pos_results                | POS tagging results                       |
| TranslationResult       | translation_results        | Translation outputs                       |
| SentimentResult         | sentiment_results          | Sentiment analysis                        |
| EmotionResult           | emotion_results            | Emotion detection                         |
| Validation              | validations                | Listen feature validations (max 25/audio) |
| SentenceValidation      | sentence_validations       | Admin validation of Write sentences       |
| QuestionValidation      | question_validations       | Admin validation of questions             |
| AudioMetadata           | audio_metadata             | Blob links, duration, demographics        |
| TranscriptionReview     | transcription_reviews      | Transcription review linking              |
| DatasetCategory         | dataset_categories         | Training/eval/testing categorization      |
| UserProgress            | user_progress              | Per-feature completion tracking           |
| Contribution            | contributions              | User contributions (audio, text, etc.)    |
| AdminUser               | admin_users                | Admin accounts for validation             |
| SecurityEvent           | security_events            | Login attempts, suspicious activity       |
| AuditLog                | audit_logs                 | Admin action audit trail                  |
| UserActivity            | user_activities            | User action logging                       |
| ApiKey                  | api_keys                   | Public API access keys                    |
| OAuthAccount            | oauth_accounts             | Multi-provider OAuth linking              |
| Notification            | notifications              | In-app notifications                      |
| NotificationPreference  | notification_preferences   | Email/push preferences                    |
| EmailQueue              | email_queue                | Async email sending                       |
| PushSubscription        | push_subscriptions         | Web push endpoints                        |
| Badge                   | badges                     | Badge definitions                         |
| UserBadge               | user_badges                | User-earned badges                        |
| Achievement             | achievements               | Achievement definitions                   |
| UserAchievement         | user_achievements          | User achievement progress                 |
| Streak                  | streaks                    | Daily streak tracking                     |
| UserStats               | user_stats                 | Aggregated user stats                     |
| Leaderboard             | leaderboards               | Rankings by category/language             |
| ExportJob               | export_jobs                | Data export requests                      |
| ExportFile              | export_files               | Export file metadata                      |
| BlogPost                | blog_posts                 | Community blog posts                      |
| AudioBlog               | audio_blogs                | Audio blog entries                        |
| VideoBlog               | video_blogs                | Video blog entries                        |
| ForumCategory           | forum_categories           | Forum categories                          |
| ForumPost               | forum_posts                | Forum posts                               |
| ForumReply              | forum_replies              | Forum replies                             |
| FAQ                     | faqs                       | FAQ entries                               |
| Feedback                | feedback                   | User feedback                             |
| ContentFlag             | content_flags              | User-reported content                     |
| Appeal                  | appeals                    | Moderation appeals                        |
| ModerationRule          | moderation_rules           | Auto-moderation rules                     |
| QualityScore            | quality_scores             | User quality scores                       |
| InterAnnotatorAgreement | inter_annotator_agreements | IAA (Kappa) scores                        |
| AnomalyDetection        | anomaly_detections         | Spam/quality anomalies                    |
| SystemMetric            | system_metrics             | Response time, error rate, etc.           |
| WebSocketConnection     | websocket_connections      | Real-time connections                     |
| ActivityFeed            | activity_feeds             | Activity feed items                       |
| DataVersion             | data_versions              | Data versioning snapshots                 |
| DataLineage             | data_lineages              | Data provenance                           |
| SavedSearch             | saved_searches             | Saved search queries                      |
| SearchHistory           | search_history             | Search query history                      |
| BackupJob               | backup_jobs                | Backup job tracking                       |
| Webhook                 | webhooks                   | Webhook endpoints                         |
| WebhookDelivery         | webhook_deliveries         | Webhook delivery logs                     |

---

## Core Entities (Detailed)

### 1. User

**Purpose:** User profiles with demographic, linguistic, OAuth, and gamification data.

| Field                                                                     | Type              | Notes                               |
| ------------------------------------------------------------------------- | ----------------- | ----------------------------------- |
| id                                                                        | String (cuid)     | Primary key                         |
| first_name, last_name, display_name                                       | String            | Required                            |
| username, email                                                           | String            | Unique, required                    |
| password                                                                  | String?           | Optional for OAuth users            |
| phone_number, birth_date, gender, religion, mother                        | String?           | PII/sensitive                       |
| *pincode, *language                                                       | String?           | Location, language proficiency      |
| google_id, github_id, oauth_provider                                      | String?           | OAuth                               |
| occupation, education, birthplace*\*, current_residence*\_, workplace\_\_ | String?           | Profile                             |
| role                                                                      | UserRole          | USER, MODERATOR, ADMIN, SUPER_ADMIN |
| points, level, tier                                                       | Int/String        | Gamification                        |
| is_verified, onboarding_completed_at                                      | Boolean/DateTime? | Verification                        |
| created_at, updated_at, deleted_at                                        | DateTime          | Soft delete for GDPR                |

### 2. Sentence

**Purpose:** Text sentences for speech, NLP, and translation tasks.

| Field                  | Type          | Notes                                       |
| ---------------------- | ------------- | ------------------------------------------- |
| id                     | String (cuid) | Primary key                                 |
| text                   | String        | Sentence content                            |
| language_code          | String        | ISO code                                    |
| user_id                | String?       | Submitter (optional)                        |
| is_active              | Boolean       | Default true                                |
| difficulty             | String?       | easy, medium, hard                          |
| task_type              | String        | ner, translation, speech, etc.              |
| valid                  | Boolean?      | null=pending, true=approved, false=rejected |
| citation               | String?       | Source for user-submitted                   |
| created_at, updated_at | DateTime      |                                             |

### 3. SpeechRecording

**Purpose:** Audio/video recordings linked to sentences. Blob storage (SeaweedFS S3).

| Field                  | Type          | Notes                  |
| ---------------------- | ------------- | ---------------------- |
| id                     | String (cuid) | Primary key            |
| sentence_id, user_id   | String        | FK to sentences, users |
| audio_file             | String        | SeaweedFS S3 path/URL  |
| audio_format           | String        | wav, webm, mp3         |
| media_type             | String        | audio or video         |
| duration, file_size    | Float?, Int?  | Metadata               |
| is_validated           | Boolean       | Default false          |
| created_at, updated_at | DateTime      |                        |

### 4. QuestionSubmission

**Purpose:** Q&A crowdsourcing; users submit questions, others record answers.

| Field                  | Type               | Notes             |
| ---------------------- | ------------------ | ----------------- |
| id                     | String (cuid)      | Primary key       |
| sentence_id            | String             | Question sentence |
| user_id                | String?            | Submitter         |
| submitted_text         | String             | Question text     |
| language_code          | String             |                   |
| is_validated, valid    | Boolean?, Boolean? | Validation status |
| created_at, updated_at | DateTime           |                   |

### 5. TranslationMapping

**Purpose:** Maps source sentences to target translations.

| Field                                             | Type          | Notes                |
| ------------------------------------------------- | ------------- | -------------------- |
| id                                                | String (cuid) | Primary key          |
| src_sentence_id, tgt_sentence_id                  | String        | FK to sentences      |
| user_id                                           | String?       | Optional contributor |
| is_validated                                      | Boolean       | Default false        |
| created_at, updated_at                            | DateTime      |                      |
| UNIQUE(src_sentence_id, tgt_sentence_id, user_id) |               |                      |

### 6. NerAnnotation

**Purpose:** NER token-level annotations (JSON structure).

| Field                  | Type            | Notes                   |
| ---------------------- | --------------- | ----------------------- |
| id                     | String (cuid)   | Primary key             |
| sentence_id, user_id   | String, String? | FK                      |
| annotations            | Json            | Token-level annotations |
| language_code          | String          |                         |
| is_validated           | Boolean         | Default false           |
| created_at, updated_at | DateTime        |                         |

### 7. Validation

**Purpose:** Listen feature — users validate audio matches text (max 25 per recording).

| Field                                | Type          | Notes                      |
| ------------------------------------ | ------------- | -------------------------- |
| id                                   | String (cuid) | Primary key                |
| speech_recording_id, user_id         | String        | FK                         |
| is_valid                             | Boolean       | true=match, false=no match |
| created_at                           | DateTime      |                            |
| UNIQUE(speech_recording_id, user_id) |               |                            |

---

## NLP Result Models

| Model             | Key Fields                                                                    | Purpose                               |
| ----------------- | ----------------------------------------------------------------------------- | ------------------------------------- |
| NerResult         | sentence_id, user_id, entities (Json), confidence, language_code              | NER entity results                    |
| PosResult         | sentence_id, user_id, tokens (Json), language_code                            | POS tagging                           |
| TranslationResult | sentence_id, source_language, target_language, original_text, translated_text | Translation                           |
| SentimentResult   | sentence_id, text, sentiment, confidence, language_code                       | Sentiment (positive/negative/neutral) |
| EmotionResult     | sentence_id, text, emotion, confidence, language_code                         | Emotion (joy, sadness, etc.)          |

---

## Auth & Security

| Model              | Purpose                                                 |
| ------------------ | ------------------------------------------------------- |
| PasswordResetToken | Token, expiry, used_at for reset flow                   |
| ApiKey             | Hashed key, key_prefix, name, expires_at for API access |
| OAuthAccount       | Links provider (GOOGLE/GITHUB) + providerId to User     |
| AdminUser          | Admin accounts for sentence/question validation         |
| SecurityEvent      | Login attempts, failed logins, severity, resolved       |
| AuditLog           | Admin actions, old/new values, resource                 |

---

## Gamification

| Model           | Purpose                                                       |
| --------------- | ------------------------------------------------------------- |
| Badge           | Badge definitions (name, description, category)               |
| UserBadge       | User-earned badges                                            |
| Achievement     | Achievement definitions                                       |
| UserAchievement | Progress (0–100), completed                                   |
| Streak          | current_streak, longest_streak, daily_goal                    |
| UserStats       | total_contributions, total_validations, points, audio_seconds |
| Leaderboard     | Rankings by category, language, period                        |

---

## Notifications

| Model                  | Purpose                                     |
| ---------------------- | ------------------------------------------- |
| Notification           | type, title, message, action_url, read      |
| NotificationPreference | in_app, email, push, email_types            |
| EmailQueue             | Async email (to, subject, template, status) |
| PushSubscription       | Web push endpoint, p256dh, auth             |

---

## Community

| Model         | Purpose                                          |
| ------------- | ------------------------------------------------ |
| BlogPost      | title, content, language_code, script, published |
| AudioBlog     | title, audio_file (SeaweedFS), duration          |
| VideoBlog     | title, video_file (SeaweedFS), thumbnail_url     |
| ForumCategory | name, slug, order                                |
| ForumPost     | category_id, title, content, pinned, locked      |
| ForumReply    | post_id, content                                 |
| FAQ           | question, answer, category                       |
| Feedback      | type, subject, message, status, admin_response   |

---

## Admin & Moderation

| Model              | Purpose                                                      |
| ------------------ | ------------------------------------------------------------ |
| SentenceValidation | Admin validates Write sentences (valid, comment)             |
| QuestionValidation | Admin validates questions                                    |
| DatasetCategory    | resource_type, resource_id, category (training/eval/testing) |
| ModerationRule     | conditions, actions, enabled                                 |
| ContentFlag        | User-reported content, reason, status                        |
| Appeal             | Moderation appeals, review_notes                             |

---

## Export & Backup

| Model      | Purpose                                          |
| ---------- | ------------------------------------------------ |
| ExportJob  | type, format, status, file_url, filters          |
| ExportFile | export_job_id, file_name, file_url, file_size    |
| BackupJob  | type, status, file_url, started_at, completed_at |

---

## Other Models

| Model                   | Purpose                                                       |
| ----------------------- | ------------------------------------------------------------- |
| UserProgress            | resource_type, resource_id, feature_type, completed_at        |
| UserActivity            | action, resource, metadata, ip_address                        |
| Contribution            | type, content, language, status, reviewed_by                  |
| AudioMetadata           | blob_storage_link, duration, language_code, gender, age_group |
| TranscriptionReview     | Links transcription to audio, is_approved                     |
| AnswerRecording         | question_submission_id, audio_file, duration                  |
| SystemMetric            | metric_type, value, unit, timestamp                           |
| WebSocketConnection     | socket_id, connected_at                                       |
| ActivityFeed            | type, title, description                                      |
| DataVersion             | resource_type, resource_id, version, data (Json)              |
| DataLineage             | source/target type/id, relationship                           |
| SavedSearch             | name, query, filters                                          |
| SearchHistory           | query, result_count                                           |
| QualityScore            | userId, score, category                                       |
| InterAnnotatorAgreement | kappa_score, resource_type, resource_id                       |
| AnomalyDetection        | anomaly_type, score, resolved                                 |
| Webhook                 | url, event_types, secret                                      |
| WebhookDelivery         | payload, status, attempts, response_status                    |

---

## Indexes (Key Patterns)

- **User:** email, username, created_at, google_id, github_id, points, level, tier
- **Sentence:** language_code, task_type, valid, is_active, (language_code, task_type, valid, is_active)
- **SpeechRecording:** sentence_id, user_id, is_validated, (is_validated, created_at)
- **Validation:** (speech_recording_id, user_id) unique
- **NerAnnotation, NerResult, etc.:** sentence_id, user_id, language_code, is_validated

---

## Security Features

### Data Privacy

- **PII fields:** phone_number, birth_date, mother, \*pincode — handle per GDPR
- **Soft delete:** users.deleted_at for Right to Erasure
- **Encryption:** Sensitive fields encrypted at rest (application-level)

### Access Control

- **Role-based:** UserRole (USER, MODERATOR, ADMIN, SUPER_ADMIN)
- **API keys:** Hashed storage, key_prefix for lookup

---

## Backup and Recovery

See [docs/BACKUP_RECOVERY.md](docs/BACKUP_RECOVERY.md) for YugaByteDB backup and restore procedures.

```bash
# Manual backup (YugaByteDB) — connect to node1
pg_dump -h yugabytedb-node1 -p 5433 -U yugabyte ilhrf_data_collection --no-owner --no-acl | gzip > backup.sql.gz
```

---

## Enums

| Enum          | Values                              |
| ------------- | ----------------------------------- |
| OAuthProvider | GOOGLE, GITHUB                      |
| UserRole      | USER, MODERATOR, ADMIN, SUPER_ADMIN |

---

This schema ensures data privacy, security, performance, and compliance with regulations like GDPR while supporting multilingual voice data collection, annotation, and NLP processing.
