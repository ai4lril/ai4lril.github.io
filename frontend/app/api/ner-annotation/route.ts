import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5566';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sentenceId, annotations, languageCode, userId } = body;

        console.log('Saving NER annotation for sentence:', sentenceId, 'with', annotations?.length || 0, 'annotations');

        const backendUrl = `${BACKEND_URL}/ner-annotation`;

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sentenceId,
                annotations,
                languageCode,
                userId,
            }),
            // Add timeout
            signal: AbortSignal.timeout(15000), // 15 seconds timeout for POST requests
        });

        if (!response.ok) {
            console.error('Backend response not ok:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Backend error details:', errorText);

            return NextResponse.json(
                {
                    error: 'Failed to save NER annotation',
                    details: errorText || response.statusText
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('Successfully saved NER annotation:', data);

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in NER annotation API route:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
