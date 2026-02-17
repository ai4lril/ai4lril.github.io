'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminAuth } from '@/lib/adminAuth';

interface SystemSettings {
    general: {
        siteName: string;
        siteDescription: string;
        contactEmail: string;
        maintenanceMode: boolean;
    };
    security: {
        sessionTimeout: number; // minutes
        passwordMinLength: number;
        enableTwoFactor: boolean;
        maxLoginAttempts: number;
        lockoutDuration: number; // minutes
    };
    dataCollection: {
        maxAudioDuration: number; // seconds
        allowedAudioFormats: string[];
        maxFileSize: number; // MB
        requireApproval: boolean;
        autoDeleteInactiveUsers: boolean;
        inactiveUserDays: number;
    };
    notifications: {
        emailNotifications: boolean;
        adminAlerts: boolean;
        contributionAlerts: boolean;
        securityAlerts: boolean;
    };
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'security' | 'data' | 'notifications'>('general');
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock settings data
        const mockSettings: SystemSettings = {
            general: {
                siteName: 'ILHRF Data Collection Platform',
                siteDescription: 'A comprehensive platform for collecting and annotating voice data across Indian languages',
                contactEmail: 'admin@voicedata.com',
                maintenanceMode: false
            },
            security: {
                sessionTimeout: 60, // 1 hour
                passwordMinLength: 8,
                enableTwoFactor: false,
                maxLoginAttempts: 5,
                lockoutDuration: 30 // 30 minutes
            },
            dataCollection: {
                maxAudioDuration: 300, // 5 minutes
                allowedAudioFormats: ['wav', 'mp3', 'ogg', 'flac'],
                maxFileSize: 50, // 50 MB
                requireApproval: true,
                autoDeleteInactiveUsers: false,
                inactiveUserDays: 365 // 1 year
            },
            notifications: {
                emailNotifications: true,
                adminAlerts: true,
                contributionAlerts: true,
                securityAlerts: true
            }
        };

