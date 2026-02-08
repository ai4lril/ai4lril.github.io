/**
 * Helper utilities for frontend API route tests
 */

import fetch from 'node-fetch';

export interface FrontendTestConfig {
    baseUrl: string;
    backendUrl: string;
}

export const getFrontendConfig = (): FrontendTestConfig => {
    return {
        baseUrl: process.env.TEST_FRONTEND_URL || 'http://localhost:5577',
        backendUrl: process.env.TEST_BACKEND_URL || 'http://localhost:5566/api',
    };
};

/**
 * Makes a request to a frontend API route
 */
export async function frontendApiRequest(
    path: string,
    options: {
        method?: string;
        body?: any;
        headers?: Record<string, string>;
        token?: string;
    } = {},
): Promise<{ status: number; data: any; headers: any }> {
    const config = getFrontendConfig();
    const url = `${config.baseUrl}${path}`;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (options.token) {
        headers['Authorization'] = `Bearer ${options.token}`;
    }

    const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await response.json().catch(() => ({}));

    return {
        status: response.status,
        data,
        headers: Object.fromEntries(response.headers.entries()),
    };
}

/**
 * Creates a test user via frontend signup API
 */
export async function createUserViaFrontend(userData: {
    email: string;
    password: string;
    name: string;
}): Promise<{ token: string; user: any }> {
    const response = await frontendApiRequest('/api/auth/signup', {
        method: 'POST',
        body: {
            email: userData.email,
            password: userData.password,
            first_name: userData.name.split(' ')[0],
            last_name: userData.name.split(' ').slice(1).join(' ') || '',
            display_name: userData.name,
            username: userData.email.split('@')[0],
            phone_number: '',
            current_residence_pincode: '',
            birth_place_pincode: '',
            birth_date: new Date().toISOString().split('T')[0],
            gender: 'prefer-not-to-say',
            first_language: 'en',
        },
    });

    if (response.status !== 200 && response.status !== 201) {
        throw new Error(`Failed to create user: ${JSON.stringify(response.data)}`);
    }

    return {
        token: response.data.token,
        user: response.data.user,
    };
}

/**
 * Logs in via frontend login API
 */
export async function loginViaFrontend(email: string, password: string): Promise<{ token: string }> {
    const response = await frontendApiRequest('/api/auth/login', {
        method: 'POST',
        body: { email, password },
    });

    if (response.status !== 200) {
        throw new Error(`Failed to login: ${JSON.stringify(response.data)}`);
    }

    return {
        token: response.data.token,
    };
}

