import { NextRequest, NextResponse } from 'next/server';

// Use internal Docker service URL for server-side API routes
// NEXT_PUBLIC_API_URL is for client-side code (browser), so we use it directly
const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5566/api';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sentences, languageCode, citation } = body;

        const authHeader = request.headers.get('authorization');
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        const response = await fetch(`${BACKEND_URL}/write/submission`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                sentences,
                languageCode,
                citation,
            }),
        });

        if (!response.ok) {
            let errorMessage = 'Failed to submit sentences';
            try {
                const error = await response.json();
                errorMessage = error.message || error.error || JSON.stringify(error);
                console.error('Backend error response:', error);
            } catch {
                const text = await response.text().catch(() => '');
                errorMessage = text || `HTTP ${response.status}: ${response.statusText}`;
                console.error('Backend error (non-JSON):', text);
            }
            return NextResponse.json(
                { error: errorMessage },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error submitting sentences:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to submit sentences';
        return NextResponse.json(
            { error: `Network error: ${errorMessage}` },
            { status: 500 }
        );
    }
}
