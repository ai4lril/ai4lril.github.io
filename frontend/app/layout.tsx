import type { Metadata } from "next";
import Link from "next/link";
import { Noto_Sans } from 'next/font/google';
import Navbar from "@/components/Navbar";
import AccessibilityWidget from "@/components/AccessibilityWidget";
import "./globals.css";

// Import compliance and accessibility managers
import '@/lib/gdprConsent';
import '@/lib/accessibility';

export const metadata: Metadata = {
    metadataBase: new URL('https://ai4lril.github.io'),
    title: {
        default: "ILHRF | AI Training Data for Indian Languages",
        template: "%s | ILHRF"
    },
    description: "Open-source platform for collecting, validating, and curating high-quality language data for Indian languages. Contribute speech, text, and annotations to advance AI and NLP research.",
    keywords: [
        "language data collection",
        "Indian languages",
        "NLP datasets",
        "speech recognition",
        "machine learning",
        "artificial intelligence",
        "multilingual data",
        "linguistic research",
        "open source",
        "Assamese",
        "Bengali",
        "Bodo",
        "Dogri",
        "Gujarati",
        "Hindi",
        "Kannada",
        "Kashmiri",
        "Konkani",
        "Maithili",
        "Malayalam",
        "Manipuri",
        "Marathi",
        "Nepali",
        "Odia",
        "Punjabi",
        "Sanskrit",
        "Santhali",
        "Sindhi",
        "Tamil",
        "Telugu",
        "Urdu",
        "language preservation",
        "dataset annotation",
        "voice data",
        "text annotation",
        "POS tagging",
        "sentiment analysis",
        "emotion recognition",
        "NER tagging",
        "translation data",
        "linguistic annotation"
    ],
    authors: [{ name: "Alvyn Abranches", url: "https://github.com/ai4lril" }],
    creator: "Alvyn Abranches",
    publisher: "ILHRF",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    category: "Technology",
    classification: "Research Platform",
    robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
            index: true,
            follow: true,
            noimageindex: false,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'your-google-site-verification-code',
    },
    alternates: {
        canonical: 'https://ai4lril.github.io',
        languages: {
            'en-US': 'https://ai4lril.github.io',
        },
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://ai4lril.github.io/voice-data-collection',
        title: 'ILHRF | AI Training Data for Indian Languages',
        description: 'Open-source platform for collecting, validating, and curating high-quality language data for Indian languages.',
        siteName: 'ILHRF',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'ILHRF Platform',
                type: 'image/jpeg',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'ILHRF | AI Training Data for Indian Languages',
        description: 'Open-source platform for collecting, validating, and curating high-quality language data for Indian languages.',
        creator: '@ai4lril',
        images: ['/og-image.jpg'],
    },
    other: {
        'msapplication-TileColor': '#2563eb',
        'theme-color': '#2563eb',
        'color-scheme': 'light dark',
    }
};

