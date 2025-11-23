import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5566';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const languageCode = searchParams.get('languageCode');

        const backendUrl = languageCode
            ? `${BACKEND_URL}/ner-sentences?languageCode=${encodeURIComponent(languageCode)}`
            : `${BACKEND_URL}/ner-sentences`;

        console.log('Fetching NER sentences from:', backendUrl);

        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // Add timeout
            signal: AbortSignal.timeout(10000), // 10 seconds timeout
        });

        if (!response.ok) {
            console.error('Backend response not ok:', response.status, response.statusText);
            return NextResponse.json(
                { error: 'Failed to fetch sentences from backend' },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('Successfully fetched NER sentences:', data.length || 'unknown count');

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in NER sentences API route:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
