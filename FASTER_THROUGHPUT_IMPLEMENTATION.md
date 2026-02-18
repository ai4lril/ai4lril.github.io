# Faster Throughput & 99.99% SLA Implementation Strategy

**Document Version:** 1.4
**Last Updated:** February 18, 2026

---

## Executive Summary

This document outlines a step-by-step implementation strategy to achieve **faster throughput** and **99.99% SLA** for the ILHRF Data Collection Platform. It is based on learnings from the current architecture, where media uploads flow through the backend API → BullMQ (Redis/Dragonfly) → workers → SeaweedFS, causing bottlenecks at multiple stages.

**Target Scale:** 7,100+ languages, 71,000–710,000 uploads/hour at peak, 4 TB–385 TB/day bandwidth.

---

## 1. Key Learnings & Bottlenecks

### 1.1 Current Flow (Bottlenecked)

```
Frontend → Backend API (receives full buffer) → BullMQ (stores mediaBuffer in Redis)
         → Worker (reads buffer from Redis) → SeaweedFS (putObject)
```

| Bottleneck                     | Impact                                                                                 |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| **mediaBuffer in job payload** | Full audio/video bytes serialized into Redis; bloats memory, slows queue throughput    |
| **Backend as proxy**           | All media traffic flows through NestJS; doubles bandwidth, adds latency                |
| **Blob storage writes**        | SeaweedFS `putObject` from worker is sequential; no multipart, no direct client upload |
| **Single SeaweedFS instance**  | No distributed mode; limited I/O at scale                                              |
| **Worker concurrency**         | Default 5 audio / 3 video; may underutilize or overload depending on load              |

### 1.2 Proven Improvements

| Improvement                        | Benefit                                                             |
| ---------------------------------- | ------------------------------------------------------------------- |
| **Direct upload (presigned URLs)** | Frontend → SeaweedFS directly; backend never touches media bytes    |
| **Metadata-only jobs**             | Jobs contain `objectKey`, `userId`, etc.; no `mediaBuffer` in Redis |
| **Staging bucket**                 | Client uploads to staging; worker validates, moves to final bucket  |
| **Multipart upload**               | Large files (video) use S3 multipart; faster, resumable             |
| **Horizontal worker scaling**      | More workers = higher throughput; HPA based on queue depth          |

---

## 2. Suggested Improvements (Prioritized)

### Tier 1: Critical for Throughput

1. **Direct upload via presigned URLs** — Bypass backend for file transfer
2. **Metadata-only queue jobs** — Remove `mediaBuffer` from BullMQ payload
3. **Staging bucket + worker validation** — Client uploads to staging; worker validates and promotes

### Tier 2: Infrastructure for Scale

4. **Worker auto-scaling** — HPA based on queue depth (e.g., scale when waiting > 100)
5. **SeaweedFS distributed mode** — Multiple nodes for higher I/O
6. **YugaByteDB horizontal scaling** — Add nodes; automatic sharding and rebalancing (see Section 7.5)
7. **Connection pooling** — PgBouncer for YugaByteDB/PostgreSQL, Redis connection pool tuning

### Tier 3: SLA & Reliability

8. **Multi-AZ / failover** — YugaByteDB multi-node (built-in replication), Dragonfly Sentinel/Cluster
9. **Circuit breakers** — Prevent cascade failures
10. **Health checks & graceful degradation** — Liveness, readiness, dependency checks

### Tier 4: Optional Optimizations

10. **Multipart upload** — For video files > 5 MB
11. **CDN for media delivery** — CloudFront/Cloudflare in front of SeaweedFS
12. **Read replicas** — YugaByteDB read replicas for analytics/search
13. **Geo-scaling** — YugaByteDB multi-region; geo-partitioning; read replicas per region (see Section 7.6)

---

## 3. Step-by-Step Implementation Plan

### Phase 1: Direct Upload (Presigned URLs) — Weeks 1–2

**Goal:** Frontend uploads media directly to SeaweedFS; backend only issues presigned URLs and enqueues metadata.

| Step | Action                      | Details                                                                              |
| ---- | --------------------------- | ------------------------------------------------------------------------------------ |
| 1.1  | Add presigned PUT endpoint  | `POST /api/storage/presigned-upload` returns `{ uploadUrl, objectKey, expiresIn }`   |
| 1.2  | Create staging bucket       | `voice-audio-staging` (or `voice-audio/incoming/`) for client uploads                |
| 1.3  | Update frontend             | Replace base64/multipart upload with: 1) GET presigned URL, 2) PUT file to SeaweedFS |
| 1.4  | Add `objectKey` to job data | Job includes `stagingObjectKey` instead of `mediaBuffer`                             |
| 1.5  | Deprecate buffer path       | Keep legacy path for backward compatibility; feature-flag new flow                   |

**Deliverables:** Presigned upload API, staging bucket, frontend integration, updated job interface.

---

### Phase 2: Metadata-Only Jobs — Weeks 3–4

**Goal:** Queue jobs contain only metadata; workers read media from SeaweedFS staging.

| Step | Action                              | Details                                                                                                  |
| ---- | ----------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 2.1  | Define `MediaUploadJobDataV2`       | `{ userId, objectKey, fileName, contentType, mediaType, duration, sentenceId?, ... }` — no `mediaBuffer` |
| 2.2  | Update workers                      | Fetch object from SeaweedFS by `objectKey`; validate; move to final path; create DB records              |
| 2.3  | Add `getObject` to StorageService   | `getObject(bucket, objectKey)` returns stream/buffer for worker                                          |
| 2.4  | Migrate producers                   | Speech, Question, AudioBlog, VideoBlog controllers use V2 job data                                       |
| 2.5  | Remove `mediaBuffer` from interface | Delete `MediaUploadJobData` V1; use V2 everywhere                                                        |

