'use client';

import { useState, useEffect, Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';

interface DataCollectionStats {
    byPincode: Array<{
        pincode: string;
        totalContributions: number;
        totalDuration: number; // in minutes
        uniqueUsers: number;
    }>;
    byGender: {
        male: { contributions: number; duration: number; users: number };
        female: { contributions: number; duration: number; users: number };
        other: { contributions: number; duration: number; users: number };
    };
    byAge: Array<{
        ageRange: string;
        contributions: number;
        duration: number;
        users: number;
    }>;
    byLanguage: Array<{
        language: string;
        contributions: number;
        duration: number;
        users: number;
    }>;
    byScript: Array<{
        script: string;
        contributions: number;
        duration: number;
        users: number;
    }>;
}

function DataCollectionContent() {
    const [stats, setStats] = useState<DataCollectionStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pincode' | 'gender' | 'age' | 'language' | 'script'>('pincode');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadDataCollectionStats();
    }, []);


    const loadDataCollectionStats = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock data
        const mockStats: DataCollectionStats = {
            byPincode: [
                { pincode: '110001', totalContributions: 234, totalDuration: 456, uniqueUsers: 89 },
                { pincode: '110002', totalContributions: 198, totalDuration: 387, uniqueUsers: 76 },
                { pincode: '110003', totalContributions: 167, totalDuration: 345, uniqueUsers: 65 },
                { pincode: '110004', totalContributions: 145, totalDuration: 298, uniqueUsers: 52 },
                { pincode: '400001', totalContributions: 201, totalDuration: 412, uniqueUsers: 78 },
                { pincode: '400002', totalContributions: 178, totalDuration: 367, uniqueUsers: 69 },
                { pincode: '560001', totalContributions: 156, totalDuration: 321, uniqueUsers: 58 },
                { pincode: '560002', totalContributions: 134, totalDuration: 276, uniqueUsers: 47 },
            ],
            byGender: {
                male: { contributions: 1234, duration: 2345, users: 456 },
                female: { contributions: 1189, duration: 2189, users: 423 },
                other: { contributions: 234, duration: 456, users: 89 }
            },
            byAge: [
                { ageRange: '18-25', contributions: 456, duration: 892, users: 123 },
                { ageRange: '26-35', contributions: 789, duration: 1456, users: 234 },
                { ageRange: '36-45', contributions: 623, duration: 1234, users: 189 },
                { ageRange: '46-55', contributions: 345, duration: 678, users: 145 },
                { ageRange: '56-65', contributions: 234, duration: 456, users: 98 },
                { ageRange: '65+', contributions: 123, duration: 245, users: 67 }
            ],
            byLanguage: [
                { language: 'Hindi', contributions: 2345, duration: 4567, users: 678 },
                { language: 'Bengali', contributions: 1987, duration: 3876, users: 543 },
                { language: 'Telugu', contributions: 1654, duration: 3245, users: 456 },
                { language: 'Marathi', contributions: 1432, duration: 2898, users: 398 },
                { language: 'Tamil', contributions: 1234, duration: 2456, users: 345 },
                { language: 'Gujarati', contributions: 987, duration: 1987, users: 234 },
                { language: 'Kannada', contributions: 876, duration: 1756, users: 198 },
                { language: 'Odia', contributions: 654, duration: 1324, users: 156 },
            ],
            byScript: [
                { script: 'Devanagari', contributions: 2345, duration: 4567, users: 678 },
                { script: 'Bengali', contributions: 1987, duration: 3876, users: 543 },
                { script: 'Telugu', contributions: 1654, duration: 3245, users: 456 },
                { script: 'Marathi', contributions: 1432, duration: 2898, users: 398 },
                { script: 'Tamil', contributions: 1234, duration: 2456, users: 345 },
                { script: 'Gujarati', contributions: 987, duration: 1987, users: 234 },
                { script: 'Kannada', contributions: 876, duration: 1756, users: 198 },
                { script: 'Odia', contributions: 654, duration: 1324, users: 156 },
            ]
        };

        setStats(mockStats);
        setLoading(false);
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const StatCard = ({ title, value, subtitle, icon }: {
        title: string;
        value: string | number;
        subtitle?: string;
        icon: string;
    }) => (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <div className="flex items-center">
                    <div className="shrink-0">
                        <div className="text-2xl">{icon}</div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                                {title}
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                                {value}
                            </dd>
                            {subtitle && (
                                <dd className="text-sm text-gray-600">
                                    {subtitle}
                                </dd>
                            )}
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );

    const filteredData = () => {
        if (!stats) return [];

        let data: Array<{
            pincode?: string;
            ageRange?: string;
            language?: string;
            script?: string;
            totalContributions?: number;
            contributions?: number;
            totalDuration?: number;
            duration?: number;
            uniqueUsers?: number;
            users?: number;
        }> = [];
        switch (activeTab) {
            case 'pincode':
                data = stats.byPincode.filter(item =>
                    item.pincode.toLowerCase().includes(searchTerm.toLowerCase())
                );
                break;
            case 'gender':
                data = Object.entries(stats.byGender).map(([gender, stats]) => ({
                    gender: gender.charAt(0).toUpperCase() + gender.slice(1),
                    ...stats
                }));
                break;
            case 'age':
                data = stats.byAge.filter(item =>
                    item.ageRange.toLowerCase().includes(searchTerm.toLowerCase())
                );
                break;
            case 'language':
                data = stats.byLanguage.filter(item =>
                    item.language.toLowerCase().includes(searchTerm.toLowerCase())
                );
                break;
            case 'script':
                data = stats.byScript.filter(item =>
                    item.script.toLowerCase().includes(searchTerm.toLowerCase())
                );
                break;
        }
        return data;
    };

    const renderTable = () => {
        const data = filteredData();

        if (activeTab === 'gender') {
            return (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Gender
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contributions
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Duration
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Users
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {data.map((item: any) => (
                                <tr key={item.gender}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {item.gender}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.contributions.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDuration(item.duration)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.users.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        const columns = {
            pincode: ['Pincode', 'Contributions', 'Duration', 'Users'],
            age: ['Age Range', 'Contributions', 'Duration', 'Users'],
            language: ['Language', 'Contributions', 'Duration', 'Users'],
            script: ['Script', 'Contributions', 'Duration', 'Users']
        };

        const currentColumns = columns[activeTab as keyof typeof columns] || columns.pincode;

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {currentColumns.map((column) => (
                                <th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {column}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {data.map((item: any, index: number) => (
                            <tr key={activeTab === 'pincode' ? item.pincode : activeTab === 'age' ? item.ageRange : item.language || item.script || index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {activeTab === 'pincode' ? item.pincode :
                                        activeTab === 'age' ? item.ageRange :
                                            activeTab === 'language' ? item.language :
                                                item.script}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {(item.contributions || item.totalContributions || 0).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDuration(item.totalDuration || item.duration || 0)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {(item.uniqueUsers || item.users || 0).toLocaleString()}
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
                        <h1 className="text-2xl font-semibold text-gray-900">Data Collection Metrics</h1>
                    </div>

                    {/* Overview Stats */}
                    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Total Speech Data"
                            value={formatDuration(8923)}
                            subtitle="All languages combined"
                            icon="🎤"
                        />
                        <StatCard
                            title="Active Contributors"
                            value="1,234"
                            subtitle="Unique users this month"
                            icon="👥"
                        />
                        <StatCard
                            title="Languages Covered"
                            value="23"
                            subtitle="Indian languages"
                            icon="🌍"
                        />
                        <StatCard
                            title="Data Quality Score"
                            value="94%"
                            subtitle="Average accuracy"
                            icon="✅"
                        />
                    </div>

                    {/* Tabs */}
                    <div className="mt-8">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                                {[
                                    { key: 'pincode', label: 'By Pincode' },
                                    { key: 'gender', label: 'By Gender' },
                                    { key: 'age', label: 'By Age' },
                                    { key: 'language', label: 'By Language' },
                                    { key: 'script', label: 'By Script' }
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => {
                                            setActiveTab(tab.key as 'pincode' | 'gender' | 'age' | 'language' | 'script');
                                            setSearchTerm('');
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
                    {activeTab !== 'gender' && (
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
                    )}

                    {/* Data Table */}
                    <div className="mt-6">
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            {renderTable()}
                        </div>
                    </div>

                    {/* Export Button */}
                    <div className="mt-6 flex justify-end">
                        <button
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <svg className="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Export Data
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function DataCollectionWrapper() {
    return (
        <Suspense fallback={
            <AdminLayout>
                <div className="flex items-center justify-center min-h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </AdminLayout>
        }>
            <DataCollectionContent />
        </Suspense>
    );
}

export default DataCollectionWrapper;
