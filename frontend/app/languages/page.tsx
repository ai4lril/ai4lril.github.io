import { indianLanguages, type IndianLanguage } from './languages';
import Link from 'next/link';
import type { Metadata } from "next";
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
    title: "Indian Languages | Complete Guide to 23 Supported Languages",
    description: "Comprehensive guide to all 23 languages supported by our platform. Explore Assamese, Bengali, Bodo, Dogri, Gujarati, Hindi, Kannada, Kashmiri, Konkani, Maithili, Malayalam, Manipuri, Marathi, Nepali, Odia, Punjabi, Sanskrit, Santhali, Sindhi, Tamil, Telugu, Urdu, and English with detailed linguistic information.",
    keywords: [
        "Indian languages",
        "Assamese language",
        "Bengali language",
        "Bodo language",
        "Dogri language",
        "Gujarati language",
        "Hindi language",
        "Kannada language",
        "Kashmiri language",
        "Konkani language",
        "Maithili language",
        "Malayalam language",
        "Manipuri language",
        "Marathi language",
        "Nepali language",
        "Odia language",
        "Punjabi language",
        "Sanskrit language",
        "Santhali language",
        "Sindhi language",
        "Tamil language",
        "Telugu language",
        "Urdu language",
        "English language",
        "Devanagari script",
        "linguistic diversity India",
        "Indian linguistics",
        "Indo-Aryan languages",
        "Dravidian languages",
        "Sino-Tibetan languages",
        "Austroasiatic languages",
        "scheduled languages India",
        "classical languages India"
    ],
    openGraph: {
        title: "Complete Guide to 23 Languages | Language Data Collection",
        description: "Explore our comprehensive support for 23 languages including Assamese, Bengali, Gujarati, Hindi, Kannada, Malayalam, Marathi, Punjabi, Tamil, Telugu, Urdu, English, and many more. Discover linguistic diversity and cultural heritage.",
        type: "website",
        images: [
            {
                url: "/og-languages.jpg",
                width: 1200,
                height: 630,
                alt: "Complete Guide to 23 Languages Supported by Language Data Collection",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "23 Languages | Complete Linguistic Guide",
        description: "Comprehensive coverage of linguistic diversity - from Assamese to Urdu and English, explore the rich tapestry of languages and scripts.",
        images: ["/og-languages.jpg"],
    },
};

export default function LanguagesPage() {
    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-linear-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-linear-to-tr from-indigo-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-linear-to-r from-cyan-100/15 to-blue-100/15 rounded-full blur-3xl"></div>
            </div>

            <div className="relative container mx-auto py-12 px-4">
                <Breadcrumb items={[{ label: 'Languages', href: '/languages' }]} />
                {/* Header Section */}
                <div className="text-center mb-12 animate-fade-in-up">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-6 animate-bounce-in">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0V1m10 3V1m0 3l1 1v16a2 2 0 01-2 2H6a2 2 0 01-2-2V5l1-1z" />
                        </svg>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4 animate-slide-in-from-top">
                        Indian Languages
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto animate-fade-in-up delay-200">
                        Explore the rich linguistic diversity of India and beyond with our comprehensive guide to 23 supported languages.
                        From ancient Sanskrit to modern regional languages and English, discover the Indo-Aryan, Dravidian, Sino-Tibetan,
                        and Austroasiatic language families that make our linguistic landscape a treasure trove.
                    </p>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in-up delay-300">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/20">
                        <div className="text-3xl font-bold text-blue-600 mb-2">{indianLanguages.length}</div>
                        <div className="text-gray-600 font-medium">Languages Supported</div>
                        <div className="text-xs text-gray-500 mt-1">Indo-Aryan, Dravidian, Sino-Tibetan, Austroasiatic</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/20">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                            {indianLanguages.reduce((sum, lang) => sum + lang.scripts.length, 0)}
                        </div>
                        <div className="text-gray-600 font-medium">Writing Systems</div>
                        <div className="text-xs text-gray-500 mt-1">Devanagari, regional scripts, Roman</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/20">
                        <div className="text-3xl font-bold text-indigo-600 mb-2">1.5B+</div>
                        <div className="text-gray-600 font-medium">Total Speakers</div>
                        <div className="text-xs text-gray-500 mt-1">Across all supported languages</div>
                    </div>
                </div>

                {/* Languages Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {indianLanguages.map((lang: IndianLanguage, index) => (
                        <div
                            key={lang.code}
                            className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up"
                            style={{ animationDelay: `${400 + index * 100}ms` }}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{lang.name}</h2>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">Language Code:</span>
                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">
                                            {lang.code}
                                        </code>
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-linear-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200">
                                        {lang.scripts.length} Script{lang.scripts.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-gray-700 leading-relaxed mb-6 text-sm">
                                {lang.description}
                            </p>

                            {/* Scripts */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Writing Systems
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {lang.scripts.map((script) => (
                                        <span
                                            key={script}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-linear-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200"
                                        >
                                            {script}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Link
                                    href="/speak"
                                    className="flex-1 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl text-center text-sm"
                                >
                                    Contribute Voice
                                </Link>
                                <Link
                                    href="/listen"
                                    className="flex-1 bg-white/90 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-semibold py-3 px-4 rounded-2xl transition-all duration-300 text-center text-sm shadow-sm hover:shadow-md"
                                >
                                    Validate Data
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="mt-16 text-center animate-fade-in-up delay-700">
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 max-w-2xl mx-auto">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Help Preserve Linguistic Diversity</h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Your contributions help preserve and document India&apos;s rich linguistic heritage.
                            Every voice, every validation, and every translation brings us closer to
                            creating comprehensive language resources for future generations.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/speak"
                                className="bg-linear-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                            >
                                Start Contributing
                            </Link>
                            <Link
                                href="/about"
                                className="bg-white/90 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-8 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                                Learn More
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
