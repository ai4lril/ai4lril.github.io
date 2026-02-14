'use client';
import { API_BASE_URL } from '@/lib/api-config';

import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { SearchBar } from '@/components/admin/SearchBar';
import { FilterPanel, type AdminFilterOptions } from '@/components/admin/FilterPanel';
import { FileText, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

interface Sentence {
    id: string;
    text: string;
    languageCode: string;
    taskType: string;
    createdAt: string;
    valid: boolean | null;
}

export default function PendingSentencesPage() {
    const [sentences, setSentences] = useState<Sentence[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [validatingId, setValidatingId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState<AdminFilterOptions>({
        languageCode: '',
        status: 'pending',
        dateFrom: '',
        dateTo: '',
    });

    const loadPendingSentences = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            if (!token) {
                window.location.href = '/admin/login';
                return;
            }

            const params = new URLSearchParams({
                page: String(currentPage),
                limit: '20',
            });
            if (search) params.set('search', search);
            if (filters.languageCode) params.set('languageCode', filters.languageCode);
            if (filters.status && filters.status !== 'pending') params.set('status', filters.status);
            if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
            if (filters.dateTo) params.set('dateTo', filters.dateTo);

            const response = await fetch(`${API_BASE_URL}/admin/sentences/pending?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch pending sentences');
            }

            const data = await response.json();
            setSentences(data.sentences || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Failed to load pending sentences:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, search, filters]);

    useEffect(() => {
        loadPendingSentences();
    }, [loadPendingSentences]);

    // Real-time: refetch when another admin validates a sentence
    useEffect(() => {
        const handler = (e: CustomEvent<{ type?: string; id?: string }>) => {
            if (e.detail?.type === 'sentence') {
                loadPendingSentences();
            }
        };
        window.addEventListener('admin:data-updated', handler as EventListener);
        return () => window.removeEventListener('admin:data-updated', handler as EventListener);
    }, [loadPendingSentences]);

    const handleValidate = async (sentenceId: string, valid: boolean) => {
        try {
            setValidatingId(sentenceId);
            const token = localStorage.getItem('adminToken');
            if (!token) {
                window.location.href = '/admin/login';
                return;
            }

            const response = await fetch(`${API_BASE_URL}/admin/sentences/${sentenceId}/validate`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    valid,
                    comment: valid ? 'Approved by admin' : 'Rejected by admin',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to validate sentence');
            }

            // Remove from list
            setSentences(prev => prev.filter(s => s.id !== sentenceId));
        } catch (error) {
            console.error('Failed to validate sentence:', error);
            alert('Failed to validate sentence');
        } finally {
            setValidatingId(null);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Pending Sentences</h1>
                    <button
                        onClick={loadPendingSentences}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="max-w-md">
                        <SearchBar
                            onSearch={setSearch}
                            placeholder="Search sentences..."
                        />
                    </div>
                    <FilterPanel
                        onFilter={(f) => {
                            setFilters(f);
                            setCurrentPage(1);
                        }}
                        showStatus={true}
                    />
                </div>

                {sentences.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No pending sentences</h3>
                        <p className="mt-1 text-sm text-gray-500">All sentences have been reviewed.</p>
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {sentences.map((sentence) => (
                                <li key={sentence.id} className="px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{sentence.text}</p>
                                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                                <span className="mr-4">Language: {sentence.languageCode}</span>
                                                <span className="mr-4">Type: {sentence.taskType}</span>
                                                <Clock className="h-4 w-4 mr-1" />
                                                <span>{new Date(sentence.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="ml-4 flex items-center space-x-2">
                                            <button
                                                onClick={() => handleValidate(sentence.id, true)}
                                                disabled={validatingId === sentence.id}
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleValidate(sentence.id, false)}
                                                disabled={validatingId === sentence.id}
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                                            >
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
