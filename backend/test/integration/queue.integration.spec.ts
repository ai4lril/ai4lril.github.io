import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Queue Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/queue/health', () => {
    it('should return queue health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/queue/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('queues');
    });
  });

  describe('GET /api/queue/status/:jobId', () => {
    it('should return 404 for non-existent job', async () => {
      await request(app.getHttpServer())
        .get('/api/queue/status/non-existent-job-id')
        .expect(404);
    });
  });

  describe('GET /api/queue/metrics/prometheus', () => {
    it('should return Prometheus metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/queue/metrics/prometheus')
        .expect(200);

      expect(response.text).toContain('queue_');
    });
  });
});
