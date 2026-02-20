'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import TableOfContents from '@/components/docs/TableOfContents';
import { useHeadings } from '@/components/docs/useHeadings';

interface NavItem {
    title: string;
    path: string;
    children?: NavItem[];
}

const navItems: NavItem[] = [
    {
        title: 'Getting Started',
        path: '/docs',
        children: [
            { title: 'Introduction', path: '/docs' },
            { title: 'Authentication', path: '/docs/authentication' },
            { title: 'API Keys', path: '/docs/api-keys' },
            { title: 'Rate Limiting', path: '/docs/rate-limiting' },
            { title: 'Supported Languages', path: '/docs/languages' },
        ],
    },
    {
        title: 'Scripted Speech',
        path: '/docs/speech',
        children: [
            { title: 'Get Sentences', path: '/docs/speech/get-sentences' },
            { title: 'Submit Recording', path: '/docs/speech/submit-recording' },
            { title: 'Listen Audio', path: '/docs/speech/listen-audio' },
            { title: 'Submit Validation', path: '/docs/speech/submit-validation' },
        ],
    },
    {
        title: 'Spontaneous Speech',
        path: '/docs/question',
        children: [
            { title: 'Submit Question', path: '/docs/question/submit-question' },
            { title: 'Get Questions', path: '/docs/question/get-questions' },
            { title: 'Submit Answer', path: '/docs/question/submit-answer' },
        ],
    },
    {
        title: 'Write',
        path: '/docs/write',
        children: [
            { title: 'Submit Sentences', path: '/docs/write/submit-sentences' },
        ],
    },
    {
        title: 'Transcription',
        path: '/docs/transcription',
        children: [
            { title: 'Get Audio', path: '/docs/transcription/get-audio' },
            { title: 'Submit Transcription', path: '/docs/transcription/submit' },
            { title: 'Review Transcription', path: '/docs/transcription/review' },
        ],
    },
    {
        title: 'NLP',
        path: '/docs/nlp',
        children: [
            { title: 'NER Sentences', path: '/docs/nlp/ner-sentences' },
            { title: 'NER Annotation', path: '/docs/nlp/ner-annotation' },
            { title: 'POS Sentences', path: '/docs/nlp/pos-sentences' },
            { title: 'POS Annotation', path: '/docs/nlp/pos-annotation' },
            { title: 'Translation', path: '/docs/nlp/translation' },
            { title: 'Sentiment Analysis', path: '/docs/nlp/sentiment' },
            { title: 'Emotion Recognition', path: '/docs/nlp/emotion' },
        ],
    },
];

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [openSections, setOpenSections] = useState<Set<string>>(new Set());
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const headings = useHeadings();

    useEffect(() => {
        // Auto-expand section containing current page
        navItems.forEach((section) => {
            if (section.children) {
                const isActive = section.children.some(
                    (item) => item.path === pathname
                );
                if (isActive) {
                    setOpenSections((prev) => new Set(prev).add(section.path));
                }
            }
        });
    }, [pathname]);

    const toggleSection = (path: string) => {
        setOpenSections((prev) => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    };

    // Filter nav items based on search
    const filteredNavItems = navItems.map((section) => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (section.children) {
                const filteredChildren = section.children.filter(
                    (item) =>
                        item.title.toLowerCase().includes(query) ||
                        section.title.toLowerCase().includes(query)
                );
                if (filteredChildren.length > 0) {
                    return { ...section, children: filteredChildren };
                }
                return null;
            } else if (section.title.toLowerCase().includes(query)) {
                return section;
            }
            return null;
        }
        return section;
    }).filter(Boolean) as NavItem[];

    return (
        <div className="flex min-h-screen">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto w-64 border-r border-slate-200 neu-flat h-screen overflow-y-auto transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                <div className="p-4 flex items-center justify-between">
                    <Link href="/docs" className="text-xl font-bold" style={{ color: 'var(--brand-900)' }}>
                        API Documentation
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 hover:bg-slate-100 rounded"
                        aria-label="Close sidebar"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Search */}
                <div className="px-4 mb-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search docs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 pl-9 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <svg
                            className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <nav className="px-4 pb-8">
                    {filteredNavItems.map((section) => (
                        <div key={section.path} className="mb-4">
                            {section.children ? (
                                <>
                                    <button
                                        onClick={() => toggleSection(section.path)}
                                        className="w-full flex items-center justify-between py-2 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        <span>{section.title}</span>
                                        <svg
                                            className={`w-4 h-4 transition-transform ${openSections.has(section.path) ? 'rotate-90' : ''
                                                }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                    {openSections.has(section.path) && (
                                        <div className="ml-4 mt-1 space-y-1">
                                            {section.children.map((item) => (
                                                <Link
                                                    key={item.path}
                                                    href={item.path}
                                                    className={`block py-2 px-3 text-sm rounded-lg transition-colors ${pathname === item.path
                                                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                        }`}
                                                >
                                                    {item.title}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link
                                    href={section.path}
                                    className={`block py-2 px-3 text-sm font-semibold rounded-lg transition-colors ${pathname === section.path
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-slate-700 hover:bg-slate-100'
                                        }`}
                                >
                                    {section.title}
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                    {/* Mobile menu button */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden mb-4 p-2 hover:bg-slate-100 rounded"
                        aria-label="Open sidebar"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    {children}
                </div>
            </main>

            {/* Table of Contents */}
            <TableOfContents headings={headings} />
        </div>
    );
}
