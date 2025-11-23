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
        <div className="relative border-t border-gray-200/70 bg-white/60 backdrop-blur z-30 overflow-visible">
            <div className="container mx-auto relative">
                <ul className="flex flex-wrap w-full justify-center gap-3 py-2.5">
                    {modes.map(m => {
                        const active = matches(m.href);
                        return (
                            <li key={m.href}>
                                <Link href={m.href} className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${active ? 'bg-indigo-600 text-white' : 'bg-white/80 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200'}`}>{m.name}</Link>
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
