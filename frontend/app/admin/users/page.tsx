'use client';

import { useEffect, useState } from 'react';
import { adminAuth } from '@/lib/adminAuth';
import AdminLayout from '@/components/AdminLayout';
import {
    Users,
    Search,
    Filter,
    MoreVertical,
    UserCheck,
    UserX,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Shield,
    Edit,
    Trash2,
    Eye,
    Download,
    RefreshCw,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';

interface User {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    first_language: string;
    second_language?: string;
    createdAt: string;
    updatedAt: string;
    contributionCount: number;
    isActive: boolean;
    isVerified: boolean;
}

interface UserStats {
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    topLanguages: Array<{ language: string; count: number }>;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [languageFilter, setLanguageFilter] = useState('all');
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'contributions'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [showUserDetails, setShowUserDetails] = useState<string | null>(null);
    const [stats, setStats] = useState<UserStats>({
        totalUsers: 0,
        activeUsers: 0,
        verifiedUsers: 0,
        newUsersToday: 0,
        newUsersThisWeek: 0,
        topLanguages: []
    });
    const [totalPages, setTotalPages] = useState<number>(1);

    useEffect(() => {
        loadUsers();
        loadStats();
    }, []);

    useEffect(() => {
        loadUsers();
    }, [currentPage, searchTerm, statusFilter]);

    useEffect(() => {
        filterAndSortUsers();
    }, [users, languageFilter, sortBy, sortOrder]);

    const loadUsers = async () => {
        try {
            setLoading(true);

            // Build query parameters
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '20',
                search: searchTerm || '',
                status: statusFilter || '',
            });

            const response = await fetch(`/api/admin/users?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data.users || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const mockStats: UserStats = {
                totalUsers: 1247,
                activeUsers: 892,
                verifiedUsers: 756,
                newUsersToday: 12,
                newUsersThisWeek: 89,
                topLanguages: [
                    { language: 'Hindi', count: 345 },
                    { language: 'Bengali', count: 234 },
                    { language: 'Telugu', count: 198 },
                    { language: 'Tamil', count: 156 },
                    { language: 'Gujarati', count: 134 }
                ]
            };
            setStats(mockStats);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const filterAndSortUsers = () => {
        let filtered = users.filter(user => {
            const matchesSearch = searchTerm === '' ||
                user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.username.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'active' && user.isActive) ||
                (statusFilter === 'inactive' && !user.isActive);

            const matchesLanguage = languageFilter === 'all' ||
                user.first_language === languageFilter ||
                user.second_language === languageFilter;

            return matchesSearch && matchesStatus && matchesLanguage;
        });

        // Sort users
        filtered.sort((a, b) => {
            let aValue: any, bValue: any;

            switch (sortBy) {
                case 'name':
                    aValue = `${a.first_name} ${a.last_name}`.toLowerCase();
                    bValue = `${b.first_name} ${b.last_name}`.toLowerCase();
                    break;
                case 'date':
                    aValue = new Date(a.createdAt).getTime();
                    bValue = new Date(b.createdAt).getTime();
                    break;
                case 'contributions':
                    aValue = a.contributionCount;
                    bValue = b.contributionCount;
                    break;
                default:
                    return 0;
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setFilteredUsers(filtered);
        setCurrentPage(1);
    };

    const toggleUserSelection = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const toggleSelectAll = () => {
        setSelectedUsers(
            selectedUsers.length === filteredUsers.length
                ? []
                : filteredUsers.map(user => user.id)
        );
    };

    const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
        if (selectedUsers.length === 0) return;

        try {
            // In a real app, this would be an API call
            console.log(`${action} users:`, selectedUsers);

            // Update local state
            setUsers(prev => prev.map(user =>
                selectedUsers.includes(user.id)
                    ? {
                        ...user,
                        isActive: action === 'activate' ? true : action === 'deactivate' ? false : user.isActive
                    }
                    : user
            ));

            setSelectedUsers([]);
        } catch (error) {
            console.error(`Failed to ${action} users:`, error);
        }
    };

    const exportUsers = () => {
        const csvContent = [
            ['Name', 'Email', 'Language', 'Contributions', 'Status', 'Joined'],
            ...filteredUsers.map(user => [
                `${user.first_name} ${user.last_name}`,
                user.email,
                user.first_language,
                user.contributionCount.toString(),
                user.isActive ? 'Active' : 'Inactive',
                new Date(user.createdAt).toLocaleDateString()
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Pagination
    const startIndex = (currentPage - 1) * usersPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

    const getLanguageColor = (language: string) => {
        const colors: { [key: string]: string } = {
            'Hindi': 'bg-orange-100 text-orange-800',
            'Bengali': 'bg-green-100 text-green-800',
            'Telugu': 'bg-blue-100 text-blue-800',
            'Tamil': 'bg-purple-100 text-purple-800',
            'Gujarati': 'bg-pink-100 text-pink-800',
            'Punjabi': 'bg-indigo-100 text-indigo-800',
            'English': 'bg-gray-100 text-gray-800'
        };
        return colors[language] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="mt-4 text-gray-600">Loading users...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Manage user accounts and monitor user activity
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={loadUsers}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                            </button>
                            <button
                                onClick={exportUsers}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Users className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Total Users
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats.totalUsers.toLocaleString()}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <UserCheck className="h-6 w-6 text-green-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Active Users
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats.activeUsers.toLocaleString()}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Shield className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Verified Users
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats.verifiedUsers.toLocaleString()}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Calendar className="h-6 w-6 text-purple-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                New This Week
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats.newUsersThisWeek}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {/* Search */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                {/* Status Filter */}
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as any)}
                                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>

                                {/* Language Filter */}
                                <select
                                    value={languageFilter}
                                    onChange={(e) => setLanguageFilter(e.target.value)}
                                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="all">All Languages</option>
                                    {stats.topLanguages.map(lang => (
                                        <option key={lang.language} value={lang.language}>
                                            {lang.language}
                                        </option>
                                    ))}
                                </select>

                                {/* Sort */}
                                <select
                                    value={`${sortBy}_${sortOrder}`}
                                    onChange={(e) => {
                                        const [sort, order] = e.target.value.split('_');
                                        setSortBy(sort as any);
                                        setSortOrder(order as any);
                                    }}
                                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="date_desc">Newest First</option>
                                    <option value="date_asc">Oldest First</option>
                                    <option value="name_asc">Name A-Z</option>
                                    <option value="name_desc">Name Z-A</option>
                                    <option value="contributions_desc">Most Contributions</option>
                                    <option value="contributions_asc">Least Contributions</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedUsers.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                                    <span className="text-sm text-yellow-800">
                                        {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                                    </span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => handleBulkAction('activate')}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        <UserCheck className="h-4 w-4 mr-2" />
                                        Activate
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('deactivate')}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                    >
                                        <UserX className="h-4 w-4 mr-2" />
                                        Deactivate
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('delete')}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Users Table */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <div className="px-4 py-3 border-b border-gray-200 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                        onChange={toggleSelectAll}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-3 text-sm text-gray-700">
                                        {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <ul className="divide-y divide-gray-200">
                            {paginatedUsers.map((user) => (
                                <li key={user.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={() => toggleUserSelection(user.id)}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-4"
                                            />

                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {user.first_name[0]}{user.last_name[0]}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="ml-4">
                                                <div className="flex items-center">
                                                    <h4 className="text-sm font-medium text-gray-900">
                                                        {user.first_name} {user.last_name}
                                                    </h4>
                                                    {user.isVerified && (
                                                        <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                                                    )}
                                                    {!user.isActive && (
                                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    @{user.username} • {user.contributionCount} contributions
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getLanguageColor(user.first_language)}`}>
                                                    {user.first_language}
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    Joined {new Date(user.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => setShowUserDetails(user.id)}
                                                    className="p-1 text-gray-400 hover:text-gray-600"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <div className="relative">
                                                    <button className="p-1 text-gray-400 hover:text-gray-600">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 mt-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing {startIndex + 1} to {Math.min(startIndex + usersPerPage, filteredUsers.length)} of {filteredUsers.length} results
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>

                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium ${currentPage === pageNum
                                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                                                    : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}