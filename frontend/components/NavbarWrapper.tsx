"use client";

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function NavbarWrapper() {
    const pathname = usePathname();

    // Don't show navbar on docs pages (they have their own layout)
    if (pathname && pathname.startsWith('/docs')) {
        return null;
    }

    // Don't show navbar on admin pages (they have their own layout)
    if (pathname && pathname.startsWith('/admin')) {
        return null;
    }

    return <Navbar />;
}
