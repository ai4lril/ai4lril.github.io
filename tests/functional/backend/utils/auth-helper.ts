/**
 * Authentication helper utilities for backend tests
 */

import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../../../../backend/src/app.module';
import { testUserData } from '../../fixtures/users';

export interface AuthenticatedRequest {
    app: INestApplication;
    token: string;
    userId: string;
}

/**
 * Creates a test NestJS application instance
 */
export async function createTestApp(): Promise<INestApplication> {
    const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
    })
        .overrideProvider('DATABASE_URL')
        .useValue(process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/voice_data_collection')
        .compile();

    const app = moduleRef.createNestApplication<NestFastifyApplication>(
        new FastifyAdapter(),
    );

    // Enable CORS (same as production)
    app.enableCors({
        origin: true,
        credentials: true,
    });

    // Set global prefix for API routes (same as production)
    app.setGlobalPrefix('api');

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    return app;
}

/**
 * Creates a test user and returns authentication token
 */
export async function createTestUser(
    app: INestApplication,
    userData = testUserData.valid,
): Promise<{ token: string; userId: string; user: any }> {
    // Ensure unique email and username for each test
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(7);
    const uniqueUserData = {
        ...userData,
        email: userData.email.includes('@') 
            ? `${userData.email.split('@')[0]}_${timestamp}_${randomSuffix}@${userData.email.split('@')[1]}`
            : `test_${timestamp}_${randomSuffix}@test.com`,
        username: `${userData.username}_${timestamp}_${randomSuffix}`,
    };

    const signupResponse = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(uniqueUserData);

    if (signupResponse.status !== 201) {
        console.error('Signup failed:', signupResponse.status, signupResponse.body);
        throw new Error(`Signup failed with status ${signupResponse.status}: ${JSON.stringify(signupResponse.body)}`);
    }

    return {
        token: signupResponse.body.token,
        userId: signupResponse.body.user.id,
        user: signupResponse.body.user,
    };
}

/**
 * Logs in an existing user and returns authentication token
 */
export async function loginTestUser(
    app: INestApplication,
    email: string,
    password: string,
): Promise<{ token: string; userId: string }> {
    const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password })
        .expect(200);

    return {
        token: loginResponse.body.token,
        userId: loginResponse.body.user.id,
    };
}

/**
 * Creates an authenticated request helper
 */
export async function createAuthenticatedRequest(
    app: INestApplication,
    userData = testUserData.valid,
): Promise<AuthenticatedRequest> {
    const { token, userId } = await createTestUser(app, userData);
    return { app, token, userId };
}

/**
 * Makes an authenticated GET request
 */
export function authenticatedGet(
    app: INestApplication,
    token: string,
    path: string,
): request.Test {
    return request(app.getHttpServer())
        .get(path)
        .set('Authorization', `Bearer ${token}`);
}

/**
 * Makes an authenticated POST request
 */
export function authenticatedPost(
    app: INestApplication,
    token: string,
    path: string,
): request.Test {
    return request(app.getHttpServer())
        .post(path)
        .set('Authorization', `Bearer ${token}`);
}

/**
 * Makes an authenticated PUT request
 */
export function authenticatedPut(
    app: INestApplication,
    token: string,
    path: string,
): request.Test {
    return request(app.getHttpServer())
        .put(path)
        .set('Authorization', `Bearer ${token}`);
}

/**
 * Makes an authenticated DELETE request
 */
export function authenticatedDelete(
    app: INestApplication,
    token: string,
    path: string,
): request.Test {
    return request(app.getHttpServer())
        .delete(path)
        .set('Authorization', `Bearer ${token}`);
}

