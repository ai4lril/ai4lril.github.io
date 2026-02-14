import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { QueueService } from '../queue/queue.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class MetricsService {
  private requestCount = 0;
  private errorCount = 0;
  private responseTimeSum = 0;
  private responseTimeCount = 0;
  private userActivityCount = 0;
  private contributionCount = 0;

  constructor(
    @Inject(forwardRef(() => QueueService))
    private readonly queueService?: QueueService,
    @Inject(forwardRef(() => CacheService))
    private readonly cacheService?: CacheService,
  ) { }

  incrementRequestCount() {
    this.requestCount++;
  }

  incrementErrorCount() {
    this.errorCount++;
  }

  recordResponseTime(time: number) {
    this.responseTimeSum += time;
    this.responseTimeCount++;
  }

  incrementUserActivity() {
    this.userActivityCount++;
  }

  incrementContribution() {
    this.contributionCount++;
  }

  getMetrics() {
    const avgResponseTime =
      this.responseTimeCount > 0
        ? this.responseTimeSum / this.responseTimeCount
        : 0;

    return {
      requests: {
        total: this.requestCount,
        errors: this.errorCount,
        success: this.requestCount - this.errorCount,
        errorRate:
          this.requestCount > 0
            ? (this.errorCount / this.requestCount) * 100
            : 0,
      },
      performance: {
        averageResponseTime: avgResponseTime,
        totalResponseTime: this.responseTimeSum,
        responseCount: this.responseTimeCount,
      },
      activity: {
        userActivity: this.userActivityCount,
        contributions: this.contributionCount,
      },
    };
  }

  async getPrometheusMetrics(): Promise<string> {
    const metrics = this.getMetrics();

    let prometheusMetrics = `# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total ${metrics.requests.total}

# HELP http_requests_errors_total Total number of HTTP errors
# TYPE http_requests_errors_total counter
http_requests_errors_total ${metrics.requests.errors}

# HELP http_requests_success_total Total number of successful HTTP requests
# TYPE http_requests_success_total counter
http_requests_success_total ${metrics.requests.success}

# HELP http_request_error_rate Error rate percentage
# TYPE http_request_error_rate gauge
http_request_error_rate ${metrics.requests.errorRate}

# HELP http_response_time_average Average response time in milliseconds
# TYPE http_response_time_average gauge
http_response_time_average ${metrics.performance.averageResponseTime}

# HELP user_activity_total Total user activity count
# TYPE user_activity_total counter
user_activity_total ${metrics.activity.userActivity}

# HELP contributions_total Total contributions count
# TYPE contributions_total counter
contributions_total ${metrics.activity.contributions}
`;

    // Add queue metrics if queue service is available
    if (this.queueService) {
      try {
        const queueMetrics = await this.queueService.getPrometheusMetrics();
        prometheusMetrics += '\n' + queueMetrics;
      } catch (error) {
        // Queue service might not be initialized yet, skip queue metrics
        console.warn('Failed to get queue metrics:', error);
      }
    }

    // Add cache metrics if cache service is available
    if (this.cacheService) {
      try {
        const cacheMetrics = await this.cacheService.getPrometheusMetrics();
        prometheusMetrics += '\n' + cacheMetrics;
      } catch (error) {
        // Cache service might not be initialized yet, skip cache metrics
        console.warn('Failed to get cache metrics:', error);
      }
    }

    return prometheusMetrics;
  }
}
