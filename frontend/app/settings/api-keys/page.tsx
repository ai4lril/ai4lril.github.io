'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ApiKey {
    id: string;
    name: string;
    lastUsedAt: string | null;
    expiresAt: string | null;
    isActive: boolean;
    createdAt: string;
}

export default function ApiKeysPage() {
    const router = useRouter();
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewKey, setShowNewKey] = useState(false);
    const [newKey, setNewKey] = useState<{ id: string; key: string; name: string } | null>(null);
    const [keyName, setKeyName] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [creating, setCreating] = useState(false);

    const loadApiKeys = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch('/api/auth/api-keys', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to load API keys');
            }

            const data: ApiKey[] = await response.json();
            setApiKeys(data);
        } catch (error) {
            console.error('Failed to load API keys:', error);
            alert('Failed to load API keys');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        loadApiKeys();
    }, [loadApiKeys]);

    const createApiKey = async () => {
        if (!keyName.trim()) {
            alert('Please enter a name for the API key');
            return;
        }

        try {
            setCreating(true);
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch('/api/auth/api-keys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: keyName,
                    expiresAt: expiresAt || undefined,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create API key');
            }

            const data = await response.json();
            setNewKey(data);
            setShowNewKey(true);
            setKeyName('');
            setExpiresAt('');
            loadApiKeys();
        } catch (error) {
            console.error('Failed to create API key:', error);
            alert('Failed to create API key');
        } finally {
            setCreating(false);
        }
    };

    const revokeApiKey = async (id: string) => {
        if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(`/api/auth/api-keys/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to revoke API key');
            }

            loadApiKeys();
        } catch (error) {
            console.error('Failed to revoke API key:', error);
            alert('Failed to revoke API key');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('API key copied to clipboard!');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">API Keys</h1>

                {/* New Key Display */}
                {showNewKey && newKey && (
                    <div className="mb-6 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                        <h2 className="text-lg font-semibold text-yellow-900 mb-2">
                            Your new API key (shown only once)
                        </h2>
                        <div className="flex items-center gap-2 mb-4">
                            <code className="flex-1 p-3 neu-pressed border border-yellow-300/50 rounded text-sm font-mono break-all">
                                {newKey.key}
                            </code>
                            <button
                                onClick={() => copyToClipboard(newKey.key)}
                                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                            >
                                Copy
                            </button>
                        </div>
                        <p className="text-sm text-yellow-800">
                            ⚠️ Save this key now. You won&apos;t be able to see it again!
                        </p>
                        <button
                            onClick={() => {
                                setShowNewKey(false);
                                setNewKey(null);
                            }}
                            className="mt-4 text-sm text-yellow-700 hover:text-yellow-900 underline"
                        >
                            I&apos;ve saved it
                        </button>
                    </div>
                )}

                {/* Create New Key Form */}
                <div className="neu-raised rounded-xl p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New API Key</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="keyName" className="block text-sm font-medium text-gray-700 mb-1">
                                Key Name
                            </label>
                            <input
                                id="keyName"
                                type="text"
                                value={keyName}
                                onChange={(e) => setKeyName(e.target.value)}
                                placeholder="e.g., Production API Key"
                                className="w-full px-3 py-2 neu-pressed rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-1">
                                Expiration Date (Optional)
                            </label>
                            <input
                                id="expiresAt"
                                type="date"
                                value={expiresAt}
                                onChange={(e) => setExpiresAt(e.target.value)}
                                className="w-full px-3 py-2 neu-pressed rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <button
                            onClick={createApiKey}
                            disabled={creating}
                            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {creating ? 'Creating...' : 'Create API Key'}
                        </button>
                    </div>
                </div>

                {/* API Keys List */}
                <div className="neu-raised rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Your API Keys</h2>
                    </div>
                    {apiKeys.length === 0 ? (
                        <div className="px-6 py-8 text-center text-gray-500">
                            No API keys found. Create your first API key above.
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {apiKeys.map((key) => (
                                <li key={key.id} className="px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-medium text-gray-900">{key.name}</h3>
                                                {key.isActive ? (
                                                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                                        Revoked
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-1 text-sm text-gray-500">
                                                <p>Created: {new Date(key.createdAt).toLocaleDateString()}</p>
                                                {key.lastUsedAt && (
                                                    <p>Last used: {new Date(key.lastUsedAt).toLocaleDateString()}</p>
                                                )}
                                                {key.expiresAt && (
                                                    <p>
                                                        Expires: {new Date(key.expiresAt).toLocaleDateString()}
                                                        {new Date(key.expiresAt) < new Date() && (
                                                            <span className="text-red-600 ml-2">(Expired)</span>
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {key.isActive && (
                                            <button
                                                onClick={() => revokeApiKey(key.id)}
                                                className="ml-4 px-4 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                                            >
                                                Revoke
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Usage Instructions */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Use API Keys</h3>
                    <p className="text-sm text-blue-800 mb-4">
                        Include your API key in requests using one of these methods:
                    </p>
                    <div className="space-y-2 text-sm">
                        <div>
                            <p className="font-medium text-blue-900">Header:</p>
                            <code className="block mt-1 p-2 neu-pressed border border-blue-200/50 rounded text-xs">
                                X-API-Key: your_api_key_here
                            </code>
                        </div>
                        <div>
                            <p className="font-medium text-blue-900">Query Parameter:</p>
                            <code className="block mt-1 p-2 neu-pressed border border-blue-200/50 rounded text-xs">
                                ?api_key=your_api_key_here
                            </code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
