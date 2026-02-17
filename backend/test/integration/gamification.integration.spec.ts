import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Gamification Integration (e2e)', () => {
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

  describe('GET /api/gamification/leaderboard', () => {
    it('should return leaderboard without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/gamification/leaderboard')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should support category and language query params', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/gamification/leaderboard?category=global&language=en')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/gamification/badges', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/gamification/badges')
        .expect(401);
    });
  });
});
