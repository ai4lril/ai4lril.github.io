'use client';

import { useEffect, useState } from 'react';
import { adminAuth } from '@/lib/adminAuth';
import AdminLayout from '@/components/AdminLayout';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler,
} from 'chart.js';
import {
  Users,
  FileText,
  Clock,
  TrendingUp,
  Activity,
  Shield,
  Database,
  Server,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw
} from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
);

interface DashboardStats {
    totalVisitors: number;
    totalUsers: number;
    totalContributions: number;
    totalAudioDuration: number;
    todayVisitors: number;
    todayContributions: number;
    activeUsers: number;
    pendingReviews: number;
    systemHealth: {
        overall: string;
        components: {
            database: { status: string };
            cache: { status: string };
            system: { status: string };
        };
    };
}

interface LanguageStats {
    language: string;
    contributions: number;
    users: number;
    duration: number;
}

interface RealtimeMetrics {
    activeUsers: number;
    currentRequests: number;
    systemLoad: any;
    memoryUsage: any;
    cacheStats: any;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalVisitors: 0,
        totalUsers: 0,
        totalContributions: 0,
        totalAudioDuration: 0,
        todayVisitors: 0,
        todayContributions: 0,
        activeUsers: 0,
        pendingReviews: 0,
        systemHealth: {
            overall: 'unknown',
            components: {
                database: { status: 'unknown' },
                cache: { status: 'unknown' },
                system: { status: 'unknown' }
            }
        }
    });
    const [languageStats, setLanguageStats] = useState<LanguageStats[]>([]);
    const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        loadDashboardData();
        // Set up real-time updates
        const interval = setInterval(loadRealtimeMetrics, 30000); // Every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch dashboard stats
            const statsResponse = await fetch('/api/admin/dashboard/stats');
            const statsData = await statsResponse.json();

            // Fetch language stats
            const languageResponse = await fetch('/api/admin/dashboard/charts?type=language-distribution');
            const languageData = await languageResponse.json();

            setStats(statsData);
            setLanguageStats(languageData.data || []);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            // Fallback to mock data
            setStats({
                totalVisitors: 12547,
                totalUsers: 3241,
                totalContributions: 8923,
                totalAudioDuration: 45680,
                todayVisitors: 234,
                todayContributions: 89,
                activeUsers: 156,
                pendingReviews: 234,
                systemHealth: {
                    overall: 'healthy',
                    components: {
                        database: { status: 'healthy' },
                        cache: { status: 'healthy' },
                        system: { status: 'healthy' }
                    }
                }
            });

            setLanguageStats([
                { language: 'Hindi', contributions: 2345, users: 678, duration: 4567 },
                { language: 'Bengali', contributions: 1987, users: 543, duration: 3876 },
                { language: 'Telugu', contributions: 1654, users: 456, duration: 3245 },
                { language: 'Marathi', contributions: 1432, users: 398, duration: 2898 },
                { language: 'Tamil', contributions: 1234, users: 345, duration: 2456 },
                { language: 'Gujarati', contributions: 987, users: 234, duration: 1987 },
                { language: 'Kannada', contributions: 876, users: 198, duration: 1756 },
                { language: 'Odia', contributions: 654, users: 156, duration: 1324 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const loadRealtimeMetrics = async () => {
        try {
            const response = await fetch('/api/admin/dashboard/realtime');
            const data = await response.json();
            setRealtimeMetrics(data);
        } catch (error) {
            console.error('Failed to load realtime metrics:', error);
        }
    };

    const refreshData = async () => {
        setRefreshing(true);
        await loadDashboardData();
        await loadRealtimeMetrics();
        setRefreshing(false);
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    // Chart configurations
    const userGrowthData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [{
            label: 'New Users',
            data: [120, 150, 180, 220, 280, 320, 380],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
        }]
    };

    const contributionsData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Daily Contributions',
            data: [45, 67, 89, 123, 156, 98, 76],
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: 'rgb(16, 185, 129)',
            borderWidth: 1
        }]
    };

    const languageDistributionData = {
        labels: languageStats.map(lang => lang.language),
        datasets: [{
            data: languageStats.map(lang => lang.contributions),
            backgroundColor: [
                '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
                '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };

    const systemHealthData = {
        labels: ['Database', 'Cache', 'System'],
        datasets: [{
            label: 'Status',
            data: [
                stats.systemHealth.components.database.status === 'healthy' ? 100 : 0,
                stats.systemHealth.components.cache.status === 'healthy' ? 100 : 0,
                stats.systemHealth.components.system.status === 'healthy' ? 100 : 0
            ],
            backgroundColor: [
                stats.systemHealth.components.database.status === 'healthy' ? '#10B981' : '#EF4444',
                stats.systemHealth.components.cache.status === 'healthy' ? '#10B981' : '#EF4444',
                stats.systemHealth.components.system.status === 'healthy' ? '#10B981' : '#EF4444'
            ]
        }]
    };

    const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }: {
        title: string;
        value: string | number;
        subtitle?: string;
        icon: any;
        color: string;
        trend?: { value: number; label: string };
    }) => (
        <div className={`bg-white overflow-hidden shadow rounded-lg border-l-4 ${color} hover:shadow-lg transition-shadow`}>
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Icon className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    {title}
                                </dt>
                                <dd className="text-2xl font-bold text-gray-900">
                                    {value}
                                </dd>
                                {subtitle && (
                                    <dd className="text-sm text-gray-600 mt-1">
                                        {subtitle}
                                    </dd>
                                )}
                                {trend && (
                                    <dd className={`text-sm mt-1 flex items-center ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        <TrendingUp className={`h-4 w-4 mr-1 ${trend.value < 0 ? 'rotate-180' : ''}`} />
                                        {Math.abs(trend.value)}% {trend.label}
                                    </dd>
                                )}
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
                            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Welcome back, {adminAuth.getCurrentUser()?.name}
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={refreshData}
                                disabled={refreshing}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stats.systemHealth.overall === 'healthy'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                <div className={`w-2 h-2 rounded-full mr-2 ${stats.systemHealth.overall === 'healthy' ? 'bg-green-400' : 'bg-red-400'
                                    }`}></div>
                                System {stats.systemHealth.overall}
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="mb-8">
                        <nav className="flex space-x-8" aria-label="Tabs">
                            {[
                                { id: 'overview', name: 'Overview', icon: BarChart3 },
                                { id: 'analytics', name: 'Analytics', icon: LineChart },
                                { id: 'system', name: 'System', icon: Server },
                                { id: 'security', name: 'Security', icon: Shield }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center px-1 py-2 border-b-2 font-medium text-sm ${activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <tab.icon className="h-4 w-4 mr-2" />
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                                <StatCard
                                    title="Total Users"
                                    value={stats.totalUsers.toLocaleString()}
                                    subtitle={`${stats.activeUsers} active now`}
                                    icon={Users}
                                    color="border-blue-500"
                                    trend={{ value: 12.5, label: 'from last month' }}
                                />
                                <StatCard
                                    title="Total Contributions"
                                    value={stats.totalContributions.toLocaleString()}
                                    subtitle={`+${stats.todayContributions} today`}
                                    icon={FileText}
                                    color="border-green-500"
                                    trend={{ value: 8.2, label: 'from last week' }}
                                />
                                <StatCard
                                    title="Audio Duration"
                                    value={formatDuration(stats.totalAudioDuration)}
                                    subtitle="Total collected"
                                    icon={Clock}
                                    color="border-purple-500"
                                    trend={{ value: 15.3, label: 'from last month' }}
                                />
                                <StatCard
                                    title="Pending Reviews"
                                    value={stats.pendingReviews}
                                    subtitle="Require attention"
                                    icon={AlertTriangle}
                                    color="border-orange-500"
                                    trend={{ value: -5.1, label: 'from yesterday' }}
                                />
                            </div>

                            {/* Charts Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                {/* User Growth Chart */}
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">User Growth</h3>
                                        <LineChart className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div className="h-64">
                                        <Line
                                            data={userGrowthData}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: { display: false }
                                                },
                                                scales: {
                                                    y: { beginAtZero: true }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Daily Contributions Chart */}
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">Daily Contributions</h3>
                                        <BarChart3 className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div className="h-64">
                                        <Bar
                                            data={contributionsData}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: { display: false }
                                                },
                                                scales: {
                                                    y: { beginAtZero: true }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Language Distribution */}
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">Language Distribution</h3>
                                        <PieChart className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div className="h-64 flex items-center justify-center">
                                        <Pie
                                            data={languageDistributionData}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: 'bottom' as const,
                                                        labels: { boxWidth: 12 }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* System Health */}
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">System Health</h3>
                                        <Server className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Database</span>
                                            <div className="flex items-center">
                                                {stats.systemHealth.components.database.status === 'healthy' ? (
                                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                                                )}
                                                <span className={`text-sm ${stats.systemHealth.components.database.status === 'healthy'
                                                    ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {stats.systemHealth.components.database.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Cache</span>
                                            <div className="flex items-center">
                                                {stats.systemHealth.components.cache.status === 'healthy' ? (
                                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                                                )}
                                                <span className={`text-sm ${stats.systemHealth.components.cache.status === 'healthy'
                                                    ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {stats.systemHealth.components.cache.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">System</span>
                                            <div className="flex items-center">
                                                {stats.systemHealth.components.system.status === 'healthy' ? (
                                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                                                )}
                                                <span className={`text-sm ${stats.systemHealth.components.system.status === 'healthy'
                                                    ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {stats.systemHealth.components.system.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white shadow rounded-lg mb-8">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    <div className="px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                        <Users className="w-4 h-4 text-green-600" />
                                                    </div>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        New user registration: John Doe
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Hindi speaker from Maharashtra
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-sm text-gray-500">2 minutes ago</span>
                                        </div>
                                    </div>
                                    <div className="px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <FileText className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        Audio contribution submitted
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        5 minutes of Hindi speech data
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-sm text-gray-500">15 minutes ago</span>
                                        </div>
                                    </div>
                                    <div className="px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                        <Activity className="w-4 h-4 text-purple-600" />
                                                    </div>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        NER annotation completed
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        50 sentences annotated by community
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-sm text-gray-500">1 hour ago</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && (
                        <div className="space-y-8">
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Analytics</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-indigo-600">
                                            {((stats.totalContributions / stats.totalUsers) * 100).toFixed(1)}%
                                        </div>
                                        <div className="text-sm text-gray-600">Avg. Contributions per User</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {Math.floor(stats.totalAudioDuration / stats.totalUsers)}min
                                        </div>
                                        <div className="text-sm text-gray-600">Avg. Audio per User</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {languageStats.length}
                                        </div>
                                        <div className="text-sm text-gray-600">Active Languages</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* System Tab */}
                    {activeTab === 'system' && realtimeMetrics && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-medium text-gray-900">Active Users</h4>
                                        <Users className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {realtimeMetrics.activeUsers}
                                    </div>
                                    <div className="text-sm text-gray-600">Currently online</div>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-medium text-gray-900">Current Requests</h4>
                                        <Activity className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {realtimeMetrics.currentRequests}
                                    </div>
                                    <div className="text-sm text-gray-600">Active requests</div>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-medium text-gray-900">Memory Usage</h4>
                                        <Database className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {realtimeMetrics.memoryUsage.percentage}%
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {realtimeMetrics.memoryUsage.used}MB / {realtimeMetrics.memoryUsage.total}MB
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-medium text-gray-900">Cache Hit Rate</h4>
                                        <TrendingUp className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {realtimeMetrics.cacheStats.hitRate.toFixed(1)}%
                                    </div>
                                    <div className="text-sm text-gray-600">Cache efficiency</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Security Overview</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Failed Login Attempts (24h)</span>
                                            <span className="text-sm font-medium text-red-600">3</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Active Sessions</span>
                                            <span className="text-sm font-medium text-green-600">12</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Security Alerts (24h)</span>
                                            <span className="text-sm font-medium text-yellow-600">1</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Data Exports (24h)</span>
                                            <span className="text-sm font-medium text-blue-600">0</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Status</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">GDPR Compliance</span>
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Data Encryption</span>
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Access Logging</span>
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Backup Security</span>
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        </div>
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
