import { NextRequest, NextResponse } from 'next/server';

// Use internal Docker service URL for server-side API routes
// NEXT_PUBLIC_API_URL is for client-side code (browser)
const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5566/api';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const page = searchParams.get('page') || '1';
        const limit = searchParams.get('limit') || '20';
        const status = searchParams.get('status') || '';
        const type = searchParams.get('type') || '';
        const language = searchParams.get('language') || '';

        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const url = new URL(`${BACKEND_URL}/admin/contributions`);
        url.searchParams.set('page', page);
        url.searchParams.set('limit', limit);
        if (status) url.searchParams.set('status', status);
        if (type) url.searchParams.set('type', type);
        if (language) url.searchParams.set('language', language);

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to fetch contributions' }));
            return NextResponse.json(
                { error: error.message || 'Failed to fetch contributions' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching contributions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch contributions' },
            { status: 500 }
        );
    }
}
