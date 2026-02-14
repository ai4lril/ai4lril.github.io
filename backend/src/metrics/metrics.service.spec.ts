import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from './metrics.service';
import { QueueService } from '../queue/queue.service';
import { CacheService } from '../cache/cache.service';

const mockQueueService = {
  getPrometheusMetrics: jest.fn().mockResolvedValue(''),
};

const mockCacheService = {
  getPrometheusMetrics: jest.fn().mockResolvedValue(''),
};

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        { provide: QueueService, useValue: mockQueueService },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
  });

  describe('incrementRequestCount', () => {
    it('should increment request count', () => {
      service.incrementRequestCount();
      service.incrementRequestCount();
      const metrics = service.getMetrics();

      expect(metrics.requests.total).toBe(2);
    });
  });

  describe('incrementErrorCount', () => {
    it('should increment error count', () => {
      service.incrementRequestCount();
      service.incrementRequestCount();
      service.incrementErrorCount();
      const metrics = service.getMetrics();

      expect(metrics.requests.errors).toBe(1);
      expect(metrics.requests.success).toBe(1);
    });
  });

  describe('recordResponseTime', () => {
    it('should record and average response times', () => {
      service.recordResponseTime(100);
      service.recordResponseTime(200);
      const metrics = service.getMetrics();

      expect(metrics.performance.averageResponseTime).toBe(150);
      expect(metrics.performance.totalResponseTime).toBe(300);
      expect(metrics.performance.responseCount).toBe(2);
    });

    it('should return 0 average when no responses', () => {
      const metrics = service.getMetrics();

      expect(metrics.performance.averageResponseTime).toBe(0);
    });
  });

  describe('incrementUserActivity', () => {
    it('should increment user activity count', () => {
      service.incrementUserActivity();
      service.incrementUserActivity();
      const metrics = service.getMetrics();

      expect(metrics.activity.userActivity).toBe(2);
    });
  });

  describe('incrementContribution', () => {
    it('should increment contribution count', () => {
      service.incrementContribution();
      const metrics = service.getMetrics();

      expect(metrics.activity.contributions).toBe(1);
    });
  });

  describe('getMetrics', () => {
    it('should return error rate when requests exist', () => {
      service.incrementRequestCount();
      service.incrementRequestCount();
      service.incrementErrorCount();
      const metrics = service.getMetrics();

      expect(metrics.requests.errorRate).toBe(50);
    });

    it('should return 0 error rate when no requests', () => {
      const metrics = service.getMetrics();

      expect(metrics.requests.errorRate).toBe(0);
    });
  });

  describe('getPrometheusMetrics', () => {
    it('should return Prometheus format string', async () => {
      service.incrementRequestCount();
      service.recordResponseTime(100);

      const metrics = await service.getPrometheusMetrics();

      expect(metrics).toContain('http_requests_total');
      expect(metrics).toContain('http_requests_total 1');
      expect(metrics).toContain('http_response_time_average');
      expect(metrics).toContain('user_activity_total');
      expect(metrics).toContain('contributions_total');
    });
  });
});
