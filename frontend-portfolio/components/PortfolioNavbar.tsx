"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const CROWDSOURCING_URL = process.env.NEXT_PUBLIC_CROWDSOURCING_URL || 'https://crowdsourcing.ilhrf.org';

interface NavbarItem {
  name: string;
  path: string;
  external?: boolean;
}

const navbarItems: NavbarItem[] = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
  { name: 'Terms', path: '/terms' },
  { name: 'Privacy', path: '/privacy' },
];

export default function PortfolioNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50" role="navigation" aria-label="Primary">
      <div className="py-3 md:py-4 neu-raised shadow-sm overflow-visible relative z-70 rounded-b-2xl md:rounded-2xl">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="logo">
            <Link href="/" className="text-2xl font-bold" style={{ color: 'var(--brand-900)' }}>
              ILHRF
            </Link>
          </div>

          <div className="flex items-center">
            <div className="hidden md:flex">
              <ul className="flex items-center text-center gap-8">
                {navbarItems.map((item) => {
                  const isActive = pathname === item.path;
                  const linkClass = `relative pb-1 text-center transition-colors duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center
                    ${isActive ? 'text-indigo-700' : 'text-gray-700 hover:text-indigo-600'}
                    after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-indigo-600 after:rounded-full
                    after:transition-all after:duration-300 hover:after:w-full`;
                  return (
                    <li key={item.path}>
                      {item.external ? (
                        <a
                          href={item.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={linkClass}
                          style={{ display: 'inline-flex' }}
                        >
                          {item.name}
                        </a>
                      ) : (
                        <Link
                          href={item.path}
                          aria-current={isActive ? 'page' : undefined}
                          className={linkClass}
                          style={{ display: 'inline-flex' }}
                        >
                          {item.name}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex justify-center items-center gap-3">
              <a
                href={`${CROWDSOURCING_URL}/login`}
                className="ml-8 hidden sm:block bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold px-6 py-2 rounded-full shadow-md shadow-indigo-500/20 transition-all duration-200 border-0 outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[44px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </a>
              <a
                href={`${CROWDSOURCING_URL}/speak`}
                className="ml-4 hidden sm:block neu-btn-secondary px-5 py-2 text-sm rounded-full transition-colors duration-200 min-h-[44px] flex items-center justify-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Start Contributing
              </a>
            </div>

            <div className="md:hidden pl-5">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
                aria-controls="mobile-menu"
                aria-expanded={isMenuOpen}
                className="focus:outline-none rounded-full p-2 hover:bg-gray-100 transition-colors duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
                type="button"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div
          id="mobile-menu"
          className={`md:hidden fixed w-screen rounded-b-2xl mt-4 neu-raised border-t border-gray-100 shadow-xl/20 z-50
            transition-transform duration-500 ease-in-out
            ${isMenuOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-10 opacity-0 pointer-events-none'}`}
          style={{ willChange: 'transform, opacity' }}
        >
          <ul className="flex flex-col space-y-4 py-4">
            {navbarItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.path}>
                  {item.external ? (
                    <a
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`relative px-4 py-4 flex justify-center transition-colors duration-300 min-h-[44px] items-center
                        ${isActive ? 'text-indigo-700' : 'text-gray-700 hover:text-indigo-600'}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </a>
                  ) : (
                    <Link
                      href={item.path}
                      aria-current={isActive ? 'page' : undefined}
                      className={`relative px-4 py-4 flex justify-center transition-colors duration-300 min-h-[44px] items-center
                        ${isActive ? 'text-indigo-700' : 'text-gray-700 hover:text-indigo-600'}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              );
            })}
            <li>
              <div className="flex flex-col gap-2 px-4">
                <a
                  href={`${CROWDSOURCING_URL}/login`}
                  className="neu-btn-secondary px-5 py-2 text-sm rounded-full text-center min-h-[44px] flex items-center justify-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </a>
                <a
                  href={`${CROWDSOURCING_URL}/speak`}
                  className="bg-linear-to-r from-indigo-600 to-indigo-700 text-white px-5 py-2 text-sm rounded-full text-center min-h-[44px] flex items-center justify-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Start Contributing
                </a>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
