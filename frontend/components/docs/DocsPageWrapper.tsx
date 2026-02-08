import { ReactNode } from 'react';
import HttpMethodBadge from './HttpMethodBadge';
import AuthBadge from './AuthBadge';
import Breadcrumbs from './Breadcrumbs';
import PageNavigation from './PageNavigation';

interface DocsPageWrapperProps {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    requiresAuth: boolean;
    breadcrumbs: Array<{ label: string; href?: string }>;
    previous?: { title: string; href: string };
    next?: { title: string; href: string };
    children: ReactNode;
}

export default function DocsPageWrapper({
    method,
    requiresAuth,
    breadcrumbs,
    previous,
    next,
    children,
}: DocsPageWrapperProps) {
    return (
        <>
            <Breadcrumbs items={breadcrumbs} />
            <div className="flex items-center gap-3 mb-4">
                <HttpMethodBadge method={method} />
                <AuthBadge required={requiresAuth} />
            </div>
            {children}
            <PageNavigation previous={previous} next={next} />
        </>
    );
}
