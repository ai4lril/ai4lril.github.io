/**
 * E2E test setup - sets up environment variables for tests
 */

// Mock sanitize module to avoid loading jsdom and its ESM dependencies
jest.mock('../src/common/utils/sanitize', () => ({
  sanitizeInput: (input: string) => (input && typeof input === 'string' ? input : ''),
  sanitizeForDisplay: (input: string) => (input && typeof input === 'string' ? input : ''),
}));

// Set test environment variables
process.env.NODE_ENV = 'test';

// OAuth test credentials (dummy values for testing)
process.env.GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID || 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET || 'test-google-client-secret';
process.env.GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL ||
  'http://localhost:5566/api/auth/google/callback';
process.env.GITHUB_CLIENT_ID =
  process.env.GITHUB_CLIENT_ID || 'test-github-client-id';
process.env.GITHUB_CLIENT_SECRET =
  process.env.GITHUB_CLIENT_SECRET || 'test-github-client-secret';
process.env.GITHUB_CALLBACK_URL =
  process.env.GITHUB_CALLBACK_URL ||
  'http://localhost:5566/api/auth/github/callback';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5577';

// Database (use test database if specified, otherwise use default)
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/voice_data_test';

// JWT Secret
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key';

// SeaweedFS S3 (test configuration)
process.env.SEAWEEDFS_S3_HOST =
  process.env.SEAWEEDFS_S3_HOST || process.env.MINIO_ENDPOINT || 'localhost';
process.env.SEAWEEDFS_S3_PORT =
  process.env.SEAWEEDFS_S3_PORT || process.env.MINIO_PORT || '8333';
process.env.SEAWEEDFS_ACCESS_KEY =
  process.env.SEAWEEDFS_ACCESS_KEY || process.env.MINIO_ACCESS_KEY || 's3admin';
process.env.SEAWEEDFS_SECRET_KEY =
  process.env.SEAWEEDFS_SECRET_KEY || process.env.MINIO_SECRET_KEY || 's3secret';
process.env.SEAWEEDFS_BUCKET =
  process.env.SEAWEEDFS_BUCKET || process.env.MINIO_BUCKET_NAME || 'voice-audio';
process.env.SEAWEEDFS_USE_SSL =
  process.env.SEAWEEDFS_USE_SSL || process.env.MINIO_USE_SSL || 'false';

// Cache/Redis
process.env.REDIS_URL =
  process.env.TEST_REDIS_URL ||
  process.env.REDIS_URL ||
  'redis://localhost:6379';
process.env.CACHE_URL =
  process.env.TEST_CACHE_URL ||
  process.env.CACHE_URL ||
  'redis://localhost:6379';
