'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { adminAuth } from '@/lib/adminAuth';

interface NavItem {
    name: string;
    href: string;
    icon: string;
    description: string;
    superAdminOnly?: boolean;
    adminOnly?: boolean;
    moderatorOnly?: boolean;
}

type UserRole = 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

const navigationItems: NavItem[] = [
    {
        name: 'Dashboard',
        href: '/admin/dashboard',
        icon: '📊',
        description: 'Overview and key metrics'
    },
    {
        name: 'Analytics',
        href: '/admin/analytics',
        icon: '📈',
        description: 'Visitor and user analytics'
    },
    {
        name: 'Users',
        href: '/admin/users',
        icon: '👥',
        description: 'User management and profiles'
    },
    {
        name: 'Content Moderation',
        href: '/admin/content-moderation',
        icon: '✅',
        description: 'Review sentences and questions'
    },
    {
        name: 'Contributions',
        href: '/admin/contributions',
        icon: '📝',
        description: 'Contribution tracking and reviews'
    },
    {
        name: 'Data Collection',
        href: '/admin/data-collection',
        icon: '🎙️',
        description: 'Speech data collection metrics'
    },
    {
        name: 'Language Data',
        href: '/admin/data-collection?tab=language',
        icon: '🌍',
        description: 'Language-wise data statistics'
    },
    {
        name: 'Reviews',
        href: '/admin/reviews',
        icon: '✅',
        description: 'Review management and quality'
    },
    {
        name: 'Admin Users',
        href: '/admin/admin-users',
        icon: '👑',
        description: 'Manage admin users',
        superAdminOnly: true
    },
    {
        name: 'Settings',
        href: '/admin/settings',
        icon: '⚙️',
        description: 'System configuration',
        superAdminOnly: true
    }
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5566/api';

interface UserProfile {
    role: UserRole;
    name?: string;
    display_name?: string;
    username?: string;
    email?: string;
}

export default function AdminNavbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        const fetchUserRole = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const response = await fetch(`${API_BASE_URL}/users/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const profileData = await response.json();
                    setUserRole(profileData.role || 'USER');
                    setUserProfile({
                        role: profileData.role || 'USER',
                        name: profileData.display_name || profileData.username || profileData.name,
                        email: profileData.email,
                    });
                }
            } catch (error) {
                console.error('Failed to fetch user role:', error);
            }
        };

        fetchUserRole();
    }, []);

    const isSuperAdmin = userRole === 'SUPER_ADMIN';
    const isAdmin = userRole === 'ADMIN' || isSuperAdmin;
    const isModerator = userRole === 'MODERATOR' || isAdmin;

    const visibleItems = navigationItems.filter(item => {
        if (item.superAdminOnly && !isSuperAdmin) return false;
        if (item.adminOnly && !isAdmin) return false;
        if (item.moderatorOnly && !isModerator) return false;
        return true;
    });

    const currentItem = visibleItems.find(item => item.href === pathname);

    return (
        <>
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-white p-2 rounded-md shadow-lg hover:shadow-xl transition-shadow"
                    aria-label="Toggle admin menu"
                >
                    <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile overlay */}
            {isOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
            )}

            {/* Navbar */}
            <div className={`
        fixed left-0 top-0 h-full bg-white shadow-xl z-40 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shadow-none
        w-80 lg:w-auto
      `}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">A</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
                                <p className="text-sm text-gray-500">
                                    {isSuperAdmin ? 'Super Admin' : 'Admin'} Dashboard
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Current page info */}
                    {currentItem && (
                        <div className="px-6 py-4 bg-indigo-50 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">{currentItem.icon}</span>
                                <div>
                                    <h3 className="font-medium text-gray-900">{currentItem.name}</h3>
                                    <p className="text-sm text-gray-600">{currentItem.description}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {visibleItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`
                    flex items-center px-4 py-3 rounded-lg transition-colors
                    ${isActive
                                            ? 'bg-indigo-100 text-indigo-700 border-r-4 border-indigo-700'
                                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                        }
                  `}
                                >
                                    <span className="text-xl mr-3">{item.icon}</span>
                                    <div className="flex-1">
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-xs text-gray-500 hidden lg:block">
                                            {item.description}
                                        </div>
                                    </div>
                                    {item.superAdminOnly && (
                                        <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                                            Super
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User info and logout */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                    {userProfile?.name?.charAt(0)?.toUpperCase() || adminAuth.getCurrentUser()?.name?.charAt(0)?.toUpperCase() || 'A'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {userProfile?.name || adminAuth.getCurrentUser()?.name || 'Admin User'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {userProfile?.email || adminAuth.getCurrentUser()?.email || ''}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                localStorage.removeItem('token');
                                adminAuth.logout();
                                window.location.href = '/admin/login';
                            }}
                            className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop spacer */}
            <div className="hidden lg:block w-80 shrink-0" />
        </>
    );
}