**Deliverables:** V2 job interface, worker refactor, StorageService `getObject`, no buffer in Redis.

---

### Phase 3: Staging Tier & Validation — Weeks 5–6

**Goal:** Robust staging flow with validation, cleanup, and promotion.

| Step | Action                          | Details                                                     |
| ---- | ------------------------------- | ----------------------------------------------------------- |
| 3.1  | Worker: validate before promote | Check magic bytes, duration, format; reject invalid uploads |
| 3.2  | Worker: move object             | Copy staging → final bucket; delete from staging            |
| 3.3  | Staging lifecycle               | TTL or cron to delete objects older than 24h in staging     |
| 3.4  | Idempotency                     | Same `objectKey` + jobId; avoid duplicate processing        |
| 3.5  | Error handling                  | Failed jobs: move to DLQ; alert on repeated failures        |

**Deliverables:** Validation pipeline, staging lifecycle, DLQ, monitoring.

---

### Phase 4: Worker & Infrastructure Scaling — Weeks 7–9

**Goal:** Scale workers and storage for peak load.

| Step | Action                     | Details                                                                                       |
| ---- | -------------------------- | --------------------------------------------------------------------------------------------- |
| 4.1  | Tune worker concurrency    | `AUDIO_UPLOAD_CONCURRENCY=15`, `VIDEO_UPLOAD_CONCURRENCY=8`, `MEDIA_PROCESSING_CONCURRENCY=5` |
| 4.2  | HPA for backend            | Scale on `queue_jobs_waiting` (e.g., target 50–100 per queue)                                 |
| 4.3  | SeaweedFS distributed mode | 4+ nodes for production; document setup                                                       |
| 4.4  | Connection pooling         | PgBouncer for YugaByteDB/PostgreSQL; tune Redis/Dragonfly pool size                           |
| 4.5  | Load testing               | Simulate 1,200–12,000 uploads/min; validate throughput                                        |

**Deliverables:** Concurrency config, HPA manifests, SeaweedFS dist mode docs, load test results.

---

### Phase 5: SLA 99.99% Hardening — Weeks 10–12

**Goal:** 99.99% uptime (~52 min downtime/year).

| Step | Action              | Details                                                                  |
| ---- | ------------------- | ------------------------------------------------------------------------ |
| 5.1  | Multi-AZ deployment | YugaByteDB multi-node (primary); Dragonfly Sentinel or Cluster           |
| 5.2  | Health checks       | Liveness (process alive), readiness (DB, Redis, SeaweedFS reachable)     |
| 5.3  | Circuit breakers    | Wrap external calls (DB, Redis, SeaweedFS); fail fast on repeated errors |
| 5.4  | Graceful shutdown   | Drain queues; finish in-flight jobs; then exit                           |
| 5.5  | Retry & backoff     | Exponential backoff for transient failures; idempotent operations        |
| 5.6  | Alerting            | PagerDuty/Slack on queue depth > 1000, error rate > 1%, DB/Redis down    |
| 5.7  | Runbooks            | Document recovery for common failures                                    |

**Deliverables:** Multi-AZ config, health endpoints, circuit breakers, runbooks.

---

### Phase 6: Optional Enhancements — Weeks 13+

| Step | Action           | Details                                                   |
| ---- | ---------------- | --------------------------------------------------------- |
| 6.1  | Multipart upload | For video > 5 MB; presigned multipart URLs                |
| 6.2  | CDN              | CloudFront/Cloudflare in front of SeaweedFS for read path |
| 6.3  | Read replicas    | YugaByteDB read replicas for analytics/search             |
| 6.4  | Request tracing  | OpenTelemetry for end-to-end latency                      |

---

## 4. Implementation Checklist (Summary)

### Phase 1: Direct Upload (Weeks 1–2)

- [ ] Add presigned PUT endpoint (`POST /api/storage/presigned-upload`)
- [ ] Create staging bucket (`voice-audio-staging` or `voice-audio/incoming/`)
- [ ] Update frontend: request presigned URL, then PUT file directly to SeaweedFS
- [ ] Add `objectKey` to job data (replace `mediaBuffer`)
- [ ] Deprecate buffer path; feature-flag new flow for backward compatibility

### Phase 2: Metadata-Only Jobs (Weeks 3–4)

- [ ] Define `MediaUploadJobDataV2` interface (no `mediaBuffer`)
- [ ] Add `getObject(bucket, objectKey)` to StorageService
- [ ] Update workers: fetch from SeaweedFS by `objectKey`, validate, move, create DB records
- [ ] Migrate producers: Speech, Question, AudioBlog, VideoBlog controllers
- [ ] Remove `mediaBuffer` from interface; delete V1

### Phase 3: Staging Tier & Validation (Weeks 5–6)

- [ ] Worker: validate before promote (magic bytes, duration, format)
- [ ] Worker: copy staging → final bucket; delete from staging
- [ ] Staging lifecycle: TTL or cron to delete objects older than 24h
- [ ] Idempotency: same `objectKey` + jobId; avoid duplicate processing
- [ ] Failed jobs: move to DLQ; alert on repeated failures

