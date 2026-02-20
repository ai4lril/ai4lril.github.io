"use client";

import Link from 'next/link';

const CROWDSOURCING_URL = process.env.NEXT_PUBLIC_CROWDSOURCING_URL || 'https://crowdsourcing.ilhrf.org';

export default function HomePage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative w-full py-16 md:py-24 px-4 animate-fade-in-up">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 animate-bounce-in">
                            <span className="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Indian Linguistic Heritage Research Foundation
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto animate-fade-in-up animate-delay-200">
                            Preserving and promoting the rich linguistic diversity of India through open-source technology and community-driven research.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animate-delay-400">
                            <a
                                href={`${CROWDSOURCING_URL}/speak`}
                                className="px-8 py-4 bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold rounded-full shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 transform hover:scale-105"
                            >
                                Start Contributing
                            </a>
                            <Link
                                href="/about"
                                className="px-8 py-4 neu-btn-secondary font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
                            >
                                Learn More
                            </Link>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 animate-fade-in-up animate-delay-600">
                        <div className="neu-raised rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/60">
                            <div className="text-3xl md:text-4xl font-extrabold text-indigo-700 mb-2">23</div>
                            <div className="text-sm md:text-base text-gray-600 font-medium">Languages</div>
                        </div>
                        <div className="neu-raised rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/60">
                            <div className="text-3xl md:text-4xl font-extrabold text-emerald-700 mb-2">6</div>
                            <div className="text-sm md:text-base text-gray-600 font-medium">Scripts</div>
                        </div>
                        <div className="neu-raised rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/60">
                            <div className="text-3xl md:text-4xl font-extrabold text-amber-700 mb-2">1000+</div>
                            <div className="text-sm md:text-base text-gray-600 font-medium">Contributions</div>
                        </div>
                        <div className="neu-raised rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/60">
                            <div className="text-3xl md:text-4xl font-extrabold text-purple-700 mb-2">Open</div>
                            <div className="text-sm md:text-base text-gray-600 font-medium">Source</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="w-full py-16 md:py-24 px-4 bg-(--neu-bg-alt)/50">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
                        How You Can Contribute
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <a
                            href={`${CROWDSOURCING_URL}/speak`}
                            className="neu-raised rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group border border-white/60"
                        >
                            <div className="p-3 rounded-full bg-indigo-100 w-fit mb-4 group-hover:bg-indigo-200 transition-colors">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-800">Scripted Speech</h3>
                            <p className="text-gray-600">
                                Record audio for predefined sentences to help build speech recognition datasets.
                            </p>
                        </a>

                        <a
                            href={`${CROWDSOURCING_URL}/question`}
                            className="neu-raised rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group border border-white/60"
                        >
                            <div className="p-3 rounded-full bg-emerald-100 w-fit mb-4 group-hover:bg-emerald-200 transition-colors">
                                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-800">Spontaneous Speech</h3>
                            <p className="text-gray-600">
                                Answer questions naturally to contribute conversational speech data.
                            </p>
                        </a>

                        <a
                            href={`${CROWDSOURCING_URL}/write`}
                            className="neu-raised rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group border border-white/60"
                        >
                            <div className="p-3 rounded-full bg-amber-100 w-fit mb-4 group-hover:bg-amber-200 transition-colors">
                                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-800">Write Sentences</h3>
                            <p className="text-gray-600">
                                Add sentences in your language to expand our text corpus.
                            </p>
                        </a>

                        <a
                            href={`${CROWDSOURCING_URL}/ner`}
                            className="neu-raised rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group border border-white/60"
                        >
                            <div className="p-3 rounded-full bg-purple-100 w-fit mb-4 group-hover:bg-purple-200 transition-colors">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-800">Token Classification</h3>
                            <p className="text-gray-600">
                                Annotate named entities to help build NLP models for Indian languages.
                            </p>
                        </a>

                        <a
                            href={`${CROWDSOURCING_URL}/translate`}
                            className="neu-raised rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group border border-white/60"
                        >
                            <div className="p-3 rounded-full bg-pink-100 w-fit mb-4 group-hover:bg-pink-200 transition-colors">
                                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-800">Translation</h3>
                            <p className="text-gray-600">
                                Translate sentences between languages to create parallel corpora.
                            </p>
                        </a>

                        <a
                            href={`${CROWDSOURCING_URL}/sentiment`}
                            className="neu-raised rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group border border-white/60"
                        >
                            <div className="p-3 rounded-full bg-blue-100 w-fit mb-4 group-hover:bg-blue-200 transition-colors">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-800">Affect Analysis</h3>
                            <p className="text-gray-600">
                                Label sentiment and emotion to enhance language understanding models.
                            </p>
                        </a>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="w-full py-16 md:py-24 px-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="neu-raised rounded-2xl p-8 md:p-12 text-center border border-white/60">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                            Ready to Make a Difference?
                        </h2>
                        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                            Join our community of contributors and help preserve India&apos;s linguistic heritage for future generations.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href={`${CROWDSOURCING_URL}/login`}
                                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            >
                                Get Started
                            </a>
                            <a
                                href={`${CROWDSOURCING_URL}/docs`}
                                className="px-8 py-4 neu-btn-secondary font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
                            >
                                View API Docs
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
