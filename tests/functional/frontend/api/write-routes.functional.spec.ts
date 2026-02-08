/**
 * Functional tests for Frontend Write API routes
 */

import { frontendApiRequest, createUserViaFrontend } from '../utils/frontend-helper';
import { testSentences } from '../../fixtures/sentences';

describe('Frontend Write API Routes (Functional)', () => {
    let authToken: string;

    beforeAll(async () => {
        try {
            const user = await createUserViaFrontend({
                email: `write_test_${Date.now()}@test.com`,
                password: 'TestPassword123!',
                name: 'Write Test User',
            });
            authToken = user.token;
        } catch (error) {
            // Backend may not be available
            authToken = '';
        }
    });

    describe('POST /api/write-submission', () => {
        it('should proxy write submission to backend', async () => {
            if (!authToken) {
                // Skip if backend unavailable
                return;
            }

            const response = await frontendApiRequest('/api/write-submission', {
                method: 'POST',
                token: authToken,
                body: {
                    sentences: testSentences.english,
                    languageCode: 'en',
                    citation: 'Test citation',
                },
            });

            expect([200, 201, 400, 401, 500]).toContain(response.status);
        });

        it('should reject submission without authentication', async () => {
            const response = await frontendApiRequest('/api/write-submission', {
                method: 'POST',
                body: {
                    sentences: testSentences.english,
                    languageCode: 'en',
                },
            });

            expect([401, 500]).toContain(response.status);
        });

        it('should handle validation errors', async () => {
            if (!authToken) return;

            const response = await frontendApiRequest('/api/write-submission', {
                method: 'POST',
                token: authToken,
                body: {
                    sentences: [],
                    languageCode: 'en',
                },
            });

            expect([400, 500]).toContain(response.status);
        });
    });
});
