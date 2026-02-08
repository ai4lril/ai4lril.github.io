import Link from 'next/link';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-slate-600">
                {items.map((item, index) => (
                    <li key={index} className="flex items-center">
                        {index > 0 && (
                            <svg
                                className="w-4 h-4 mx-2 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        )}
                        {item.href ? (
                            <Link href={item.href} className="hover:text-indigo-600 transition-colors">
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-slate-900 font-medium">{item.label}</span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
