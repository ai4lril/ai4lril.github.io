/**
 * API Configuration
 * Centralized API base URL configuration for documentation and examples
 */

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:5566/api'
        : 'https://api.ilhrf.org/api');

export const API_BASE_URL_DISPLAY =
    typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:5566/api'
        : 'https://api.ilhrf.org/api';

export const API_EXAMPLES_BASE_URL = 'https://api.ilhrf.org/api';

/**
 * Get the API base URL for code examples
 * Uses production URL in examples, but documents environment variables
 */
export function getExampleBaseUrl(): string {
    return API_EXAMPLES_BASE_URL;
}

/**
 * Get environment-specific API URL note
 */
export function getApiUrlNote(): string {
    return `Replace \${API_BASE_URL} with your API base URL:
- Production: https://api.ilhrf.org/api
- Development: http://localhost:5566/api`;
}
