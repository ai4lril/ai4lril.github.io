'use client';

import { useState } from 'react';

interface CodeBlockProps {
    children: string;
    language?: string;
    filename?: string;
}

export default function CodeBlock({ children, language = 'bash', filename }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(children);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="relative group my-4 neu-raised rounded-2xl overflow-hidden">
            {filename && (
                <div className="bg-slate-800 text-slate-300 text-xs px-4 py-2 rounded-t-lg border-b border-slate-700">
                    {filename}
                </div>
            )}
            <div className="relative">
                <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto text-sm">
                    <code className={`language-${language}`}>{children}</code>
                </pre>
                <button
                    onClick={copyToClipboard}
                    className="absolute top-2 right-2 p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Copy to clipboard"
                >
                    {copied ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}
