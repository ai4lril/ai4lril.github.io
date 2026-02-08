/**
 * Functional tests for API Key management endpoints
 */

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
    createTestApp,
    createAuthenticatedRequest,
    authenticatedPost,
    authenticatedGet,
    authenticatedDelete,
    authenticatedPut,
} from '../utils/auth-helper';

describe('API Keys API (Functional)', () => {
    let app: INestApplication;
    let auth: { app: INestApplication; token: string; userId: string };

    beforeAll(async () => {
        app = await createTestApp();
        auth = await createAuthenticatedRequest(app);
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /api/auth/api-keys', () => {
        it('should create a new API key', async () => {
            const response = await authenticatedPost(auth.app, auth.token, '/api/auth/api-keys')
                .send({ name: 'Test API Key' })
                .expect(201);

            expect(response.body).toHaveProperty('apiKey');
            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toBe('Test API Key');
            expect(response.body.apiKey).toMatch(/^[a-zA-Z0-9_-]+$/); // API key format
        });

        it('should create API key with expiration date', async () => {
            const expiresAt = new Date();
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);

            const response = await authenticatedPost(auth.app, auth.token, '/api/auth/api-keys')
                .send({
                    name: 'Expiring API Key',
                    expiresAt: expiresAt.toISOString(),
                })
                .expect(201);

            expect(response.body.expiresAt).toBeDefined();
        });

        it('should reject API key creation without authentication', async () => {
            await request(auth.app.getHttpServer())
                .post('/api/auth/api-keys')
                .send({ name: 'Test Key' })
                .expect(401);
        });

        it('should reject API key creation without name', async () => {
            await authenticatedPost(auth.app, auth.token, '/api/auth/api-keys')
                .send({})
                .expect(400);
        });
    });

    describe('GET /api/auth/api-keys', () => {
        it('should list user API keys', async () => {
            // Create a few API keys first
            await authenticatedPost(auth.app, auth.token, '/api/auth/api-keys')
                .send({ name: 'Key 1' });
            await authenticatedPost(auth.app, auth.token, '/api/auth/api-keys')
                .send({ name: 'Key 2' });

            const response = await authenticatedGet(auth.app, auth.token, '/api/auth/api-keys')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThanOrEqual(2);
            expect(response.body[0]).toHaveProperty('id');
            expect(response.body[0]).toHaveProperty('name');
            expect(response.body[0]).not.toHaveProperty('apiKey'); // Should not return full key
        });

        it('should reject listing API keys without authentication', async () => {
            await request(auth.app.getHttpServer())
                .get('/api/auth/api-keys')
                .expect(401);
        });
    });

    describe('DELETE /api/auth/api-keys/:id', () => {
        it('should revoke an API key', async () => {
            // Create an API key
            const createResponse = await authenticatedPost(auth.app, auth.token, '/api/auth/api-keys')
                .send({ name: 'Key to Revoke' })
                .expect(201);

            const keyId = createResponse.body.id;

            // Revoke it
            await authenticatedDelete(auth.app, auth.token, `/api/auth/api-keys/${keyId}`)
                .expect(200);

            // Verify it's revoked
            const listResponse = await authenticatedGet(auth.app, auth.token, '/api/auth/api-keys')
                .expect(200);

            const revokedKey = listResponse.body.find((k: any) => k.id === keyId);
            expect(revokedKey.isActive).toBe(false);
        });

        it('should reject revoking non-existent API key', async () => {
            await authenticatedDelete(auth.app, auth.token, '/api/auth/api-keys/nonexistent-id')
                .expect(404);
        });

        it('should reject revoking another user\'s API key', async () => {
            // Create API key with first user
            const createResponse = await authenticatedPost(auth.app, auth.token, '/api/auth/api-keys')
                .send({ name: 'Other User Key' })
                .expect(201);

            const keyId = createResponse.body.id;

            // Create second user and try to revoke first user's key
            const auth2 = await createAuthenticatedRequest(auth.app);
            await authenticatedDelete(auth2.app, auth2.token, `/api/auth/api-keys/${keyId}`)
                .expect(404); // Should not find it (or 403 if found but not authorized)
        });
    });

    describe('PUT /api/auth/api-keys/:id', () => {
        it('should update API key name', async () => {
            // Create an API key
            const createResponse = await authenticatedPost(auth.app, auth.token, '/api/auth/api-keys')
                .send({ name: 'Original Name' })
                .expect(201);

            const keyId = createResponse.body.id;

            // Update it
            const response = await authenticatedPut(auth.app, auth.token, `/api/auth/api-keys/${keyId}`)
                .send({ name: 'Updated Name' })
                .expect(200);

            expect(response.body.name).toBe('Updated Name');
        });

        it('should update API key expiration', async () => {
            // Create an API key
            const createResponse = await authenticatedPost(auth.app, auth.token, '/api/auth/api-keys')
                .send({ name: 'Key to Update' })
                .expect(201);

            const keyId = createResponse.body.id;
            const newExpiresAt = new Date();
            newExpiresAt.setFullYear(newExpiresAt.getFullYear() + 2);

            // Update expiration
            const response = await authenticatedPut(auth.app, auth.token, `/api/auth/api-keys/${keyId}`)
                .send({ expiresAt: newExpiresAt.toISOString() })
                .expect(200);

            expect(response.body.expiresAt).toBeDefined();
        });
    });
});

