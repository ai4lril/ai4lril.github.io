/**
 * Global test setup for backend functional tests
 */

/// <reference types="jest" />

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'Ovc5Gigy1KBQiVsNr51tow1fTNojj8aQ2Fwv1JLn+uE=';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/voice_data_collection';
process.env.REDIS_URL = process.env.TEST_REDIS_URL || 'redis://localhost:6379';
process.env.CACHE_URL = process.env.TEST_CACHE_URL || 'redis://localhost:6379';

// Mock external services
process.env.MINIO_ENDPOINT = 'localhost';
process.env.MINIO_PORT = '9000';
process.env.MINIO_ACCESS_KEY = 'test';
process.env.MINIO_SECRET_KEY = 'test';
process.env.MINIO_BUCKET_NAME = 'test-bucket';
process.env.MINIO_USE_SSL = 'false';

// OAuth test credentials (dummy values for testing)
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
process.env.GOOGLE_CALLBACK_URL = 'http://localhost:5566/api/auth/google/callback';
process.env.GITHUB_CLIENT_ID = 'test-github-client-id';
process.env.GITHUB_CLIENT_SECRET = 'test-github-client-secret';
process.env.GITHUB_CALLBACK_URL = 'http://localhost:5566/api/auth/github/callback';
process.env.FRONTEND_URL = 'http://localhost:5577';

// Increase timeout for database operations
jest.setTimeout(60000);
