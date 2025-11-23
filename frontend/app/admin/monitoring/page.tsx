'use client';

import { useEffect, useState } from 'react';
import { adminAuth } from '@/lib/adminAuth';
import AdminLayout from '@/components/AdminLayout';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Server,
  Database,
  Activity,
  Cpu,
  HardDrive,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Settings,
  Shield,
  Clock
} from 'lucide-react';

interface SystemMetrics {
  timestamp: string;
  cpu: {
    usage: number;
    cores: number;
    load: number[];
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
  };
  requests: {
    total: number;
    perSecond: number;
    errors: number;
    avgResponseTime: number;
  };
  database: {
    connections: number;
    queriesPerSecond: number;
    slowQueries: number;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
    size: number;
  };
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  components: {
    database: { status: 'healthy' | 'warning' | 'critical'; message?: string };
    cache: { status: 'healthy' | 'warning' | 'critical'; message?: string };
    api: { status: 'healthy' | 'warning' | 'critical'; message?: string };
    storage: { status: 'healthy' | 'warning' | 'critical'; message?: string };
  };
  uptime: number;
  lastIncident?: {
    timestamp: string;
    type: string;
    description: string;
  };
}

export default function SystemMonitoringPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  useEffect(() => {
    loadSystemData();
    if (autoRefresh) {
      const interval = setInterval(loadSystemData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const loadSystemData = async () => {
    try {
      // In a real app, these would be API calls
      const mockMetrics: SystemMetrics = {
        timestamp: new Date().toISOString(),
        cpu: {
          usage: Math.random() * 100,
          cores: 8,
          load: [Math.random() * 4, Math.random() * 3, Math.random() * 2]
        },
        memory: {
          used: Math.floor(Math.random() * 1024) + 512,
          total: 8192,
          percentage: Math.random() * 100
        },
        disk: {
          used: Math.floor(Math.random() * 500) + 200,
          total: 1000,
          percentage: Math.random() * 100
        },
        network: {
          bytesIn: Math.floor(Math.random() * 1000000),
          bytesOut: Math.floor(Math.random() * 1000000)
        },
        requests: {
          total: Math.floor(Math.random() * 10000) + 5000,
          perSecond: Math.random() * 100 + 50,
          errors: Math.floor(Math.random() * 100),
          avgResponseTime: Math.random() * 500 + 100
        },
        database: {
          connections: Math.floor(Math.random() * 50) + 10,
          queriesPerSecond: Math.random() * 1000 + 500,
          slowQueries: Math.floor(Math.random() * 10)
        },
        cache: {
          hits: Math.floor(Math.random() * 10000) + 8000,
          misses: Math.floor(Math.random() * 2000) + 500,
          hitRate: Math.random() * 20 + 80,
          size: Math.floor(Math.random() * 100) + 50
        }
      };

      const mockHealth: SystemHealth = {
        overall: Math.random() > 0.8 ? 'critical' : Math.random() > 0.6 ? 'warning' : 'healthy',
        components: {
          database: {
            status: Math.random() > 0.9 ? 'critical' : Math.random() > 0.7 ? 'warning' : 'healthy',
            message: Math.random() > 0.8 ? 'High connection count' : undefined
          },
          cache: {
            status: Math.random() > 0.9 ? 'critical' : Math.random() > 0.7 ? 'warning' : 'healthy',
            message: Math.random() > 0.8 ? 'Low hit rate' : undefined
          },
          api: {
            status: Math.random() > 0.9 ? 'critical' : Math.random() > 0.7 ? 'warning' : 'healthy',
            message: Math.random() > 0.8 ? 'High error rate' : undefined
          },
          storage: {
            status: Math.random() > 0.9 ? 'critical' : Math.random() > 0.7 ? 'warning' : 'healthy',
            message: Math.random() > 0.8 ? 'Low disk space' : undefined
          }
        },
        uptime: Math.floor(Math.random() * 86400) + 3600, // Random uptime in seconds
        lastIncident: Math.random() > 0.7 ? {
          timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          type: 'Database Connection Issue',
          description: 'Temporary database connectivity problem resolved automatically'
        } : undefined
      };

      setMetrics(mockMetrics);
      setHealth(mockHealth);
    } catch (error) {
      console.error('Failed to load system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  // Chart data
  const cpuChartData = {
    labels: ['1 min', '5 min', '15 min'],
    datasets: [{
      label: 'CPU Load',
      data: metrics?.cpu.load || [0, 0, 0],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1
    }]
  };

  const memoryChartData = {
    labels: ['Used', 'Free'],
    datasets: [{
      data: [
        metrics?.memory.used || 0,
        (metrics?.memory.total || 0) - (metrics?.memory.used || 0)
      ],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(34, 197, 94, 0.8)'
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  const requestsChartData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [{
      label: 'Requests per Second',
      data: [45, 67, 89, 123, 156, 98],
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading system metrics...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
              <p className="mt-1 text-sm text-gray-500">
                Real-time system metrics and health monitoring
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Auto-refresh:</label>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="block w-24 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value={10}>10s</option>
                <option value={30}>30s</option>
                <option value={60}>1m</option>
                <option value={300}>5m</option>
              </select>
              <button
                onClick={loadSystemData}
                disabled={!autoRefresh}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Overall Health Status */}
          <div className="mb-8">
            <div className={`rounded-lg p-6 ${health?.overall === 'healthy' ? 'bg-green-50 border-green-200' : health?.overall === 'warning' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'} border`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(health?.overall || 'healthy')}
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      System Status: {health?.overall?.toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Last updated: {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Uptime</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatUptime(health?.uptime || 0)}
                  </div>
                </div>
              </div>

              {health?.lastIncident && (
                <div className="mt-4 p-4 bg-white rounded-md border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Last Incident</h4>
                      <p className="text-sm text-gray-600">{health.lastIncident.description}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(health.lastIncident.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* System Components Health */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {health && Object.entries(health.components).map(([component, status]) => (
              <div key={component} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {component === 'database' && <Database className="h-6 w-6 text-gray-400" />}
                        {component === 'cache' && <Zap className="h-6 w-6 text-gray-400" />}
                        {component === 'api' && <Activity className="h-6 w-6 text-gray-400" />}
                        {component === 'storage' && <HardDrive className="h-6 w-6 text-gray-400" />}
                      </div>
                      <div className="ml-3">
                        <dt className="text-sm font-medium text-gray-500 capitalize">
                          {component}
                        </dt>
                        <dd className={`text-lg font-medium capitalize ${getStatusColor(status.status)}`}>
                          {status.status}
                        </dd>
                      </div>
                    </div>
                    {getStatusIcon(status.status)}
                  </div>
                  {status.message && (
                    <div className="mt-2 text-xs text-gray-600">
                      {status.message}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* CPU Usage */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">CPU Usage</h3>
                <Cpu className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Usage</span>
                  <span className="text-sm font-medium text-gray-900">
                    {metrics?.cpu.usage.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cores</span>
                  <span className="text-sm font-medium text-gray-900">
                    {metrics?.cpu.cores}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${metrics?.cpu.usage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Memory Usage */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Memory Usage</h3>
                <Server className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Used</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatBytes((metrics?.memory.used || 0) * 1024 * 1024)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatBytes((metrics?.memory.total || 0) * 1024 * 1024)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Usage</span>
                  <span className="text-sm font-medium text-gray-900">
                    {metrics?.memory.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      (metrics?.memory.percentage || 0) > 80 ? 'bg-red-600' :
                      (metrics?.memory.percentage || 0) > 60 ? 'bg-yellow-600' : 'bg-green-600'
                    }`}
                    style={{ width: `${metrics?.memory.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Disk Usage */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Disk Usage</h3>
                <HardDrive className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Used</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatBytes((metrics?.disk.used || 0) * 1024 * 1024 * 1024)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatBytes((metrics?.disk.total || 0) * 1024 * 1024 * 1024)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Usage</span>
                  <span className="text-sm font-medium text-gray-900">
                    {metrics?.disk.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      (metrics?.disk.percentage || 0) > 85 ? 'bg-red-600' :
                      (metrics?.disk.percentage || 0) > 70 ? 'bg-yellow-600' : 'bg-green-600'
                    }`}
                    style={{ width: `${metrics?.disk.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* API Performance */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">API Performance</h3>
                <Activity className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Requests/sec</span>
                  <span className="text-sm font-medium text-gray-900">
                    {metrics?.requests.perSecond.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Response Time</span>
                  <span className="text-sm font-medium text-gray-900">
                    {metrics?.requests.avgResponseTime.toFixed(0)}ms
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Error Rate</span>
                  <span className="text-sm font-medium text-red-600">
                    {((metrics?.requests.errors || 0) / (metrics?.requests.total || 1) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Database & Cache Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Database Metrics */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Database Metrics</h3>
                <Database className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Connections</span>
                  <span className="text-sm font-medium text-gray-900">
                    {metrics?.database.connections}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Queries/sec</span>
                  <span className="text-sm font-medium text-gray-900">
                    {metrics?.database.queriesPerSecond.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Slow Queries</span>
                  <span className={`text-sm font-medium ${
                    (metrics?.database.slowQueries || 0) > 5 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {metrics?.database.slowQueries}
                  </span>
                </div>
              </div>
            </div>

            {/* Cache Metrics */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Cache Performance</h3>
                <Zap className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hit Rate</span>
                  <span className="text-sm font-medium text-green-600">
                    {metrics?.cache.hitRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cache Size</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatBytes((metrics?.cache.size || 0) * 1024 * 1024)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hits vs Misses</span>
                  <span className="text-sm font-medium text-gray-900">
                    {metrics?.cache.hits}:{metrics?.cache.misses}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${metrics?.cache.hitRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* CPU Load Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">CPU Load Average</h3>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
              <div className="h-64">
                <Bar
                  data={cpuChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                  }}
                />
              </div>
            </div>

            {/* Requests Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">API Requests Trend</h3>
                <Activity className="h-5 w-5 text-gray-400" />
              </div>
              <div className="h-64">
                <Line
                  data={requestsChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
