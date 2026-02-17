# Changelog

All notable changes to the ILHRF Data Collection Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed (2026-02-18)

#### Documentation

- **CRITICAL_ANALYSIS_REPORT.md cleanup** — Removed implemented items from the report:
  - Removed: Audio Duration Calculation (implemented in speak page with calculateMediaDuration)
  - Removed: Admin Dashboard Error Handling (error state, retry, try/catch)
  - Removed: Error Handling / AllExceptionsFilter (implemented globally)
  - Removed: Search/Filter (SearchBar, FilterPanel in admin content-moderation)
  - Removed: Review Validation Count Logic (submitReview creates Validation, 25-threshold)
  - Removed: API Key Rate Limiting (ApiKeyRateLimitGuard, ThrottlerModule)
  - Removed: RBAC (UserRole, RolesGuard, @Roles decorator)
  - Removed: Chart.js optimization (tree-shaking with specific module imports)
  - Removed: API Documentation (Swagger at /api/docs)
  - Kept: OAuth error handling (pending), API key entropy (optional)
  - Updated Executive Summary and Priority Recommendations
- **Merged CRITICAL_ANALYSIS_REPORT.md into REMAINING_FEATURES.md**
  - Added Critical & Security Issues section (OAuth error handling, API key entropy)
  - Added completion status and implemented features list
  - Updated Feature Completeness Matrix with OAuth and API key items
  - Updated Next Steps with immediate, short-term, and future priorities
- **Removed** `CRITICAL_ANALYSIS_REPORT.md` (content consolidated into REMAINING_FEATURES.md)

### Changed (2026-02-17)

#### MinIO to SeaweedFS Migration

