import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { AuthService } from '../../src/auth/auth.service';

describe('Question Integration (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authService: AuthService;
  let accessToken: string;
  let userId: string;
  let questionId: string;

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
      email: `question${Date.now()}@example.com`,
      password: 'Test123!@#',
      username: `questionuser${Date.now()}`,
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

    // Create a test question sentence
    const sentence = await prismaService.sentence.create({
      data: {
        text: 'What is your favorite color?',
        languageCode: 'hin_Deva',
        taskType: 'question',
        valid: true,
        isActive: true,
      },
    });

    const questionSubmission = await prismaService.questionSubmission.create({
      data: {
        sentenceId: sentence.id,
        userId,
        submittedText: 'What is your favorite color?',
        languageCode: 'hin_Deva',
        valid: true,
      },
    });
    questionId = questionSubmission.id;
  });

  afterAll(async () => {
    // Cleanup
    await prismaService.answerRecording
      .deleteMany({
        where: { questionSubmissionId: questionId },
      })
      .catch(() => {});
    await prismaService.questionSubmission
      .delete({
        where: { id: questionId },
      })
      .catch(() => {});
    await prismaService.sentence
      .deleteMany({
        where: { languageCode: 'hin_Deva', taskType: 'question' },
      })
      .catch(() => {});
    await prismaService.user
      .delete({
        where: { id: userId },
      })
      .catch(() => {});
    await app.close();
  });

  describe('POST /api/question/submission', () => {
    it('should submit a question with authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/question/submission')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          questionText: 'What is your name?',
          languageCode: 'hin_Deva',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.id).toBeDefined();
    });

    it('should reject without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/question/submission')
        .send({
          questionText: 'Test question?',
          languageCode: 'hin_Deva',
        })
        .expect(401);
    });

    it('should sanitize question text', async () => {
      const maliciousText = '<script>alert("xss")</script>What is your name?';

      const response = await request(app.getHttpServer())
        .post('/api/question/submission')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          questionText: maliciousText,
          languageCode: 'hin_Deva',
        })
        .expect(201);

      // Verify script tag was removed
      const submission = await prismaService.questionSubmission.findUnique({
        where: { id: response.body.id },
        include: { sentence: true },
      });

      expect(submission).not.toBeNull();
      if (submission) {
        expect(submission.submittedText).not.toContain('<script>');
        expect(submission.submittedText).toContain('What is your name?');
      }
    });
  });

  describe('GET /api/question/sentences', () => {
    it('should return validated questions', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/question/sentences')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by language code', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/question/sentences?languageCode=hin_Deva')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/question/answer-recording', () => {
    it('should save answer recording with authentication', async () => {
      const base64Audio = Buffer.from('test audio data').toString('base64');

      const response = await request(app.getHttpServer())
        .post('/api/question/answer-recording')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          questionSubmissionId: questionId,
          audioFile: base64Audio,
          audioFormat: 'webm',
          duration: 5.5,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.id).toBeDefined();
    });

    it('should reject without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/question/answer-recording')
        .send({
          questionSubmissionId: questionId,
          audioFile: 'test',
          audioFormat: 'webm',
        })
        .expect(401);
    });

    it('should reject invalid question ID', async () => {
      const base64Audio = Buffer.from('test').toString('base64');

      await request(app.getHttpServer())
        .post('/api/question/answer-recording')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          questionSubmissionId: 'invalid-id',
          audioFile: base64Audio,
          audioFormat: 'webm',
        })
        .expect(404);
    });
  });
});
