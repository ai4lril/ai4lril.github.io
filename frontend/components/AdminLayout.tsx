'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminNavbar from './AdminNavbar';
import { realtimeClient } from '@/lib/realtime';

interface AdminUser {
  id: string;
  email: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';
  display_name?: string;
  username?: string;
  name?: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5566/api';

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const adminToken = localStorage.getItem('adminToken');
      const adminUserStr = localStorage.getItem('adminUser');

      // Support admin login (adminToken) or user with admin role (token)
      if (adminToken && adminUserStr) {
        try {
          const adminUser = JSON.parse(adminUserStr);
          setUser({
            id: adminUser.id,
            email: adminUser.email,
            role: adminUser.role === 'super_admin' ? 'SUPER_ADMIN' : 'ADMIN',
            name: adminUser.name,
          });
          setLoading(false);
          return;
        } catch {
          // Fall through to token check
        }
      }

      if (!token) {
        router.push('/admin/login');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          router.push('/admin/login');
          return;
        }

        const profileData = await response.json();
        const role = profileData.role || 'USER';
        if (!['MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
          router.push('/');
          return;
        }

        setUser({
          id: profileData.id,
          email: profileData.email,
          role: role,
          display_name: profileData.display_name,
          username: profileData.username,
        });
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        router.push('/admin/login');
        return;
      }

      const interval = setInterval(async () => {
        const currentToken = localStorage.getItem('token');
        const currentAdminToken = localStorage.getItem('adminToken');
        if (!currentToken && !currentAdminToken) {
          router.push('/admin/login');
          return;
        }
        if (currentToken) {
          try {
            const response = await fetch(`${API_BASE_URL}/users/profile`, {
              headers: { 'Authorization': `Bearer ${currentToken}` },
            });
            if (!response.ok) router.push('/admin/login');
          } catch {
            router.push('/admin/login');
          }
        }
      }, 30000);
      return () => clearInterval(interval);
    };

    checkAuth();
  }, [router]);

  // Real-time: connect with admin token, subscribe to admin:content, and dispatch updates
  useEffect(() => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (!token || !user) return;

    realtimeClient.connect(token);
    realtimeClient.subscribe(['admin:content']);

    const onUpdate = (data: unknown) => {
      window.dispatchEvent(new CustomEvent('admin:data-updated', { detail: data }));
    };
    const onStats = (data: unknown) => {
      window.dispatchEvent(new CustomEvent('admin:stats-updated', { detail: data }));
    };

    realtimeClient.on('update', onUpdate);
    realtimeClient.on('admin:stats', onStats);

    return () => {
      realtimeClient.off('update', onUpdate);
      realtimeClient.off('admin:stats', onStats);
      realtimeClient.disconnect();
    };
  }, [user]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }



  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Admin Navbar */}
      <AdminNavbar />

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome back, {user.display_name || user.username || user.name || user.email}!
              </div>
              <div className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                {user.role}
              </div>
              <div className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                Session Active
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
