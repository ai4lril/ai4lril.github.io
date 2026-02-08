import Link from 'next/link';

interface PageNavigationProps {
    previous?: { title: string; href: string };
    next?: { title: string; href: string };
}

export default function PageNavigation({ previous, next }: PageNavigationProps) {
    if (!previous && !next) return null;

    return (
        <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between">
            {previous ? (
                <Link
                    href={previous.href}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <div>
                        <div className="text-xs text-slate-500">Previous</div>
                        <div>{previous.title}</div>
                    </div>
                </Link>
            ) : (
                <div></div>
            )}
            {next && (
                <Link
                    href={next.href}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-right"
                >
                    <div>
                        <div className="text-xs text-slate-500">Next</div>
                        <div>{next.title}</div>
                    </div>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            )}
        </div>
    );
}
