'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

interface Review {
    id: string;
    contributionId: string;
    sentence: string;
    contributorName: string;
    contributorEmail: string;
    reviewerName: string;
    reviewerEmail: string;
    reviewType: 'speech' | 'ner' | 'pos' | 'sentiment' | 'emotion';
    language?: string;
    script?: string;
    status: 'approved' | 'rejected' | 'pending';
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    comments?: string;
    audioDuration?: number;
    reviewedAt: Date;
    createdAt: Date;
}

interface ReviewStats {
    totalReviews: number;
    approved: number;
    rejected: number;
    pending: number;
    avgQuality: number;
    topReviewers: Array<{
        name: string;
        email: string;
        reviewCount: number;
    }>;
}

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);

    useEffect(() => {
        loadReviewsData();
    }, []);

    const loadReviewsData = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Mock reviews data
        const mockReviews: Review[] = [
            {
                id: '1',
                contributionId: 'c1',
                sentence: 'यह एक परीक्षण वाक्य है जिसमें उच्च गुणवत्ता की आवाज़ है।',
                contributorName: 'Rahul Sharma',
                contributorEmail: 'rahul@example.com',
                reviewerName: 'Priya Patel',
                reviewerEmail: 'priya@example.com',
                reviewType: 'speech',
                language: 'Hindi',
                script: 'Devanagari',
                status: 'approved',
                quality: 'excellent',
                comments: 'Clear pronunciation, good audio quality',
                audioDuration: 8.5,
                reviewedAt: new Date('2024-01-15T10:30:00'),
                createdAt: new Date('2024-01-14T14:20:00')
            },
            {
                id: '2',
                contributionId: 'c2',
                sentence: 'The quick brown fox jumps over the lazy dog.',
                contributorName: 'John Doe',
                contributorEmail: 'john@example.com',
                reviewerName: 'Alice Smith',
                reviewerEmail: 'alice@example.com',
                reviewType: 'ner',
                language: 'English',
                status: 'pending',
                quality: 'good',
                reviewedAt: new Date('2024-01-15T09:15:00'),
                createdAt: new Date('2024-01-13T16:45:00')
            },
            {
                id: '3',
                contributionId: 'c3',
                sentence: 'The restaurant served delicious food but the service was slow.',
                contributorName: 'Jane Smith',
                contributorEmail: 'jane@example.com',
                reviewerName: 'Bob Wilson',
                reviewerEmail: 'bob@example.com',
                reviewType: 'sentiment',
                language: 'English',
                status: 'rejected',
                quality: 'poor',
                comments: 'Audio quality is poor, background noise interference',
                audioDuration: 6.2,
                reviewedAt: new Date('2024-01-14T11:20:00'),
                createdAt: new Date('2024-01-12T13:10:00')
            },
            // Add more mock data...
        ];

        // Calculate stats
        const totalReviews = mockReviews.length;
        const approved = mockReviews.filter(r => r.status === 'approved').length;
        const rejected = mockReviews.filter(r => r.status === 'rejected').length;
        const pending = mockReviews.filter(r => r.status === 'pending').length;

        const qualityScores = { excellent: 5, good: 4, fair: 3, poor: 2 };
        const avgQuality = mockReviews.reduce((sum, r) => sum + qualityScores[r.quality], 0) / totalReviews;

        const reviewerCounts = mockReviews.reduce((acc, r) => {
            const key = r.reviewerEmail;
            acc[key] = acc[key] || { name: r.reviewerName, email: r.reviewerEmail, reviewCount: 0 };
            acc[key].reviewCount++;
            return acc;
        }, {} as Record<string, { name: string; email: string; reviewCount: number }>);

        const topReviewers = Object.values(reviewerCounts)
            .sort((a, b) => b.reviewCount - a.reviewCount)
            .slice(0, 5);

        setReviews(mockReviews);
        setStats({
            totalReviews,
            approved,
            rejected,
            pending,
            avgQuality,
            topReviewers
        });
        setLoading(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'text-green-600 bg-green-100';
            case 'rejected': return 'text-red-600 bg-red-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getQualityColor = (quality: string) => {
        switch (quality) {
            case 'excellent': return 'text-green-600 bg-green-100';
            case 'good': return 'text-blue-600 bg-blue-100';
            case 'fair': return 'text-yellow-600 bg-yellow-100';
            case 'poor': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'speech': return '🎤';
            case 'ner': return '🏷️';
            case 'pos': return '📝';
            case 'sentiment': return '😊';
            case 'emotion': return '🎭';
            default: return '📄';
        }
    };

    const filteredReviews = reviews.filter(review => {
        const matchesStatus = activeFilter === 'all' || review.status === activeFilter;
        const matchesSearch = review.sentence.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.contributorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.reviewerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (review.language && review.language.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold text-gray-900">Review Management</h1>
                        <div className="flex items-center space-x-4">
                            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                                Export Reviews
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="neu-raised overflow-hidden rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="shrink-0">
                                        <div className="text-2xl">📊</div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Total Reviews
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats?.totalReviews || 0}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="neu-raised overflow-hidden rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="shrink-0">
                                        <div className="text-2xl">✅</div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Approved
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats?.approved || 0}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="neu-raised overflow-hidden rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="shrink-0">
                                        <div className="text-2xl">⏳</div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Pending
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats?.pending || 0}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="neu-raised overflow-hidden rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="shrink-0">
                                        <div className="text-2xl">⭐</div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Avg Quality
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats?.avgQuality.toFixed(1) || 0}/5
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Reviewers */}
                    <div className="mt-8">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Top Reviewers</h2>
                        <div className="neu-raised overflow-hidden sm:rounded-md">
                            <div className="px-4 py-5 sm:p-6">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {stats?.topReviewers.map((reviewer, index) => (
                                        <div key={reviewer.email} className="flex items-center p-4 bg-gray-50 rounded-lg">
                                            <div className="shrink-0">
                                                <div className="h-10 w-10 bg-indigo-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-medium">
                                                        {reviewer.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {reviewer.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {reviewer.reviewCount} reviews
                                                </div>
                                            </div>
                                            <div className="ml-auto">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                    #{index + 1}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <label htmlFor="filter" className="text-sm font-medium text-gray-700">
                                        Filter by status:
                                    </label>
                                    <select
                                        id="filter"
                                        value={activeFilter}
                                        onChange={(e) => setActiveFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
                                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    >
                                        <option value="all">All Reviews</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search reviews..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reviews Table */}
                    <div className="mt-6">
                        <div className="neu-raised overflow-hidden sm:rounded-md">
                            <div className="overflow-x-auto">
                                <table className="min-w-full min-w-[600px] divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Sentence
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contributor
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Reviewer
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Quality
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Reviewed
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredReviews.map((review) => (
                                            <tr key={review.id} className="hover:bg-gray-50 cursor-pointer"
                                                onClick={() => setSelectedReview(review)}>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 max-w-xs truncate">
                                                        {review.sentence}
                                                    </div>
                                                    {review.audioDuration && (
                                                        <div className="text-xs text-gray-500">
                                                            {review.audioDuration.toFixed(1)}s
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {review.contributorName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {review.contributorEmail}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {review.reviewerName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {review.reviewerEmail}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {getTypeIcon(review.reviewType)} {review.reviewType.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(review.status)}`}>
                                                        {review.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getQualityColor(review.quality)}`}>
                                                        {review.quality}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {review.reviewedAt.toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Review Details Modal */}
                    {selectedReview && (
                        <div className="fixed inset-0 z-50 overflow-y-auto">
                            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                <div className="fixed inset-0 transition-opacity" onClick={() => setSelectedReview(null)}>
                                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                                </div>

                                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <div className="sm:flex sm:items-start">
                                            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                                    Review Details
                                                </h3>

                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Sentence</label>
                                                        <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
                                                            {selectedReview.sentence}
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">Contributor</label>
                                                            <p className="mt-1 text-sm font-medium text-gray-900">{selectedReview.contributorName}</p>
                                                            <p className="text-sm text-gray-500">{selectedReview.contributorEmail}</p>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">Reviewer</label>
                                                            <p className="mt-1 text-sm font-medium text-gray-900">{selectedReview.reviewerName}</p>
                                                            <p className="text-sm text-gray-500">{selectedReview.reviewerEmail}</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">Type</label>
                                                            <p className="mt-1 text-sm text-gray-900 flex items-center">
                                                                <span className="mr-2">{getTypeIcon(selectedReview.reviewType)}</span>
                                                                {selectedReview.reviewType.toUpperCase()}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">Status</label>
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getStatusColor(selectedReview.status)}`}>
                                                                {selectedReview.status}
                                                            </span>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">Quality</label>
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getQualityColor(selectedReview.quality)}`}>
                                                                {selectedReview.quality}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">Language</label>
                                                            <p className="mt-1 text-sm text-gray-900">{selectedReview.language || 'N/A'}</p>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">Audio Duration</label>
                                                            <p className="mt-1 text-sm text-gray-900">
                                                                {selectedReview.audioDuration ? `${selectedReview.audioDuration.toFixed(1)}s` : 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {selectedReview.comments && (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">Review Comments</label>
                                                            <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
                                                                {selectedReview.comments}
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">Created</label>
                                                            <p className="mt-1 text-sm text-gray-900">
                                                                {selectedReview.createdAt.toLocaleDateString()} at {selectedReview.createdAt.toLocaleTimeString()}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">Reviewed</label>
                                                            <p className="mt-1 text-sm text-gray-900">
                                                                {selectedReview.reviewedAt.toLocaleDateString()} at {selectedReview.reviewedAt.toLocaleTimeString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button
                                            type="button"
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                            onClick={() => setSelectedReview(null)}
                                        >
                                            Close
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