### Phase 4: Worker & Infrastructure Scaling (Weeks 7–9)

- [ ] Tune worker concurrency (e.g. audio: 15, video: 8, processing: 5)
- [ ] HPA manifests: scale on `queue_jobs_waiting` (target 50–100)
- [ ] SeaweedFS distributed mode: 4+ nodes; document setup
- [ ] YugaByteDB: add nodes for horizontal scale (3+ for HA, e.g. ilhrf-yugabyte-node1/2/3); configure sharding for hot tables
- [ ] Connection pooling: PgBouncer for YugaByteDB/PostgreSQL; tune Redis/Dragonfly pool
- [ ] Load testing: simulate 1,200–12,000 uploads/min
- [ ] Optional: dedicated worker deployment (API vs workers)

### Phase 5: SLA 99.99% Hardening (Weeks 10–12)

- [ ] Multi-AZ deployment: YugaByteDB multi-node (built-in replication); Dragonfly Sentinel/Cluster
- [ ] Health checks: liveness (process alive), readiness (DB, Redis, SeaweedFS)
- [ ] Circuit breakers: wrap DB, Redis, SeaweedFS calls; fail fast on repeated errors
- [ ] Graceful shutdown: drain queues; finish in-flight jobs; then exit
- [ ] Retry & backoff: BullMQ `attempts: 3`, exponential backoff; `isRetryableError()` helper
- [ ] Frontend retry: 3x on 5xx/network error (1s, 2s, 4s backoff)
- [ ] Alerting: queue depth > 1000, error rate > 1%, DB/Redis down
- [ ] Runbooks: document recovery for common failures

### Phase 6: Optional Enhancements (Weeks 13+)

- [ ] Multipart upload: `createMultipartUpload`, `getPresignedPartUrl`, `completeMultipartUpload`
- [ ] `POST /presigned-multipart/init`, `POST /presigned-multipart/complete`
- [ ] Frontend: split file into 5–10 MB parts; parallel upload; complete
- [ ] CDN: CloudFront/Cloudflare in front of SeaweedFS for read path
- [ ] Read replicas: YugaByteDB read replicas for analytics/search
- [ ] Request tracing: OpenTelemetry for end-to-end latency
- [ ] **Geo-scaling:** YugaByteDB multi-region; geo-partitioning by `languageCode`/region; read replicas per region (see Section 7.6)
- [ ] **Additional optimizations:** See Section 9 (Fastify, response compression, WebSocket job status, single-flight cache, etc.)

### Additional Scaling Factors (Section 8)

- [ ] **Database:** YugaByteDB multi-node + sharding; PgBouncer; partitioning by language/date; indexes on hot tables
- [ ] **Cache:** Stampede prevention (single-flight), eviction policy (`allkeys-lru`)
- [ ] **Queue:** Backpressure when depth high; BullMQ `stalledInterval` for stuck jobs
- [ ] **Network:** DNS caching, TLS session reuse, CDN for media; geo-scaling (multi-region YugaByteDB)
- [ ] **Security:** Rate limits on presigned requests; per-user quotas
- [ ] **Observability:** Limit metrics cardinality; log sampling; trace sampling (1–10%)
- [ ] **Deployment:** Rolling updates; readiness probes; minimum replicas
- [ ] **Consistency:** Idempotent workers; deduplication keys
- [ ] **Cost:** Right-sizing; lifecycle policies; spot/preemptible for workers
- [ ] **Platform:** Per-language queues; dedicated export workers; WebSocket scaling

### Geo-Scaling (Section 7.6)

- [ ] Deploy YugaByteDB across multiple regions (e.g. India, US, EU)
- [ ] Configure geo-partitioning for `SpeechRecording` by `languageCode` or region
- [ ] Add read replicas in regions with heavy read load
- [ ] Set replication factor 5–7 for regional failure resilience (multi-cloud)
- [ ] Route writes to nearest region; route reads to local read replica when possible

---

## 5. Success Metrics

| Metric                   | Current (Est.)                | Target                   |
| ------------------------ | ----------------------------- | ------------------------ |
| **Upload latency (p95)** | ~5–15 s (buffer path)         | < 2 s (direct upload)    |
| **Queue throughput**     | ~300–500 jobs/min (5 workers) | 2,000+ jobs/min (scaled) |
| **Redis memory per job** | ~500 KB–5 MB (buffer)         | < 1 KB (metadata only)   |
| **Uptime SLA**           | Best effort                   | 99.99%                   |
| **Peak uploads/min**     | ~100–500                      | 1,200–12,000             |

---

## 6. Risks & Mitigations

| Risk                      | Mitigation                                                                        |
| ------------------------- | --------------------------------------------------------------------------------- |
| Presigned URL abuse       | Short expiry (15 min); validate `objectKey` format; rate limit presigned requests |
| Staging bucket growth     | Lifecycle policy; delete objects > 24h                                            |
| Worker/SeaweedFS overload | HPA; queue backpressure; rate limiting                                            |
| Data loss on worker crash | Idempotent jobs; retry with same objectKey; staging retention                     |

---

## 7. Deep Dive: Chunked Uploads, Retries, Scaling & Blob Storage

This section provides detailed implementation guidance for the four core concepts.

---

### 7.1 Chunked Uploads (Multipart)

**Purpose:** Upload large files (video 5–50 MB) in chunks; enables resumable uploads, parallel part uploads, and avoids timeouts.

#### Flow

