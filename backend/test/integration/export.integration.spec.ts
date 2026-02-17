import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Export Integration (e2e)', () => {
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

  describe('GET /api/export/history', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/export/history')
        .expect(401);
    });
  });

  describe('GET /api/export/job/:id', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/export/job/test-job-id')
        .expect(401);
    });
  });

  describe('POST /api/export', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/export')
        .send({ type: 'contributions', format: 'csv' })
        .expect(401);
    });
  });
});
