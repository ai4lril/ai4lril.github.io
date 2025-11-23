import { contributors } from './contributors';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from "next";
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
    title: "About | ILHRF - Indian Linguistic Heritage Research Foundation",
    description: "Learn about ILHRF, supporting 23 Indian languages and English. Our mission to preserve linguistic diversity through open-source technology and AI development.",
    keywords: [
        "about ILHRF",
        "Indian Linguistic Heritage Research Foundation",
        "23 languages",
        "linguistic research",
        "Indian languages preservation",
        "Assamese Bengali Gujarati Hindi",
        "Kannada Malayalam Marathi Punjabi",
        "Tamil Telugu Urdu English",
        "open source project",
        "team Alvyn Abranches",
        "language technology",
        "computational linguistics",
        "language documentation",
        "Indo-Aryan languages",
        "Dravidian languages"
    ],
    openGraph: {
        title: "About ILHRF | Indian Linguistic Heritage Research Foundation",
        description: "Discover our mission to preserve linguistic diversity through open-source technology. Supporting 23 languages from Assamese to Urdu and English for AI and NLP research.",
        type: "website",
        images: [
            {
                url: "/og-about.jpg",
                width: 1200,
                height: 630,
                alt: "About ILHRF - Supporting 23 Languages",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "About ILHRF | 23 Languages",
        description: "Learn about our mission to preserve 23 languages through open-source technology and AI development.",
        images: ["/og-about.jpg"],
    },
};

export default function AboutPage() {

    return (
        <div className="w-full max-w-2xl md:max-w-4xl xl:max-w-6xl mx-auto py-12 md:py-16 px-4 animate-fade-in-up">
            <Breadcrumb items={[{ label: 'About', href: '/about' }]} />
            {/* Hero / Mission */}
            <header className="relative glass rounded-2xl p-6 md:p-8 border border-slate-100 animate-bounce-in xl:mr-[280px]" id="mission">
                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50/40 to-indigo-50/20 rounded-2xl blur-xl"></div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 animate-pulse">
                        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                        </svg>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800">About ILHRF</h1>
                </div>
                <p className="mt-3 text-slate-600 text-lg leading-relaxed animate-fade-in-up animate-delay-200">
                    The Indian Linguistic Heritage Research Foundation (ILHRF) is dedicated to preserving and promoting the rich linguistic diversity of India through open-source technology and community-driven research. We build practical tools to collect, annotate, and curate language data for underrepresented Indian languages and scripts. Our mission is to empower communities and researchers with ethical, accessible, and extensible workflows—aligned with the spirit of community projects like Common Voice, but focused on Indian languages.
                </p>
                <div className="mt-6 flex justify-center">
                    <Image src="/globe.svg" alt="Illustration of global languages and scripts" width={120} height={120} />
                </div>
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center animate-fade-in-up animate-delay-400">
                    <div className="group rounded-xl border border-slate-200 bg-white/95 hover:bg-white py-4 px-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                        <div className="text-2xl font-extrabold text-indigo-700 mb-1 group-hover:scale-110 transition-transform duration-300">23</div>
                        <div className="text-sm text-slate-600 font-medium">Languages</div>
                        <div className="mt-2 h-1 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="group rounded-xl border border-slate-200 bg-white/95 hover:bg-white py-4 px-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                        <div className="text-2xl font-extrabold text-emerald-700 mb-1 group-hover:scale-110 transition-transform duration-300">6</div>
                        <div className="text-sm text-slate-600 font-medium">Scripts</div>
                        <div className="mt-2 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="group rounded-xl border border-slate-200 bg-white/95 hover:bg-white py-4 px-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                        <div className="text-2xl font-extrabold text-amber-700 mb-1 group-hover:scale-110 transition-transform duration-300">1000+</div>
                        <div className="text-sm text-slate-600 font-medium">Tokens annotated</div>
                        <div className="mt-2 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="group rounded-xl border border-slate-200 bg-white/95 hover:bg-white py-4 px-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                        <div className="text-2xl font-extrabold text-purple-700 mb-1 group-hover:scale-110 transition-transform duration-300">Community-first</div>
                        <div className="text-sm text-slate-600 font-medium">Ethical collection</div>
                        <div className="mt-2 h-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                </div>
            </header>

            {/* Sticky in-page TOC for desktop */}
            <aside className="hidden xl:block absolute right-0 top-32 w-[260px]">
                <nav className="glass rounded-xl border border-slate-100 p-3 shadow-sm min-w-[200px]">
                    <div className="text-xs font-semibold text-slate-700 mb-2">On this page</div>
                    <ul className="space-y-1 text-sm text-slate-700">
                        <li><a className="hover:text-indigo-700" href="#what-we-collect">What we collect</a></li>
                        <li><a className="hover:text-indigo-700" href="#how-it-works">How it works</a></li>
                        <li><a className="hover:text-indigo-700" href="#community-impact">Community impact</a></li>
                        <li><a className="hover:text-indigo-700" href="#roadmap">Roadmap</a></li>
                        <li><a className="hover:text-indigo-700" href="#get-involved">Get involved</a></li>
                        <li><a className="hover:text-indigo-700" href="#contributors">Contributors</a></li>
                        <li><a className="hover:text-indigo-700" href="#faq">FAQ</a></li>
                    </ul>
                </nav>
            </aside>

            {/* What we collect */}
            <section className="mt-12 glass rounded-2xl p-6 md:p-8 border border-slate-100 xl:mr-[280px]" id="what-we-collect">
                <h2 className="text-xl font-semibold text-slate-800">
                    <span className="inline-block relative pb-1">
                        What we collect
                        <span className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500"></span>
                    </span>
                </h2>
                <p className="mt-2 text-slate-600">ILHRF supports multiple data types to build robust, inclusive language resources for Indian linguistic heritage.</p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="card rounded-2xl p-4 transition hover:shadow-lg hover:-translate-y-0.5">
                        <Image src="/window.svg" alt="Scripted speech icon" width={28} height={28} className="mb-2 opacity-80" />
                        <h3 className="font-medium text-slate-800">Scripted Speech</h3>
                        <p className="mt-1 text-sm text-slate-600">Contributors read prompts aloud to gather clear pronunciation across scripts and dialects, preserving linguistic heritage.</p>
                    </div>
                    <div className="card rounded-2xl p-4 transition hover:shadow-lg hover:-translate-y-0.5">
                        <Image src="/vercel.svg" alt="Spontaneous speech icon" width={28} height={28} className="mb-2 opacity-80" />
                        <h3 className="font-medium text-slate-800">Spontaneous Speech</h3>
                        <p className="mt-1 text-sm text-slate-600">Upcoming: natural responses to prompts for richer accents and styles, capturing authentic cultural expression.</p>
                    </div>
                    <div className="card rounded-2xl p-4 transition hover:shadow-lg hover:-translate-y-0.5">
                        <Image src="/file.svg" alt="Transcription icon" width={28} height={28} className="mb-2 opacity-80" />
                        <h3 className="font-medium text-slate-800">Transcriptions</h3>
                        <p className="mt-1 text-sm text-slate-600">Text transcriptions of audio clips help train ASR models and enable search, documenting oral traditions.</p>
                    </div>
                    <div className="card rounded-2xl p-4 transition hover:shadow-lg hover:-translate-y-0.5">
                        {/* <Image src="/next.svg" alt="Token classification icon" width={28} height={28} className="mb-2 opacity-80" /> */}
                        <h3 className="font-medium text-slate-800">Token Classification (POS & NER)</h3>
                        <p className="mt-1 text-sm text-slate-600">Word-by-word UPOS tags and span-level BIO tags to support downstream NLP tasks, advancing computational linguistics for Indian heritage.</p>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="mt-12 glass rounded-2xl p-6 md:p-8 border border-slate-100 xl:mr-[280px]" id="how-it-works">
                <div className="flex justify-end mb-3">
                    <Image src="/file.svg" alt="How it works diagram" width={80} height={80} />
                </div>
                <h2 className="text-xl font-semibold text-slate-800">
                    <span className="inline-block relative pb-1">
                        How it works
                        <span className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500"></span>
                    </span>
                </h2>
                <ol className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                    <li className="card rounded-2xl p-4 border border-slate-200 transition hover:shadow-lg">
                        <div className="font-semibold text-slate-800 flex items-center gap-2"><span className="inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-indigo-100 text-indigo-700">1</span> Contribute</div>
                        <p className="mt-1">Record speech, transcribe, or annotate tokens. Choose your language and script via the language switcher to preserve your linguistic heritage.</p>
                    </li>
                    <li className="card rounded-2xl p-4 border border-slate-200 transition hover:shadow-lg">
                        <div className="font-semibold text-slate-800 flex items-center gap-2"><span className="inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-indigo-100 text-indigo-700">2</span> Validate</div>
                        <p className="mt-1">Peers review submissions for clarity and correctness using simple yes/no checks, ensuring quality for research.</p>
                    </li>
                    <li className="card rounded-2xl p-4 border border-slate-200 transition hover:shadow-lg">
                        <div className="font-semibold text-slate-800 flex items-center gap-2"><span className="inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-indigo-100 text-indigo-700">3</span> Token Classification</div>
                        <p className="mt-1">Assign UPOS tags or BIO entity labels, with script-aware tokenization and span support for accurate linguistic analysis.</p>
                    </li>
                    <li className="card rounded-2xl p-4 border border-slate-200 transition hover:shadow-lg">
                        <div className="font-semibold text-slate-800 flex items-center gap-2"><span className="inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-indigo-100 text-indigo-700">4</span> Release</div>
                        <p className="mt-1">Aggregated, anonymized datasets will be made available for research with clear licenses, supporting global linguistic studies.</p>
                    </li>
                </ol>
            </section>

            {/* Community impact */}
            <section className="mt-12 glass rounded-2xl p-6 md:p-8 border border-slate-100 xl:mr-[280px]" id="community-impact">
                <h2 className="text-xl font-semibold text-slate-800">
                    <span className="inline-block relative pb-1">
                        Community impact
                        <span className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500"></span>
                    </span>
                </h2>
                <p className="mt-2 text-slate-600">ILHRF centers low‑resourced languages and zero‑resourced scripts, with community review to ensure quality and respect for cultural heritage.</p>
                <div className="mt-4 flex justify-center">
                    <Image src="/globe.svg" alt="Community impact illustration" width={96} height={96} />
                </div>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="rounded-lg border border-slate-200 bg-white py-3 px-2">
                        <div className="text-sm text-slate-600">Focus</div>
                        <div className="text-base font-semibold text-slate-900">Indian languages</div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white py-3 px-2">
                        <div className="text-sm text-slate-600">Inclusion</div>
                        <div className="text-base font-semibold text-slate-900">Low/zero resourced</div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white py-3 px-2">
                        <div className="text-sm text-slate-600">Quality</div>
                        <div className="text-base font-semibold text-slate-900">Peer validation</div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white py-3 px-2">
                        <div className="text-sm text-slate-600">Access</div>
                        <div className="text-base font-semibold text-slate-900">Open practices</div>
                    </div>
                </div>
            </section>

            {/* Roadmap */}
            <section className="mt-12 glass rounded-2xl p-6 md:p-8 border border-slate-100 xl:mr-[280px]" id="roadmap">
                <h2 className="text-xl font-semibold text-slate-800">
                    <span className="inline-block relative pb-1">
                        Roadmap
                        <span className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500"></span>
                    </span>
                </h2>
                <div className="mt-2 flex justify-center">
                    {/* <Image src="/next.svg" alt="Roadmap timeline illustration" width={80} height={80} /> */}
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="card rounded-2xl p-4 border border-slate-200">
                        <div className="font-semibold text-slate-800">Spontaneous Speech</div>
                        <p className="mt-1 text-sm text-slate-700">Launch natural prompt responses for richer accents and styles to capture authentic linguistic heritage.</p>
                    </div>
                    <div className="card rounded-2xl p-4 border border-slate-200">
                        <div className="font-semibold text-slate-800">Mobile-first recordings</div>
                        <p className="mt-1 text-sm text-slate-700">Improve UI for low bandwidth and small screens to reach more community contributors.</p>
                    </div>
                    <div className="card rounded-2xl p-4 border border-slate-200">
                        <div className="font-semibold text-slate-800">Quality signals</div>
                        <p className="mt-1 text-sm text-slate-700">Rater agreement, confidence, and lightweight spam checks for reliable research data.</p>
                    </div>
                    <div className="card rounded-2xl p-4 border border-slate-200">
                        <div className="font-semibold text-slate-800">Research access</div>
                        <p className="mt-1 text-sm text-slate-700">APIs and periodic dataset releases with documentation to support global linguistic studies.</p>
                    </div>
                </div>
            </section>

            {/* Get involved */}
            <section className="mt-12 glass rounded-2xl p-6 md:p-8 border border-slate-100 xl:mr-[280px]" id="get-involved">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    <div className="md:col-span-2">
                        <h2 className="text-xl font-semibold text-slate-800">
                            <span className="inline-block relative pb-1">
                                Get involved
                                <span className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500"></span>
                            </span>
                        </h2>
                        <p className="mt-2 text-slate-600">Interested in collaborating or contributing datasets to preserve Indian linguistic heritage? Reach out and join our efforts.</p>
                        <div className="mt-3">
                            <Image src="/vercel.svg" alt="Get involved illustration" width={64} height={64} />
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3 animate-fade-in-up animate-delay-300">
                            <Link href="/contact" className="group inline-flex bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 items-center gap-2">
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Contact us
                            </Link>
                            <Link href="/speak" className="group inline-flex bg-white/95 hover:bg-white border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-800 text-sm font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 items-center gap-2">
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Start contributing
                            </Link>
                        </div>
                    </div>
                    <aside className="card rounded-2xl p-6">
                        <div className="text-sm text-slate-600">Quick links</div>
                        <ul className="mt-2 text-sm text-slate-700 space-y-2">
                            <li><a className="text-indigo-600 hover:underline" href="#what-we-collect">What we collect</a></li>
                            <li><a className="text-indigo-600 hover:underline" href="#how-it-works">How it works</a></li>
                            <li><a className="text-indigo-600 hover:underline" href="#contributors">Contributors</a></li>
                            <li><a className="text-indigo-600 hover:underline" href="#faq">FAQ</a></li>
                        </ul>
                    </aside>
                </div>
            </section>

            {/* Contributors */}
            <section className="mt-12 xl:mr-[280px]" id="contributors">
                <div className="relative">
                    {/* Section Header with Background Pattern */}
                    <div className="glass rounded-3xl p-8 md:p-12 border border-slate-100 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-5">
                            <div className="absolute top-4 left-4 w-20 h-20 bg-indigo-400 rounded-full blur-xl"></div>
                            <div className="absolute bottom-4 right-4 w-16 h-16 bg-purple-400 rounded-full blur-xl"></div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-400 rounded-full blur-2xl"></div>
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 shadow-lg">
                                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-800 mb-2">
                                        Meet Our Contributors
                                    </h2>
                                    <p className="text-slate-600 text-lg">Dedicated researchers and developers committed to preserving India's linguistic heritage</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contributors Grid */}
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {contributors.map((c, index) => (
                            <div key={c.name} className={`group relative animate-fade-in-up ${index % 2 === 0 ? 'animate-delay-200' : 'animate-delay-300'
                                }`}>
                                {/* Background Pattern */}
                                <div className="absolute inset-0 opacity-30 group-hover:opacity-40 transition-opacity duration-500">
                                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl ${index % 4 === 0 ? 'bg-indigo-200' :
                                        index % 4 === 1 ? 'bg-purple-200' :
                                            index % 4 === 2 ? 'bg-blue-200' : 'bg-emerald-200'
                                        }`}></div>
                                </div>

                                {/* Main Card */}
                                <div className="relative glass rounded-2xl p-8 border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group-hover:border-slate-200">
                                    {/* Card Header */}
                                    <div className="flex items-start gap-6 mb-6">
                                        {/* Avatar Section */}
                                        <div className="relative">
                                            {c.photoUrl ? (
                                                <div className="relative">
                                                    <Image
                                                        alt={c.name}
                                                        src={c.photoUrl}
                                                        width={80}
                                                        height={80}
                                                        className="w-20 h-20 rounded-2xl object-cover shadow-lg ring-4 ring-white group-hover:ring-indigo-100 transition-all duration-300"
                                                    />
                                                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-2 border-white shadow-md"></div>
                                                </div>
                                            ) : (
                                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 shadow-lg ring-4 ring-white group-hover:ring-indigo-100 transition-all duration-300 flex items-center justify-center">
                                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Name and Role */}
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-indigo-900 transition-colors duration-300">
                                                {c.name}
                                            </h3>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
                                                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                                <span className="text-sm font-medium text-indigo-700">{c.role}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    <div className="mb-6">
                                        <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                                            {c.bio}
                                        </p>
                                    </div>

                                    {/* Interests */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            <span className="text-sm font-medium text-slate-700">Research Interests</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {c.interests.map((interest, i) => (
                                                <span
                                                    key={interest}
                                                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 group-hover:scale-105 ${i % 3 === 0
                                                        ? 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-700 border border-indigo-300'
                                                        : i % 3 === 1
                                                            ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 border border-purple-300'
                                                            : 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 border border-emerald-300'
                                                        }`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${i % 3 === 0 ? 'bg-indigo-500' :
                                                        i % 3 === 1 ? 'bg-purple-500' : 'bg-emerald-500'
                                                        }`}></div>
                                                    {interest}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Decorative Elements */}
                                    <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                                        <svg className="w-8 h-8 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Call to Action */}
                    <div className="mt-12 text-center">
                        <div className="glass rounded-2xl p-8 border border-slate-100 max-w-md mx-auto">
                            <div className="p-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 w-fit mx-auto mb-4">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">Join Our Team</h3>
                            <p className="text-slate-600 text-sm mb-4">Interested in contributing to the preservation of Indian linguistic heritage? We'd love to hear from you.</p>
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                <span>Get in Touch</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="mt-12 glass rounded-2xl p-6 md:p-8 border border-slate-100 xl:mr-[280px]" id="faq">
                <h2 className="text-xl font-semibold text-slate-800">
                    <span className="inline-block relative pb-1">
                        Frequently asked questions
                        <span className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500"></span>
                    </span>
                </h2>
                <div className="mt-2">
                    <Image src="/window.svg" alt="FAQ illustration" width={64} height={64} />
                </div>
                <div className="mt-4 space-y-3 animate-fade-in-up animate-delay-400">
                    <details className="group rounded-xl border border-slate-200 bg-white/90 hover:bg-white p-4 shadow-sm hover:shadow-md transition-all duration-300">
                        <summary className="cursor-pointer font-semibold text-slate-800 flex items-center justify-between hover:text-indigo-900 transition-colors duration-300">
                            <span className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors duration-300">
                                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                What data do you collect?
                            </span>
                            <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-all duration-300 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </summary>
                        <p className="mt-4 text-sm text-slate-700 leading-relaxed pl-9">Scripted speech, spontaneous speech, transcriptions, token-level annotations (POS, NER), and translations. ILHRF focuses on Indian languages and scripts to preserve linguistic heritage.</p>
                    </details>
                    <details className="group rounded-xl border border-slate-200 bg-white/90 hover:bg-white p-4 shadow-sm hover:shadow-md transition-all duration-300">
                        <summary className="cursor-pointer font-semibold text-slate-800 flex items-center justify-between hover:text-emerald-900 transition-colors duration-300">
                            <span className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors duration-300">
                                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                How do you handle privacy?
                            </span>
                            <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-all duration-300 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </summary>
                        <p className="mt-4 text-sm text-slate-700 leading-relaxed pl-9">We avoid collecting directly identifying information. See our <Link className="text-indigo-600 hover:underline font-medium" href="/privacy">Privacy Policy</Link> for details on how ILHRF protects contributors' data.</p>
                    </details>
                    <details className="group rounded-xl border border-slate-200 bg-white/90 hover:bg-white p-4 shadow-sm hover:shadow-md transition-all duration-300">
                        <summary className="cursor-pointer font-semibold text-slate-800 flex items-center justify-between hover:text-amber-900 transition-colors duration-300">
                            <span className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors duration-300">
                                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                Can I add my language?
                            </span>
                            <svg className="w-5 h-5 text-slate-400 group-hover:text-amber-600 transition-all duration-300 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </summary>
                        <p className="mt-4 text-sm text-slate-700 leading-relaxed pl-9">Yes. Use the <Link className="text-indigo-600 hover:underline font-medium" href="/contact">contact page</Link> to propose new languages or scripts and we'll coordinate onboarding for ILHRF.</p>
                    </details>
                    <details className="group rounded-xl border border-slate-200 bg-white/90 hover:bg-white p-4 shadow-sm hover:shadow-md transition-all duration-300">
                        <summary className="cursor-pointer font-semibold text-slate-800 flex items-center justify-between hover:text-purple-900 transition-colors duration-300">
                            <span className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-300">
                                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                How are annotations used?
                            </span>
                            <svg className="w-5 h-5 text-slate-400 group-hover:text-purple-600 transition-all duration-300 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </summary>
                        <p className="mt-4 text-sm text-slate-700 leading-relaxed pl-9">Annotations help train and evaluate NLP models for Indian languages and scripts. Aggregated data may be released for research with clear licenses through ILHRF initiatives.</p>
                    </details>
                </div>
            </section>

            <a href="#mission" className="group fixed bottom-6 xl:right-[280px] right-6 bg-white/95 hover:bg-white border border-slate-200 text-slate-700 hover:text-slate-800 rounded-full shadow-lg hover:shadow-xl px-4 py-3 text-sm transition-all duration-300 hover:scale-110 active:scale-95 flex items-center gap-2 animate-bounce-in">
                <svg className="w-4 h-4 transition-transform group-hover:-translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span className="font-medium">Back to top</span>
            </a>
        </div>
    );
}