```
1. Frontend: POST /api/storage/presigned-multipart-init
   → Backend returns { uploadId, objectKey, partUrls[] }

2. Frontend: PUT each chunk to partUrls[i] (parallel, 5–10 MB per part)

3. Frontend: POST /api/storage/presigned-multipart-complete
   → Backend calls SeaweedFS completeMultipartUpload; enqueues metadata job
```

#### Implementation Steps

| Step  | Component         | Action                                                                             |
| ----- | ----------------- | ---------------------------------------------------------------------------------- |
| 7.1.1 | StorageService    | `createMultipartUpload(bucket, objectKey, contentType)` → `uploadId`               |
| 7.1.2 | StorageService    | `getPresignedPartUrl(bucket, objectKey, uploadId, partNumber)` → presigned PUT URL |
| 7.1.3 | StorageService    | `completeMultipartUpload(bucket, objectKey, uploadId, parts[])`                    |
| 7.1.4 | StorageController | `POST /presigned-multipart/init`, `POST /presigned-multipart/complete`             |
| 7.1.5 | Frontend          | Split file into 5–10 MB parts; upload in parallel; complete when done              |
| 7.1.6 | Threshold         | Use multipart only when `file.size > 5_000_000` (5 MB)                             |

#### Chunk Size Guidelines

| File Size | Chunk Size | Max Parts (S3 limit: 10,000) |
| --------- | ---------- | ---------------------------- |
| 5–50 MB   | 5 MB       | 1–10 parts                   |
| 50–500 MB | 10 MB      | 5–50 parts                   |
| 500 MB+   | 100 MB     | 5–100 parts                  |

#### SeaweedFS/S3 API

```typescript
// SeaweedFS S3-compatible API supports multipart (use @aws-sdk/client-s3 or similar)
await s3Client.send(
  new CreateMultipartUploadCommand({ Bucket: bucket, Key: objectKey }),
);
await getSignedUrl(
  s3Client,
  new PutObjectCommand({ Bucket: bucket, Key: objectKey }),
  { expiresIn: 3600 },
);
await s3Client.send(
  new CompleteMultipartUploadCommand({
    Bucket: bucket,
    Key: objectKey,
    UploadId: uploadId,
    MultipartUpload: { Parts: parts },
  }),
);
```

---

### 7.2 Retries

**Purpose:** Retry transient failures (network, DB, SeaweedFS) with exponential backoff; avoid thundering herd.

#### Retry Layers

| Layer              | Scope                         | Strategy                                                       |
| ------------------ | ----------------------------- | -------------------------------------------------------------- |
| **BullMQ job**     | Failed jobs                   | `attempts: 3`, `backoff: { type: 'exponential', delay: 2000 }` |
| **HTTP client**    | Frontend → Backend            | Retry 3x on 5xx/network error; 1s, 2s, 4s backoff              |
| **StorageService** | SeaweedFS putObject/getObject | `@nestjs/axios` retry or custom wrapper                        |
| **Database**       | Prisma queries                | Connection retry; transient error handling                     |

#### BullMQ Retry Configuration

```typescript
// queue.module.ts or queue config
{
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,  // 2s, 4s, 8s
    },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  },
}
```

#### Retryable vs Non-Retryable Errors

| Retryable                    | Non-Retryable                   |
| ---------------------------- | ------------------------------- |
| ECONNRESET, ETIMEDOUT        | 400 Bad Request (invalid file)  |
| 503 Service Unavailable      | 404 Not Found                   |
| SeaweedFS internal errors    | Validation failed (magic bytes) |
| DB connection pool exhausted | Duplicate key                   |

#### Implementation

- Add `isRetryableError(error)` helper in `common/error-utils.ts`
- In workers: catch, check `isRetryableError`, re-throw to trigger BullMQ retry
- In frontend: use `retry` or `axios-retry` for presigned PUT

---

### 7.3 Scaling (Workers & Application)

**Purpose:** Scale workers and API pods based on load; handle 1,200–12,000 uploads/min.

#### Worker Scaling Options

| Option                | When                    | How                                                             |
| --------------------- | ----------------------- | --------------------------------------------------------------- |
| **Vertical**          | Single instance         | Increase `AUDIO_UPLOAD_CONCURRENCY`, `VIDEO_UPLOAD_CONCURRENCY` |
| **Horizontal**        | Multiple pods           | More backend replicas (each runs workers)                       |
| **Dedicated workers** | Separate worker service | Backend = API only; Worker = separate deployment                |
| **HPA**               | Auto-scale              | Scale on `queue_jobs_waiting` (e.g., target 50)                 |

#### Recommended Concurrency (per pod)

| Queue              | Dev | Prod (single pod) | Prod (scaled) |
| ------------------ | --- | ----------------- | ------------- |
| media-upload-audio | 5   | 15                | 15–20         |
| media-upload-video | 3   | 8                 | 8–10          |
| media-processing   | 2   | 5                 | 5             |

#### HPA for Kubernetes

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 20
  metrics:
    - type: External
      external:
        metric:
          name: queue_jobs_waiting
        target:
          type: AverageValue
          averageValue: "50"
