"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Modes from "@/components/Modes";
import TokenModes from "@/components/TokenModes";
import TranslateModes from "@/components/TranslateModes";
import AffectModes from "@/components/AffectModes";

import LangSwitcher from './LangSwitcher';


interface NavbarItem {
    name: string;
    path: string;
}

const navbarItems: NavbarItem[] = [
    { name: 'Home', path: '/' },
    { name: 'Scripted Speech', path: '/speak' },
    { name: 'Spontaneous Speech', path: '/question' },
    { name: 'Token Classification', path: '/ner' },
    { name: 'Translation', path: '/translate' },
    { name: 'Affect', path: '/sentiment' },
];

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const pathname = usePathname();

    return (
        <nav className='sticky top-0 z-50' role="navigation" aria-label="Primary">
            <div className="py-3 md:py-4 glass shadow-sm overflow-visible relative z-[70]">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="logo">
                        <Link href="/" className="text-2xl font-bold" style={{ color: 'var(--brand-900)' }}>
                            {/* Indian Low-Resourced Language Human Rights Foundation */}
                            {/* Indian Linguistic Heritage Research Foundation */}
                            ILHRF 
                            {/* <br />
                            <span className="text-sm text-gray-500">
                                Open-source platform for collecting, validating, and curating high-quality language data for Indian languages.
                            </span> */}
                        </Link>
                    </div>

                    <div className="flex items-center">
                        {/* Desktop menu */}
                        <div className="hidden md:flex">
                            <ul className="flex items-center text-center gap-8">
                                {navbarItems.map((item) => {
                                    const isActive = pathname === item.path;
                                    return (
                                        <li key={item.path}>
                                            <Link
                                                href={item.path}
                                                aria-current={isActive ? 'page' : undefined}
                                                className={`relative pb-1 text-center transition-colors duration-300
                                                    ${isActive ? 'text-indigo-700' : 'text-gray-700 hover:text-indigo-600'}
                                                    after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-indigo-600 after:rounded-full
                                                    after:transition-all after:duration-300 hover:after:w-full`}
                                                style={{ display: "inline-block" }}
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        <div className="flex justify-center items-center gap-3">
                            <Link
                                href="/login"
                                className="ml-8 hidden sm:block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-full shadow transition-all duration-200 border-0 outline-none focus:ring-2 focus:ring-slate-300"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Login
                            </Link>
                        </div>

                        <div className="ml-8">
                            <LangSwitcher />
                        </div>

                        {/* Hamburger menu for mobile */}
                        <div className="md:hidden pl-5">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                aria-label="Toggle menu"
                                aria-controls="mobile-menu"
                                aria-expanded={isMenuOpen}
                                className="focus:outline-none rounded-full p-2 hover:bg-gray-100 transition-colors duration-300"
                                type="button"
                            >
                                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    {isMenuOpen
                                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    }
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                <div
                    id="mobile-menu"
                    className={`md:hidden fixed w-[100vw] rounded-b-2xl mt-4 glass border-t border-gray-100 shadow-xl/20 z-50
                        transition-transform duration-500 ease-in-out
                        ${isMenuOpen ? "translate-y-0 opacity-100 pointer-events-auto" : "-translate-y-10 opacity-0 pointer-events-none"}`}
                    style={{ willChange: "transform, opacity" }}
                >
                    <ul className="flex flex-col space-y-4 py-4">

                        {navbarItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <li key={item.path}>
                                    <Link
                                        href={item.path}
                                        aria-current={isActive ? 'page' : undefined}
                                        className={`relative px-4 py-2 flex justify-center transition-colors duration-300
                                            ${isActive ? 'text-indigo-700' : 'text-gray-700 hover:text-indigo-600'}
                                            after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-1 after:w-0 after:h-[2px] after:bg-indigo-600 after:rounded-full
                                            after:transition-all after:duration-300 hover:after:w-3/4`}
                                        style={{ display: "inline-block" }}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                        <li>
                            <div className="flex justify-center items-center">
                                <Link
                                    href="/login"
                                    className="sm:hidden border border-slate-400 text-gray-700 bg-white hover:bg-blue-50 px-5 py-2 text-sm rounded-full transition-colors duration-200 shadow-sm"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Login
                                </Link>
                            </div>
                        </li>
                    </ul>
                </div>


            </div>
            <Modes />
            <TokenModes />
            <TranslateModes />
            <AffectModes />
        </nav>
    )
}
