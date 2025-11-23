import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Home",
    description: "Welcome to Language Data Collection - an open-source platform supporting 23 languages including Assamese, Bengali, Gujarati, Hindi, Kannada, Malayalam, Marathi, Punjabi, Tamil, Telugu, Urdu, English, and more. Contribute to advance AI and NLP research.",
    keywords: [
        "language data collection",
        "Indian languages",
        "Assamese language",
        "Bengali language",
        "Gujarati language",
        "Hindi language",
        "Kannada language",
        "Malayalam language",
        "Marathi language",
        "Punjabi language",
        "Tamil language",
        "Telugu language",
        "Urdu language",
        "open source platform",
        "AI training data",
        "NLP research",
        "speech data",
        "text annotation",
        "multilingual datasets",
        "linguistic diversity",
        "Indian linguistics"
    ],
    openGraph: {
        title: "Language Data Collection | 23 Languages Supported",
        description: "Open-source platform supporting 23 languages including Assamese, Bengali, Gujarati, Hindi, Kannada, Malayalam, Marathi, Punjabi, Tamil, Telugu, Urdu, English. Contribute speech, text, and annotations to advance AI and NLP research.",
        type: "website",
        images: [
            {
                url: "/og-home.jpg",
                width: 1200,
                height: 630,
                alt: "Language Data Collection Platform - 23 Languages Supported",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Language Data Collection | 23 Languages",
        description: "Open-source platform for collecting language data across 23 languages including English. Advance AI and NLP research through community contributions.",
        images: ["/og-home.jpg"],
    },
};

export default function Home() {
    return (
        <div className="w-full">
            {/* Structured Data for Homepage */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": "ILHRF",
                        "url": "https://ai4lril.github.io",
                        "logo": "https://ai4lril.github.io/logo.png",
                        "description": "Open-source platform supporting Low-Resourced Indian languages for collecting, validating, and curating high-quality language data for AI and NLP research",
                        "founder": {
                            "@type": "Person",
                            "name": "Alvyn Abranches"
                        },
                        "sameAs": [
                            "https://github.com/ai4lril/ai4lril.github.io"
                        ]
                    })
                }}
            />
            <section className="relative container mx-auto py-12 sm:py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center" aria-labelledby="hero-heading">
                {/* Decorative background */}
                <div className="pointer-events-none absolute -z-10 inset-0">
                    <div className="absolute -top-10 -left-10 w-56 h-56 rounded-full bg-blue-100/50 blur-2xl" />
                    <div className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full bg-indigo-100/50 blur-3xl" />
                </div>
                <header>
                    <h1 id="hero-heading" className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight" style={{ color: 'var(--brand-900)' }}>
                        Contribute to Indian Languages
                    </h1>
                    <p className="mt-4 text-slate-600 text-lg leading-relaxed">
                        Help build open, research-grade datasets for linguistic diversity. From Assamese to Urdu and English, contribute speech, validate recordings,
                        and support AI development across Indo-Aryan, Dravidian, Sino-Tibetan, and Austroasiatic language families.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link href="/speak" className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-300 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
                            <span className="flex items-center gap-2">
                                Contribute
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                        </Link>
                        <Link href="/listen" className="group bg-white/90 hover:bg-white border border-slate-200 text-slate-700 hover:text-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-full hover:scale-105 active:scale-95">
                            <span className="flex items-center gap-2">
                                Validate
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                        </Link>
                        <Link href="/languages" className="group bg-white/90 hover:bg-white border border-slate-200 text-slate-700 hover:text-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-full hover:scale-105 active:scale-95">
                            <span className="flex items-center gap-2">
                                Browse languages
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                                </svg>
                            </span>
                        </Link>
                    </div>
                </header>
                <div className="relative">
                    <div className="glass rounded-2xl p-6 shadow-lg border border-gray-100">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-xl p-4 bg-white/90 border border-slate-200">
                                <div className="text-sm text-slate-600 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4Z" /></svg>
                                    Contribute
                                </div>
                                <div className="mt-2 h-2 rounded bg-gradient-to-r from-indigo-400 to-indigo-600 w-3/4" />
                            </div>
                            <div className="rounded-xl p-4 bg-white/90 border border-slate-200">
                                <div className="text-sm text-slate-600 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                                    Validate
                                </div>
                                <div className="mt-2 h-2 rounded bg-gradient-to-r from-emerald-400 to-teal-500 w-2/3" />
                            </div>
                            <div className="rounded-xl p-4 bg-white/90 border border-slate-200">
                                <div className="text-sm text-slate-600 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="currentColor"><path d="M3 5h18v2H3V5Zm0 6h12v2H3v-2Zm0 6h18v2H3v-2Z" /></svg>
                                    Transcribe
                                </div>
                                <div className="mt-2 h-2 rounded bg-gradient-to-r from-amber-400 to-orange-500 w-1/2" />
                            </div>
                            <div className="rounded-xl p-4 bg-white/90 border border-slate-200">
                                <div className="text-sm text-slate-600 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-fuchsia-600" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25ZM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z" /></svg>
                                    Review
                                </div>
                                <div className="mt-2 h-2 rounded bg-gradient-to-r from-fuchsia-400 to-pink-500 w-2/5" />
                            </div>
                        </div>
                        <div className="mt-6">
                            <div className="text-slate-700 font-medium">Open data, community-led</div>
                            <p className="text-slate-500 text-sm mt-1">Purpose-built for Indian languages and scripts with accessible flows and quality checks.</p>
                        </div>
                    </div>
                    <div className="absolute -z-10 inset-0 -translate-x-6 -translate-y-6 rounded-3xl blur-2xl opacity-30 bg-gradient-to-tr from-indigo-400 to-fuchsia-400" />
                </div>
            </section>

            <section className="w-full bg-gradient-to-r from-indigo-50/80 via-white/70 to-purple-50/80 border-t border-b border-slate-200/70 backdrop-blur-sm">
                <div className="container mx-auto py-8 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
                    <div className="group rounded-xl bg-white/90 hover:bg-white border border-slate-200 p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                        <div className="text-3xl font-extrabold text-indigo-700 mb-1 group-hover:scale-110 transition-transform duration-300">3</div>
                        <div className="text-sm text-slate-600 font-medium">Languages</div>
                        <div className="mt-2 h-1 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="group rounded-xl bg-white/90 hover:bg-white border border-slate-200 p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                        <div className="text-3xl font-extrabold text-emerald-700 mb-1 group-hover:scale-110 transition-transform duration-300">6</div>
                        <div className="text-sm text-slate-600 font-medium">Scripts</div>
                        <div className="mt-2 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="group rounded-xl bg-white/90 hover:bg-white border border-slate-200 p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                        <div className="text-3xl font-extrabold text-amber-700 mb-1 group-hover:scale-110 transition-transform duration-300">100+</div>
                        <div className="text-sm text-slate-600 font-medium">Speakers</div>
                        <div className="mt-2 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="group rounded-xl bg-white/90 hover:bg-white border border-slate-200 p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                        <div className="text-3xl font-extrabold text-fuchsia-700 mb-1 group-hover:scale-110 transition-transform duration-300">1h</div>
                        <div className="text-sm text-slate-600 font-medium">Recorded</div>
                        <div className="mt-2 h-1 bg-gradient-to-r from-fuchsia-400 to-pink-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                </div>
            </section>

            <section className="container mx-auto py-12 md:py-16">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Founder</h2>
                <div className="mt-6 card rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="size-12 rounded-full bg-gradient-to-tr from-blue-200 to-indigo-200 border border-white" />
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-semibold text-slate-800">Alvyn Abranches</h3>
                                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Assistant Professor</span>
                            </div>
                            <p className="mt-2 text-slate-600 text-sm leading-relaxed">
                                Alvyn Abranches is an Assistant Professor with interests in Computational Socio-Linguistics, Low-Resourced Languages, and Zero-Resourced Scripts. He focuses on developing research-driven tools that bridge technology and linguistics to document and revitalize underrepresented languages.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">Computational Socio-Linguistics</span>
                                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">Low-Resourced Languages</span>
                                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">Zero-Resourced Scripts</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="container mx-auto py-12 md:py-16" id="highlights">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
                    <span className="inline-block relative pb-1">Highlights
                        <span className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500"></span>
                    </span>
                </h2>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link href="/about#mission" className="group rounded-2xl p-6 glass border border-slate-200 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] will-change-transform relative overflow-hidden animate-fade-in-up">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-3 relative z-10">
                            <div className="p-2 rounded-full bg-indigo-100 group-hover:bg-indigo-200 transition-colors duration-300 animate-bounce-in">
                                <svg className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm1 14.5h-2V11h2v5.5Zm0-7h-2V7h2v2.5Z" />
                                </svg>
                            </div>
                            Preservation of low-resourced languages
                        </h3>
                        <p className="mt-3 text-slate-600 text-sm leading-relaxed relative z-10 group-hover:text-slate-700 transition-colors duration-300">Languages encode identity, heritage, and unique worldviews. When low-resourced languages fade, communities lose cultural memory and traditional knowledge. We prioritize ethical, participant-first collection to create durable records and enable revitalization.</p>
                        <div className="mt-4 flex items-center text-indigo-600 font-medium text-sm relative z-10 group-hover:translate-x-1 transition-transform duration-300">
                            <span>Learn more</span>
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>
                    <Link href="/about#story" className="group rounded-2xl p-6 glass border border-slate-200 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] will-change-transform relative overflow-hidden animate-fade-in-up animate-delay-200">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-3 relative z-10">
                            <div className="p-2 rounded-full bg-emerald-100 group-hover:bg-emerald-200 transition-colors duration-300 animate-bounce-in animate-delay-200">
                                <svg className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 4c-4.418 0-8 3.134-8 7s3.582 7 8 7 8-3.134 8-7-3.582-7-8-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z" />
                                </svg>
                            </div>
                            Contributions to Indian languages
                        </h3>
                        <p className="mt-3 text-slate-600 text-sm leading-relaxed relative z-10 group-hover:text-slate-700 transition-colors duration-300">We focus on practical resources for Indian languages across scripts and varieties—curating prompts, collecting speech data, and enabling community review for Konkani, Marathi, Hindi, and others. Our goal: reproducible datasets that reflect linguistic diversity and local usage.</p>
                        <div className="mt-4 flex items-center text-emerald-600 font-medium text-sm relative z-10 group-hover:translate-x-1 transition-transform duration-300">
                            <span>Learn more</span>
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>
                    <Link href="/about#focus" className="group rounded-2xl p-6 glass border border-slate-200 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] will-change-transform relative overflow-hidden animate-fade-in-up animate-delay-400">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-3 relative z-10">
                            <div className="p-2 rounded-full bg-amber-100 group-hover:bg-amber-200 transition-colors duration-300 animate-bounce-in animate-delay-400">
                                <svg className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M4 4h16v2H4V4Zm0 7h16v2H4v-2Zm0 7h16v2H4v-2Z" />
                                </svg>
                            </div>
                            Preservation of scripts
                        </h3>
                        <p className="mt-3 text-slate-600 text-sm leading-relaxed relative z-10 group-hover:text-slate-700 transition-colors duration-300">Scripts are cultural archives. We document and promote lesser-used scripts alongside mainstream ones, supporting digitization, consistent transcription, and script-aware tools for education and research.</p>
                        <div className="mt-4 flex items-center text-amber-600 font-medium text-sm relative z-10 group-hover:translate-x-1 transition-transform duration-300">
                            <span>Learn more</span>
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-slate-700">
                    <Link href="/about#focus" className="group rounded-xl border border-slate-200 p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-indigo-300 hover:bg-indigo-50/50 flex items-center justify-between">
                        <span>Community-involved workflows</span>
                        <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                    <Link href="/about#story" className="group rounded-xl border border-slate-200 p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-emerald-300 hover:bg-emerald-50/50 flex items-center justify-between">
                        <span>Open, research-grade datasets</span>
                        <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                    <Link href="/about#focus" className="group rounded-xl border border-slate-200 p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-amber-300 hover:bg-amber-50/50 flex items-center justify-between">
                        <span>Accessible UI for contributors</span>
                        <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                    <Link href="/about#focus" className="group rounded-xl border border-slate-200 p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-purple-300 hover:bg-purple-50/50 flex items-center justify-between">
                        <span>Script-aware transcription and review</span>
                        <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="container mx-auto py-12 md:py-16" id="why-choose-us">
                <div className="text-center mb-12">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">
                        Why Choose Our Language Data Collection Platform?
                    </h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Discover why researchers, linguists, and AI developers worldwide trust our platform for high-quality multilingual datasets.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200 hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-2">23 Languages Supported</h3>
                        <p className="text-sm text-slate-600">Comprehensive coverage of Indian linguistic diversity with native script support</p>
                    </div>

                    <div className="text-center p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200 hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-2">Community-Driven</h3>
                        <p className="text-sm text-slate-600">Open-source platform with community contributions and peer review validation</p>
                    </div>

                    <div className="text-center p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200 hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-2">Research-Grade Quality</h3>
                        <p className="text-sm text-slate-600">High-quality datasets validated by linguistic experts and AI researchers</p>
                    </div>

                    <div className="text-center p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200 hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-2">Free & Open Source</h3>
                        <p className="text-sm text-slate-600">No cost access to datasets and tools for advancing AI and NLP research</p>
                    </div>
                </div>

                <div className="text-center mt-12">
                    <div className="inline-flex flex-wrap gap-4 justify-center">
                        <Link href="/languages" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-colors">
                            Explore Languages
                        </Link>
                        <Link href="/about" className="bg-white hover:bg-gray-50 text-slate-800 px-6 py-3 rounded-full font-semibold border border-slate-200 transition-colors">
                            Learn More
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}