- **Storage**: Replaced MinIO with SeaweedFS for blob storage (audio, video, exports)
  - Backend uses AWS S3 SDK (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`) with SeaweedFS S3 gateway
  - Env vars: `SEAWEEDFS_S3_HOST`, `SEAWEEDFS_S3_PORT`, `SEAWEEDFS_ACCESS_KEY`, `SEAWEEDFS_SECRET_KEY`, `SEAWEEDFS_BUCKET`, `SEAWEEDFS_USE_SSL` (MINIO\_\* fallback supported)
  - Docker Compose: SeaweedFS stack (master, volume, filer, s3) replaces MinIO
  - CI: SeaweedFS all-in-one container for backend tests
  - Docs: BACKUP_RECOVERY.md, backup.sh, README updated for SeaweedFS
  - Removed `minio` from backend and frontend dependencies

### Added (2026-02-17)

#### SEO Enhancements

- **metadataBase, openGraph, twitter, keywords** — Root layout with International Linguistic Heritage Research Foundation branding, 7100+ languages, crowdsourcing-focused descriptions
- **Site config** — `frontend/lib/site-config.ts` with SITE_URL (NEXT_PUBLIC_FRONTEND_URL), ORG_NAME, ORG_ACRONYM, ORG_DESCRIPTION
- **Dynamic sitemap** — `app/sitemap.ts` with all public routes (/, about, speak, listen, question, write, transcribe, translate, review, languages, contact, privacy, terms, cookies, data-rights, docs, login)
- **Dynamic robots.txt** — `app/robots.ts`; removed Crawl-delay; no Disallow for \*.json (allows manifest.json); AhrefsBot/SemrushBot disallowed
- **Page layouts** — speak, listen, question, write, transcribe with full metadata and canonical URLs
- **Canonical URLs** — Added to languages, privacy, about, terms, contact, cookies, data-rights
- **Structured data** — StructuredData component with Organization + WebSite JSON-LD in root layout
- **Default OG image** — `app/opengraph-image.tsx` with ImageResponse (1200×630, indigo gradient, ILHRF, foundation name, "Crowdsourced Linguistic Data for 7100+ Languages")
- **SEOHead** — Deprecated; updated to use SITE_URL and foundation branding
- **About page** — Updated to International Linguistic Heritage Research Foundation, 7100+ languages (global scope)
- **Static files removed** — Deleted public/sitemap.xml and public/robots.txt (replaced by dynamic versions)

#### Mobile-Friendly Website

- **Viewport configuration**: Explicit viewport export in layout (device-width, initialScale, maximumScale, userScalable, viewportFit: cover)
- **Table overflow**: Wrapped privacy stats table, pos/ner annotation tables in overflow-x-auto
- **Content-moderation layout**: Sentences and questions list items stack on mobile (flex-col sm:flex-row, min-w-0, flex-shrink-0)
- **Video recording**: Mobile-aware constraints in RecordBtn (640×480 min on viewport < 768px)
- **Safe-area insets**: BottomBar uses pb-[max(1rem,env(safe-area-inset-bottom))] for notched phones

#### Documentation

- **Consolidated analysis documents**: Created `REMAINING_FEATURES.md` merging content from `GAP_ANALYSIS.md`, `SCALABILITY_ANALYSIS.md`, `CACHING_ANALYSIS.md`, and `README-IMPLEMENTATION.md`; deleted the four original files

#### Backend

- **ESLint fixes**: Resolved all 234 backend ESLint warnings without changing config
  - Added `getErrorMessage()` and `isPrismaErrorCode()` in `common/error-utils.ts`
  - Added `RequestUser` type in `common/request-user.types.ts`
  - Typed `req.user` across controllers (auth, community, export, gamification, notifications, search)
  - Replaced `error: any` with `error: unknown` and `getErrorMessage()` for error handling
  - Fixed OAuth profile typing, Prisma error checks, floating promises, cache generics

#### Frontend

- **Logger unit tests**: Fixed TypeScript errors in `test/unit/logger.test.ts`
  - Added `length` and `key` to localStorage mock to satisfy `Storage` interface
  - Added `Record<string, string>` type assertion for `formLog.metadata.fields` in privacy compliance test

### Added (2026-02-09)

#### Documentation

- **SEO analysis**: Added SEO Enhancements section to REMAINING_FEATURES.md
  - Current state: partial metadata, static sitemap/robots, unused SEOHead component
  - Proposed: metadataBase, dynamic sitemap, canonical URLs, structured data (JSON-LD), OG images, domain consistency

#### Intelligent Task Assignment

- **TaskAssignmentService**: Centralized scoring and ranking for task assignment
  - Difficulty matching: easy for level 1–2, medium for 3–5, hard for 6+
  - Language preference: boost tasks in user's `languagesContributed`
  - Under-collection prioritization: prefer sentences with fewer recordings, recordings with fewer validations, questions with fewer answers
  - Waiting-time prioritization: prefer recordings waiting longest for validation/transcription
- **SpeechService**: getSpeechSentences and getAudioForValidation use intelligent assignment
- **QuestionService**: getValidatedQuestions uses intelligent assignment
- **TranscriptionService**: getAudioForTranscription uses intelligent assignment

#### Contributor Onboarding

- **Welcome email**: Sent after signup (email/password and OAuth) with first-task tips and link to /speak
- **Onboarding tour**: 5-step modal (Welcome → Choose language → Record first sentence → Validate others → You're ready) with Next/Skip/Done; `PATCH /users/me/onboarding-complete` to mark done
- **First-task tip**: Dismissible tip card on /speak when totalContributions === 0 (quiet room, clear pronunciation)
- **Progress tracking**: "X of 5 steps" display for new users; `GET /gamification/stats/me` returns totalContributions, totalValidations, onboardingStep, onboardingCompletedAt
- **Analytics**: UserActivity logged when tour is completed (`action: onboarding_completed`, `resource: tour`)

#### Webhook System

- **Webhook registration**: REST API for managing webhooks (POST/GET/PUT/DELETE `/api/webhooks`)
  - Per-user webhooks with URL, secret, description, and event type subscriptions
  - JWT authentication required
- **Webhook delivery**: Async delivery via BullMQ queue (`{webhook-delivery}`)
  - 5 retry attempts with exponential backoff
  - HMAC-SHA256 signatures in `X-Webhook-Signature` header for verification
  - Payload format: `{ event, timestamp, data }`
- **Event types**: `speech.recorded`, `question.answered`, `user.signed_up`, `feedback.submitted`
- **Integration points**: Media upload processor, auth service, feedback service
- **Database**: `Webhook` and `WebhookDelivery` models; migration `20260217120000_add_webhooks`
- **Documentation**: Removed Webhook System from `REMAINING_FEATURES.md` (now implemented)

### Changed (2026-02-08)

#### Documentation

- **Analysis documents cleanup**: Removed implemented features from `GAP_ANALYSIS.md`, `SCALABILITY_ANALYSIS.md`, and `CACHING_ANALYSIS.md` to focus on remaining gaps
  - GAP_ANALYSIS: Removed list of implemented items (RBAC, OAuth, API docs, etc.) from Executive Summary
  - SCALABILITY_ANALYSIS: Removed BullMQ implementation status section
  - CACHING_ANALYSIS: Removed implemented features list (wildcard deletion, cache warming, etc.)

### Added (2026-02-08)

#### Test Coverage

- Added unit tests for `AdminService` and `SearchService`
- CI now runs `pnpm test:cov` for backend with coverage reporting
- Excluded spec files and main.ts from coverage collection

#### Advanced Search

- **Admin content moderation**: Search and filter for pending sentences and questions
  - Text search (debounced)
  - Language filter
  - Status filter (all, pending, approved, rejected)
  - Date range filter (from/to)
- **Public search API**: Added `languageCode`, `dateFrom`, `dateTo`, `orderBy` (relevance|date) query params
- New components: `SearchBar`, `FilterPanel` in `frontend/components/admin/`

#### Real-time Collaboration

- **Backend**: RealtimeGateway now emits events on data mutations
  - Admin validates sentence/question → `admin:content` room receives update + refreshed stats
  - User submits sentences → moderators notified via `admin:content`
  - User saves recording → activity event to user
  - Submitter notification when their sentence/question is validated
- **Frontend**: Admin pages listen for real-time updates
  - Sentences and questions pages refetch when another admin validates content
  - Dashboard receives `admin:stats` and updates pending counts
  - Toast notifications for users when their submissions are validated
- `RealtimeNotificationListener` component for user notifications
- AdminLayout supports both `adminToken` and user `token` auth
- AdminLayout connects WebSocket and subscribes to `admin:content`

### Planned Changes

This section tracks planned improvements based on the Platform Scalability Implementation Plan.

#### Phase 1: Critical Fixes & Foundation (Weeks 1-4)

- [x] **Cache System Critical Fixes**
  - Fix wildcard deletion bug in `CacheService`
  - Increase Dragonfly memory from 4GB to 64GB
  - Add eviction policy (`allkeys-lru`)
  - Implement `delPattern()` method using SCAN iterator

- [x] **Cache Critical Data**
  - Cache speech recordings metadata (5 min TTL)
  - Cache audio metadata queries
  - Cache search results (5 min TTL)
  - Cache user progress data
  - Cache language lists (permanent cache)

- [x] **RBAC Implementation**
  - Complete RBAC guard implementation
  - Add `@Roles()` decorators to all admin endpoints
  - Implement role-based UI restrictions in frontend
  - Add role assignment workflow

- [x] **OAuth Error Handling**
  - Handle email conflicts between OAuth providers
  - Handle missing email from GitHub
  - Add race condition handling during user creation
  - Implement account linking workflow

- [x] **Audio Duration Calculation**
  - Implement audio duration extraction using `ffprobe` or `fluent-ffmpeg`
  - Add duration validation
  - Update metadata storage to include accurate duration

#### Phase 2: Message Queue Implementation (Weeks 5-8)

- [x] **BullMQ Setup**
  - Install `@nestjs/bullmq`, `bullmq`, `ioredis`
  - Configure BullMQ module with Redis connection
  - Create queue definitions: `media-upload-audio`, `media-upload-video`, `media-processing`
  - Set up queue configuration with priorities and rate limits

- [x] **Media Upload Processor**
  - Create `MediaUploadProcessor` with `@Processor` decorator
  - Move upload logic from controller to processor
  - Implement job data structure
  - Add error handling and retry logic

- [x] **Controller Updates for Async Processing**
  - Update controllers to queue jobs instead of synchronous processing
  - Return 202 Accepted with jobId
  - Add job status endpoint
  - Implement job priority based on language/user

- [x] **Worker Scaling & Monitoring**
  - Implement worker pool configuration
  - Add job progress tracking
  - Create monitoring endpoints for queue depth
  - Set up basic alerting

#### Phase 3: Cache Enhancements (Weeks 9-12)

- [x] **Cache Invalidation Strategy**
  - Implement cache invalidation on data updates
  - Add event listeners for recording creation/updates
  - Invalidate related caches (e.g., new recording → invalidate sentence cache)
  - Add cache tags for grouped invalidation

- [x] **Cache Warming**
  - Create cache warming service
  - Implement scheduled cache warming (every 6 hours)
  - Warm cache for active languages
  - Add manual cache warming endpoint for admins

- [x] **Cache Statistics & Monitoring**
  - Add `getStats()` method to CacheService
  - Expose cache metrics (hits, misses, hit rate, memory usage)
  - Integrate with Prometheus
  - Create Grafana dashboard for cache metrics

- [x] **Optimize Cache Keys**
  - Consolidate pagination cache keys
  - Cache full lists instead of paginated results
  - Implement pagination in application layer
  - Reduce cache key proliferation

#### Phase 4: Infrastructure & Reliability (Weeks 13-16)

- [x] **Email Verification & Password Reset**
  - Complete email verification workflow
  - Implement verification email sending
  - Complete password reset functionality
  - Add frontend pages for verification and reset

- [x] **API Documentation**
  - Install and configure `@nestjs/swagger`
  - Add OpenAPI decorators to all endpoints
  - Document admin endpoints
  - Create interactive API explorer

- [x] **Backup & Recovery Strategy**
  - Set up automated daily database backups
  - Implement backup retention policies
  - Configure backup storage (S3/MinIO)
  - Document recovery procedures
  - Add backup verification

- [x] **Monitoring & Alerting**
  - Complete Prometheus configuration
  - Create Grafana dashboards for:
    - Queue metrics (depth, processing time, errors)
    - Cache metrics (hit rate, memory usage)
    - Database metrics (connections, query time)
    - Application metrics (request rate, error rate)
  - Set up alert rules
  - Configure notification channels

- [x] **CI/CD Pipeline**
  - Set up automated testing on PR
  - Configure automated deployment to staging/production
  - Add Docker image building and publishing
  - Implement database migration automation
  - Add rollback procedures

#### Phase 5: Advanced Scalability (Weeks 17+)

- [ ] **Redis Cluster Setup**
  - Set up Redis Cluster with 3-6 nodes
  - Implement sharding by language code
  - Configure automatic failover
  - Update CacheService for cluster support

- [ ] **Multi-Level Caching**
  - Implement L1 in-memory cache (Node.js)
  - Integrate with existing L2 Redis cache
  - Add cache compression for large objects
  - Implement cache hierarchy logic

- [ ] **Database Optimization**
  - Set up read replicas
  - Implement connection pooling (PgBouncer)
  - Partition `SpeechRecording` table by language or date
  - Optimize indexes for common queries

- [ ] **Storage Scaling**
  - Set up MinIO distributed mode (multi-node cluster)
  - Consider S3-compatible cloud storage migration
  - Implement CDN integration (CloudFront/Cloudflare)
  - Add storage monitoring

---

## [Current] - 2026-02-08

### Phase 1.1: Cache System Critical Fixes ✅

**Fixed:**

- Fixed wildcard deletion bug in `CacheService` - implemented `delPattern()` method using SCAN iterator
- Updated `faq.service.ts` and `community/faq.service.ts` to use `delPattern()` instead of `del()` for wildcard patterns
- Increased Dragonfly memory limit from 4GB to 64GB in `compose.yml`
- Added eviction policy `allkeys-lru` to Dragonfly configuration

**Files Modified:**

- `backend/src/cache/cache.service.ts` - Added `delPattern()` method
- `backend/src/faq.service.ts` - Updated to use `delPattern()`
- `backend/src/community/faq.service.ts` - Updated to use `delPattern()`
- `compose.yml` - Updated Dragonfly memory and eviction policy

### Phase 1.2: Cache Critical Data ✅

**Added:**

- Caching for speech recordings metadata (`getAudioForValidation`) - 5 min TTL
- Caching for search results (`fullTextSearch`) - 5 min TTL
- Improved caching for user progress (`getCompletedIds`) - 5 min TTL

**Files Modified:**

- `backend/src/speech/speech.service.ts` - Added CacheService injection and caching to `getAudioForValidation`
- `backend/src/speech/speech.module.ts` - Added CacheModule import
- `backend/src/search/search.service.ts` - Added caching to `fullTextSearch`
- `backend/src/progress/progress.service.ts` - Added caching to `getCompletedIds`

### Phase 1.3: RBAC Implementation ✅

**Completed:**

- Replaced `AdminAuthGuard` and `SuperAdminGuard` with `RolesGuard` and `@Roles()` decorators
- Added `@Roles()` decorators to all admin endpoints:
  - Admin user management (SUPER_ADMIN only)
  - Dashboard stats (ADMIN, SUPER_ADMIN)
  - Content moderation (MODERATOR, ADMIN, SUPER_ADMIN)
  - Analytics endpoints (ADMIN, SUPER_ADMIN)
  - Quality endpoints (ADMIN, SUPER_ADMIN)
  - Export dataset (ADMIN, SUPER_ADMIN)
  - Feedback admin endpoints (MODERATOR, ADMIN, SUPER_ADMIN)
- Updated frontend AdminLayout to use backend JWT token and check user role
- Updated AdminNavbar to filter navigation items based on user role

**Files Modified:**

- `backend/src/admin/admin.controller.ts` - Replaced guards with RolesGuard and @Roles decorators
- `backend/src/admin.controller.ts` - Replaced guards with RolesGuard and @Roles decorators
- `backend/src/export/export.controller.ts` - Replaced AdminAuthGuard with RolesGuard
- `backend/src/export.controller.ts` - Replaced AdminAuthGuard with RolesGuard
- `backend/src/analytics/analytics.controller.ts` - Replaced AdminAuthGuard with RolesGuard
- `backend/src/analytics.controller.ts` - Replaced AdminAuthGuard with RolesGuard
- `backend/src/quality/quality.controller.ts` - Replaced AdminAuthGuard with RolesGuard
- `backend/src/quality.controller.ts` - Replaced AdminAuthGuard with RolesGuard
- `backend/src/community/feedback.controller.ts` - Replaced AdminAuthGuard with RolesGuard
- `backend/src/feedback.controller.ts` - Replaced AdminAuthGuard with RolesGuard
- `frontend/components/AdminLayout.tsx` - Updated to use backend JWT token and check roles
- `frontend/components/AdminNavbar.tsx` - Updated to filter navigation based on user role

### Analysis Documents Created

- Created `GAP_ANALYSIS.md` - Comprehensive analysis of missing features and improvements
- Created `SCALABILITY_ANALYSIS.md` - Message queue requirements analysis for 7100+ languages
- Created `CACHING_ANALYSIS.md` - Current caching state and scalability assessment
- Created `IMPLEMENTATION_PLAN.md` - Detailed 5-phase implementation roadmap

### Documentation Updates

- Updated analysis documents to remove implementation details, keeping only analysis
- Created `CHANGELOG.md` to track all implementation changes

---

## Change Categories

Changes are categorized as follows:

- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements

---

## Version History

- **v0.1.0** (Current) - Initial analysis and planning phase
- Future versions will be tracked as implementation progresses

---

## [2026-02-08] - Phase 1 Implementation

### Added

- **OAuth Error Handling** (Phase 1.4)
  - Added email conflict handling between OAuth providers (Google/GitHub)
  - Implemented GitHub email fetching via API when email is hidden
  - Added transaction-based user creation to prevent race conditions
  - Enhanced error messages in OAuth callbacks with specific error codes
  - Added email warning for GitHub users who hide their email
  - Frontend now displays OAuth-specific error messages

- **Audio Duration Calculation** (Phase 1.5)
  - Added backend duration validation with min/max bounds
  - Implemented `extractMediaDuration()` method using ffprobe for backend verification
  - Added `validateDuration()` method to ensure duration is within acceptable bounds
  - Duration extraction gracefully falls back if ffprobe is not available
  - Updated `SpeechService` and `QuestionService` to validate and verify durations
  - Frontend already calculates duration using Web Audio API (no changes needed)

### Changed

- **OAuth Login Methods**
  - `googleLogin()` now uses transactions and handles email conflicts
  - `githubLogin()` now fetches email from GitHub API if not in profile
  - Both methods now include OAuth account linking with conflict detection
  - Improved error handling with specific exception types

- **Storage Service**
  - Added duration validation and extraction capabilities
  - Duration extraction is optional and doesn't fail if ffprobe unavailable

### Fixed

- **OAuth Race Conditions**
  - Fixed concurrent OAuth login race conditions using Prisma transactions
  - Added retry logic for user creation conflicts
  - Improved account linking to prevent duplicate OAuth accounts

### Technical Details

- **Dependencies Added**: `fluent-ffmpeg`, `@types/fluent-ffmpeg` (deprecated but functional)
- **Backend Changes**:
  - `backend/src/auth/auth.service.ts` - Enhanced OAuth login methods
  - `backend/src/auth/auth.controller.ts` - Improved error handling
  - `backend/src/auth/github.strategy.ts` - Added async email fetching
  - `backend/src/storage/storage.service.ts` - Added duration extraction and validation
  - `backend/src/speech/speech.service.ts` - Added duration validation
  - `backend/src/question/question.service.ts` - Added duration validation
- **Frontend Changes**:
  - `frontend/app/auth/callback/page.tsx` - Handle email warnings and errors
  - `frontend/app/login/page.tsx` - Display OAuth-specific error messages

### Notes

- ffprobe is optional - duration extraction gracefully fails if not installed
- Frontend duration calculation is primary; backend extraction is for validation
- OAuth email warnings are stored in sessionStorage for display after redirect

---

## [2026-02-08] - Phase 2.1 Implementation

### Added

- **BullMQ Setup** (Phase 2.1)
  - Installed `@nestjs/bullmq`, `bullmq`, and `ioredis` packages
  - Created `QueueModule` with BullMQ configuration
  - Configured connection to Dragonfly (Redis-compatible) for queue storage
  - Registered three queues:
    - `media-upload-audio` - For audio file uploads (priority 5)
    - `media-upload-video` - For video file uploads (priority 5)
    - `media-processing` - For media processing tasks (priority 3)
  - Set default job options with retry logic and cleanup policies
  - Created `MediaUploadJobData` and `MediaUploadJobResult` interfaces

### Changed

- **App Module**
  - Added `QueueModule` import to enable BullMQ queues application-wide

### Technical Details

- **Dependencies Added**: `@nestjs/bullmq@11.0.4`, `bullmq@5.67.3`, `ioredis@5.9.2`
- **Backend Changes**:
  - `backend/src/queue/queue.module.ts` - BullMQ module configuration
  - `backend/src/queue/interfaces/media-upload-job.interface.ts` - Job data interfaces
  - `backend/src/app.module.ts` - Added QueueModule import

### Configuration

- Queue connection uses Dragonfly (same instance as cache)
- Automatic connection detection: Docker network vs localhost
- Default job options:
  - 3 attempts with exponential backoff (starts at 2 seconds)
  - Completed jobs kept for 24 hours (max 1000)
  - Failed jobs kept for 7 days

---

## [2026-02-08] - Phase 2.2 Implementation

### Added

- **Media Upload Processor** (Phase 2.2)
  - Created `AudioUploadProcessor` for processing audio upload jobs
  - Created `VideoUploadProcessor` for processing video upload jobs
  - Created `MediaProcessingProcessor` placeholder for future processing tasks
  - Implemented job routing based on job data:
    - Speech recordings (sentenceId present)
    - Question answers (questionSubmissionId present)
    - Audio blogs (title + languageCode present)
    - Video blogs (title + languageCode present)
  - Added error handling and retry logic
  - Integrated with existing services (SpeechService, QuestionService, AudioBlogService, VideoBlogService)
  - Added job event handlers for logging (completed/failed events)

### Changed

- **Queue Module**
  - Added imports for SpeechModule, QuestionModule, CommunityModule, StorageModule
  - Registered processors as providers

### Technical Details

- **Backend Changes**:
  - `backend/src/queue/media-upload.processor.ts` - Three processor classes
  - `backend/src/queue/queue.module.ts` - Updated with processor providers and module imports
  - `backend/src/queue/interfaces/media-upload-job.interface.ts` - Job data and result interfaces

### Job Processing Flow

1. Job arrives in queue (media-upload-audio or media-upload-video)
2. Processor extracts format from contentType or fileName
3. Routes to appropriate service based on job data fields
4. Service processes upload and saves to database
5. Returns result with success status and recording ID
6. Errors trigger automatic retry with exponential backoff

---

## [2026-02-08] - Phase 2.3 Implementation

### Added

- **Queue Service** (Phase 2.3)
  - Created `QueueService` for managing job creation and status
  - Added `addAudioUploadJob()` and `addVideoUploadJob()` methods
  - Added `getJobStatus()` method to check job status by ID
  - Added `getQueueStats()` method for admin monitoring
  - Created `QueueController` with endpoints for job status and queue statistics

- **Async Queue Processing in Controllers**
  - Updated `SpeechController` to queue jobs instead of synchronous processing
  - Updated `QuestionController` to queue answer recordings
  - Updated `AudioBlogController` to queue audio blog uploads
  - Updated `VideoBlogController` to queue video blog uploads
  - All upload endpoints now return `202 Accepted` with `jobId`
  - Added status endpoints for checking job progress

### Changed

- **Controller Response Format**
  - Upload endpoints now return:
    ```json
    {
      "success": true,
      "jobId": "audio-1234567890-abc123",
      "status": "queued",
      "message": "Recording upload queued for processing"
    }
    ```
  - Status endpoints return job details including progress, result, and error information

- **Module Imports**
  - Added `QueueModule` imports to `SpeechModule`, `QuestionModule`, and `CommunityModule`
  - `QueueModule` now exports `QueueService` for use in other modules

### Technical Details

- **Backend Changes**:
  - `backend/src/queue/queue.service.ts` - Queue management service
  - `backend/src/queue/queue.controller.ts` - Queue monitoring endpoints
  - `backend/src/queue/queue.module.ts` - Added QueueService and QueueController
  - `backend/src/speech/speech.controller.ts` - Updated to use queue
  - `backend/src/question/question.controller.ts` - Updated to use queue
  - `backend/src/community/audio-blog.controller.ts` - Updated to use queue
  - `backend/src/community/video-blog.controller.ts` - Updated to use queue

### API Endpoints

- `POST /speech/recording` - Queue speech recording (returns 202 with jobId)
- `GET /speech/recording/status/:jobId` - Check recording job status
- `POST /question/answer-recording` - Queue answer recording (returns 202 with jobId)
- `GET /question/answer-recording/status/:jobId` - Check answer job status
- `POST /community/audio-blog` - Queue audio blog upload (returns 202 with jobId)
- `GET /community/audio-blog/status/:jobId` - Check audio blog job status
- `POST /community/video-blog` - Queue video blog upload (returns 202 with jobId)
- `GET /community/video-blog/status/:jobId` - Check video blog job status
- `GET /queue/status/:jobId` - Generic job status endpoint
- `GET /queue/stats` - Queue statistics (admin only)

---

## [2026-02-08] - Phase 2.4 Implementation

### Added

- **Worker Scaling Configuration** (Phase 2.4)
  - Added concurrency configuration to processors via `@Processor` decorator
  - AudioUploadProcessor: 5 concurrent workers (configurable via `AUDIO_UPLOAD_CONCURRENCY`)
  - VideoUploadProcessor: 3 concurrent workers (configurable via `VIDEO_UPLOAD_CONCURRENCY`)
  - MediaProcessingProcessor: 2 concurrent workers (configurable via `MEDIA_PROCESSING_CONCURRENCY`)
  - Created `WORKER_SCALING.md` with scaling recommendations and examples

- **Queue Monitoring Enhancements**
  - Enhanced `getQueueStats()` to include total counts and delayed jobs
  - Added `getPrometheusMetrics()` to QueueService for Prometheus integration
  - Added `getHealth()` method for health checks
  - Added progress tracking in processors (10% start, 100% completion)
  - Added processing time logging

- **Queue Controller Endpoints**
  - `GET /queue/metrics/prometheus` - Prometheus metrics for queues
  - `GET /queue/health` - Health check endpoint
  - Enhanced existing endpoints with proper HTTP status codes

- **Metrics Integration**
  - Updated MetricsService to include queue metrics in Prometheus output
  - Queue metrics automatically included in `/metrics/prometheus` endpoint

### Changed

- **Processors**
  - Added progress updates during job processing
  - Added processing time tracking and logging
  - Improved error logging with duration information

- **Queue Service**
  - Enhanced statistics to include delayed jobs and totals
  - Added Prometheus metrics generation
  - Added health check logic

- **Metrics Module**
  - Added QueueModule import (with forwardRef to avoid circular dependency)
  - MetricsService now optionally includes queue metrics

### Technical Details

- **Backend Changes**:
  - `backend/src/queue/media-upload.processor.ts` - Added concurrency config and progress tracking
  - `backend/src/queue/queue.service.ts` - Added Prometheus metrics and health check
  - `backend/src/queue/queue.controller.ts` - Added new monitoring endpoints
  - `backend/src/metrics/metrics.service.ts` - Integrated queue metrics
  - `backend/src/metrics/metrics.module.ts` - Added QueueModule import
  - `backend/src/queue/WORKER_SCALING.md` - Scaling documentation

### Monitoring Endpoints

- `GET /api/queue/stats` - Queue statistics (admin only)
- `GET /api/queue/health` - Health check
- `GET /api/queue/metrics/prometheus` - Prometheus metrics
- `GET /api/queue/status/:jobId` - Job status

### Prometheus Metrics

New metrics exposed:

- `queue_jobs_waiting{queue="..."}` - Jobs waiting in queue
- `queue_jobs_active{queue="..."}` - Jobs currently being processed
- `queue_jobs_completed{queue="..."}` - Total completed jobs
- `queue_jobs_failed{queue="..."}` - Total failed jobs
- `queue_jobs_total{queue="..."}` - Total jobs in queue

---

## [2026-02-08] - Phase 3.1 Implementation

### Added

- **Cache Invalidation Service** (Phase 3.1)
  - Created `CacheInvalidationService` for centralized cache invalidation
  - Added methods for invalidating related caches:
    - `invalidateSpeechRecording()` - Invalidates recordings, progress, and search caches
    - `invalidateQuestionAnswer()` - Invalidates progress caches
    - `invalidateAudioBlog()` - Invalidates audio blog caches
    - `invalidateVideoBlog()` - Invalidates video blog caches
    - `invalidateUserProgress()` - Invalidates progress caches
    - `invalidateSearch()` - Invalidates search result caches
    - `invalidateSentence()` - Invalidates sentence-related caches
  - Uses pattern-based deletion for efficient cache clearing
  - Includes logging for cache invalidation operations

- **Cache Invalidation Integration**
  - Added cache invalidation to `SpeechService.saveSpeechRecording()`
  - Added cache invalidation to `QuestionService.saveAnswer()`
  - Added cache invalidation to `ProgressService.markCompleted()`
  - Added cache invalidation to `AudioBlogService.createAudioBlog()`
  - Added cache invalidation to `VideoBlogService.createVideoBlog()`
  - Added cache invalidation to `WriteService.submitSentences()`
  - Added cache invalidation to `AdminService.validateSentence()`
  - Added cache invalidation to `AdminService.validateQuestion()`

### Changed

- **Cache Module**
  - Added `CacheInvalidationService` as provider and export
  - Service is now globally available via `@Global()` decorator

- **Service Modules**
  - `SpeechModule` - Already imports CacheModule
  - `QuestionModule` - Already imports CacheModule (via ProgressModule)
  - `ProgressModule` - Already imports CacheModule
  - `CommunityModule` - Already imports CacheModule
  - `WriteModule` - Added CacheModule import
  - `AdminModule` - Added CacheModule import

### Technical Details

- **Backend Changes**:
  - `backend/src/cache/cache-invalidation.service.ts` - New service for cache invalidation
  - `backend/src/cache/cache.module.ts` - Added CacheInvalidationService
  - `backend/src/speech/speech.service.ts` - Added invalidation on recording creation
  - `backend/src/question/question.service.ts` - Added invalidation on answer creation
  - `backend/src/progress/progress.service.ts` - Added invalidation on progress updates
  - `backend/src/community/audio-blog.service.ts` - Updated to use invalidation service
  - `backend/src/community/video-blog.service.ts` - Updated to use invalidation service
  - `backend/src/write/write.service.ts` - Added invalidation on sentence creation
  - `backend/src/admin/admin.service.ts` - Added invalidation on sentence/question validation
  - `backend/src/write/write.module.ts` - Added CacheModule import
  - `backend/src/admin/admin.module.ts` - Added CacheModule import

### Cache Invalidation Strategy

When data is created or updated, related caches are automatically invalidated:

1. **Speech Recording Created**:
   - Invalidates validation caches (`recordings:validation:*`)
   - Invalidates progress caches (`progress:completed_ids:*`)
   - Invalidates search caches (`search:*`)

2. **Question Answer Created**:
   - Invalidates progress caches for the user

3. **Progress Updated**:
   - Invalidates specific progress cache patterns

4. **Blog Created**:
   - Invalidates language-specific blog caches
   - Invalidates specific blog cache if ID provided

5. **Sentence Created/Validated**:
   - Invalidates validation and search caches

6. **Question Validated**:
   - Invalidates question-related caches and search caches

### Benefits

- Ensures cache consistency when data changes
- Prevents stale data from being served
- Automatic invalidation reduces manual cache management
- Pattern-based invalidation efficiently clears related caches

---

## [2026-02-08] - Phase 3.2 Implementation

### Added

- **Cache Warming Service** (Phase 3.2)
  - Created `CacheWarmingService` for pre-populating cache with frequently accessed data
  - Scheduled cache warming runs every 6 hours automatically
  - Manual cache warming endpoint for admins
  - Warms cache for:
    - Active languages (top 50 languages with most validated sentences)
    - Speech sentences (first page for each language)
    - Validation recordings (for Listen feature)
    - Validated questions
    - Audio and video blogs
    - Popular search queries (top 10-20 queries per language)
  - Specific cache type warming (recordings, questions, blogs, search)
  - Language-specific warming support

- **Cache Warming Controller**
  - `POST /cache/warm` - Manual cache warming (admin only)
  - `POST /cache/warm/:type` - Warm specific cache type (admin only)
  - Supports language-specific warming via request body

### Changed

- **Cache Module**
  - Added `ScheduleModule` import for cron jobs
  - Added `CacheWarmingService` and `CacheWarmingController`
  - Added imports for SpeechModule, QuestionModule, SearchModule, CommunityModule (with forwardRef)
  - Exported `CacheWarmingService` for use in other modules

### Technical Details

- **Backend Changes**:
  - `backend/src/cache/cache-warming.service.ts` - Cache warming logic with scheduled jobs
  - `backend/src/cache/cache-warming.controller.ts` - Admin endpoints for manual warming
  - `backend/src/cache/cache.module.ts` - Added warming service and controller

### Cache Warming Strategy

**Scheduled (Every 6 Hours):**

- Automatically warms cache for top 50 active languages
- Warms popular search queries
- Ensures frequently accessed data is always cached

**Manual (Admin Triggered):**

- Can warm specific languages
- Can warm specific cache types (recordings, questions, blogs, search)
- Useful for preparing cache before high-traffic events

### Benefits

- Improved response times for frequently accessed data
- Reduced database load during peak hours
- Better user experience with pre-warmed cache
- Scalable for 7100+ languages (focuses on active languages)

---

## [2026-02-08] - Phase 3.3 Implementation

### Added

- **Cache Statistics Tracking** (Phase 3.3)
  - Added statistics tracking to `CacheService`:
    - Hits counter
    - Misses counter
    - Sets counter
    - Deletes counter
    - Errors counter
    - Hit rate calculation
  - Added `getStats()` method to retrieve cache statistics
  - Added `getPrometheusMetrics()` method for Prometheus integration
  - Added `resetStats()` method for statistics reset
  - Statistics track all cache operations automatically

- **Cache Statistics Controller**
  - `GET /cache/stats` - Get cache statistics (admin only)
  - `GET /cache/stats/prometheus` - Get Prometheus metrics for cache
  - Provides detailed cache performance metrics

- **Prometheus Integration**
  - Cache metrics automatically included in `/metrics/prometheus` endpoint
  - Metrics exposed:
    - `cache_hits_total` - Total cache hits
    - `cache_misses_total` - Total cache misses
    - `cache_sets_total` - Total cache sets
    - `cache_deletes_total` - Total cache deletes
    - `cache_errors_total` - Total cache errors
    - `cache_hit_rate` - Cache hit rate percentage
    - `cache_keys_total` - Total number of keys in cache
    - `cache_memory_used_bytes` - Memory used by cache (if available)
    - `cache_memory_peak_bytes` - Peak memory usage (if available)

### Changed

- **Cache Service**
  - All cache operations now track statistics
  - Improved error logging with Logger
  - Statistics tracked in-memory (can be reset)

- **Metrics Service**
  - Added CacheService injection (with forwardRef)
  - Cache metrics automatically included in Prometheus output

- **Metrics Module**
  - Added CacheModule import (with forwardRef to avoid circular dependency)

### Technical Details

- **Backend Changes**:
  - `backend/src/cache/cache.service.ts` - Added statistics tracking and Prometheus metrics
  - `backend/src/cache/cache-stats.controller.ts` - New controller for cache statistics
  - `backend/src/cache/cache.module.ts` - Added CacheStatsController
  - `backend/src/metrics/metrics.service.ts` - Integrated cache metrics
  - `backend/src/metrics/metrics.module.ts` - Added CacheModule import

### Cache Statistics

Statistics are tracked for:

- Cache hits (successful retrievals)
- Cache misses (keys not found)
- Cache sets (writes)
- Cache deletes
- Cache errors
- Hit rate (hits / (hits + misses) \* 100)
- Total keys in cache
- Memory usage (if available from Redis/Dragonfly)

### Benefits

- Real-time cache performance monitoring
- Prometheus integration for Grafana dashboards
- Helps identify cache effectiveness
- Memory usage tracking for capacity planning
- Error tracking for troubleshooting

---

## [2026-02-08] - Phase 3.4 Implementation

### Changed

- **Cache Key Optimization** (Phase 3.4)
  - Optimized cache keys to reduce proliferation by caching full lists instead of paginated results
  - Services now cache complete datasets and paginate in-memory
  - Significantly reduces cache key count (from potentially thousands to dozens per language)

- **Audio Blog Service**
  - Changed cache key from `audio_blogs:${languageCode}:${published}:${limit}:${offset}` to `audio_blogs:${languageCode}:${published}`
  - Now caches full list and paginates in-memory using `slice()`
  - Reduces cache keys from potentially hundreds (different limit/offset combinations) to 2 per language (published/unpublished)

- **Video Blog Service**
  - Changed cache key from `video_blogs:${languageCode}:${published}:${limit}:${offset}` to `video_blogs:${languageCode}:${published}`
  - Now caches full list and paginates in-memory using `slice()`
  - Same optimization as audio blogs

- **Search Service**
  - Changed cache key from `search:${query}:${resourceTypesKey}:${limit}:${offset}` to `search:${query}:${resourceTypesKey}`
  - Now caches full search results and paginates in-memory
  - Reduces cache keys from potentially thousands (different pagination combinations) to one per query/resource type combination

### Technical Details

- **Backend Changes**:
  - `backend/src/community/audio-blog.service.ts` - Optimized `getAudioBlogs` method
  - `backend/src/community/video-blog.service.ts` - Optimized `getVideoBlogs` method
  - `backend/src/search/search.service.ts` - Optimized `fullTextSearch` method

### Cache Key Reduction

**Before:**

- Audio blogs: `audio_blogs:${lang}:${published}:${limit}:${offset}` → Potentially 100+ keys per language (different limit/offset combinations)
- Video blogs: Same pattern → 100+ keys per language
- Search: `search:${query}:${types}:${limit}:${offset}` → Potentially 1000+ keys per query

**After:**

- Audio blogs: `audio_blogs:${lang}:${published}` → 2 keys per language (published/unpublished)
- Video blogs: Same pattern → 2 keys per language
- Search: `search:${query}:${types}` → 1 key per query/resource type combination

**Impact:**

- For 7100 languages: Reduces cache keys from potentially millions to thousands
- Reduces memory usage significantly
- Faster cache lookups (fewer keys to scan)
- Easier cache invalidation (fewer patterns to match)

### Benefits

- **Reduced Memory Usage**: Fewer cache keys means less memory overhead
- **Faster Cache Operations**: Fewer keys to scan/manage
- **Simpler Invalidation**: Cache invalidation patterns are simpler (no pagination parameters)
- **Better Scalability**: Scales better for 7100+ languages
- **Same Functionality**: Pagination still works, just done in-memory from cached full lists

---

## [2026-02-08] - Phase 4.1 Implementation

### Added

- **Password Reset Token Model** (Phase 4.1)
  - New `PasswordResetToken` model in Prisma schema
  - Separate from email verification tokens to avoid conflicts
  - Fields: `userId`, `token`, `expiresAt`, `createdAt`, `usedAt`
  - Cascade delete when user is deleted

- **Complete Password Reset Workflow**
  - `POST /auth/password-reset/request` - Request reset (rate limited: 3/hour per email)
  - `POST /auth/password-reset/reset` - Reset password with token
  - Uses dedicated `PasswordResetToken` table instead of reusing verification fields
  - OAuth-only users cannot request password reset
  - Password validation: min 8 chars, uppercase, lowercase, number

- **Email Verification After Signup**
  - Verification email sent automatically after signup (non-blocking)
  - `POST /users/verification/send` - Resend verification email (JWT required)
  - `POST /users/verification/verify` - Verify email with token (public)
  - `GET /users/verification/status` - Check verification status (JWT required)

- **Frontend Pages**
  - `/auth/forgot-password` - Request password reset form
  - `/auth/reset-password?token=...` - Set new password form
  - `/auth/verify?token=...` - Email verification (auto-redirects to login)
  - Updated login page: "Forgot password" links to `/auth/forgot-password`
  - Password hint on signup: "At least 8 characters, with uppercase, lowercase, and a number"

### Changed

- **Signup DTO** - Added `@MinLength(8)` and `@Matches()` for password strength
- **RecoveryService** - Uses `PasswordResetToken` model, rate limiting, invalidates previous tokens
- **AuthService** - Sends verification email after signup (fire-and-forget)
- **Auth Module** - CacheModule, VerificationService
- **Users Module** - VerificationService, NotificationsModule, verification endpoints

### Migration

Run `pnpm prisma migrate deploy` (with DATABASE_URL set) to apply `20260208120000_add_password_reset_token`.

---

## [2026-02-08] - Phase 4.3, 4.4, 4.5 Implementation

### Phase 4.3: Backup & Recovery

- **Backup service** in `compose.yml` (profile: backup)
  - Runs daily PostgreSQL dump, compresses to .sql.gz
  - Stores in `./backups/` with retention (default 7 days)
  - Start with: `docker compose --profile backup up -d`

- **Scripts**: `scripts/backup.sh`, `scripts/restore.sh` for manual backup/restore
- **Documentation**: `docs/BACKUP_RECOVERY.md` with recovery procedures

### Phase 4.4: Monitoring (Grafana)

- **Prometheus**: Updated metrics path to `/api/metrics/prometheus`
- **Grafana datasource**: Added uid `prometheus` for dashboard references
- **Dashboard**: Added queue and cache panels
  - Queue: waiting, active, completed, failed jobs per queue
  - Cache: hit rate, hits/misses, keys, memory usage

### Phase 4.5: CI/CD

- **`.github/workflows/ci.yml`**: CI pipeline
  - Backend: lint, build, test (with Postgres + Redis services)
  - Frontend: lint, build
  - Runs on push/PR to main and develop

---

## [2026-02-08] - Phase 4.2 Implementation

### Added

- **OpenAPI/Swagger Documentation** (Phase 4.2)
  - Installed `@nestjs/swagger`
  - Swagger UI at `/api/docs`
  - DocumentBuilder with title, description, version
  - Bearer auth support
  - Tags for auth, users, speech, question, write, search, community, admin, export, analytics, quality, queue, cache, metrics

- **Global API Prefix**
  - All routes now under `/api` prefix (e.g. `/api/auth/login`, `/api/speech/sentences`)
  - Aligns with frontend proxy and healthcheck

- **Swagger Decorators**
  - `@ApiTags` on auth, users, speech, search, queue, metrics, cache controllers
  - `@ApiOperation` and `@ApiResponse` on auth endpoints (signup, login, password reset)
  - Swagger plugin in nest-cli.json for automatic DTO introspection

### Changed

- **main.ts** - Added DocumentBuilder, SwaggerModule.setup, setGlobalPrefix('api')
- **nest-cli.json** - Added @nestjs/swagger plugin with classValidatorShim and introspectComments
