'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            // Store token in localStorage
            localStorage.setItem('token', token);

            // Redirect to dashboard
            router.push('/speak');
        } else {
            // No token, redirect to login with error
            router.push('/login?error=oauth_failed');
        }
    }, [searchParams, router]);

    return null; // No render needed, just handling side effects
}

export default function AuthCallbackPage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Completing authentication...</p>
            </div>
            <Suspense fallback={null}>
                <CallbackHandler />
            </Suspense>
        </div>
    );
}
