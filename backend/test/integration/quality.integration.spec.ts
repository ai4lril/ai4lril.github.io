import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Quality Integration (e2e)', () => {
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

  describe('GET /api/quality/score/:userId', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/quality/score/test-user-id')
        .expect(401);
    });
  });

  describe('GET /api/quality/anomalies', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/quality/anomalies')
        .expect(401);
    });
  });
});
