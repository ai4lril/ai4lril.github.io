"use client";

import { useState, useEffect } from 'react';
import { toggleHighContrast, toggleFontSize, toggleReducedMotion, announceToScreenReader } from '@/lib/accessibility';

export default function AccessibilityWidget() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Announce widget availability to screen readers
        announceToScreenReader('Accessibility controls are available. Press the accessibility button to open settings.');
    }, []);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        announceToScreenReader(isOpen ? 'Accessibility menu closed' : 'Accessibility menu opened');
    };

    const handleHighContrast = () => {
        toggleHighContrast();
        announceToScreenReader('High contrast mode toggled');
    };

    const handleFontSize = () => {
        toggleFontSize();
        announceToScreenReader('Font size changed');
    };

    const handleReducedMotion = () => {
        toggleReducedMotion();
        announceToScreenReader('Reduced motion toggled');
    };

    return (
        <>
            {/* Accessibility Button */}
            <button
                onClick={handleToggle}
                className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-40 focus:outline-none focus:ring-4 focus:ring-blue-300"
                aria-label="Open accessibility settings"
                aria-expanded={isOpen}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            </button>

            {/* Accessibility Menu */}
            {isOpen && (
                <div className="fixed bottom-20 right-4 neu-raised rounded-xl p-4 z-50 min-w-[200px]">
                    <h3 className="font-semibold text-gray-900 mb-3 text-center">Accessibility</h3>

                    <div className="space-y-3">
                        <button
                            onClick={handleHighContrast}
                            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Toggle high contrast mode"
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                                </svg>
                                <span className="text-sm">High Contrast</span>
                            </div>
                            <div className="w-3 h-3 border-2 border-gray-300 rounded-full"></div>
                        </button>

                        <button
                            onClick={handleFontSize}
                            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Change font size"
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                <span className="text-sm">Font Size</span>
                            </div>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </button>

                        <button
                            onClick={handleReducedMotion}
                            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Toggle reduced motion"
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span className="text-sm">Reduced Motion</span>
                            </div>
                            <div className="w-3 h-3 border-2 border-gray-300 rounded-full"></div>
                        </button>

                        <hr className="border-gray-200" />

                        <div className="text-xs text-gray-500 space-y-1">
                            <p><strong>Keyboard shortcuts:</strong></p>
                            <p>• Tab: Navigate</p>
                            <p>• Enter: Activate</p>
                            <p>• Escape: Close menus</p>
                        </div>
                    </div>

                    <button
                        onClick={handleToggle}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-lg"
                        aria-label="Close accessibility menu"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Overlay to close menu when clicking outside */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30"
                    onClick={handleToggle}
                    aria-hidden="true"
                />
            )}
        </>
    );
}
