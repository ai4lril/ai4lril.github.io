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
});
