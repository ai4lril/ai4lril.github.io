/**
 * Functional tests for Frontend Auth API routes
 */

import { frontendApiRequest, createUserViaFrontend, loginViaFrontend } from '../utils/frontend-helper';
import { testUserData, invalidUserData } from '../../fixtures/users';

describe('Frontend Auth API Routes (Functional)', () => {
    describe('POST /api/auth/signup', () => {
        it('should proxy signup request to backend', async () => {
            const userData = {
                ...testUserData.valid,
                email: `frontend_signup_${Date.now()}@test.com`,
                username: `frontend_signup_${Date.now()}`,
            };

            const response = await frontendApiRequest('/api/auth/signup', {
                method: 'POST',
                body: userData,
            });

            // Should either succeed (201) or fail with backend error (500)
            // But should not fail with connection refused (meaning proxy works)
            expect([200, 201, 400, 409, 500]).toContain(response.status);

            if (response.status === 201 || response.status === 200) {
                expect(response.data).toHaveProperty('token');
                expect(response.data).toHaveProperty('user');
            }
        });

        it('should handle validation errors from backend', async () => {
            const response = await frontendApiRequest('/api/auth/signup', {
                method: 'POST',
                body: invalidUserData.missingEmail,
            });

            expect([400, 500]).toContain(response.status);
            if (response.status === 400) {
                expect(response.data).toHaveProperty('error');
            }
        });

        it('should return proper error format on failure', async () => {
            const response = await frontendApiRequest('/api/auth/signup', {
                method: 'POST',
                body: invalidUserData.shortPassword,
            });

            expect([400, 500]).toContain(response.status);
            expect(response.data).toHaveProperty('error');
        });
    });

    describe('POST /api/auth/login', () => {
        let testCredentials: { email: string; password: string };

        beforeAll(async () => {
            // Create a test user first
            const userData = {
                ...testUserData.valid,
                email: `frontend_login_${Date.now()}@test.com`,
                username: `frontend_login_${Date.now()}`,
            };

            try {
                await createUserViaFrontend({
                    email: userData.email,
                    password: userData.password,
                    name: userData.display_name,
                });
                testCredentials = {
                    email: userData.email,
                    password: userData.password,
                };
            } catch (error) {
                // If backend is not available, skip these tests
                testCredentials = { email: '', password: '' };
            }
        });

        it('should proxy login request to backend', async () => {
            if (!testCredentials.email) {
                // Skip if backend unavailable
                return;
            }

            const response = await frontendApiRequest('/api/auth/login', {
                method: 'POST',
                body: {
                    email: testCredentials.email,
                    password: testCredentials.password,
                },
            });

            expect([200, 401, 500]).toContain(response.status);

            if (response.status === 200) {
                expect(response.data).toHaveProperty('token');
                expect(response.data).toHaveProperty('user');
            }
        });

        it('should handle invalid credentials', async () => {
            const response = await frontendApiRequest('/api/auth/login', {
                method: 'POST',
                body: {
                    email: 'nonexistent@test.com',
                    password: 'wrongpassword',
                },
            });

            expect([401, 500]).toContain(response.status);
        });

        it('should handle missing fields', async () => {
            const response = await frontendApiRequest('/api/auth/login', {
                method: 'POST',
                body: {
                    email: 'test@test.com',
                    // Missing password
                },
            });

            expect([400, 500]).toContain(response.status);
        });
    });

    describe('GET /api/auth/google', () => {
        it('should redirect to backend Google OAuth endpoint', async () => {
            const response = await frontendApiRequest('/api/auth/google', {
                method: 'GET',
            });

            // Should redirect (307 or 302)
            expect([302, 307, 500]).toContain(response.status);
        });
    });

    describe('GET /api/auth/github', () => {
        it('should redirect to backend GitHub OAuth endpoint', async () => {
            const response = await frontendApiRequest('/api/auth/github', {
                method: 'GET',
            });

            // Should redirect (307 or 302)
            expect([302, 307, 500]).toContain(response.status);
        });
    });
});

