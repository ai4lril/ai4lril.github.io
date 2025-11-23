'use client';

import { useEffect, useState } from 'react';
import { adminAuth } from '@/lib/adminAuth';
import AdminLayout from '@/components/AdminLayout';
import {
  Shield,
  AlertTriangle,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Key,
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Clock,
  MapPin,
  Globe
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'login_attempt' | 'failed_login' | 'suspicious_activity' | 'data_access' | 'permission_change' | 'security_alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  userEmail?: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    city: string;
  };
  description: string;
  metadata?: Record<string, any>;
}

interface SecurityStats {
  totalEvents: number;
  criticalEvents: number;
  failedLogins: number;
  activeSessions: number;
  blockedIPs: number;
  securityAlerts: number;
  recentIncidents: SecurityEvent[];
}

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  success: boolean;
}

export default function SecurityPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<SecurityStats>({
    totalEvents: 0,
    criticalEvents: 0,
    failedLogins: 0,
    activeSessions: 0,
    blockedIPs: 0,
    securityAlerts: 0,
    recentIncidents: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'login_attempt' | 'failed_login' | 'suspicious_activity' | 'data_access' | 'permission_change' | 'security_alert'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(20);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);

      // Load security events
      const eventsParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: eventsPerPage.toString(),
        severity: severityFilter !== 'all' ? severityFilter : '',
        type: typeFilter !== 'all' ? typeFilter : ''
      });

      const [eventsResponse, auditResponse] = await Promise.all([
        fetch(`/api/admin/security-events?${eventsParams}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }),
        fetch(`/api/admin/audit-logs?page=1&limit=20`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          },
        })
      ]);

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData.events || []);
      }

      if (auditResponse.ok) {
        const auditData = await auditResponse.json();
        setAuditLogs(auditData.logs || []);
      }

      // Load mock stats for now - will be replaced with real API call
      const mockStats = {
        totalEvents: 0,
        criticalEvents: 0,
        failedLogins: 0,
        activeSessions: 0,
        blockedIPs: 0,
        securityAlerts: 0,
        recentIncidents: []
      };

      setEvents([]);
      setAuditLogs([]);
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = searchTerm === '' ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.userEmail && event.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      event.ipAddress.includes(searchTerm);

    const matchesSeverity = severityFilter === 'all' || event.severity === severityFilter;
    const matchesType = typeFilter === 'all' || event.type === typeFilter;

    return matchesSearch && matchesSeverity && matchesType;
  });

  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * eventsPerPage,
    currentPage * eventsPerPage
  );

  const getSeverityColor = (severity: string) => {
    const colors: { [key: string]: string } = {
      'low': 'bg-blue-100 text-blue-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'failed_login':
        return <UserX className="h-4 w-4 text-red-500" />;
      case 'login_attempt':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'suspicious_activity':
        return <Eye className="h-4 w-4 text-orange-500" />;
      case 'data_access':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'security_alert':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const exportSecurityReport = () => {
    const csvContent = [
      ['Timestamp', 'Type', 'Severity', 'User', 'IP Address', 'Location', 'Description'],
      ...filteredEvents.map(event => [
        new Date(event.timestamp).toLocaleString(),
        event.type,
        event.severity,
        event.userEmail || 'Unknown',
        event.ipAddress,
        event.location ? `${event.location.city}, ${event.location.country}` : 'Unknown',
        event.description
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading security data...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Security Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitor security events and manage access controls
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadSecurityData}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={exportSecurityReport}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>

          {/* Security Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Shield className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Events
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalEvents}
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
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Critical Events
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.criticalEvents}
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
                    <UserX className="h-6 w-6 text-orange-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Failed Logins
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.failedLogins}
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
                    <Lock className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Sessions
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.activeSessions}
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
                    <Globe className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Blocked IPs
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.blockedIPs}
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
                    <AlertTriangle className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Security Alerts
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.securityAlerts}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Incidents */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Security Incidents</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {stats.recentIncidents.map((incident) => (
                <div key={incident.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getSeverityIcon(incident.severity)}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {incident.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(incident.severity)}`}>
                            {incident.severity.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {incident.userEmail || 'System'}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {incident.location?.city}, {incident.location?.country}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-900">{incident.ipAddress}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(incident.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
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
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Severity Filter */}
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value as any)}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Severities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>

                {/* Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Types</option>
                  <option value="login_attempt">Login Attempt</option>
                  <option value="failed_login">Failed Login</option>
                  <option value="suspicious_activity">Suspicious Activity</option>
                  <option value="data_access">Data Access</option>
                  <option value="security_alert">Security Alert</option>
                </select>

                {/* Quick Actions */}
                <div className="flex items-center space-x-2">
                  <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Security Events Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-3 border-b border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <h4 className="text-sm font-medium text-gray-900">
                    Security Events ({filteredEvents.length})
                  </h4>
                </div>
              </div>
            </div>

            <ul className="divide-y divide-gray-200">
              {paginatedEvents.map((event) => (
                <li key={event.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getEventTypeIcon(event.type)}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {event.description}
                          </div>
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(event.severity)}`}>
                            {event.severity}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {event.userEmail && (
                            <span className="mr-4">User: {event.userEmail}</span>
                          )}
                          <span className="mr-4">IP: {event.ipAddress}</span>
                          {event.location && (
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {event.location.city}, {event.location.country}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-900">
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {event.userAgent.substring(0, 50)}...
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Audit Logs */}
          <div className="bg-white shadow rounded-lg mt-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Audit Logs</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {auditLogs.map((log) => (
                <div key={log.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {log.action} on {log.resource}
                        </p>
                        <p className="text-sm text-gray-500">
                          {log.details}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-900">{log.userEmail}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
