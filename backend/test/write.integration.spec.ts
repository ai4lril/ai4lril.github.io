import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { AuthService } from '../../src/auth/auth.service';

describe('Write Integration (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authService: AuthService;
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    authService = moduleFixture.get<AuthService>(AuthService);

    // Create test user and get token
    const testUser = {
      email: `write${Date.now()}@example.com`,
      password: 'Test123!@#',
      username: `writeuser${Date.now()}`,
      first_name: 'Test',
      last_name: 'User',
      display_name: 'Test',
      birth_date: '1990-01-01',
      gender: 'OTHER',
    };

    const signupResult = await authService.signup({
      email: testUser.email,
      password: testUser.password,
      username: testUser.username,
      first_name: testUser.first_name,
      last_name: testUser.last_name,
      display_name: testUser.display_name,
      birth_date: testUser.birth_date,
      gender: testUser.gender,
    });

    accessToken = signupResult.token;
    userId = signupResult.user.id;
  });

  afterAll(async () => {
    // Cleanup
    await prismaService.sentence
      .deleteMany({
        where: { languageCode: 'hin_Deva' },
      })
      .catch(() => {});
    await prismaService.user
      .delete({
        where: { id: userId },
      })
      .catch(() => {});
    await app.close();
  });

  describe('POST /api/write/submission', () => {
    it('should submit sentences with valid data', async () => {
      const submissionData = {
        sentences: 'Hello world\nHow are you?',
        languageCode: 'hin_Deva',
        citation: 'Test citation',
      };

      const response = await request(app.getHttpServer())
        .post('/api/write/submission')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(submissionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.submittedCount).toBe(2);
      expect(response.body.sentenceIds).toHaveLength(2);
    });

    it('should accept sentences as array', async () => {
      const submissionData = {
        sentences: ['Sentence one', 'Sentence two'],
        languageCode: 'hin_Deva',
      };

      const response = await request(app.getHttpServer())
        .post('/api/write/submission')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(submissionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.submittedCount).toBe(2);
    });

    it('should reject without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/write/submission')
        .send({
          sentences: 'Test',
          languageCode: 'hin_Deva',
        })
        .expect(401);
    });

    it('should reject invalid language code', async () => {
      await request(app.getHttpServer())
        .post('/api/write/submission')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          sentences: 'Test',
          languageCode: 'invalid',
        })
        .expect(400);
    });

    it('should reject empty sentences', async () => {
      await request(app.getHttpServer())
        .post('/api/write/submission')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          sentences: '',
          languageCode: 'hin_Deva',
        })
        .expect(400);
    });

    it('should sanitize input to prevent XSS', async () => {
      const maliciousInput = '<script>alert("xss")</script>Hello';
      const submissionData = {
        sentences: maliciousInput,
        languageCode: 'hin_Deva',
      };

      const response = await request(app.getHttpServer())
        .post('/api/write/submission')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(submissionData)
        .expect(201);

      // Verify script tag was removed
      const createdSentence = await prismaService.sentence.findFirst({
        where: { id: response.body.sentenceIds[0] },
      });

      expect(createdSentence).not.toBeNull();
      expect(createdSentence!.text).not.toContain('<script>');
      expect(createdSentence!.text).toContain('Hello');
    });
  });
});
