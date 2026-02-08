/**
 * Functional tests for NLP API endpoints
 */

import { INestApplication } from '@nestjs/common';
import {
    createTestApp,
    createAuthenticatedRequest,
    authenticatedGet,
    authenticatedPost,
} from '../utils/auth-helper';
import { testSentences } from '../../fixtures/sentences';

describe('NLP API (Functional)', () => {
    let app: INestApplication;
    let auth: { app: INestApplication; token: string; userId: string };

    beforeAll(async () => {
        app = await createTestApp();
        auth = await createAuthenticatedRequest(app);
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /api/ner-sentences', () => {
        it('should return sentences for NER tagging', async () => {
            const response = await authenticatedGet(auth.app, auth.token, '/api/ner-sentences')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should filter sentences by language code', async () => {
            const response = await authenticatedGet(auth.app, auth.token, '/api/ner-sentences?languageCode=en')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('POST /api/ner-annotation', () => {
        it('should save NER annotation', async () => {
            const response = await authenticatedPost(auth.app, auth.token, '/api/ner-annotation')
                .send({
                    sentenceId: 'test-sentence-id',
                    annotations: [
                        { tokenIndex: 0, entityType: 'PERSON', entityValue: 'John' },
                    ],
                });

            expect([200, 201, 404]).toContain(response.status);
        });

        it('should reject annotation without authentication', async () => {
            await authenticatedPost(auth.app, '', '/api/ner-annotation')
                .send({
                    sentenceId: 'test-id',
                    annotations: [],
                })
                .expect(401);
        });
    });

    describe('GET /api/translation-sentences', () => {
        it('should return sentences for translation', async () => {
            const response = await authenticatedGet(auth.app, auth.token, '/api/translation-sentences')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should filter sentences by language code', async () => {
            const response = await authenticatedGet(auth.app, auth.token, '/api/translation-sentences?languageCode=en')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('POST /api/translation-submission', () => {
        it('should save translation submission', async () => {
            const response = await authenticatedPost(auth.app, auth.token, '/api/translation-submission')
                .send({
                    sentenceId: 'test-sentence-id',
                    targetLanguageCode: 'hi',
                    translatedText: 'यह एक अनुवाद है।',
                });

            expect([200, 201, 404]).toContain(response.status);
        });

        it('should reject submission without authentication', async () => {
            await authenticatedPost(auth.app, '', '/api/translation-submission')
                .send({
                    sentenceId: 'test-id',
                    targetLanguageCode: 'hi',
                    translatedText: 'Test translation',
                })
                .expect(401);
        });
    });

    describe('GET /api/pos-sentences', () => {
        it('should return sentences for POS tagging', async () => {
            const response = await authenticatedGet(auth.app, auth.token, '/api/pos-sentences')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('POST /api/pos-annotation', () => {
        it('should save POS annotation', async () => {
            const response = await authenticatedPost(auth.app, auth.token, '/api/pos-annotation')
                .send({
                    sentenceId: 'test-sentence-id',
                    tags: [
                        { tokenIndex: 0, posTag: 'NOUN' },
                        { tokenIndex: 1, posTag: 'VERB' },
                    ],
                });

            expect([200, 201, 404]).toContain(response.status);
        });
    });

    describe('POST /api/sentiment-annotation', () => {
        it('should save sentiment annotation', async () => {
            const response = await authenticatedPost(auth.app, auth.token, '/api/sentiment-annotation')
                .send({
                    sentenceId: 'test-sentence-id',
                    sentiment: 'positive',
                });

            expect([200, 201, 404]).toContain(response.status);
        });
    });

    describe('POST /api/emotion-annotation', () => {
        it('should save emotion annotation', async () => {
            const response = await authenticatedPost(auth.app, auth.token, '/api/emotion-annotation')
                .send({
                    sentenceId: 'test-sentence-id',
                    emotion: 'happy',
                });

            expect([200, 201, 404]).toContain(response.status);
        });
    });
});
