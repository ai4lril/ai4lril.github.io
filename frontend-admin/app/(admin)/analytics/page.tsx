'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';

type TimePeriod = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

interface AnalyticsData {
    visitors: {
        total: number;
        change: number;
        trend: number[];
    };
    users: {
        total: number;
        newUsers: number;
        activeUsers: number;
        change: number;
        trend: number[];
    };
    contributions: {
        total: number;
        byType: {
            speech: number;
            ner: number;
            pos: number;
            sentiment: number;
            emotion: number;
        };
        trend: number[];
    };
}

export default function AdminAnalytics() {
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
    const [customDateRange, setCustomDateRange] = useState({
        start: '',
        end: ''
    });
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    const loadAnalyticsData = useCallback(async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data - in real app, this would come from API
        const mockData: AnalyticsData = {
            visitors: {
                total: timePeriod === 'day' ? 234 : timePeriod === 'week' ? 1456 : timePeriod === 'month' ? 5678 : 23456,
                change: 12.5,
                trend: [120, 145, 167, 189, 201, 234, 256]
            },
            users: {
                total: timePeriod === 'day' ? 45 : timePeriod === 'week' ? 234 : timePeriod === 'month' ? 892 : 3241,
                newUsers: timePeriod === 'day' ? 12 : timePeriod === 'week' ? 45 : timePeriod === 'month' ? 156 : 623,
                activeUsers: timePeriod === 'day' ? 89 : timePeriod === 'week' ? 345 : timePeriod === 'month' ? 1234 : 2156,
                change: 8.3,
                trend: [45, 52, 61, 58, 67, 72, 89]
            },
            contributions: {
                total: timePeriod === 'day' ? 89 : timePeriod === 'week' ? 456 : timePeriod === 'month' ? 1789 : 8923,
                byType: {
                    speech: 2345,
                    ner: 1234,
                    pos: 1456,
                    sentiment: 1890,
                    emotion: 1998
                },
                trend: [67, 78, 89, 95, 102, 115, 123]
            }
        };

        setData(mockData);
        setLoading(false);
    }, [timePeriod]);

    useEffect(() => {
        loadAnalyticsData();
    }, [timePeriod, customDateRange.start, customDateRange.end, loadAnalyticsData]);

    const MetricCard = ({ title, value, change, subtitle, icon }: {
        title: string;
        value: string | number;
        change?: number;
        subtitle?: string;
        icon: string;
    }) => (
        <div className="neu-raised overflow-hidden rounded-lg">
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
                            <dd className="flex items-baseline">
                                <div className="text-2xl font-semibold text-gray-900">
                                    {typeof value === 'number' ? value.toLocaleString() : value}
                                </div>
                                {change !== undefined && (
                                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        <svg className={`self-center shrink-0 h-4 w-4 ${change >= 0 ? 'text-green-500' : 'text-red-500'
                                            }`} fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d={
                                                change >= 0
                                                    ? "M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                                    : "M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                                            } clipRule="evenodd" />
                                        </svg>
                                        <span className="sr-only">
                                            {change >= 0 ? 'Increased' : 'Decreased'} by
                                        </span>
                                        {Math.abs(change)}%
                                    </div>
                                )}
                            </dd>
                            {subtitle && (
                                <dd className="text-sm text-gray-600 mt-1">
                                    {subtitle}
                                </dd>
                            )}
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );

    const SimpleChart = ({ data, label }: { data: number[]; label: string }) => (
        <div className="neu-raised p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">{label}</h3>
            <div className="flex items-end space-x-2 h-32">
                {data.map((value, index) => (
                    <div
                        key={index}
                        className="bg-indigo-600 rounded-t flex-1"
                        style={{ height: `${(value / Math.max(...data)) * 100}%` }}
                        title={`Day ${index + 1}: ${value}`}
                    ></div>
                ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
                {data.map((_, index) => (
                    <span key={index}>{index + 1}</span>
                ))}
            </div>
        </div>
    );

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
                        <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>

                        {/* Time Period Selector */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <label htmlFor="timePeriod" className="text-sm font-medium text-gray-700">
                                    Time Period:
                                </label>
                                <select
                                    id="timePeriod"
                                    value={timePeriod}
                                    onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                >
                                    <option value="day">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                    <option value="quarter">This Quarter</option>
                                    <option value="year">This Year</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                            </div>

                            {timePeriod === 'custom' && (
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="date"
                                        value={customDateRange.start}
                                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    />
                                    <span className="text-gray-500">to</span>
                                    <input
                                        type="date"
                                        value={customDateRange.end}
                                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <MetricCard
                            title="Total Visitors"
                            value={data?.visitors.total || 0}
                            change={data?.visitors.change}
                            icon="👥"
                        />
                        <MetricCard
                            title="Total Users"
                            value={data?.users.total || 0}
                            change={data?.users.change}
                            subtitle={`${data?.users.newUsers || 0} new this period`}
                            icon="👤"
                        />
                        <MetricCard
                            title="Active Users"
                            value={data?.users.activeUsers || 0}
                            subtitle="Currently online"
                            icon="🔵"
                        />
                        <MetricCard
                            title="Total Contributions"
                            value={data?.contributions.total || 0}
                            icon="📝"
                        />
                    </div>

                    {/* Charts */}
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <SimpleChart
                            data={data?.visitors.trend || []}
                            label={`Visitor Trend (${timePeriod})`}
                        />
                        <SimpleChart
                            data={data?.users.trend || []}
                            label={`User Growth (${timePeriod})`}
                        />
                    </div>

                    {/* Contribution Breakdown */}
                    <div className="mt-8">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Contribution Breakdown</h2>
                        <div className="neu-raised overflow-hidden sm:rounded-md">
                            <div className="px-4 py-5 sm:p-6">
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-indigo-600">
                                            {data?.contributions.byType.speech.toLocaleString() || 0}
                                        </div>
                                        <div className="text-sm text-gray-500">Speech Contributions</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {data?.contributions.byType.ner.toLocaleString() || 0}
                                        </div>
                                        <div className="text-sm text-gray-500">NER Tagging</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {data?.contributions.byType.pos.toLocaleString() || 0}
                                        </div>
                                        <div className="text-sm text-gray-500">POS Tagging</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mt-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-orange-600">
                                            {data?.contributions.byType.sentiment.toLocaleString() || 0}
                                        </div>
                                        <div className="text-sm text-gray-500">Sentiment Analysis</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-pink-600">
                                            {data?.contributions.byType.emotion.toLocaleString() || 0}
                                        </div>
                                        <div className="text-sm text-gray-500">Emotion Recognition</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contribution Trend */}
                    <div className="mt-8">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Contribution Trend</h2>
                        <SimpleChart
                            data={data?.contributions.trend || []}
                            label={`Contributions Over Time (${timePeriod})`}
                        />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
