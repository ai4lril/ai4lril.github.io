import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { AuthService } from '../../src/auth/auth.service';

describe('Transcription Integration (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authService: AuthService;
  let accessToken: string;
  let userId: string;
  let recordingId: string;

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
      email: `transcription${Date.now()}@example.com`,
      password: 'Test123!@#',
      username: `transcriptionuser${Date.now()}`,
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

    // Create a test sentence and recording
    const sentence = await prismaService.sentence.create({
      data: {
        text: 'Hello world',
        languageCode: 'hin_Deva',
        taskType: 'speech',
        valid: true,
        isActive: true,
      },
    });

    const recording = await prismaService.speechRecording.create({
      data: {
        sentenceId: sentence.id,
        userId,
        audioFile: 'https://storage.example.com/test.webm',
        audioFormat: 'webm',
        duration: 5.5,
        isValidated: true,
      },
    });
    recordingId = recording.id;
  });

  afterAll(async () => {
    // Cleanup
    await prismaService.transcriptionReview
      .deleteMany({
        where: { speechRecordingId: recordingId },
      })
      .catch(() => {});
    await prismaService.speechRecording
      .delete({
        where: { id: recordingId },
      })
      .catch(() => {});
    await prismaService.sentence
      .deleteMany({
        where: { languageCode: 'hin_Deva', taskType: 'speech' },
      })
      .catch(() => {});
    await prismaService.user
      .delete({
        where: { id: userId },
      })
      .catch(() => {});
    await app.close();
  });

  describe('GET /api/transcription/audio', () => {
    it('should return audio for transcription', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/transcription/audio')
        .expect(200);

      if (response.body) {
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('audioFile');
        expect(response.body).toHaveProperty('sentence');
      }
    });

    it('should filter by language code', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/transcription/audio?languageCode=hin_Deva')
        .expect(200);

      // May return null if no recordings available
      if (response.body) {
        expect(response.body.sentence.languageCode).toBe('hin_Deva');
      }
    });
  });

  describe('POST /api/transcription/submission', () => {
    it('should submit transcription with authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/transcription-submission')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          speechRecordingId: recordingId,
          transcriptionText: 'Hello world',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should reject without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/transcription-submission')
        .send({
          speechRecordingId: recordingId,
          transcriptionText: 'Hello world',
        })
        .expect(401);
    });

    it('should sanitize transcription text', async () => {
      const maliciousText = '<script>alert("xss")</script>Hello world';

      await request(app.getHttpServer())
        .post('/api/transcription-submission')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          speechRecordingId: recordingId,
          transcriptionText: maliciousText,
        })
        .expect(400); // Will fail because already transcribed, but check sanitization

      // Create new recording for sanitization test
      const sentence2 = await prismaService.sentence.create({
        data: {
          text: 'Test sentence',
          languageCode: 'hin_Deva',
          taskType: 'speech',
          valid: true,
          isActive: true,
        },
      });

      const recording2 = await prismaService.speechRecording.create({
        data: {
          sentenceId: sentence2.id,
          userId,
          audioFile: 'https://storage.example.com/test2.webm',
          audioFormat: 'webm',
          duration: 5.5,
          isValidated: true,
        },
      });

      const response = await request(app.getHttpServer())
        .post('/api/transcription-submission')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          speechRecordingId: recording2.id,
          transcriptionText: maliciousText,
        })
        .expect(201);

      // Verify sanitization
      const transcription = await prismaService.transcriptionReview.findFirst({
        where: { speechRecordingId: recording2.id },
      });

      expect(transcription).not.toBeNull();
      if (transcription) {
        expect(transcription.transcriptionText).not.toContain('<script>');
        expect(transcription.transcriptionText).toContain('Hello world');
      }
    });

    it('should reject invalid recording ID', async () => {
      await request(app.getHttpServer())
        .post('/api/transcription-submission')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          speechRecordingId: 'invalid-id',
          transcriptionText: 'Hello',
        })
        .expect(404);
    });
  });

  describe('GET /api/transcription/review', () => {
    it('should return transcriptions for review', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/transcription/review')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/transcription/review', () => {
    let transcriptionId: string;

    beforeAll(async () => {
      // Create a transcription for review
      const transcription = await prismaService.transcriptionReview.create({
        data: {
          speechRecordingId: recordingId,
          userId,
          transcriptionText: 'Hello world',
          isApproved: false,
        },
      });
      transcriptionId = transcription.id;
    });

    it('should submit review with authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/transcription-review')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          transcriptionReviewId: transcriptionId,
          isApproved: true,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.isApproved).toBe(true);
    });

    it('should reject without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/transcription-review')
        .send({
          transcriptionReviewId: transcriptionId,
          isApproved: true,
        })
        .expect(401);
    });

    it('should reject invalid transcription ID', async () => {
      await request(app.getHttpServer())
        .post('/api/transcription-review')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          transcriptionReviewId: 'invalid-id',
          isApproved: true,
        })
        .expect(404);
    });
  });
});
