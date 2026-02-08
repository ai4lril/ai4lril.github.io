import { NextRequest, NextResponse } from 'next/server';

// Use internal Docker service URL for server-side API routes
// NEXT_PUBLIC_API_URL is for client-side code (browser), so we use it directly
const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5566/api';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const response = await fetch(`${BACKEND_URL}/admin/users/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to delete admin user' }));
            return NextResponse.json(
                { error: error.message || 'Failed to delete admin user' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error deleting admin user:', error);
        return NextResponse.json(
            { error: 'Failed to delete admin user' },
            { status: 500 }
        );
    }
}
