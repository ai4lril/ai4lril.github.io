/**
 * Functional tests for Write API endpoints
 */

import { INestApplication } from '@nestjs/common';
import {
    createTestApp,
    createAuthenticatedRequest,
    authenticatedPost,
} from '../utils/auth-helper';
import { testSentences } from '../../fixtures/sentences';

describe('Write API (Functional)', () => {
    let app: INestApplication;
    let auth: { app: INestApplication; token: string; userId: string };

    beforeAll(async () => {
        app = await createTestApp();
        auth = await createAuthenticatedRequest(app);
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /api/write/submission', () => {
        it('should submit sentences for write feature', async () => {
            const response = await authenticatedPost(auth.app, auth.token, '/api/write/submission')
                .send({
                    sentences: testSentences.english,
                    languageCode: 'en',
                    citation: 'Test citation',
                })
                .expect(201);

            expect(response.body).toHaveProperty('submittedCount');
            expect(response.body.submittedCount).toBe(testSentences.english.length);
        });

        it('should submit sentences without citation', async () => {
            const response = await authenticatedPost(auth.app, auth.token, '/api/write/submission')
                .send({
                    sentences: ['Another test sentence.'],
                    languageCode: 'en',
                })
                .expect(201);

            expect(response.body.submittedCount).toBe(1);
        });

        it('should reject submission without authentication', async () => {
            await authenticatedPost(auth.app, '', '/api/write/submission')
                .send({
                    sentences: testSentences.english,
                    languageCode: 'en',
                })
                .expect(401);
        });

        it('should reject submission with empty sentences array', async () => {
            await authenticatedPost(auth.app, auth.token, '/api/write/submission')
                .send({
                    sentences: [],
                    languageCode: 'en',
                })
                .expect(400);
        });

        it('should reject submission with missing language code', async () => {
            await authenticatedPost(auth.app, auth.token, '/api/write/submission')
                .send({
                    sentences: testSentences.english,
                })
                .expect(400);
        });

        it('should handle multiple sentences correctly', async () => {
            const multipleSentences = [
                'First sentence.',
                'Second sentence.',
                'Third sentence.',
                'Fourth sentence.',
            ];

            const response = await authenticatedPost(auth.app, auth.token, '/api/write/submission')
                .send({
                    sentences: multipleSentences,
                    languageCode: 'en',
                })
                .expect(201);

            expect(response.body.submittedCount).toBe(multipleSentences.length);
        });

        it('should handle different language codes', async () => {
            const response = await authenticatedPost(auth.app, auth.token, '/api/write/submission')
                .send({
                    sentences: testSentences.hindi,
                    languageCode: 'hi',
                })
                .expect(201);

            expect(response.body.submittedCount).toBe(testSentences.hindi.length);
        });
    });
});

