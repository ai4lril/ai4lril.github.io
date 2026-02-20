"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

type Mode = { name: string; href: string };

export default function SubNavbar({ modes, rightSlot }: { modes: Mode[]; rightSlot?: ReactNode }) {
    const pathname = usePathname() ?? "";
    const normalize = (s: string) => s.replace(/\/+$/, "");
    const matches = (href: string) => normalize(pathname).endsWith(normalize(href));
    const isVisible = modes.some(m => matches(m.href));
    if (!isVisible) return null;

    return (
        <div className="relative border-t border-gray-200/70 neu-flat z-30 overflow-visible overflow-x-auto scrollbar-hide">
            <div className="container mx-auto relative">
                <ul className="flex flex-wrap w-full justify-center gap-3 py-2.5 min-w-max px-2">
                    {modes.map(m => {
                        const active = matches(m.href);
                        return (
                            <li key={m.href}>
                                <Link href={m.href} className={`px-4 py-2 rounded-full text-sm transition-all duration-200 min-h-[44px] flex items-center min-w-[120px] justify-center ${active ? 'bg-linear-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/20' : 'neu-btn-secondary'}`}>{m.name}</Link>
                            </li>
                        );
                    })}
                </ul>
                {rightSlot && (
                    <div className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 items-center gap-2">
                        {rightSlot}
                    </div>
                )}
            </div>
        </div>
    );
}
