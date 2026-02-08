import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5566/api';

export async function GET() {
    // Redirect to backend OAuth initiation
    const redirectUrl = `${BACKEND_URL}/auth/github`;
    return NextResponse.redirect(redirectUrl);
}
