'use client';

import { useEffect, useState } from 'react';
import { adminAuth } from '@/lib/adminAuth';
import AdminLayout from '@/components/AdminLayout';
import {
  Crown,
  Settings,
  Users,
  Database,
  Shield,
  AlertTriangle,
  Server,
  Key,
  FileText,
  Download,
  Upload,
  Trash2,
  Power,
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  Lock,
  Unlock,
  UserPlus,
  UserMinus,
  Archive,
  HardDrive,
  Cloud
} from 'lucide-react';

interface SystemConfig {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  allowRegistration: boolean;
  maxFileSize: number;
  rateLimitRequests: number;
  rateLimitWindow: number;
  jwtExpiry: number;
  cacheTTL: number;
  backupSchedule: string;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

interface SystemStats {
  totalUsers: number;
  totalAdmins: number;
  activeAdmins: number;
  systemUptime: number;
  lastBackup: string;
  diskUsage: number;
  memoryUsage: number;
  databaseSize: number;
}

export default function SuperAdminPage() {
  const [config, setConfig] = useState<SystemConfig>({
    maintenanceMode: false,
    maintenanceMessage: 'System is under maintenance. Please try again later.',
    allowRegistration: true,
    maxFileSize: 50,
    rateLimitRequests: 100,
    rateLimitWindow: 15,
    jwtExpiry: 24,
    cacheTTL: 3600,
    backupSchedule: '0 2 * * *'
  });

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalAdmins: 0,
    activeAdmins: 0,
    systemUptime: 0,
    lastBackup: '',
    diskUsage: 0,
    memoryUsage: 0,
    databaseSize: 0
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: '', name: '', role: 'admin' as 'admin' | 'super_admin' });

  useEffect(() => {
    // Check if user is super admin
    if (!adminAuth.isSuperAdmin()) {
      window.location.href = '/admin/dashboard';
      return;
    }

    loadSuperAdminData();
  }, []);

  const loadSuperAdminData = async () => {
    try {
      setLoading(true);

      // Load admin users
      const response = await fetch('/api/admin/admin-users?page=1&limit=20', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdminUsers(data.adminUsers || []);
      } else {
        setAdminUsers([]);
      }

      // Load mock stats for now - will be replaced with real API call
      const mockStats: SystemStats = {
        totalUsers: 0,
        totalAdmins: 0,
        activeAdmins: 0,
        systemUptime: 0,
        lastBackup: new Date().toISOString(),
        diskUsage: 0,
        memoryUsage: 0,
        databaseSize: 0
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Failed to load super admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSystemConfig = async () => {
    try {
      setSaving(true);
      // In a real app, this would be an API call
      console.log('Saving system config:', config);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('System configuration saved successfully!');
    } catch (error) {
      console.error('Failed to save config:', error);
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const addAdminUser = async () => {
    try {
      if (!newAdmin.email || !newAdmin.name) {
        alert('Please fill in all required fields');
        return;
      }

      // In a real app, this would be an API call
      const newUser: AdminUser = {
        id: Date.now().toString(),
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role,
        isActive: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      setAdminUsers(prev => [...prev, newUser]);
      setNewAdmin({ email: '', name: '', role: 'admin' });
      setShowAddAdmin(false);
      alert('Admin user added successfully!');
    } catch (error) {
      console.error('Failed to add admin user:', error);
      alert('Failed to add admin user');
    }
  };

  const toggleAdminStatus = async (adminId: string) => {
    try {
      setAdminUsers(prev => prev.map(admin =>
        admin.id === adminId
          ? { ...admin, isActive: !admin.isActive }
          : admin
      ));
    } catch (error) {
      console.error('Failed to toggle admin status:', error);
    }
  };

  const removeAdminUser = async (adminId: string) => {
    if (!confirm('Are you sure you want to remove this admin user? This action cannot be undone.')) {
      return;
    }

    try {
      setAdminUsers(prev => prev.filter(admin => admin.id !== adminId));
      alert('Admin user removed successfully!');
    } catch (error) {
      console.error('Failed to remove admin user:', error);
      alert('Failed to remove admin user');
    }
  };

  const performSystemAction = async (action: string) => {
    const confirmMessage = {
      'restart': 'Are you sure you want to restart the system? This may cause temporary downtime.',
      'shutdown': 'Are you sure you want to shut down the system? This will make the platform unavailable.',
      'maintenance': 'Are you sure you want to toggle maintenance mode?',
      'backup': 'Are you sure you want to create a system backup?',
      'clear-cache': 'Are you sure you want to clear all system caches?',
      'clear-logs': 'Are you sure you want to clear old system logs?'
    }[action];

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      // In a real app, this would be an API call
      console.log(`Performing system action: ${action}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`${action.replace('-', ' ').toUpperCase()} completed successfully!`);
    } catch (error) {
      console.error(`Failed to perform ${action}:`, error);
      alert(`Failed to perform ${action}`);
    }
  };

  const exportSystemData = async (type: string) => {
    try {
      // In a real app, this would be an API call
      console.log(`Exporting ${type} data`);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock download
      const data = `Mock ${type} export data`;
      const blob = new Blob([data], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Failed to export ${type}:`, error);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading super admin panel...</p>
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
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Super Admin Panel</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Advanced system management and configuration
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600">
                System Uptime: {formatUptime(stats.systemUptime)}
              </div>
              <button
                onClick={loadSuperAdminData}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* System Overview */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-blue-400" />
                  <div className="ml-5">
                    <dt className="text-sm font-medium text-gray-500">Total Users</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalUsers.toLocaleString()}</dd>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <Shield className="h-6 w-6 text-green-400" />
                  <div className="ml-5">
                    <dt className="text-sm font-medium text-gray-500">Active Admins</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.activeAdmins}/{stats.totalAdmins}</dd>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <Database className="h-6 w-6 text-purple-400" />
                  <div className="ml-5">
                    <dt className="text-sm font-medium text-gray-500">Database Size</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.databaseSize}GB</dd>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <HardDrive className="h-6 w-6 text-orange-400" />
                  <div className="ml-5">
                    <dt className="text-sm font-medium text-gray-500">Disk Usage</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.diskUsage}%</dd>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Configuration */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">System Configuration</h3>
                <button
                  onClick={saveSystemConfig}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Settings className="h-4 w-4 mr-2" />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Maintenance Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maintenance Mode
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.maintenanceMode}
                      onChange={(e) => setConfig(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">Enable maintenance mode</span>
                  </div>
                </div>

                {/* User Registration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Registration
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.allowRegistration}
                      onChange={(e) => setConfig(prev => ({ ...prev, allowRegistration: e.target.checked }))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">Allow new user registration</span>
                  </div>
                </div>

                {/* Max File Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max File Size (MB)
                  </label>
                  <input
                    type="number"
                    value={config.maxFileSize}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxFileSize: Number(e.target.value) }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Rate Limiting */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rate Limit (requests/minute)
                  </label>
                  <input
                    type="number"
                    value={config.rateLimitRequests}
                    onChange={(e) => setConfig(prev => ({ ...prev, rateLimitRequests: Number(e.target.value) }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* JWT Expiry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    JWT Expiry (hours)
                  </label>
                  <input
                    type="number"
                    value={config.jwtExpiry}
                    onChange={(e) => setConfig(prev => ({ ...prev, jwtExpiry: Number(e.target.value) }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Cache TTL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cache TTL (seconds)
                  </label>
                  <input
                    type="number"
                    value={config.cacheTTL}
                    onChange={(e) => setConfig(prev => ({ ...prev, cacheTTL: Number(e.target.value) }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Admin User Management */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Admin User Management</h3>
                <button
                  onClick={() => setShowAddAdmin(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Admin
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {adminUsers.map((admin) => (
                <div key={admin.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {admin.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium text-gray-900">{admin.name}</h4>
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            admin.role === 'super_admin' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {admin.role.replace('_', ' ').toUpperCase()}
                          </span>
                          {!admin.isActive && (
                            <span className="ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              INACTIVE
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{admin.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-500">
                        Last login: {new Date(admin.lastLogin).toLocaleDateString()}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleAdminStatus(admin.id)}
                          className={`p-1 rounded-full ${
                            admin.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          {admin.isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </button>
                        {admin.role !== 'super_admin' && (
                          <button
                            onClick={() => removeAdminUser(admin.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Actions */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">System Actions</h3>
            </div>

            <div className="px-6 py-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <button
                  onClick={() => performSystemAction('restart')}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <RefreshCw className="h-5 w-5 mr-3 text-blue-500" />
                  Restart System
                </button>

                <button
                  onClick={() => performSystemAction('maintenance')}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Settings className="h-5 w-5 mr-3 text-orange-500" />
                  Toggle Maintenance
                </button>

                <button
                  onClick={() => performSystemAction('backup')}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Archive className="h-5 w-5 mr-3 text-green-500" />
                  Create Backup
                </button>

                <button
                  onClick={() => performSystemAction('clear-cache')}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Trash2 className="h-5 w-5 mr-3 text-purple-500" />
                  Clear Cache
                </button>

                <button
                  onClick={() => performSystemAction('clear-logs')}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FileText className="h-5 w-5 mr-3 text-indigo-500" />
                  Clear Logs
                </button>

                <button
                  onClick={() => performSystemAction('shutdown')}
                  className="flex items-center justify-center px-4 py-3 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                >
                  <Power className="h-5 w-5 mr-3 text-red-500" />
                  Shutdown System
                </button>
              </div>
            </div>
          </div>

          {/* Data Export & Backup */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Data Management</h3>
            </div>

            <div className="px-6 py-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <button
                  onClick={() => exportSystemData('users')}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="h-5 w-5 mr-3 text-blue-500" />
                  Export Users
                </button>

                <button
                  onClick={() => exportSystemData('contributions')}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="h-5 w-5 mr-3 text-green-500" />
                  Export Contributions
                </button>

                <button
                  onClick={() => exportSystemData('analytics')}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="h-5 w-5 mr-3 text-purple-500" />
                  Export Analytics
                </button>

                <button
                  onClick={() => exportSystemData('system-logs')}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="h-5 w-5 mr-3 text-orange-500" />
                  Export System Logs
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Last Backup</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(stats.lastBackup).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">Backup Status:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Healthy
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add Admin Modal */}
          {showAddAdmin && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Admin User</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="admin@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={newAdmin.name}
                        onChange={(e) => setNewAdmin(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <select
                        value={newAdmin.role}
                        onChange={(e) => setNewAdmin(prev => ({ ...prev, role: e.target.value as 'admin' | 'super_admin' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 mt-6">
                    <button
                      onClick={() => {
                        setShowAddAdmin(false);
                        setNewAdmin({ email: '', name: '', role: 'admin' });
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addAdminUser}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                    >
                      Add Admin
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
