import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Community Integration (e2e)', () => {
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

  describe('GET /api/community/faq', () => {
    it('should return FAQ list', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/community/faq')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should support category filter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/community/faq?category=general')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/languages', () => {
    it('should return languages list', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/languages')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('code');
        expect(response.body[0]).toHaveProperty('name');
      }
    });
  });

  describe('POST /api/community/feedback', () => {
    it('should accept feedback without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/community/feedback')
        .send({
          type: 'bug',
          subject: 'Test feedback',
          message: 'Integration test feedback message',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('type', 'bug');
      expect(response.body).toHaveProperty('subject', 'Test feedback');
    });

  });
});
