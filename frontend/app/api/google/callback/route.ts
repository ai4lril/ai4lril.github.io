import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5566/api';
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:5577';

export async function GET(request: NextRequest) {
    try {
        // Get the full callback URL with query parameters
        const callbackUrl = new URL(request.url);
        const backendCallbackUrl = new URL(`${BACKEND_URL}/auth/google/callback`);

        // Copy query parameters to backend callback URL
        callbackUrl.searchParams.forEach((value, key) => {
            backendCallbackUrl.searchParams.set(key, value);
        });

        // Call backend callback endpoint
        const response = await fetch(backendCallbackUrl.toString(), {
            method: 'GET',
            headers: {
                'Cookie': request.headers.get('cookie') || '',
            },
        });

        if (!response.ok) {
            throw new Error('OAuth callback failed');
        }

        const data = await response.json();

        // Store token and redirect to dashboard
        if (data.token) {
            // Redirect to frontend with token in URL (will be handled by frontend)
            const redirectUrl = new URL(`${FRONTEND_URL}/auth/callback`);
            redirectUrl.searchParams.set('token', data.token);
            redirectUrl.searchParams.set('provider', 'google');

            return NextResponse.redirect(redirectUrl.toString());
        }

        throw new Error('No token received from OAuth callback');
    } catch (error) {
        console.error('OAuth callback error:', error);
        return NextResponse.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
    }
}
