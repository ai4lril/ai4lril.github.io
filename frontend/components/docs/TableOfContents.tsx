'use client';

import { useEffect, useState } from 'react';

interface Heading {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        if (headings.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: '-100px 0px -66%',
                threshold: 0,
            }
        );

        headings.forEach((heading) => {
            const element = document.getElementById(heading.id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => {
            headings.forEach((heading) => {
                const element = document.getElementById(heading.id);
                if (element) {
                    observer.unobserve(element);
                }
            });
        };
    }, [headings]);

    if (headings.length === 0) return null;

    return (
        <nav className="hidden xl:block w-64 pl-8 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto">
            <div className="text-sm font-semibold text-slate-900 mb-4">On This Page</div>
            <ul className="space-y-2">
                {headings.map((heading) => (
                    <li key={heading.id}>
                        <a
                            href={`#${heading.id}`}
                            className={`block py-1 text-sm transition-colors ${heading.level === 2
                                    ? 'font-medium text-slate-700 hover:text-indigo-600'
                                    : 'text-slate-600 hover:text-slate-900 pl-4'
                                } ${activeId === heading.id
                                    ? 'text-indigo-600 font-medium'
                                    : ''
                                }`}
                            onClick={(e) => {
                                e.preventDefault();
                                const element = document.getElementById(heading.id);
                                if (element) {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    // Update URL without scrolling
                                    window.history.pushState(null, '', `#${heading.id}`);
                                }
                            }}
                        >
                            {heading.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
