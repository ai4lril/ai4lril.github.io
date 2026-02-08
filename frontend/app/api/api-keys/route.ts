import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5566/api';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const response = await fetch(`${BACKEND_URL}/auth/api-keys`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to fetch API keys' }));
            return NextResponse.json(
                { error: error.message || 'Failed to fetch API keys' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching API keys:', error);
        return NextResponse.json(
            { error: 'Failed to fetch API keys' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, expiresAt } = body;

        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const response = await fetch(`${BACKEND_URL}/auth/api-keys`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
            body: JSON.stringify({ name, expiresAt }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to create API key' }));
            return NextResponse.json(
                { error: error.message || 'Failed to create API key' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating API key:', error);
        return NextResponse.json(
            { error: 'Failed to create API key' },
            { status: 500 }
        );
    }
}
