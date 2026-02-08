'use client';

import { useEffect, useState } from 'react';

export interface Heading {
    id: string;
    text: string;
    level: number;
}

export function useHeadings() {
    const [headings, setHeadings] = useState<Heading[]>([]);

    useEffect(() => {
        const extractHeadings = () => {
            const headingElements = Array.from(document.querySelectorAll('main h2, main h3')).map((el) => {
                let { id } = el;
                if (!id) {
                    id = el.textContent?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || '';
                    el.id = id;
                }
                return {
                    id,
                    text: el.textContent || '',
                    level: parseInt(el.tagName.charAt(1)),
                };
            });

            setHeadings(headingElements);
        };

        // Extract headings after a short delay to ensure DOM is ready
        const timeoutId = setTimeout(extractHeadings, 100);
        extractHeadings(); // Also try immediately

        // Re-extract on route changes
        const observer = new MutationObserver(extractHeadings);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            clearTimeout(timeoutId);
            observer.disconnect();
        };
    }, []);

    return headings;
}
