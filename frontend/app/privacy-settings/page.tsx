"use client";

import Link from "next/link";
import { useState, useEffect } from 'react';
import { getConsentPreferences, showConsentPreferences } from '@/lib/gdprConsent';
import { getAccessibilitySettings, updateAccessibilitySettings, toggleHighContrast, toggleFontSize, toggleReducedMotion, AccessibilitySettings } from '@/lib/accessibility';
import { withdrawConsent } from '@/lib/gdprConsent';

interface ConsentPreferences {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    functional: boolean;
    dataCollection: boolean;
    dataProcessing: boolean;
    dataSharing: boolean;
}

export default function PrivacySettingsPage() {
    const [consentPrefs, setConsentPrefs] = useState<ConsentPreferences | null>(null);
    const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings | null>(null);

    useEffect(() => {
        setConsentPrefs(getConsentPreferences());
        setAccessibilitySettings(getAccessibilitySettings());
    }, []);

    const handleWithdrawConsent = () => {
        if (confirm('Are you sure you want to withdraw your consent? This will delete all your preferences and show the consent banner again.')) {
            withdrawConsent();
            setConsentPrefs(null);
        }
    };

    const handleAccessibilityChange = (key: keyof AccessibilitySettings, value: string | boolean) => {
        if (!accessibilitySettings) return;

        const newSettings = { ...accessibilitySettings, [key]: value };
        setAccessibilitySettings(newSettings);
        updateAccessibilitySettings({ [key]: value });
    };

    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy & Accessibility Settings</h1>
                <p className="text-gray-600">
                    Manage your privacy preferences, consent settings, and accessibility options.
                </p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    {[
                        { step: "1", title: "Review cookies", detail: "See what’s enabled and why" },
                        { step: "2", title: "Set data consents", detail: "Choose per audio/text/metadata" },
                        { step: "3", title: "Track requests", detail: "Open the Data Rights Portal" },
                    ].map((item) => (
                        <div key={item.step} className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                            <p className="text-xs uppercase text-slate-500">Step {item.step}</p>
                            <p className="font-semibold text-slate-800">{item.title}</p>
                            <p className="text-slate-600">{item.detail}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-8">
                {/* GDPR Consent Section */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookie & Consent Preferences</h2>

                    {consentPrefs ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium">Necessary Cookies</span>
                                    <span className="text-green-600 font-semibold">Always Active</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium">Analytics Cookies</span>
                                    <span className={`font-semibold ${consentPrefs.analytics ? 'text-green-600' : 'text-red-600'}`}>
                                        {consentPrefs.analytics ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium">Functional Cookies</span>
                                    <span className={`font-semibold ${consentPrefs.functional ? 'text-green-600' : 'text-red-600'}`}>
                                        {consentPrefs.functional ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium">Data Collection</span>
                                    <span className={`font-semibold ${consentPrefs.dataCollection ? 'text-green-600' : 'text-red-600'}`}>
                                        {consentPrefs.dataCollection ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                <button
                                    onClick={showConsentPreferences}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                                >
                                    Modify Preferences
                                </button>
                                <button
                                    onClick={handleWithdrawConsent}
                                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                                >
                                    Withdraw Consent
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-600 mb-4">No consent preferences found.</p>
                            <button
                                onClick={showConsentPreferences}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                            >
                                Set Preferences
                            </button>
                        </div>
                    )}
                </div>

                {consentPrefs && (
                    <section className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Consents by data type</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                            <div className="p-4 border border-gray-200 rounded-lg">
                                <h3 className="font-semibold text-gray-900">Audio</h3>
                                <p className="text-sm text-gray-600 mt-1">Speech clips, spontaneous prompts</p>
                                <p className={`mt-2 text-xs font-semibold ${consentPrefs.dataCollection ? 'text-green-600' : 'text-red-600'}`}>
                                    {consentPrefs.dataCollection ? 'Enabled for research' : 'Disabled'}
                                </p>
                            </div>
                            <div className="p-4 border border-gray-200 rounded-lg">
                                <h3 className="font-semibold text-gray-900">Text & annotations</h3>
                                <p className="text-sm text-gray-600 mt-1">Transcripts, POS/NER labels</p>
                                <p className={`mt-2 text-xs font-semibold ${consentPrefs.dataProcessing ? 'text-green-600' : 'text-red-600'}`}>
                                    {consentPrefs.dataProcessing ? 'Processing allowed' : 'Processing paused'}
                                </p>
                            </div>
                            <div className="p-4 border border-gray-200 rounded-lg">
                                <h3 className="font-semibold text-gray-900">Metadata & analytics</h3>
                                <p className="text-sm text-gray-600 mt-1">Language choices, device info</p>
                                <p className={`mt-2 text-xs font-semibold ${consentPrefs.analytics ? 'text-green-600' : 'text-red-600'}`}>
                                    {consentPrefs.analytics ? 'Anonymous metrics enabled' : 'Analytics disabled'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={showConsentPreferences}
                            className="mt-4 inline-flex px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
                        >
                            Adjust data-type consents
                        </button>
                    </section>
                )}

                {/* Accessibility Settings Section */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Accessibility Settings</h2>

                    {accessibilitySettings && (
                        <div className="space-y-6">
                            {/* Color Scheme */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Color Scheme
                                </label>
                                <select
                                    value={accessibilitySettings.colorScheme}
                                    onChange={(e) => handleAccessibilityChange('colorScheme', e.target.value)}
                                    className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                    <option value="high-contrast">High Contrast</option>
                                </select>
                            </div>

                            {/* Font Size */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Font Size
                                </label>
                                <div className="flex items-center gap-4">
                                    <select
                                        value={accessibilitySettings.fontSize}
                                        onChange={(e) => handleAccessibilityChange('fontSize', e.target.value)}
                                        className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="small">Small</option>
                                        <option value="medium">Medium</option>
                                        <option value="large">Large</option>
                                    </select>
                                    <button
                                        onClick={toggleFontSize}
                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                                    >
                                        Toggle Size
                                    </button>
                                </div>
                            </div>

                            {/* Reduced Motion */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Reduced Motion
                                    </label>
                                    <p className="text-sm text-gray-600">Minimize animations and transitions</p>
                                </div>
                                <button
                                    onClick={toggleReducedMotion}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${accessibilitySettings.reducedMotion ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${accessibilitySettings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* High Contrast Toggle */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        High Contrast
                                    </label>
                                    <p className="text-sm text-gray-600">Increase contrast for better visibility</p>
                                </div>
                                <button
                                    onClick={toggleHighContrast}
                                    className={`px-4 py-2 rounded-md font-semibold transition-colors ${accessibilitySettings.colorScheme === 'high-contrast'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Toggle Contrast
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Accessibility documentation</h2>
                    <p className="text-gray-600 mb-3">Need help configuring screen reader modes, captions, or keyboard navigation?</p>
                    <ul className="list-disc ml-6 space-y-2 text-sm text-gray-700">
                        <li>Screen reader tips for VoiceOver, NVDA, and TalkBack.</li>
                        <li>High-contrast modes tested with WCAG 2.1 AA.</li>
                        <li>Reduced motion guidelines for vestibular safety.</li>
                    </ul>
                    <Link href="/guides/accessibility" className="inline-flex mt-3 text-indigo-600 hover:underline">
                        View accessibility guide →
                    </Link>
                </div>

                {/* Data Rights Section */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Data Rights</h2>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border border-gray-200 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-2">Right to Access</h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    You have the right to request a copy of all personal data we hold about you.
                                </p>
                                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    Request Data Access
                                </button>
                            </div>

                            <div className="p-4 border border-gray-200 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-2">Right to Deletion</h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    You can request the deletion of your personal data at any time.
                                </p>
                                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    Request Data Deletion
                                </button>
                            </div>

                            <div className="p-4 border border-gray-200 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-2">Data Portability</h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    Request your data in a structured, machine-readable format.
                                </p>
                                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    Request Data Export
                                </button>
                            </div>

                            <div className="p-4 border border-gray-200 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-2">Contact Us</h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    Have questions about your data rights? Get in touch.
                                </p>
                                <a href="/contact" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    Contact Support
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Information Section */}
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Privacy Information</h3>
                    <div className="text-sm text-blue-800 space-y-2">
                        <p>
                            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
                        </p>
                        <p>
                            Your privacy preferences are stored locally in your browser and are never transmitted to our servers without your explicit consent.
                        </p>
                        <p>
                            For more information about how we handle your data, please review our <a href="/privacy" className="underline hover:text-blue-900">Privacy Policy</a>.
                        </p>
                        <p>
                            Need to escalate or download data? Visit the <Link href="/data-rights" className="underline hover:text-blue-900">Data Rights Portal</Link>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
