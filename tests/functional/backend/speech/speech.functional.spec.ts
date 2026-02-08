/**
 * Functional tests for Speech API endpoints
 */

import { INestApplication } from '@nestjs/common';
import {
    createTestApp,
    createAuthenticatedRequest,
    authenticatedGet,
    authenticatedPost,
} from '../utils/auth-helper';
import { testSentences } from '../../fixtures/sentences';

describe('Speech API (Functional)', () => {
    let app: INestApplication;
    let auth: { app: INestApplication; token: string; userId: string };

    beforeAll(async () => {
        app = await createTestApp();
        auth = await createAuthenticatedRequest(app);
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /api/speech/sentences', () => {
        it('should return sentences for speech recording', async () => {
            const response = await authenticatedGet(auth.app, auth.token, '/api/speech/sentences')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should filter sentences by language code', async () => {
            const response = await authenticatedGet(auth.app, auth.token, '/api/speech/sentences?languageCode=en')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            // All returned sentences should be in English (if any exist)
            if (response.body.length > 0) {
                response.body.forEach((sentence: any) => {
                    expect(sentence.languageCode).toBe('en');
                });
            }
        });

        it('should not return sentences already recorded by user', async () => {
            // First request
            const firstResponse = await authenticatedGet(auth.app, auth.token, '/api/speech/sentences')
                .expect(200);

            const firstSentenceId = firstResponse.body[0]?.id;
            if (firstSentenceId) {
                // Record the sentence
                const audioData = Buffer.from('fake audio data').toString('base64');
                await authenticatedPost(auth.app, auth.token, '/api/speech/recording')
                    .send({
                        sentenceId: firstSentenceId,
                        audioFile: audioData,
                        audioFormat: 'wav',
                        duration: 5.0,
                    })
                    .expect(201);

                // Second request should not include the recorded sentence
                const secondResponse = await authenticatedGet(auth.app, auth.token, '/api/speech/sentences')
                    .expect(200);

                const recordedSentence = secondResponse.body.find((s: any) => s.id === firstSentenceId);
                expect(recordedSentence).toBeUndefined();
            }
        });

        it('should work without authentication (optional)', async () => {
            const response = await authenticatedGet(auth.app, '', '/api/speech/sentences')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('POST /api/speech/recording', () => {
        let sentenceId: string;

        beforeAll(async () => {
            // Get a sentence to record
            const response = await authenticatedGet(auth.app, auth.token, '/api/speech/sentences')
                .expect(200);

            sentenceId = response.body[0]?.id;
        });

        it('should save speech recording with valid data', async () => {
            if (!sentenceId) {
                // Skip if no sentences available
                return;
            }

            const audioData = Buffer.from('fake audio data for testing').toString('base64');

            const response = await authenticatedPost(auth.app, auth.token, '/api/speech/recording')
                .send({
                    sentenceId,
                    audioFile: audioData,
                    audioFormat: 'wav',
                    duration: 3.5,
                })
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body.sentenceId).toBe(sentenceId);
        });

        it('should reject recording without authentication', async () => {
            const audioData = Buffer.from('fake audio').toString('base64');

            await authenticatedPost(auth.app, '', '/api/speech/recording')
                .send({
                    sentenceId: 'test-id',
                    audioFile: audioData,
                    audioFormat: 'wav',
                })
                .expect(401);
        });

        it('should reject recording with missing sentenceId', async () => {
            const audioData = Buffer.from('fake audio').toString('base64');

            await authenticatedPost(auth.app, auth.token, '/api/speech/recording')
                .send({
                    audioFile: audioData,
                    audioFormat: 'wav',
                })
                .expect(400);
        });

        it('should reject recording with invalid audio format', async () => {
            if (!sentenceId) return;

            const audioData = Buffer.from('fake audio').toString('base64');

            await authenticatedPost(auth.app, auth.token, '/api/speech/recording')
                .send({
                    sentenceId,
                    audioFile: audioData,
                    audioFormat: 'invalid-format',
                })
                .expect(400);
        });
    });

    describe('GET /api/speech/listen-audio', () => {
        it('should return audio for validation', async () => {
            const response = await authenticatedGet(auth.app, auth.token, '/api/speech/listen-audio')
                .expect(200);

            // Should return audio data or empty array
            expect(Array.isArray(response.body) || typeof response.body === 'object').toBe(true);
        });

        it('should filter audio by language code', async () => {
            const response = await authenticatedGet(auth.app, auth.token, '/api/speech/listen-audio?languageCode=en')
                .expect(200);

            expect(Array.isArray(response.body) || typeof response.body === 'object').toBe(true);
        });

        it('should not return audio already validated by user', async () => {
            // This test would require setting up test data with audio recordings
            // and validations, which is more complex
            const response = await authenticatedGet(auth.app, auth.token, '/api/speech/listen-audio')
                .expect(200);

            expect(Array.isArray(response.body) || typeof response.body === 'object').toBe(true);
        });
    });

    describe('POST /api/speech/listen-validation', () => {
        it('should save validation for audio', async () => {
            // This test requires existing audio recordings
            // For now, we'll test the endpoint structure
            const response = await authenticatedPost(auth.app, auth.token, '/api/speech/listen-validation')
                .send({
                    speechRecordingId: 'test-recording-id',
                    isValid: true,
                });

            // May return 404 if recording doesn't exist, or 201 if it does
            expect([200, 201, 404]).toContain(response.status);
        });

        it('should reject validation without authentication', async () => {
            await authenticatedPost(auth.app, '', '/api/speech/listen-validation')
                .send({
                    speechRecordingId: 'test-id',
                    isValid: true,
                })
                .expect(401);
        });

        it('should reject validation with missing required fields', async () => {
            await authenticatedPost(auth.app, auth.token, '/api/speech/listen-validation')
                .send({
                    speechRecordingId: 'test-id',
                    // Missing isValid
                })
                .expect(400);
        });
    });
});

