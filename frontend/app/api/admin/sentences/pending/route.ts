import { NextRequest, NextResponse } from 'next/server';

// Use internal Docker service URL for server-side API routes
// NEXT_PUBLIC_API_URL is for client-side code (browser), so we use it directly
const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5566/api';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const page = searchParams.get('page') || '1';
        const limit = searchParams.get('limit') || '20';

        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const url = new URL(`${BACKEND_URL}/admin/sentences/pending`);
        url.searchParams.set('page', page);
        url.searchParams.set('limit', limit);

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to fetch pending sentences' }));
            return NextResponse.json(
                { error: error.message || 'Failed to fetch pending sentences' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching pending sentences:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pending sentences' },
            { status: 500 }
        );
    }
}