```

#### Custom Metrics (Prometheus)

- Expose `queue_jobs_waiting` via Prometheus adapter or custom metrics server
- Alternatively: scale on CPU/memory if workers are CPU-bound

#### Dedicated Worker Deployment (Optional)

Separate API from workers for independent scaling:

```
backend-api (3–10 pods)     → API only, no BullMQ workers
backend-workers (2–10 pods) → BullMQ workers only
```

---

### 7.4 Scaling Blob Storage

**Purpose:** Handle 4 TB–385 TB/day; high I/O; no single point of failure.

#### Options

| Option                    | Use Case            | Complexity |
| ------------------------- | ------------------- | ---------- |
| **SeaweedFS single node** | Dev, low load       | Low        |
| **SeaweedFS distributed** | Prod, 10–100 TB/day | Medium     |
| **S3 + CloudFront**       | Prod, global, CDN   | Medium     |
| **Multi-region S3**       | Global, 99.99%+     | High       |

#### SeaweedFS Distributed Mode

- **4+ nodes** (erasure coding): 4 data + 2 parity drives minimum
- **Consistent hashing** for object placement
- **Shared backend** (NAS, NFS) or distributed storage

```yaml
# Example: SeaweedFS cluster (master + volume servers)
# Master: seaweedfs master -port=9333
# Volume servers: seaweedfs volume -mserver=master:9333 -port=8080 -dir=/data
# S3 API: seaweedfs filer -master=master:9333 -port=8888 (S3-compatible gateway)
```

#### S3-Compatible at Scale

| Aspect        | Recommendation                                                                  |
| ------------- | ------------------------------------------------------------------------------- |
| **Bucket**    | One bucket per environment; prefix by `audio/`, `video/`, `staging/`            |
| **Lifecycle** | Staging: delete after 24h; final: transition to Glacier after 1 year (optional) |
| **CDN**       | CloudFront/Cloudflare in front of SeaweedFS/S3 for read path                    |
| **CORS**      | Allow frontend origin for presigned PUT                                         |

#### Environment Abstraction

Keep `StorageService` S3-compatible so you can switch between SeaweedFS and AWS S3:

```typescript
// Same S3-compatible interface for SeaweedFS (S3 gateway) or AWS S3
const client = new S3Client({
  endpoint:
    process.env.STORAGE_PROVIDER === "s3"
      ? undefined
      : process.env.SEAWEEDFS_S3_ENDPOINT,
  region: process.env.AWS_REGION || "us-east-1",
  // ... credentials
});
```

#### Capacity Planning

| Daily Uploads | Est. Storage | Bandwidth   | Recommendation                    |
| ------------- | ------------ | ----------- | --------------------------------- |
| 71K           | ~4 TB        | ~4 TB/day   | SeaweedFS single node             |
| 710K          | ~40 TB       | ~40 TB/day  | SeaweedFS distributed (4–8 nodes) |
| 7.1M          | ~400 TB      | ~400 TB/day | S3 + CloudFront                   |

---

### 7.5 Scaling Database (YugaByteDB)

**Purpose:** The platform uses YugaByteDB (PostgreSQL-compatible) as the default database. YugaByteDB provides built-in horizontal scaling and reduces operational overhead compared to vanilla PostgreSQL. Node names follow the `ilhrf-yugabyte-node*` convention (e.g. `ilhrf-yugabyte-node1`, `ilhrf-yugabyte-node2`, `ilhrf-yugabyte-node3`).

#### How YugaByteDB Helps With Scaling

| Capability                 | Benefit                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------ |
| **Horizontal scaling**     | Add nodes to the cluster without downtime; data and workload rebalance automatically |
| **Automatic sharding**     | Tables split into tablets distributed across nodes; hash or range sharding           |
| **Built-in replication**   | RPO=0, RTO 3–15 s; no manual streaming replication setup                             |
| **Operational simplicity** | No vacuuming, no transaction ID wraparound; automatic rebalancing on node addition   |

#### Sharding Strategies for Voice Data

| Strategy           | Use Case                         | Example                                            |
| ------------------ | -------------------------------- | -------------------------------------------------- |
| **Hash sharding**  | Even distribution, point lookups | Default for `User`, `Sentence`                     |
| **Range sharding** | Range scans by language or date  | `SpeechRecording` by `languageCode` or `createdAt` |

#### What You Still Need With YugaByteDB

| Concern               | YugaByteDB          | Still Needed                                      |
| --------------------- | ------------------- | ------------------------------------------------- |
| Connection exhaustion | Scales with nodes   | PgBouncer, connection pooling                     |
| Query performance     | Sharding helps      | Indexes, partitioning strategy                    |
| Read scaling          | Replicas for reads  | Route analytics/search to read replicas           |
| Hot tables            | Tablets spread load | Consider range sharding by `languageCode` or date |

#### Production Checklist

- [ ] Add YugaByteDB nodes for horizontal scale (3+ nodes for HA, e.g. ilhrf-yugabyte-node1, ilhrf-yugabyte-node2, ilhrf-yugabyte-node3)
- [ ] Configure range sharding for `SpeechRecording` by `languageCode` or date if hot
- [ ] Use PgBouncer or connection pooling; YugaByteDB scales but connections still need management
- [ ] Route read-heavy queries (analytics, search) to read replicas
- [ ] Monitor tablet distribution and rebalancing

---

### 7.6 Geo-Scaling (YugaByteDB)

**Purpose:** YugaByteDB supports geo-distribution and multi-region scaling similar to CockroachDB. Use this when contributors span multiple regions and you need low latency or data residency.

#### Multi-Region Topologies

| Topology                            | Purpose                                                            | Latency / Consistency                       |
| ----------------------------------- | ------------------------------------------------------------------ | ------------------------------------------- |
| **Default synchronous replication** | Strong consistency across regions                                  | Higher write latency (cross-region commits) |
| **Geo-partitioning**                | Data pinned to regions by policy (e.g. `languageCode`, region)     | Low latency; data residency compliance      |
| **xCluster**                        | Async replication (unidirectional or bidirectional) across regions | Timeline consistency; lower write latency   |
| **Read replicas**                   | Read-only clusters in distant regions                              | Read latency can drop from ~60 ms to ~2 ms  |

#### YugaByteDB vs CockroachDB (Geo-Scaling)

| Capability           | CockroachDB                            | YugaByteDB                                        |
| -------------------- | -------------------------------------- | ------------------------------------------------- |
| **Geo-partitioning** | Yes (regional by row, regional tables) | Yes (geo-partitioning by policy)                  |
| **Multi-region**     | Yes                                    | Yes                                               |
| **Read replicas**    | Yes                                    | Yes                                               |
| **Data residency**   | Yes (row-level)                        | Yes (partition-level)                             |
| **Multi-cloud**      | Yes                                    | Yes (AWS, GCP, Azure)                             |
| **Survival goals**   | Yes (region/zone failure)              | Yes (replication factor 5–7 for regional failure) |

#### Voice Data Platform Use Cases

| Use Case                             | Approach                                                                                     |
| ------------------------------------ | -------------------------------------------------------------------------------------------- |
| **Contributors in multiple regions** | Geo-partition `SpeechRecording` by `languageCode` or region; keep data close to contributors |
| **Analytics in distant regions**     | Read replicas in regions with heavy analytics/search traffic                                 |
| **Data residency (GDPR, etc.)**      | Geo-partitioning to keep data in required jurisdictions                                      |
| **Multi-cloud**                      | Deploy across AWS, GCP, Azure for redundancy or cost optimization                            |

#### Geo-Scaling Checklist

- [ ] Deploy YugaByteDB across multiple regions (e.g. India, US, EU)
- [ ] Configure geo-partitioning for `SpeechRecording` by `languageCode` or region
- [ ] Add read replicas in regions with heavy read load
- [ ] Set replication factor 5–7 for regional failure resilience (multi-cloud)
- [ ] Route writes to nearest region; route reads to local read replica when possible

---

## 8. Additional Scaling Factors

Beyond chunked uploads, retries, worker scaling, and blob storage, these factors can affect throughput and reliability at scale. Plan for them proactively.

---

### 8.1 Database Scaling

The platform uses **YugaByteDB** (PostgreSQL-compatible). YugaByteDB provides horizontal scaling, automatic sharding, and built-in replication—see Section 7.5. The factors below still apply:

| Factor                    | What Happens                                                   | Mitigation                                                                 |
| ------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Connection exhaustion** | More pods → more DB connections → pool limit hit               | PgBouncer, connection pooling, limit connections per pod                   |
| **Query latency**         | Hot tables (e.g. `SpeechRecording`) grow; full scans slow down | Indexes, partitioning by `languageCode` or date; YugaByteDB range sharding |
| **Write contention**      | Many inserts/updates on same tables                            | Partitioning, batching, async writes; YugaByteDB tablets spread load       |
| **Replication lag**       | Read replicas fall behind under heavy writes                   | Monitor lag; route critical reads to primary                               |
| **Lock contention**       | Long transactions block others                                 | Shorter transactions, optimistic locking                                   |

---

### 8.2 Cache Scaling

| Factor                  | What Happens                                             | Mitigation                                                 |
| ----------------------- | -------------------------------------------------------- | ---------------------------------------------------------- |
| **Cache stampede**      | Many requests miss cache at once → thundering herd to DB | Probabilistic early expiration, single-flight pattern      |
| **Memory pressure**     | Dragonfly/Redis fills up; eviction kicks in              | Eviction policy (`allkeys-lru`), increase memory, sharding |
| **Invalidation storms** | Bulk invalidation causes many cache misses               | Tag-based invalidation, avoid broad `FLUSHDB`              |
| **Serialization cost**  | Large objects (e.g. language lists) slow get/set         | Compression, smaller payloads, split into smaller keys     |

---

### 8.3 Queue Scaling

| Factor                    | What Happens                                           | Mitigation                                                    |
| ------------------------- | ------------------------------------------------------ | ------------------------------------------------------------- |
| **Queue depth explosion** | Producers faster than workers; backlog grows unbounded | Backpressure, reject new jobs, or shed low-priority work      |
| **Priority inversion**    | Low-priority jobs block high-priority ones             | Separate queues or strict priority handling                   |
| **Job visibility**        | Jobs stuck in "active" if worker crashes               | BullMQ `stalledInterval`, job timeouts                        |
| **Redis memory**          | Many jobs in queue → high memory use                   | Metadata-only jobs, `removeOnComplete`, `removeOnFail` limits |

---

### 8.4 Network & Bandwidth

| Factor                   | What Happens                            | Mitigation                                       |
| ------------------------ | --------------------------------------- | ------------------------------------------------ |
| **Bandwidth saturation** | SeaweedFS/API links saturated at peak   | Direct uploads, CDN, multipart, parallel uploads |
| **DNS resolution**       | High request rate → DNS lookup overhead | DNS caching, connection pooling, keep-alive      |
| **TLS handshake**        | Many new connections → CPU cost         | TLS session reuse, HTTP/2                        |
| **Geographic latency**   | Distant users see high latency          | Edge/CDN, regional deployments                   |

---

### 8.5 Security & Rate Limiting

| Factor                 | What Happens                                   | Mitigation                                 |
| ---------------------- | ---------------------------------------------- | ------------------------------------------ |
| **DDoS / abuse**       | Presigned URLs used for abuse or storage abuse | Rate limits, short expiry, per-user quotas |
| **Auth bottleneck**    | JWT validation on every request                | Caching of validation results, edge auth   |
| **API key exhaustion** | Many API clients hit limits                    | Per-key quotas, tiered limits              |

---

### 8.6 Observability & Operations

| Factor                  | What Happens                              | Mitigation                                          |
| ----------------------- | ----------------------------------------- | --------------------------------------------------- |
| **Metrics cardinality** | Too many unique labels → Prometheus bloat | Limit labels, aggregate, sampling                   |
| **Log volume**          | High RPS → huge log volume                | Structured logging, sampling, log aggregation (ELK) |
| **Trace cost**          | 100% tracing → high overhead              | Sampling (e.g. 1–10%), head-based sampling          |
| **Alert fatigue**       | Too many alerts                           | SLO-based alerting, grouping, runbooks              |

---

### 8.7 Deployment & Rollout

| Factor                | What Happens                           | Mitigation                               |
| --------------------- | -------------------------------------- | ---------------------------------------- |
| **Deployment spikes** | All pods restart → brief capacity drop | Rolling updates, readiness probes        |
| **Config drift**      | Different config across pods           | Central config (ConfigMap, Vault)        |
| **Schema migrations** | Migrations under load can lock tables  | Online migrations, blue-green DB changes |
| **Cold starts**       | New pods slow until warmed             | Pre-warming, minimum replicas            |

---

### 8.8 Data Consistency & Correctness

| Factor                   | What Happens                       | Mitigation                             |
| ------------------------ | ---------------------------------- | -------------------------------------- |
| **Eventual consistency** | Reads from replicas may be stale   | Route critical reads to primary        |
| **Duplicate processing** | Retries can process same job twice | Idempotent workers, deduplication keys |
| **Split brain**          | Failover can create two leaders    | Consensus (etcd), fencing              |

---

### 8.9 Cost & Efficiency

| Factor                  | What Happens                     | Mitigation                                 |
| ----------------------- | -------------------------------- | ------------------------------------------ |
| **Non-linear cost**     | Cost grows faster than traffic   | Right-sizing, spot/preemptible for workers |
| **Storage growth**      | Retention increases storage cost | Lifecycle policies, archival, compression  |
| **Inefficient queries** | N+1, missing indexes             | Query analysis, connection pooling         |

---

### 8.10 Platform-Specific (Linguistic Data Collection)

| Factor                        | What Happens                           | Mitigation                                         |
| ----------------------------- | -------------------------------------- | -------------------------------------------------- |
| **Language hotspots**         | Few languages dominate load            | Per-language queues or sharding                    |
| **Peak contributor activity** | Spikes during campaigns                | Auto-scaling, queue buffering                      |
| **Export load**               | Large exports compete with uploads     | Dedicated export workers, off-peak scheduling      |
| **Real-time updates**         | WebSocket connections scale with users | Horizontal scaling, sticky sessions, Redis adapter |

---

### 8.11 Cross-Cutting Notes

These factors often interact (e.g. DB pressure from cache stampede, or queue depth from slow blob storage). Monitor SLOs (latency, error rate, queue depth) and maintain runbooks for each layer to detect and address issues early.

---

## 9. Additional Throughput & Latency Optimizations (Critical Analysis)

This section captures further improvements identified through critical analysis of the codebase. These complement the phased implementation plan and scaling factors above.

---

### 9.1 Backend / API Layer

| Optimization | Current State | Impact | Effort |
| ------------ | ------------- | ------ | ------ |
| **Base64 elimination** | Frontend sends `audioFile` as base64 in JSON; backend receives full buffer before enqueue | Base64 inflates payload ~33%; doubles parse/serialize cost; blocks response until full body received | High (requires presigned flow) |
| **Fastify adapter** | NestJS uses Express by default | Fastify typically 10–30% faster request handling; lower memory per connection | Medium |
| **Response compression** | No gzip/brotli for API responses | Large JSON (languages list, search results, NER sentences) could be 60–80% smaller over the wire | Low (`compression` middleware) |
| **JWT validation caching** | JWT verified on every request | Cache decoded payload for same token (short TTL, e.g. 5s) to avoid repeated crypto; or use edge auth | Medium |
| **ValidationPipe tuning** | Global `forbidNonWhitelisted` on all routes | Selective validation; skip or relax for high-throughput endpoints (e.g. health, metrics) | Low |
| **Export queue isolation** | Export runs in-process via `processExport().catch()` | Move to BullMQ; dedicated export workers; prevents CPU/memory contention with upload workers | Medium |

---

### 9.2 Frontend / Client Layer

| Optimization | Current State | Impact | Effort |
| ------------ | ------------- | ------ | ------ |
| **Binary upload (pre-presigned)** | Base64 in JSON body | If presigned not yet available: use `FormData` + `Blob` instead of base64; avoids 33% inflation | Low |
| **Prefetch / preconnect** | No explicit connection hints | `rel="preconnect"` to API; `dns-prefetch`; reduces first-request latency | Low |
| **Prefetch next sentence** | Next sentence fetched after submit | Fetch next sentence while user records; overlap I/O with user activity | Medium |
| **WebSocket for job status** | Polling `GET /recording/status/:jobId` | Use Socket.IO to push job completion; eliminates polling round-trips | Medium |
| **Batch submission** | One recording per request | Allow submitting 3–5 recordings in one request; fewer round-trips for power users | Medium |
| **Offline queue (IndexedDB)** | No offline support | Queue recordings locally; sync when online; improves perceived latency in poor connectivity | High |
| **Service Worker caching** | No SW | Cache static assets, language list; reduce repeat loads | Medium |

---

### 9.3 Database & Query Layer

| Optimization | Current State | Impact | Effort |
| ------------ | ------------- | ------ | ------ |
| **Bulk inserts** | Individual `create` for sentences, validations | Use `createMany` for bulk imports; batch size 100–500 | Low |
| **Select only needed columns** | `findMany` often returns full rows | `select: { id, text, languageCode }` for list endpoints; reduces payload and memory | Low |
| **Composite indexes** | May have single-column indexes only | Add composite indexes for common filters: `(languageCode, isActive, taskType)`, `(userId, createdAt)` | Low |
| **Cursor-based pagination** | Offset pagination (`skip`/`take`) | Cursor-based for large tables; avoids expensive offset scans | Medium |
| **Read replica routing** | All reads go to primary | Route analytics, search, exports to read replica; reduce primary load | Medium |

---

### 9.4 Cache & Queue Layer

| Optimization | Current State | Impact | Effort |
| ------------ | ------------- | ------ | ------ |
| **Single-flight (request coalescing)** | Cache stampede mitigation mentioned | Implement: when N concurrent requests miss same key, only 1 fetches; others wait | Medium |
| **L1 cache tuning** | Default 1000 entries, 60s TTL | Increase for hot keys (languages); decrease for volatile data; tune `CACHE_L1_MAX_SIZE`, `CACHE_L1_TTL_SECONDS` | Low |
| **Queue job batching** | One job per recording | Batch metadata jobs: 5–10 recordings per job; fewer Redis round-trips | Medium |
| **Per-language queues** | Single audio/video queue | Separate queues by `languageCode` for hotspots; isolate bursty languages | High |
| **Throttler storage** | In-memory (default) | Redis-backed throttler for multi-pod deployments; consistent rate limits | Low |

---

### 9.5 Network & Transport Layer

| Optimization | Current State | Impact | Effort |
| ------------ | ------------- | ------ | ------ |
| **HTTP/2 for API** | Nginx terminates TLS; proxies HTTP/1.1 to backend | Ensure backend supports HTTP/2 or keep-alive; multiplexing reduces connection overhead | Low |
| **gzip/brotli at proxy** | Nginx may not compress API responses | Enable `gzip on` for `application/json`; or compress in NestJS | Low |
| **Connection pooling (client)** | Frontend fetch() creates new connections | Use `keep-alive`; browser does this by default; ensure server supports it | Low |
| **TLS session tickets** | May not be configured | Enable session reuse; reduces handshake cost for repeat clients | Low |

---

### 9.6 Worker & Processing Layer

| Optimization | Current State | Impact | Effort |
| ------------ | ------------- | ------ | ------ |
| **Streaming SeaweedFS writes** | `putObject` with full buffer | Use `Upload` from stream when reading from staging; avoid loading full file in memory | Medium |
| **Parallel validation** | Worker validates then uploads sequentially | Validate format in parallel with upload start; overlap I/O | Low |
| **CPU affinity** | Workers share CPU with API | Pin worker processes to CPU cores; reduce context switches | Low (K8s) |
| **Worker warm-up** | Cold workers slow first job | Pre-warm: process dummy job on startup; or keep minimum workers always active | Low |

---

### 9.7 Observability & Tuning

| Optimization | Current State | Impact | Effort |
| ------------ | ------------- | ------ | ------ |
| **Latency percentiles** | May track only avg or histograms | Add p50, p95, p99 for upload, queue, DB; identify tail latency | Low |
| **Slow query logging** | May not log | Log queries > 100ms; identify slow paths | Low |
| **Trace sampling** | 100% tracing expensive | Sample 1–10%; head-based sampling for errors | Low |
| **Request ID propagation** | May not propagate | Add `X-Request-ID`; propagate to workers, logs, traces for debugging | Low |

---

### 9.8 Implementation Priority (Additional Optimizations)

| Priority | Optimization | Rationale |
| -------- | ------------ | --------- |
| **P0** | Base64 elimination (presigned flow) | Already in Phase 1; highest impact |
| **P0** | Response compression | Low effort; immediate bandwidth reduction |
| **P1** | Fastify adapter | 10–30% faster; medium effort |
| **P1** | Export queue isolation | Prevents export from starving upload workers |
| **P1** | WebSocket for job status | Eliminates polling; better UX |
| **P2** | Single-flight cache | Prevents stampede on popular keys |
| **P2** | Select only needed columns | Quick query wins |
| **P2** | Prefetch next sentence | Overlaps I/O with user activity |
| **P3** | Batch submission, offline queue | Nice-to-have for power users |

---

## 10. Related Documentation

- `Architecture.md` — System overview
- `REMAINING_FEATURES.md` — Scale requirements (7,100+ languages)
- `backend/src/queue/WORKER_SCALING.md` — Worker concurrency config
- `docs/HTTP2_TLS.md` — HTTP/2 and TLS configuration

---

_Built for linguistic diversity and AI research._
