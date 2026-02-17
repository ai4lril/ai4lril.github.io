import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app?.close();
  });

  it('GET /api returns hello', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(200)
      .expect('Hello World!');
  });

  it('GET /api/metrics returns metrics', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/metrics')
      .expect(200);
    expect(res.body).toHaveProperty('requests');
    expect(res.body.requests).toHaveProperty('total');
    expect(res.body).toHaveProperty('performance');
  });

  it('GET /api/metrics/prometheus returns Prometheus format', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/metrics/prometheus')
      .expect(200);
    expect(res.text).toContain('http_requests_total');
  });

  it('GET /api/queue/health returns queue health', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/queue/health')
      .expect(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('queues');
  });

  it('POST /api/auth/signup rejects empty password', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        first_name: 'Test',
        last_name: 'User',
        display_name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: '',
      })
      .expect(400);
  });

  it('POST /api/auth/signup rejects weak password', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        first_name: 'Test',
        last_name: 'User',
        display_name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'weak',
      })
      .expect(400);
  });

  it('POST /api/auth/login returns 401 for invalid credentials', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'WrongPass123' })
      .expect(401);
  });

  it('POST /api/auth/login rejects empty email', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: '', password: 'Password123' })
      .expect(400);
  });

  it('GET /api/speech/sentences returns sentences', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/speech/sentences')
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/speech/recording returns 401 without auth', async () => {
    await request(app.getHttpServer())
      .post('/api/speech/recording')
      .send({
        sentenceId: 'test-id',
        audioFile: 'base64encoded',
        audioFormat: 'webm',
        mediaType: 'audio',
      })
      .expect(401);
  });
});
