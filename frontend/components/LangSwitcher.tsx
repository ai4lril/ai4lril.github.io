"use client";
import { useEffect, useRef, useState } from "react";
import { LANGUAGES, type Language } from "@/lib/languages";
import { getPreferredLanguage, setPreferredLanguage } from "@/lib/langPreference";

export default function LangSwitcher() {
    const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[0]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const listRef = useRef<HTMLUListElement | null>(null);

    // Initialize from localStorage if available
    useEffect(() => {
        const saved = getPreferredLanguage();
        if (saved) {
            const found = LANGUAGES.find(l => l.code === saved);
            if (found) setSelectedLanguage(found);
        }
    }, []);

    // Outside click close (pointerdown for better mobile/safari support)
    useEffect(() => {
        const onDocClick = (e: Event) => {
            if (!wrapperRef.current) return;
            if (!wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener('pointerdown', onDocClick as EventListener);
        return () => document.removeEventListener('pointerdown', onDocClick as EventListener);
    }, []);

    // Focus first option when menu opens
    useEffect(() => {
        if (isOpen && listRef.current) {
            const first = listRef.current.querySelector('button');
            (first as HTMLButtonElement | null)?.focus();
        }
    }, [isOpen]);

    const choose = (lang: Language) => {
        setSelectedLanguage(lang);
        setIsOpen(false);
        try {
            setPreferredLanguage(lang.code);
            window.dispatchEvent(new CustomEvent('language-changed', { detail: lang.code }));
        } catch { }
    };

    return (
        <div ref={wrapperRef} className="relative inline-block text-left z-100">
            <button
                className="group flex items-center justify-between gap-3 border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white/95 hover:bg-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls="langswitcher-list"
            >
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                        selectedLanguage.code === 'hi' ? 'bg-orange-400' :
                        selectedLanguage.code === 'mr' ? 'bg-blue-400' :
                        selectedLanguage.code === 'kok' ? 'bg-green-400' :
                        selectedLanguage.code === 'en' ? 'bg-purple-400' : 'bg-gray-400'
                    }`}></div>
                    <span className="capitalize font-medium text-gray-800">{selectedLanguage.name}</span>
                </div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transform transition-all duration-300 ${isOpen ? "rotate-180 text-blue-600" : "rotate-0 text-gray-500"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-100 mt-2 w-56 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-2xl right-0 animate-in slide-in-from-top-2 duration-200">
                    <div className="p-2">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-1">Select Language</div>
                    </div>
                    <ul
                        ref={listRef}
                        className="py-1"
                        role="listbox"
                        aria-label="Select language"
                        id="langswitcher-list"
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') setIsOpen(false);
                        }}
                    >
                        {LANGUAGES.map((lang) => (
                            <li key={lang.code}>
                                <button
                                    className={`group w-full text-left px-4 py-3 text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-all duration-200 flex items-center gap-3 ${
                                        selectedLanguage.code === lang.code
                                            ? "bg-blue-100 font-semibold text-blue-900 border-l-4 border-blue-500"
                                            : "text-gray-700 hover:text-blue-900"
                                    }`}
                                    onClick={() => choose(lang)}
                                    role="option"
                                    aria-selected={selectedLanguage.code === lang.code}
                                >
                                    <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                                        lang.code === 'hi' ? 'bg-orange-400' :
                                        lang.code === 'mr' ? 'bg-blue-400' :
                                        lang.code === 'kok' ? 'bg-green-400' :
                                        lang.code === 'en' ? 'bg-purple-400' : 'bg-gray-400'
                                    }`}></div>
                                    <span className="flex-1">{lang.name}</span>
                                    {selectedLanguage.code === lang.code && (
                                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
