import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  private requestCount = 0;
  private errorCount = 0;
  private responseTimeSum = 0;
  private responseTimeCount = 0;
  private userActivityCount = 0;
  private contributionCount = 0;

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

  getPrometheusMetrics(): string {
    const metrics = this.getMetrics();

    return `# HELP http_requests_total Total number of HTTP requests
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
  }
}
