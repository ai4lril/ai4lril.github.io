import { NextRequest, NextResponse } from 'next/server';

// Use internal Docker service URL for server-side API routes
// NEXT_PUBLIC_API_URL is for client-side code (browser), so we use it directly
const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5566/api';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json();
        const { valid, comment } = body;
        const { id } = await params;

        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const response = await fetch(`${BACKEND_URL}/admin/questions/${id}/validate`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
            body: JSON.stringify({ valid, comment }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to validate question' }));
            return NextResponse.json(
                { error: error.message || 'Failed to validate question' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error validating question:', error);
        return NextResponse.json(
            { error: 'Failed to validate question' },
            { status: 500 }
        );
    }
}
