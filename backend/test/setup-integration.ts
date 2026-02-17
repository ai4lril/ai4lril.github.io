/**
 * Setup for integration tests.
 * Mocks sanitize module to avoid loading jsdom and its ESM dependencies (@exodus/bytes)
 * which cause "Unexpected token 'export'" in Jest.
 */
jest.mock('../src/common/utils/sanitize', () => ({
  sanitizeInput: (input: string) => (input && typeof input === 'string' ? input : ''),
  sanitizeForDisplay: (input: string) => (input && typeof input === 'string' ? input : ''),
}));
