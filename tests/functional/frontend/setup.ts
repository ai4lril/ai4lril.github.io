/**
 * Global test setup for frontend functional tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_API_URL = process.env.TEST_BACKEND_URL || 'http://localhost:5566/api';
process.env.NEXT_PUBLIC_FRONTEND_URL = process.env.TEST_FRONTEND_URL || 'http://localhost:5577';
process.env.BACKEND_INTERNAL_URL = process.env.TEST_BACKEND_INTERNAL_URL || 'http://backend:3001/api';

// Increase timeout for network requests
jest.setTimeout(30000);
