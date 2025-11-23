'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminAuth } from '@/lib/adminAuth';

export default function AdminPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!adminAuth.isAuthenticated()) {
            router.push('/admin/login');
            return;
        }

        // Redirect to dashboard if authenticated
        router.push('/admin/dashboard');
    }, [router]);

    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading admin panel...</p>
            </div>
        </div>
    );
}
