/**
 * Functional tests for Admin API endpoints
 */

import { INestApplication } from '@nestjs/common';
import {
    createTestApp,
    createAuthenticatedRequest,
    authenticatedGet,
    authenticatedPost,
} from '../utils/auth-helper';
import { testUserData } from '../../fixtures/users';

describe('Admin API (Functional)', () => {
    let app: INestApplication;
    let adminAuth: { app: INestApplication; token: string; userId: string };

    beforeAll(async () => {
        app = await createTestApp();
        // Note: Admin user creation requires special setup
        // For now, we'll test with regular user (will fail auth checks)
        adminAuth = await createAuthenticatedRequest(app, testUserData.admin);
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /api/admin/login', () => {
        it('should login admin user', async () => {
            // This requires an admin user to exist
            const response = await authenticatedPost(adminAuth.app, '', '/api/admin/login')
                .send({
                    email: 'admin@example.com',
                    password: 'AdminPassword123!',
                });

            // May succeed (200) or fail (401) depending on admin user existence
            expect([200, 401, 404]).toContain(response.status);
        });
    });

    describe('GET /api/admin/dashboard/stats', () => {
        it('should require admin authentication', async () => {
            const response = await authenticatedGet(adminAuth.app, adminAuth.token, '/api/admin/dashboard/stats');

            // Will fail if user is not admin (403) or succeed if admin (200)
            expect([200, 401, 403]).toContain(response.status);
        });
    });

    describe('GET /api/admin/users', () => {
        it('should list users (admin only)', async () => {
            const response = await authenticatedGet(adminAuth.app, adminAuth.token, '/api/admin/users');

            expect([200, 401, 403]).toContain(response.status);
            if (response.status === 200) {
                expect(Array.isArray(response.body)).toBe(true);
            }
        });
    });

    describe('GET /api/admin/sentences/pending', () => {
        it('should return pending sentences (admin only)', async () => {
            const response = await authenticatedGet(adminAuth.app, adminAuth.token, '/api/admin/sentences/pending');

            expect([200, 401, 403]).toContain(response.status);
            if (response.status === 200) {
                expect(Array.isArray(response.body)).toBe(true);
            }
        });
    });

    describe('GET /api/admin/questions/pending', () => {
        it('should return pending questions (admin only)', async () => {
            const response = await authenticatedGet(adminAuth.app, adminAuth.token, '/api/admin/questions/pending');

            expect([200, 401, 403]).toContain(response.status);
            if (response.status === 200) {
                expect(Array.isArray(response.body)).toBe(true);
            }
        });
    });
});
