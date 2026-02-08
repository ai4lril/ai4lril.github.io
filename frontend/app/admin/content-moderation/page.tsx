'use client';

import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { FileText, MessageSquare, CheckCircle, XCircle, AlertTriangle, ArrowRight } from 'lucide-react';

export default function ContentModerationPage() {
    return (
        <AdminLayout>
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Review and validate user-submitted content
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
                        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-blue-500">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="shrink-0">
                                        <FileText className="h-8 w-8 text-blue-500" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Pending Sentences
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                Review sentences submitted by users
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Link
                                        href="/admin/content-moderation/sentences"
                                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                                    >
                                        Review Sentences
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-green-500">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="shrink-0">
                                        <MessageSquare className="h-8 w-8 text-green-500" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Pending Questions
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                Review questions submitted by users
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Link
                                        href="/admin/content-moderation/questions"
                                        className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-800"
                                    >
                                        Review Questions
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Guidelines */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Moderation Guidelines</h2>
                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                                <div>
                                    <strong className="text-gray-900">Approve</strong> content that is:
                                    <ul className="mt-1 ml-4 list-disc space-y-1">
                                        <li>Grammatically correct and well-formed</li>
                                        <li>Appropriate and non-offensive</li>
                                        <li>In the correct language and script</li>
                                        <li>Properly formatted and readable</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 shrink-0" />
                                <div>
                                    <strong className="text-gray-900">Reject</strong> content that:
                                    <ul className="mt-1 ml-4 list-disc space-y-1">
                                        <li>Contains offensive, inappropriate, or harmful content</li>
                                        <li>Has grammatical errors or is poorly formatted</li>
                                        <li>Is in the wrong language or script</li>
                                        <li>Violates copyright or contains personal information</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 shrink-0" />
                                <div>
                                    <strong className="text-gray-900">Note:</strong> All approved content will be made available for users to contribute audio recordings and annotations.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
