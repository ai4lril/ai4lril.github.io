# Worker Scaling Configuration

## Environment Variables

Worker concurrency can be configured via environment variables:

- `AUDIO_UPLOAD_CONCURRENCY` - Number of concurrent audio upload jobs (default: 5)
- `VIDEO_UPLOAD_CONCURRENCY` - Number of concurrent video upload jobs (default: 3)
- `MEDIA_PROCESSING_CONCURRENCY` - Number of concurrent media processing jobs (default: 2)

## Scaling Recommendations

### For 7100+ Languages

**Development/Testing:**

- Audio: 5 concurrent workers
- Video: 3 concurrent workers
- Processing: 2 concurrent workers

**Production (High Load):**

- Audio: 10-20 concurrent workers (based on server CPU/memory)
- Video: 5-10 concurrent workers (video files are larger)
- Processing: 3-5 concurrent workers (CPU-intensive)

### Docker Compose Example

```yaml
services:
  backend:
    environment:
      - AUDIO_UPLOAD_CONCURRENCY=10
      - VIDEO_UPLOAD_CONCURRENCY=5
      - MEDIA_PROCESSING_CONCURRENCY=3
```

### Kubernetes Example

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  template:
    spec:
      containers:
        - name: backend
          env:
            - name: AUDIO_UPLOAD_CONCURRENCY
              value: '20'
            - name: VIDEO_UPLOAD_CONCURRENCY
              value: '10'
            - name: MEDIA_PROCESSING_CONCURRENCY
              value: '5'
```

## Monitoring

Monitor queue depth and worker utilization:

- `GET /api/queue/stats` - Queue statistics (admin only)
- `GET /api/queue/health` - Health check
- `GET /api/queue/metrics/prometheus` - Prometheus metrics

## Auto-scaling

For Kubernetes, use Horizontal Pod Autoscaler based on queue depth:

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
  maxReplicas: 10
  metrics:
    - type: External
      external:
        metric:
          name: queue_jobs_waiting
        target:
          type: AverageValue
          averageValue: '100'
```
