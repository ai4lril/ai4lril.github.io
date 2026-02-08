/**
 * Shared test setup utilities
 */

export interface TestUser {
    id: string;
    email: string;
    password: string;
    token: string;
}

export interface TestConfig {
    backendUrl: string;
    frontendUrl: string;
    testDatabaseUrl: string;
}

export const getTestConfig = (): TestConfig => {
    return {
        backendUrl: process.env.TEST_BACKEND_URL || 'http://localhost:5566/api',
        frontendUrl: process.env.TEST_FRONTEND_URL || 'http://localhost:5577',
        testDatabaseUrl: process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/voice_data_test',
    };
};

export const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const generateRandomEmail = (): string => {
    return `test_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`;
};

export const generateRandomString = (length: number = 10): string => {
    return Math.random().toString(36).substring(2, length + 2);
};

