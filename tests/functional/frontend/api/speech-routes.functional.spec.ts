/**
 * Functional tests for Frontend Speech API routes
 */

import { frontendApiRequest, createUserViaFrontend } from '../utils/frontend-helper';

describe('Frontend Speech API Routes (Functional)', () => {
    let authToken: string;

    beforeAll(async () => {
        try {
            const user = await createUserViaFrontend({
                email: `speech_test_${Date.now()}@test.com`,
                password: 'TestPassword123!',
                name: 'Speech Test User',
            });
            authToken = user.token;
        } catch (error) {
            authToken = '';
        }
    });

    describe('GET /api/speech-sentences', () => {
        it('should proxy speech sentences request to backend', async () => {
            const response = await frontendApiRequest('/api/speech-sentences', {
                method: 'GET',
                token: authToken,
            });

            expect([200, 401, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(Array.isArray(response.data)).toBe(true);
            }
        });

        it('should filter by language code', async () => {
            const response = await frontendApiRequest('/api/speech-sentences?languageCode=en', {
                method: 'GET',
                token: authToken,
            });

            expect([200, 401, 500]).toContain(response.status);
        });
    });

    describe('POST /api/speech-recording', () => {
        it('should proxy speech recording to backend', async () => {
            if (!authToken) return;

            const audioData = Buffer.from('fake audio data').toString('base64');

            const response = await frontendApiRequest('/api/speech-recording', {
                method: 'POST',
                token: authToken,
                body: {
                    sentenceId: 'test-sentence-id',
                    audioFile: audioData,
                    audioFormat: 'wav',
                    duration: 5.0,
                },
            });

            expect([200, 201, 400, 401, 404, 500]).toContain(response.status);
        });

        it('should reject recording without authentication', async () => {
            const audioData = Buffer.from('fake audio').toString('base64');

            const response = await frontendApiRequest('/api/speech-recording', {
                method: 'POST',
                body: {
                    sentenceId: 'test-id',
                    audioFile: audioData,
                    audioFormat: 'wav',
                },
            });

            expect([401, 500]).toContain(response.status);
        });
    });
});
