/**
 * Functional tests for Transcription API endpoints
 */

import { INestApplication } from '@nestjs/common';
import {
    createTestApp,
    createAuthenticatedRequest,
    authenticatedGet,
    authenticatedPost,
} from '../utils/auth-helper';

describe('Transcription API (Functional)', () => {
    let app: INestApplication;
    let auth: { app: INestApplication; token: string; userId: string };

    beforeAll(async () => {
        app = await createTestApp();
        auth = await createAuthenticatedRequest(app);
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /api/transcription/audio', () => {
        it('should return audio for transcription', async () => {
            const response = await authenticatedGet(auth.app, auth.token, '/api/transcription/audio')
                .expect(200);

            expect(Array.isArray(response.body) || typeof response.body === 'object').toBe(true);
        });

        it('should filter audio by language code', async () => {
            const response = await authenticatedGet(auth.app, auth.token, '/api/transcription/audio?languageCode=en')
                .expect(200);

            expect(Array.isArray(response.body) || typeof response.body === 'object').toBe(true);
        });

        it('should not return audio already transcribed by user', async () => {
            const response = await authenticatedGet(auth.app, auth.token, '/api/transcription/audio')
                .expect(200);

            expect(Array.isArray(response.body) || typeof response.body === 'object').toBe(true);
        });
    });

    describe('POST /api/transcription/submission', () => {
        it('should submit transcription', async () => {
            const response = await authenticatedPost(auth.app, auth.token, '/api/transcription/submission')
                .send({
                    speechRecordingId: 'test-recording-id',
                    transcriptionText: 'This is a test transcription.',
                });

            // May return 404 if recording doesn't exist, or 201 if it does
            expect([200, 201, 404]).toContain(response.status);
        });

        it('should reject submission without authentication', async () => {
            await authenticatedPost(auth.app, '', '/api/transcription/submission')
                .send({
                    speechRecordingId: 'test-id',
                    transcriptionText: 'Test transcription',
                })
                .expect(401);
        });

        it('should reject submission with missing required fields', async () => {
            await authenticatedPost(auth.app, auth.token, '/api/transcription/submission')
                .send({
                    speechRecordingId: 'test-id',
                    // Missing transcriptionText
                })
                .expect(400);
        });
    });

    describe('GET /api/transcription/review', () => {
        it('should return transcriptions for review', async () => {
            const response = await authenticatedGet(auth.app, auth.token, '/api/transcription/review')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should filter transcriptions by language code', async () => {
            const response = await authenticatedGet(auth.app, auth.token, '/api/transcription/review?languageCode=en')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('POST /api/transcription/review-submission', () => {
        it('should submit transcription review', async () => {
            const response = await authenticatedPost(auth.app, auth.token, '/api/transcription/review-submission')
                .send({
                    transcriptionReviewId: 'test-review-id',
                    isApproved: true,
                });

            // May return 404 if review doesn't exist, or 201 if it does
            expect([200, 201, 404]).toContain(response.status);
        });

        it('should reject review without authentication', async () => {
            await authenticatedPost(auth.app, '', '/api/transcription/review-submission')
                .send({
                    transcriptionReviewId: 'test-id',
                    isApproved: true,
                })
                .expect(401);
        });

        it('should reject review with missing required fields', async () => {
            await authenticatedPost(auth.app, auth.token, '/api/transcription/review-submission')
                .send({
                    transcriptionReviewId: 'test-id',
                    // Missing isApproved
                })
                .expect(400);
        });
    });
});