        setSettings(mockSettings);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!settings) return;

        setSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In a real app, this would save to the backend
        console.log('Saving settings:', settings);
        setHasChanges(false);
        setSaving(false);

        // Show success message
        alert('Settings saved successfully!');
    };

    const updateSetting = (section: keyof SystemSettings, field: string, value: string | number | boolean | string[]) => {
        if (!settings) return;

        setSettings(prev => {
            if (!prev) return null;
            return {
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value
                }
            };
        });
        setHasChanges(true);
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

    if (!adminAuth.isSuperAdmin()) {
        return (
            <AdminLayout>
                <div className="py-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🔒</div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                            <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
                            <p className="text-sm text-gray-500 mt-2">Super Admin privileges required.</p>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (!settings) return null;

    return (
        <AdminLayout>
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold text-gray-900">System Settings</h1>
                        {hasChanges && (
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="mt-8">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                                {[
                                    { key: 'general', label: 'General' },
                                    { key: 'security', label: 'Security' },
                                    { key: 'data', label: 'Data Collection' },
                                    { key: 'notifications', label: 'Notifications' }
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key as 'general' | 'security' | 'data' | 'notifications')}
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

                    {/* Settings Content */}
                    <div className="mt-6">
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <div className="px-4 py-5 sm:p-6">
                                {/* General Settings */}
                                {activeTab === 'general' && (
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-medium text-gray-900">General Settings</h3>

                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div>
                                                <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
                                                    Site Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id="siteName"
                                                    value={settings.general.siteName}
                                                    onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                                                    Contact Email
                                                </label>
                                                <input
                                                    type="email"
                                                    id="contactEmail"
                                                    value={settings.general.contactEmail}
                                                    onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
                                                Site Description
                                            </label>
                                            <textarea
                                                id="siteDescription"
                                                rows={3}
                                                value={settings.general.siteDescription}
                                                onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                id="maintenanceMode"
                                                type="checkbox"
                                                checked={settings.general.maintenanceMode}
                                                onChange={(e) => updateSetting('general', 'maintenanceMode', e.target.checked)}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
                                                Enable Maintenance Mode
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Security Settings */}
                                {activeTab === 'security' && (
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>

                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div>
                                                <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700">
                                                    Session Timeout (minutes)
                                                </label>
                                                <input
                                                    type="number"
                                                    id="sessionTimeout"
                                                    min="15"
                                                    max="480"
                                                    value={settings.security.sessionTimeout}
                                                    onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="passwordMinLength" className="block text-sm font-medium text-gray-700">
                                                    Minimum Password Length
                                                </label>
                                                <input
                                                    type="number"
                                                    id="passwordMinLength"
                                                    min="6"
                                                    max="32"
                                                    value={settings.security.passwordMinLength}
                                                    onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="maxLoginAttempts" className="block text-sm font-medium text-gray-700">
                                                    Max Login Attempts
                                                </label>
                                                <input
                                                    type="number"
                                                    id="maxLoginAttempts"
                                                    min="3"
                                                    max="10"
                                                    value={settings.security.maxLoginAttempts}
                                                    onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="lockoutDuration" className="block text-sm font-medium text-gray-700">
                                                    Lockout Duration (minutes)
                                                </label>
                                                <input
                                                    type="number"
                                                    id="lockoutDuration"
                                                    min="5"
                                                    max="1440"
                                                    value={settings.security.lockoutDuration}
                                                    onChange={(e) => updateSetting('security', 'lockoutDuration', parseInt(e.target.value))}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                id="enableTwoFactor"
                                                type="checkbox"
                                                checked={settings.security.enableTwoFactor}
                                                onChange={(e) => updateSetting('security', 'enableTwoFactor', e.target.checked)}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="enableTwoFactor" className="ml-2 block text-sm text-gray-900">
                                                Enable Two-Factor Authentication
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Data Collection Settings */}
                                {activeTab === 'data' && (
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-medium text-gray-900">Data Collection Settings</h3>

                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div>
                                                <label htmlFor="maxAudioDuration" className="block text-sm font-medium text-gray-700">
                                                    Max Audio Duration (seconds)
                                                </label>
                                                <input
                                                    type="number"
                                                    id="maxAudioDuration"
                                                    min="30"
                                                    max="600"
                                                    value={settings.dataCollection.maxAudioDuration}
                                                    onChange={(e) => updateSetting('dataCollection', 'maxAudioDuration', parseInt(e.target.value))}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="maxFileSize" className="block text-sm font-medium text-gray-700">
                                                    Max File Size (MB)
                                                </label>
                                                <input
                                                    type="number"
                                                    id="maxFileSize"
                                                    min="1"
                                                    max="500"
                                                    value={settings.dataCollection.maxFileSize}
                                                    onChange={(e) => updateSetting('dataCollection', 'maxFileSize', parseInt(e.target.value))}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="inactiveUserDays" className="block text-sm font-medium text-gray-700">
                                                    Inactive User Threshold (days)
                                                </label>
                                                <input
                                                    type="number"
                                                    id="inactiveUserDays"
                                                    min="30"
                                                    max="730"
                                                    value={settings.dataCollection.inactiveUserDays}
                                                    onChange={(e) => updateSetting('dataCollection', 'inactiveUserDays', parseInt(e.target.value))}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Allowed Audio Formats
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {['wav', 'mp3', 'ogg', 'flac', 'aac', 'm4a'].map(format => (
                                                    <label key={format} className="inline-flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={settings.dataCollection.allowedAudioFormats.includes(format)}
                                                            onChange={(e) => {
                                                                const formats = e.target.checked
                                                                    ? [...settings.dataCollection.allowedAudioFormats, format]
                                                                    : settings.dataCollection.allowedAudioFormats.filter(f => f !== format);
                                                                updateSetting('dataCollection', 'allowedAudioFormats', formats);
                                                            }}
                                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">.{format}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center">
                                                <input
                                                    id="requireApproval"
                                                    type="checkbox"
                                                    checked={settings.dataCollection.requireApproval}
                                                    onChange={(e) => updateSetting('dataCollection', 'requireApproval', e.target.checked)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="requireApproval" className="ml-2 block text-sm text-gray-900">
                                                    Require admin approval for new contributions
                                                </label>
                                            </div>

                                            <div className="flex items-center">
                                                <input
                                                    id="autoDeleteInactiveUsers"
                                                    type="checkbox"
                                                    checked={settings.dataCollection.autoDeleteInactiveUsers}
                                                    onChange={(e) => updateSetting('dataCollection', 'autoDeleteInactiveUsers', e.target.checked)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="autoDeleteInactiveUsers" className="ml-2 block text-sm text-gray-900">
                                                    Automatically delete inactive users
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Notification Settings */}
                                {activeTab === 'notifications' && (
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>

                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <input
                                                    id="emailNotifications"
                                                    type="checkbox"
                                                    checked={settings.notifications.emailNotifications}
                                                    onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
                                                    Enable email notifications
                                                </label>
                                            </div>

                                            <div className="flex items-center">
                                                <input
                                                    id="adminAlerts"
                                                    type="checkbox"
                                                    checked={settings.notifications.adminAlerts}
                                                    onChange={(e) => updateSetting('notifications', 'adminAlerts', e.target.checked)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="adminAlerts" className="ml-2 block text-sm text-gray-900">
                                                    Send alerts for admin actions
                                                </label>
                                            </div>

                                            <div className="flex items-center">
                                                <input
                                                    id="contributionAlerts"
                                                    type="checkbox"
                                                    checked={settings.notifications.contributionAlerts}
                                                    onChange={(e) => updateSetting('notifications', 'contributionAlerts', e.target.checked)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="contributionAlerts" className="ml-2 block text-sm text-gray-900">
                                                    Alert on new contributions
                                                </label>
                                            </div>

                                            <div className="flex items-center">
                                                <input
                                                    id="securityAlerts"
                                                    type="checkbox"
                                                    checked={settings.notifications.securityAlerts}
                                                    onChange={(e) => updateSetting('notifications', 'securityAlerts', e.target.checked)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="securityAlerts" className="ml-2 block text-sm text-gray-900">
                                                    Send security alerts
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
