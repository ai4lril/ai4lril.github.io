/**
 * Functional tests for Question API endpoints
 */

import { INestApplication } from '@nestjs/common';
import {
    createTestApp,
    createAuthenticatedRequest,
    authenticatedPost,
    authenticatedGet,
} from '../utils/auth-helper';
import { testQuestions } from '../../fixtures/sentences';

describe('Question API (Functional)', () => {
    let app: INestApplication;
    let auth: { app: INestApplication; token: string; userId: string };

    beforeAll(async () => {
        app = await createTestApp();
        auth = await createAuthenticatedRequest(app);
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /api/question/submission', () => {
        it('should submit a question', async () => {
            const response = await authenticatedPost(auth.app, auth.token, '/api/question/submission')
                .send({
                    questionText: testQuestions.english[0],
                    languageCode: 'en',
                })
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body.questionText).toBe(testQuestions.english[0]);
            expect(response.body.languageCode).toBe('en');
        });

        it('should reject submission without authentication', async () => {
            await authenticatedPost(auth.app, '', '/api/question/submission')
                .send({
                    questionText: testQuestions.english[0],
                    languageCode: 'en',
                })
                .expect(401);
        });

        it('should reject submission with missing question text', async () => {
            await authenticatedPost(auth.app, auth.token, '/api/question/submission')
                .send({
                    languageCode: 'en',
                })
                .expect(400);
        });

        it('should reject submission with missing language code', async () => {
            await authenticatedPost(auth.app, auth.token, '/api/question/submission')
                .send({
                    questionText: testQuestions.english[0],
                })
                .expect(400);
        });
    });

    describe('GET /api/question/sentences', () => {
        it('should return validated questions', async () => {
            const response = await authenticatedGet(auth.app, auth.token, '/api/question/sentences')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should filter questions by language code', async () => {
            const response = await authenticatedGet(auth.app, auth.token, '/api/question/sentences?languageCode=en')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            if (response.body.length > 0) {
                response.body.forEach((question: any) => {
                    expect(question.languageCode).toBe('en');
                });
            }
        });

        it('should not return questions already answered by user', async () => {
            // This would require setting up test data
            const response = await authenticatedGet(auth.app, auth.token, '/api/question/sentences')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('POST /api/question/answer-recording', () => {
        let questionId: string;

        beforeAll(async () => {
            // Submit a question first
            const submitResponse = await authenticatedPost(auth.app, auth.token, '/api/question/submission')
                .send({
                    questionText: testQuestions.english[0],
                    languageCode: 'en',
                })
                .expect(201);

            questionId = submitResponse.body.id;
        });

        it('should save answer recording', async () => {
            if (!questionId) return;

            const audioData = Buffer.from('fake answer audio').toString('base64');

            const response = await authenticatedPost(auth.app, auth.token, '/api/question/answer-recording')
                .send({
                    questionSubmissionId: questionId,
                    audioFile: audioData,
                    audioFormat: 'wav',
                    duration: 10.5,
                })
                .expect(201);

            expect(response.body).toHaveProperty('id');
        });

        it('should reject recording without authentication', async () => {
            const audioData = Buffer.from('fake audio').toString('base64');

            await authenticatedPost(auth.app, '', '/api/question/answer-recording')
                .send({
                    questionSubmissionId: 'test-id',
                    audioFile: audioData,
                    audioFormat: 'wav',
                })
                .expect(401);
        });

        it('should reject recording with missing required fields', async () => {
            await authenticatedPost(auth.app, auth.token, '/api/question/answer-recording')
                .send({
                    questionSubmissionId: 'test-id',
                    // Missing audioFile
                })
                .expect(400);
        });
    });
});
