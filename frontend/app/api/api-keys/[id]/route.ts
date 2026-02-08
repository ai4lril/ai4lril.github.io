import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5566/api';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const response = await fetch(`${BACKEND_URL}/auth/api-keys/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': authHeader,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to delete API key' }));
            return NextResponse.json(
                { error: error.message || 'Failed to delete API key' },
                { status: response.status }
            );
        }

        return NextResponse.json({ message: 'API key deleted successfully' });
    } catch (error) {
        console.error('Error deleting API key:', error);
        return NextResponse.json(
            { error: 'Failed to delete API key' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, expiresAt } = body;

        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const response = await fetch(`${BACKEND_URL}/auth/api-keys/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
            body: JSON.stringify({ name, expiresAt }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to update API key' }));
            return NextResponse.json(
                { error: error.message || 'Failed to update API key' },
                { status: response.status }
            );
        }

        return NextResponse.json({ message: 'API key updated successfully' });
    } catch (error) {
        console.error('Error updating API key:', error);
        return NextResponse.json(
            { error: 'Failed to update API key' },
            { status: 500 }
        );
    }
}
