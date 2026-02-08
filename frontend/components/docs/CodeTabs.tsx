'use client';

import { useState } from 'react';
import CodeBlock from './CodeBlock';

interface CodeExample {
    language: string;
    label: string;
    code: string;
}

interface CodeTabsProps {
    examples: CodeExample[];
}

export default function CodeTabs({ examples }: CodeTabsProps) {
    const [activeTab, setActiveTab] = useState(0);

    if (examples.length === 0) return null;

    return (
        <div className="my-4">
            <div className="flex border-b border-slate-200">
                {examples.map((example, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveTab(index)}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === index
                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        {example.label}
                    </button>
                ))}
            </div>
            <div className="mt-0">
                <CodeBlock language={examples[activeTab].language}>
                    {examples[activeTab].code}
                </CodeBlock>
            </div>
        </div>
    );
}