const notoSans = Noto_Sans({ subsets: ['latin', 'devanagari'], weight: ['400', '500', '700'] });

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" >
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link rel="apple-touch-icon" href="/favicon.ico" />
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#2563eb" />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
                <meta name="format-detection" content="telephone=no" />

                {/* Security Headers */}
                <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
                <meta httpEquiv="X-Frame-Options" content="DENY" />
                <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
                <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
                <meta name="permissions-policy" content="camera=(), microphone=(), geolocation=()" />

                {/* Content Security Policy */}
                <meta httpEquiv="Content-Security-Policy" content="
                    default-src 'self';
                    script-src 'self' 'unsafe-inline';
                    style-src 'self' 'unsafe-inline';
                    img-src 'self' data: https:;
                    font-src 'self' data:;
                    connect-src 'self';
                    frame-src 'none';
                    object-src 'none';
                    base-uri 'self';
                    form-action 'self';
                    upgrade-insecure-requests;
                    report-uri /csp-report;
                " />

                {/* Additional Security Headers */}
                <meta name="strict-transport-security" content="max-age=31536000; includeSubDomains; preload" />
                <meta name="cross-origin-embedder-policy" content="require-corp" />
                <meta name="cross-origin-opener-policy" content="same-origin" />
                <meta name="cross-origin-resource-policy" content="same-origin" />

                {/* Additional Security Measures */}
                <meta name="referrer" content="strict-origin-when-cross-origin" />
                <meta name="feature-policy" content="camera 'none'; microphone 'none'; geolocation 'none'; payment 'none'" />
                <meta name="document-policy" content="force-load-at-top" />

                {/* DNS Prefetch Control */}
                <meta httpEquiv="x-dns-prefetch-control" content="on" />

                {/* Cache Control */}
                <meta httpEquiv="Cache-Control" content="public, max-age=31536000, immutable" />

                {/* Preload Critical Resources */}
                <link rel="preload" href="/favicon.ico" as="image" type="image/x-icon" />
                <link rel="preload" href="/manifest.json" as="fetch" type="application/manifest+json" />
                <link rel="dns-prefetch" href="//fonts.googleapis.com" />
                <link rel="dns-prefetch" href="//fonts.gstatic.com" />

                {/* Feature Policy Enhancements */}
                <meta name="permissions-policy" content="
                    camera=(),
                    microphone=(),
                    geolocation=(),
                    gyroscope=(),
                    accelerometer=(),
                    magnetometer=(),
                    payment=(),
                    usb=(),
                    autoplay=(),
                    encrypted-media=(),
                    fullscreen=(self),
                    picture-in-picture=()
                " />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebSite",
                            "name": "ILHRF",
                            "url": "https://ai4lril.github.io",
                            "description": "Open-source platform for collecting, validating, and curating high-quality language data for Indian languages",
                            "publisher": {
                                "@type": "Organization",
                                "name": "ILHRF",
                                "founder": {
                                    "@type": "Person",
                                    "name": "Alvyn Abranches"
                                }
                            },
                            "potentialAction": {
                                "@type": "SearchAction",
                                "target": "https://ai4lril.github.io/search?q={search_term_string}",
                                "query-input": "required name=search_term_string"
                            },
                            "sameAs": [
                                "https://github.com/ai4lril/ai4lril.github.io"
                            ]
                        })
                    }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "SoftwareApplication",
                            "name": "ILHRF Platform",
                            "description": "Web application for collecting and curating language data for AI training",
                            "url": "https://ai4lril.github.io",
                            "applicationCategory": "DeveloperApplication",
                            "operatingSystem": "Web Browser",
                            "offers": {
                                "@type": "Offer",
                                "price": "0",
                                "priceCurrency": "USD"
                            },
                            "author": {
                                "@type": "Person",
                                "name": "Alvyn Abranches"
                            }
                        })
                    }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Organization",
                            "name": "ILHRF",
                            "url": "https://ai4lril.github.io",
                            "logo": "https://ai4lril.github.io/logo.png",
                            "description": "Open-source platform supporting 23 Indian languages for collecting, validating, and curating high-quality language data for AI and NLP research",
                            "founder": {
                                "@type": "Person",
                                "name": "Alvyn Abranches",
                                "url": "https://github.com/alvynabranches"
                            },
                            "contactPoint": {
                                "@type": "ContactPoint",
                                "email": "contact@language-data-collection.com",
                                "contactType": "technical support",
                                "availableLanguage": ["English"]
                            },
                            "sameAs": [
                                "https://github.com/ai4lril/ai4lril.github.io",
                                "https://twitter.com/alvynabranches"
                            ]
                        })
                    }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "FAQPage",
                            "mainEntity": [
                                {
                                    "@type": "Question",
                                    "name": "What languages does the platform support?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "Our platform supports 23 languages including Assamese, Bengali, Gujarati, Hindi, Kannada, Malayalam, Marathi, Punjabi, Tamil, Telugu, Urdu, English, and many more Indian languages with their native scripts."
                                    }
                                },
                                {
                                    "@type": "Question",
                                    "name": "How can I contribute to language data collection?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "You can contribute by recording speech, validating audio samples, transcribing text, or annotating data through our user-friendly web interface. All contributions help advance AI and NLP research for Indian languages."
                                    }
                                },
                                {
                                    "@type": "Question",
                                    "name": "Is the platform free to use?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "Yes, our platform is completely free and open-source. We believe in democratizing access to language technology and making high-quality datasets available to researchers and developers worldwide."
                                    }
                                }
                            ]
                        })
                    }}
                />

                {/* Enhanced SEO Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebSite",
                            "name": "ILHRF",
                            "alternateName": "AI4LRIL Language Data Platform",
                            "url": "https://ai4lril.github.io/voice-data-collection",
                            "description": "Open-source platform for collecting, validating, and curating high-quality language data for Indian languages",
                            "publisher": {
                                "@type": "Organization",
                                "name": "AI4LRIL",
                                "url": "https://github.com/ai4lril"
                            },
                            "potentialAction": {
                                "@type": "SearchAction",
                                "target": "https://ai4lril.github.io/voice-data-collection/search?q={search_term_string}",
                                "query-input": "required name=search_term_string"
                            },
                            "inLanguage": [
                                "en", "hi", "bn", "te", "mr", "ta", "gu", "kn", "ml", "pa",
                                "or", "as", "mai", "bho", "mag", "hne", "doi", "mtr", "raj",
                                "gon", "kok", "sat", "sd"
                            ]
                        })
                    }}
                />

                {/* Organization Schema */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Organization",
                            "name": "ILHRF",
                            "url": "https://ai4lril.github.io/voice-data-collection",
                            "logo": "https://ai4lril.github.io/voice-data-collection/logo.png",
                            "description": "Open-source platform for multilingual language data collection and annotation",
                            "founder": {
                                "@type": "Person",
                                "name": "Alvyn Abranches",
                                "url": "https://github.com/ai4lril"
                            },
                            "sameAs": [
                                "https://github.com/ai4lril/voice-data-collection"
                            ],
                            "contactPoint": {
                                "@type": "ContactPoint",
                                "email": "contact@ai4lril.github.io",
                                "contactType": "technical support"
                            }
                        })
                    }}
                />

                {/* Dataset Schema for Language Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Dataset",
                            "name": "Indian Language Data Collection",
                            "description": "Comprehensive dataset of Indian language annotations including speech, text, POS tags, sentiment analysis, and emotion recognition",
                            "url": "https://ai4lril.github.io/voice-data-collection",
                            "creator": {
                                "@type": "Organization",
                                "name": "AI4LRIL"
                            },
                            "distribution": {
                                "@type": "DataDownload",
                                "encodingFormat": "application/json",
                                "contentUrl": "https://github.com/ai4lril/voice-data-collection"
                            },
                            "includedInDataCatalog": {
                                "@type": "DataCatalog",
                                "name": "AI4LRIL Language Resources"
                            },
                            "measurementTechnique": [
                                "Crowdsourcing",
                                "Expert Annotation",
                                "Automated Validation"
                            ],
                            "variableMeasured": [
                                "Speech Audio",
                                "Text Transcription",
                                "Part-of-Speech Tags",
                                "Named Entities",
                                "Sentiment Labels",
                                "Emotion Labels"
                            ]
                        })
                    }}
                />
            </head>
            <body className={`flex flex-col min-h-screen ${notoSans.className}`}>
                {/* Load security script securely */}
                <script src="/security.js" defer></script>
                <Navbar />
                <main className="flex-1 container mx-auto flex flex-col items-center justify-around px-4 sm:px-6 md:px-8" role="main">
                    {children}
                </main>
                <footer className="mt-8 border-t border-slate-200/70 bg-white/60" role="contentinfo">
                    <div className="container mx-auto px-4 py-6 text-sm text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div>© {new Date().getFullYear()} ILHRF</div>
                        <nav className="flex items-center gap-4" role="navigation" aria-label="Footer navigation">
                            <Link className="hover:text-blue-700" href="/about" aria-label="About">About</Link>
                            <Link className="hover:text-blue-700" href="/contact" aria-label="Contact">Contact</Link>
                            <Link className="hover:text-blue-700" href="/privacy" aria-label="Privacy">Privacy</Link>
                            <Link className="hover:text-blue-700" href="/terms" aria-label="Terms">Terms</Link>
                            <Link className="hover:text-blue-700" href="/cookies" aria-label="Cookies">Cookies</Link>
                            <Link className="hover:text-blue-700" href="/data-rights" aria-label="Data Rights">Data Rights</Link>
                            <Link className="hover:text-blue-700" href="/privacy-settings" aria-label="Privacy Settings">Privacy Settings</Link>
                            <span className="inline-flex items-center gap-2 ml-2">
                                <a href="https://twitter.com/alvynabranches" aria-label="Twitter" className="hover:text-blue-700" target="_blank" rel="noopener noreferrer">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.21 4.21 0 001.85-2.32 8.39 8.39 0 01-2.66 1.02 4.18 4.18 0 00-7.12 3.81A11.86 11.86 0 013 4.9a4.17 4.17 0 001.29 5.58 4.13 4.13 0 01-1.9-.52v.05a4.18 4.18 0 003.35 4.1 4.21 4.21 0 01-1.89.07 4.18 4.18 0 003.9 2.9A8.39 8.39 0 012 19.54a11.84 11.84 0 006.41 1.88c7.69 0 11.89-6.37 11.89-11.89l-.01-.54A8.5 8.5 0 0022.46 6z" /></svg>
                                </a>
                                <a href="https://github.com/ai4lril" aria-label="GitHub" className="hover:text-blue-700" target="_blank" rel="noopener noreferrer">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.016c0 4.422 2.865 8.166 6.839 9.49.5.093.682-.216.682-.48 0-.237-.009-.866-.014-1.701-2.782.605-3.369-1.343-3.369-1.343-.455-1.158-1.11-1.467-1.11-1.467-.907-.62.069-.607.069-.607 1.003.07 1.53 1.031 1.53 1.031.892 1.53 2.341 1.088 2.91.833.091-.647.35-1.088.636-1.338-2.221-.253-4.555-1.112-4.555-4.945 0-1.092.39-1.987 1.029-2.687-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.026 2.748-1.026.546 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.687 0 3.842-2.337 4.688-4.566 4.937.359.31.678.92.678 1.854 0 1.337-.012 2.416-.012 2.744 0 .266.18.576.688.478A10.02 10.02 0 0022 12.016C22 6.484 17.523 2 12 2z" clipRule="evenodd" /></svg>
                                </a>
                            </span>
                        </nav>
                    </div>
                </footer>
                <AccessibilityWidget />
            </body>
        </html>
    );
}
