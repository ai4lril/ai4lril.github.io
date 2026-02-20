'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

interface Contribution {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    type: 'speech' | 'ner' | 'pos' | 'sentiment' | 'emotion';
    language?: string;
    script?: string;
    sentenceId?: string;
    sentence?: string;
    audioDuration?: number;
    createdAt: Date;
    reviewed: boolean;
    reviewerId?: string;
    reviewerName?: string;
    reviewCount: number;
    quality: 'pending' | 'approved' | 'rejected';
}

interface UserContributionStats {
    userId: string;
    userName: string;
    userEmail: string;
    totalContributions: number;
    speechContributions: number;
    nerContributions: number;
    posContributions: number;
    sentimentContributions: number;
    emotionContributions: number;
    totalDuration: number;
    lastActivity: Date;
    quality: number; // percentage
}

export default function ContributionsPage() {
    const [activeTab, setActiveTab] = useState<'users' | 'sentences' | 'languages' | 'scripts'>('users');
    const [searchTerm, setSearchTerm] = useState('');
    const [contributions, setContributions] = useState<Contribution[]>([]);
    const [userStats, setUserStats] = useState<UserContributionStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);

    useEffect(() => {
        loadContributionsData();
    }, []);

    const loadContributionsData = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Mock contributions data
        const mockContributions: Contribution[] = [
            {
                id: '1',
                userId: 'u1',
                userName: 'John Doe',
                userEmail: 'john@example.com',
                type: 'speech',
                language: 'Hindi',
                script: 'Devanagari',
                sentence: 'यह एक नमूना वाक्य है।',
                audioDuration: 5.2,
                createdAt: new Date('2024-01-15'),
                reviewed: true,
                reviewerId: 'r1',
                reviewerName: 'Alice Smith',
                reviewCount: 2,
                quality: 'approved'
            },
            {
                id: '2',
                userId: 'u2',
                userName: 'Jane Smith',
                userEmail: 'jane@example.com',
                type: 'ner',
                sentenceId: 's1',
                sentence: 'Barack Obama was the 44th President of the United States.',
                createdAt: new Date('2024-01-14'),
                reviewed: false,
                reviewCount: 0,
                quality: 'pending'
            },
            // Add more mock data...
        ];

        // Mock user stats
        const mockUserStats: UserContributionStats[] = [
            {
                userId: 'u1',
                userName: 'John Doe',
                userEmail: 'john@example.com',
                totalContributions: 156,
                speechContributions: 89,
                nerContributions: 23,
                posContributions: 34,
                sentimentContributions: 10,
                emotionContributions: 0,
                totalDuration: 445,
                lastActivity: new Date('2024-01-15'),
                quality: 94
            },
            {
                userId: 'u2',
                userName: 'Jane Smith',
                userEmail: 'jane@example.com',
                totalContributions: 123,
                speechContributions: 45,
                nerContributions: 34,
                posContributions: 23,
                sentimentContributions: 12,
                emotionContributions: 9,
                totalDuration: 234,
                lastActivity: new Date('2024-01-14'),
                quality: 87
            },
            // Add more mock data...
        ];

        setContributions(mockContributions);
        setUserStats(mockUserStats);
        setLoading(false);
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const getQualityColor = (quality: string) => {
        switch (quality) {
            case 'approved': return 'text-green-600 bg-green-100';
            case 'rejected': return 'text-red-600 bg-red-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
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

    const filteredData = (): (UserContributionStats | Contribution | { language?: string; script?: string; contributions: number; users: number; duration: number })[] => {
        if (activeTab === 'users') {
            return userStats.filter(user =>
                user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (activeTab === 'sentences') {
            return contributions.filter(contrib =>
                contrib.sentence?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contrib.userName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (activeTab === 'languages') {
            const languageStats = contributions.reduce((acc, contrib) => {
                if (contrib.language) {
                    if (!acc[contrib.language]) {
                        acc[contrib.language] = { language: contrib.language, contributions: 0, users: new Set(), duration: 0 };
                    }
                    acc[contrib.language].contributions++;
                    acc[contrib.language].users.add(contrib.userId);
                    if (contrib.audioDuration) {
                        acc[contrib.language].duration += contrib.audioDuration;
                    }
                }
                return acc;
            }, {} as Record<string, { language: string; contributions: number; users: Set<string>; duration: number }>);

            return Object.values(languageStats).map(stat => ({
                ...stat,
                users: stat.users.size
            })).filter(stat =>
                stat.language.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (activeTab === 'scripts') {
            const scriptStats = contributions.reduce((acc, contrib) => {
                if (contrib.script) {
                    if (!acc[contrib.script]) {
                        acc[contrib.script] = { script: contrib.script, contributions: 0, users: new Set(), duration: 0 };
                    }
                    acc[contrib.script].contributions++;
                    acc[contrib.script].users.add(contrib.userId);
                    if (contrib.audioDuration) {
                        acc[contrib.script].duration += contrib.audioDuration;
                    }
                }
                return acc;
            }, {} as Record<string, { script: string; contributions: number; users: Set<string>; duration: number }>);

            return Object.values(scriptStats).map(stat => ({
                ...stat,
                users: stat.users.size
            })).filter(stat =>
                stat.script.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return [];
    };

    const renderTable = () => {
        const data = filteredData();

        if (activeTab === 'users') {
            return (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Speech
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    NER
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    POS
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sentiment
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Emotion
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Duration
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quality
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Activity
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {data.map((user: any) => (
                                <tr key={user.userId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 bg-indigo-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-medium">
                                                    {user.userName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.userName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {user.userEmail}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        {user.totalContributions}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.speechContributions}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.nerContributions}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.posContributions}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.sentimentContributions}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.emotionContributions}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDuration(user.totalDuration)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.quality >= 90 ? 'bg-green-100 text-green-800' :
                                                user.quality >= 80 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {user.quality}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.lastActivity.toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        if (activeTab === 'sentences') {
            return (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sentence
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contributor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Language
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Reviews
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {data.map((contrib: any) => (
                                <tr key={contrib.id} className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => setSelectedContribution(contrib)}>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 max-w-xs truncate">
                                            {contrib.sentence}
                                        </div>
                                        {contrib.audioDuration && (
                                            <div className="text-xs text-gray-500">
                                                Duration: {contrib.audioDuration.toFixed(1)}s
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {contrib.userName}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {contrib.userEmail}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {getTypeIcon(contrib.type)} {contrib.type.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {contrib.language}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {contrib.reviewCount}
                                        {contrib.reviewerName && (
                                            <div className="text-xs text-gray-400">
                                                by {contrib.reviewerName}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getQualityColor(contrib.quality)}`}>
                                            {contrib.quality}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {contrib.createdAt.toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        // Languages and Scripts tables
        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {activeTab === 'languages' ? 'Language' : 'Script'}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contributions
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contributors
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Duration
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Avg per User
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {data.map((item: any) => (
                            <tr key={item.language || item.script} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {item.language || item.script}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.contributions.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.users}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDuration(Math.floor(item.duration / 60))}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {(item.contributions / item.users).toFixed(1)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };



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
                        <h1 className="text-2xl font-semibold text-gray-900">Contributions</h1>
                        <div className="flex items-center space-x-4">
                            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                                Export Report
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mt-8">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                                {[
                                    { key: 'users', label: 'By Users' },
                                    { key: 'sentences', label: 'By Sentences' },
                                    { key: 'languages', label: 'By Language' },
                                    { key: 'scripts', label: 'By Script' }
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => {
                                            setActiveTab(tab.key as 'users' | 'sentences' | 'languages' | 'scripts');
                                            setSearchTerm('');
                                            setSelectedContribution(null);
                                        }}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.key
                                                ? 'border-indigo-500 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mt-4">
                        <div className="flex items-center">
                            <div className="relative flex-1 max-w-xs">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder={`Search ${activeTab}...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="mt-6">
                        <div className="neu-raised overflow-hidden sm:rounded-md">
                            {renderTable()}
                        </div>
                    </div>

                    {/* Contribution Details Modal */}
                    {selectedContribution && (
                        <div className="fixed inset-0 z-50 overflow-y-auto">
                            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                <div className="fixed inset-0 transition-opacity" onClick={() => setSelectedContribution(null)}>
                                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                                </div>

                                <div className="inline-block align-bottom neu-raised rounded-xl text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                    <div className="neu-flat px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <div className="sm:flex sm:items-start">
                                            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                                    Contribution Details
                                                </h3>

                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Sentence</label>
                                                        <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
                                                            {selectedContribution.sentence}
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">Contributor</label>
                                                            <p className="mt-1 text-sm text-gray-900">{selectedContribution.userName}</p>
                                                            <p className="text-sm text-gray-500">{selectedContribution.userEmail}</p>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">Type</label>
                                                            <p className="mt-1 text-sm text-gray-900 flex items-center">
                                                                <span className="mr-2">{getTypeIcon(selectedContribution.type)}</span>
                                                                {selectedContribution.type.toUpperCase()}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">Language</label>
                                                            <p className="mt-1 text-sm text-gray-900">{selectedContribution.language}</p>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">Status</label>
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getQualityColor(selectedContribution.quality)}`}>
                                                                {selectedContribution.quality}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {selectedContribution.reviewed && selectedContribution.reviewerName && (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">Reviewed By</label>
                                                            <p className="mt-1 text-sm text-gray-900">{selectedContribution.reviewerName}</p>
                                                            <p className="text-sm text-gray-500">Review count: {selectedContribution.reviewCount}</p>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Created</label>
                                                        <p className="mt-1 text-sm text-gray-900">
                                                            {selectedContribution.createdAt.toLocaleDateString()} at {selectedContribution.createdAt.toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button
                                            type="button"
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                            onClick={() => setSelectedContribution(null)}
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
