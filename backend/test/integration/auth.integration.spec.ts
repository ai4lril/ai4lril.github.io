import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Auth Integration (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user', async () => {
      const signupData = {
        email: `test${Date.now()}@example.com`,
        password: 'Test123!@#',
        name: 'Test User',
        displayName: 'Test',
        dateOfBirth: '1990-01-01',
        gender: 'OTHER',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(signupData)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(signupData.email);

      // Cleanup
      await prismaService.user
        .delete({
          where: { email: signupData.email },
        })
        .catch(() => {});
    });

    it('should reject duplicate email', async () => {
      const signupData = {
        email: `duplicate${Date.now()}@example.com`,
        password: 'Test123!@#',
        name: 'Test User',
        displayName: 'Test',
        dateOfBirth: '1990-01-01',
        gender: 'OTHER',
      };

      // Create first user
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(signupData)
        .expect(201);

      // Try to create duplicate
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(signupData)
        .expect(400);

      // Cleanup
      await prismaService.user
        .delete({
          where: { email: signupData.email },
        })
        .catch(() => {});
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          // Missing password
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser: { email: string; password: string };

    beforeAll(async () => {
      testUser = {
        email: `login${Date.now()}@example.com`,
        password: 'Test123!@#',
      };

      // Create test user
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          ...testUser,
          name: 'Test User',
          displayName: 'Test',
          dateOfBirth: '1990-01-01',
          gender: 'OTHER',
        });
    });

    afterAll(async () => {
      await prismaService.user
        .delete({
          where: { email: testUser.email },
        })
        .catch(() => {});
    });

    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
    });

    it('should reject invalid password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword',
        })
        .expect(401);
    });

    it('should reject non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test123!@#',
        })
        .expect(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    let accessToken: string;
    let refreshToken: string;

    beforeAll(async () => {
      const testUser = {
        email: `refresh${Date.now()}@example.com`,
        password: 'Test123!@#',
      };

      // Create and login
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          ...testUser,
          name: 'Test User',
          displayName: 'Test',
          dateOfBirth: '1990-01-01',
          gender: 'OTHER',
        });

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(testUser);

      accessToken = loginResponse.body.access_token;
      refreshToken = loginResponse.body.refresh_token;
    });

    it('should refresh access token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
      expect(response.body.access_token).not.toBe(accessToken);
    });

    it('should reject invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid_token' })
        .expect(401);
    });
  });
});
