import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { AuthService } from '../../src/auth/auth.service';

describe('Speech Integration (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authService: AuthService;
  let accessToken: string;
  let userId: string;
  let sentenceId: string;

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
      email: `speech${Date.now()}@example.com`,
      password: 'Test123!@#',
      username: `speechuser${Date.now()}`,
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

    // Create a test sentence
    const sentence = await prismaService.sentence.create({
      data: {
        text: 'Test sentence for speech recording',
        languageCode: 'hin_Deva',
        taskType: 'speech',
        valid: true,
        isActive: true,
      },
    });
    sentenceId = sentence.id;
  });

  afterAll(async () => {
    // Cleanup
    await prismaService.speechRecording
      .deleteMany({
        where: { sentenceId },
      })
      .catch(() => {});
    await prismaService.sentence
      .delete({
        where: { id: sentenceId },
      })
      .catch(() => {});
    await prismaService.user
      .delete({
        where: { id: userId },
      })
      .catch(() => {});
    await app.close();
  });

  describe('GET /api/speech/sentences', () => {
    it('should return sentences without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/speech/sentences')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by language code', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/speech/sentences?languageCode=hin_Deva')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0].languageCode).toBe('hin_Deva');
      }
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/speech/sentences?page=1&limit=10')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/speech/recording', () => {
    it('should save speech recording with authentication', async () => {
      // Create a base64 audio string (minimal valid WebM header)
      const base64Audio = Buffer.from('test audio data').toString('base64');

      const response = await request(app.getHttpServer())
        .post('/api/speech/recording')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          sentenceId,
          audioFile: base64Audio,
          audioFormat: 'webm',
          duration: 5.5,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should reject without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/speech/recording')
        .send({
          sentenceId,
          audioFile: 'test',
          audioFormat: 'webm',
        })
        .expect(401);
    });

    it('should reject invalid sentence ID', async () => {
      const base64Audio = Buffer.from('test').toString('base64');

      await request(app.getHttpServer())
        .post('/api/speech/recording')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          sentenceId: 'invalid-id',
          audioFile: base64Audio,
          audioFormat: 'webm',
        })
        .expect(404);
    });
  });

  describe('GET /api/speech/listen-audio', () => {
    it('should return audio for validation', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/speech/listen-audio')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by language code', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/speech/listen-audio?languageCode=hin_Deva')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/speech/listen-validation', () => {
    let recordingId: string;

    beforeAll(async () => {
      // Create a test recording
      const recording = await prismaService.speechRecording.create({
        data: {
          sentenceId,
          userId,
          audioFile: 'https://storage.example.com/test.webm',
          audioFormat: 'webm',
          duration: 5.5,
          isValidated: false,
        },
      });
      recordingId = recording.id;
    });

    afterAll(async () => {
      await prismaService.validation
        .deleteMany({
          where: { speechRecordingId: recordingId },
        })
        .catch(() => {});
      await prismaService.speechRecording
        .delete({
          where: { id: recordingId },
        })
        .catch(() => {});
    });

    it('should save validation with authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/speech/listen-validation')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          speechRecordingId: recordingId,
          isValid: true,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should reject without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/speech/listen-validation')
        .send({
          speechRecordingId: recordingId,
          isValid: true,
        })
        .expect(401);
    });

    it('should reject invalid recording ID', async () => {
      await request(app.getHttpServer())
        .post('/api/speech/listen-validation')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          speechRecordingId: 'invalid-id',
          isValid: true,
        })
        .expect(404);
    });
  });
});
