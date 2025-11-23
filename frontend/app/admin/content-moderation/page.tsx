'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    User,
    MessageSquare,
    Volume2,
    Play,
    Pause,
    AlertTriangle,
    ThumbsUp,
    ThumbsDown,
    Flag,
    RefreshCw
} from 'lucide-react';

interface Contribution {
    id: string;
    type: 'audio' | 'text' | 'annotation';
    userId: string;
    userName: string;
    userEmail: string;
    content: string;
    language: string;
    status: 'pending' | 'approved' | 'rejected' | 'flagged';
    createdAt: string;
    metadata: {
        duration?: number;
        wordCount?: number;
        quality?: number;
    };
}

export default function ContentModerationPage() {
    const [contributions, setContributions] = useState<Contribution[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedContributions, setSelectedContributions] = useState<string[]>([]);
    const [showReviewModal, setShowReviewModal] = useState<string | null>(null);
    const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
    const [playingAudio, setPlayingAudio] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [languageFilter, setLanguageFilter] = useState<string>('');
    const [totalPages, setTotalPages] = useState<number>(1);

    useEffect(() => {
        loadContributions();
    }, [currentPage, statusFilter, typeFilter, languageFilter]);

    const loadContributions = async () => {
        try {
            setLoading(true);

            // Build query parameters
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '20',
                status: statusFilter || '',
                type: typeFilter || '',
                language: languageFilter || ''
            });

            const response = await fetch(`/api/admin/contributions?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch contributions');
            }

            const data = await response.json();
            setContributions(data.contributions || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Failed to load contributions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (contributionId: string, action: 'approve' | 'reject') => {
        try {
            const endpoint = action === 'approve'
                ? `/api/admin/contributions/${contributionId}/approve`
                : `/api/admin/contributions/${contributionId}/reject`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json',
                },
                body: action === 'reject' ? JSON.stringify({ reason: 'Content review failed' }) : undefined,
            });

            if (!response.ok) {
                throw new Error(`Failed to ${action} contribution`);
            }

            // Update local state
            setContributions(prev => prev.map(contribution =>
                contribution.id === contributionId
                    ? { ...contribution, status: action === 'approve' ? 'approved' : 'rejected' }
                    : contribution
            ));
            setShowReviewModal(null);

            // Show success message
            alert(`Contribution ${action}d successfully!`);
        } catch (error) {
            console.error(`Error ${action}ing contribution:`, error);
            alert(`Failed to ${action} contribution. Please try again.`);
        }
    };

    const toggleAudioPlayback = (contributionId: string) => {
        setPlayingAudio(playingAudio === contributionId ? null : contributionId);
    };

    const getStatusColor = (status: string) => {
        const colors: { [key: string]: string } = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'approved': 'bg-green-100 text-green-800',
            'rejected': 'bg-red-100 text-red-800',
            'flagged': 'bg-orange-100 text-orange-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="mt-4 text-gray-600">Loading contributions...</p>
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
                            <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Review and manage user contributions
                            </p>
                        </div>
                        <button
                            onClick={loadContributions}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <Clock className="h-6 w-6 text-yellow-400" />
                                    <div className="ml-5">
                                        <dt className="text-sm font-medium text-gray-500">Pending</dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {contributions.filter(c => c.status === 'pending').length}
                                        </dd>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <CheckCircle className="h-6 w-6 text-green-400" />
                                    <div className="ml-5">
                                        <dt className="text-sm font-medium text-gray-500">Approved</dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {contributions.filter(c => c.status === 'approved').length}
                                        </dd>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <XCircle className="h-6 w-6 text-red-400" />
                                    <div className="ml-5">
                                        <dt className="text-sm font-medium text-gray-500">Rejected</dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {contributions.filter(c => c.status === 'rejected').length}
                                        </dd>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <AlertTriangle className="h-6 w-6 text-orange-400" />
                                    <div className="ml-5">
                                        <dt className="text-sm font-medium text-gray-500">Flagged</dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {contributions.filter(c => c.status === 'flagged').length}
                                        </dd>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contributions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {contributions.map((contribution) => (
                            <div key={contribution.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                {contribution.type === 'audio' ? (
                                                    <Volume2 className="h-5 w-5 text-blue-500" />
                                                ) : contribution.type === 'text' ? (
                                                    <FileText className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <MessageSquare className="h-5 w-5 text-purple-500" />
                                                )}
                                            </div>
                                            <div className="ml-3">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contribution.status)}`}>
                                                    {contribution.status}
                                                </span>
                                                <span className="ml-2 text-xs text-gray-500">
                                                    {contribution.language}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="mb-4">
                                        {contribution.type === 'audio' && (
                                            <div className="bg-gray-50 rounded-lg p-4 mb-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm text-gray-600">Audio Recording</span>
                                                    <span className="text-xs text-gray-500">{contribution.metadata.duration}s</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => toggleAudioPlayback(contribution.id)}
                                                        className="flex items-center justify-center w-8 h-8 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
                                                    >
                                                        {playingAudio === contribution.id ? (
                                                            <Pause className="h-4 w-4" />
                                                        ) : (
                                                            <Play className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <p className="text-sm text-gray-900 mb-3">
                                            {contribution.content}
                                        </p>

                                        <div className="text-xs text-gray-500">
                                            Quality: {contribution.metadata.quality}%
                                            {contribution.metadata.wordCount && ` • ${contribution.metadata.wordCount} words`}
                                        </div>
                                    </div>

                                    {/* User Info */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <User className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-600">{contribution.userName}</span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {new Date(contribution.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    {contribution.status === 'pending' && (
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => {
                                                    setShowReviewModal(contribution.id);
                                                    setReviewAction('approve');
                                                }}
                                                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                            >
                                                <ThumbsUp className="h-4 w-4 mr-2" />
                                                Approve
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setShowReviewModal(contribution.id);
                                                    setReviewAction('reject');
                                                }}
                                                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                            >
                                                <ThumbsDown className="h-4 w-4 mr-2" />
                                                Reject
                                            </button>
                                        </div>
                                    )}

                                    {contribution.status === 'flagged' && (
                                        <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                                            <div className="flex items-center">
                                                <Flag className="h-4 w-4 text-orange-400 mr-2" />
                                                <span className="text-sm text-orange-800">This content has been flagged for review</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Review Modal */}
                    {showReviewModal && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                                <div className="mt-3">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        {reviewAction === 'approve' ? 'Approve' : 'Reject'} Contribution
                                    </h3>

                                    <div className="flex items-center justify-end space-x-3">
                                        <button
                                            onClick={() => {
                                                setShowReviewModal(null);
                                                setReviewAction(null);
                                            }}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleReview(showReviewModal, reviewAction!)}
                                            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${reviewAction === 'approve'
                                                ? 'bg-green-600 hover:bg-green-700'
                                                : 'bg-red-600 hover:bg-red-700'
                                                }`}
                                        >
                                            {reviewAction === 'approve' ? 'Approve' : 'Reject'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
