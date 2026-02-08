/**
 * Functional tests for Authentication API endpoints
 */

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, createTestUser, loginTestUser } from '../utils/auth-helper';
import { testUserData, invalidUserData } from '../../fixtures/users';

describe('Auth API (Functional)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        app = await createTestApp();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /api/auth/signup', () => {
        it('should create a new user with valid data', async () => {
            const userData = {
                ...testUserData.valid,
                email: `signup_${Date.now()}@test.com`,
                username: `signup_${Date.now()}`,
            };

            const response = await request(app.getHttpServer())
                .post('/api/auth/signup')
                .send(userData)
                .expect(201);

            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe(userData.email);
            expect(response.body.user.username).toBe(userData.username);
            expect(response.body.user.password).toBeUndefined(); // Password should not be returned
        });

        it('should create user with minimal required fields', async () => {
            const userData = {
                ...testUserData.minimal,
                email: `minimal_${Date.now()}@test.com`,
                username: `minimal_${Date.now()}`,
            };

            const response = await request(app.getHttpServer())
                .post('/api/auth/signup')
                .send(userData)
                .expect(201);

            expect(response.body).toHaveProperty('token');
            expect(response.body.user.email).toBe(userData.email);
        });

        it('should reject signup with missing email', async () => {
            await request(app.getHttpServer())
                .post('/api/auth/signup')
                .send(invalidUserData.missingEmail)
                .expect(400);
        });

        it('should reject signup with invalid email format', async () => {
            await request(app.getHttpServer())
                .post('/api/auth/signup')
                .send(invalidUserData.invalidEmail)
                .expect(400);
        });

        it('should reject signup with short password', async () => {
            await request(app.getHttpServer())
                .post('/api/auth/signup')
                .send(invalidUserData.shortPassword)
                .expect(400);
        });

        it('should reject signup with duplicate email', async () => {
            const userData = {
                ...testUserData.valid,
                email: `duplicate_${Date.now()}@test.com`,
                username: `duplicate_${Date.now()}`,
            };

            // Create first user
            await request(app.getHttpServer())
                .post('/api/auth/signup')
                .send(userData)
                .expect(201);

            // Try to create duplicate
            await request(app.getHttpServer())
                .post('/api/auth/signup')
                .send(userData)
                .expect(409); // Conflict
        });

        it('should reject signup with duplicate username', async () => {
            const userData = {
                ...testUserData.valid,
                email: `unique_${Date.now()}@test.com`,
                username: `duplicate_username_${Date.now()}`,
            };

            // Create first user
            await request(app.getHttpServer())
                .post('/api/auth/signup')
                .send(userData)
                .expect(201);

            // Try to create duplicate with same username
            const duplicateData = {
                ...userData,
                email: `different_${Date.now()}@test.com`,
            };

            await request(app.getHttpServer())
                .post('/api/auth/signup')
                .send(duplicateData)
                .expect(409); // Conflict
        });
    });

    describe('POST /api/auth/login', () => {
        let testUser: { email: string; password: string };

        beforeAll(async () => {
            const userData = {
                ...testUserData.valid,
                email: `login_${Date.now()}@test.com`,
                username: `login_${Date.now()}`,
            };

            const created = await createTestUser(app, userData);
            // Use the actual email that was created (which may have been modified for uniqueness)
            testUser = { email: created.user.email, password: userData.password };
        });

        it('should login with valid credentials', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                })
                .expect(200);

            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe(testUser.email);
        });

        it('should reject login with invalid email', async () => {
            await request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: 'password123',
                })
                .expect(401);
        });

        it('should reject login with invalid password', async () => {
            await request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword',
                })
                .expect(401);
        });

        it('should reject login with missing email', async () => {
            await request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    password: 'password123',
                })
                .expect(400);
        });

        it('should reject login with missing password', async () => {
            await request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                })
                .expect(400);
        });
    });

    describe('POST /api/auth/me', () => {
        it('should return user profile with valid token', async () => {
            const { token } = await createTestUser(app);

            const response = await request(app.getHttpServer())
                .post('/api/auth/me')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('id');
            expect(response.body.user).toHaveProperty('email');
        });

        it('should reject request without token', async () => {
            await request(app.getHttpServer())
                .post('/api/auth/me')
                .expect(401);
        });

        it('should reject request with invalid token', async () => {
            await request(app.getHttpServer())
                .post('/api/auth/me')
                .set('Authorization', 'Bearer invalid_token')
                .expect(401);
        });
    });
});

