import type { Metadata } from "next";
import Breadcrumb from '@/components/Breadcrumb';
import ContactForm from './ContactForm';
import Link from 'next/link';
import TeamPhoto from './TeamPhoto';

export const metadata: Metadata = {
    title: "Contact | Get in Touch",
    description: "Contact the Language Data Collection team. Reach out for collaborations, partnerships, technical support, or to propose new languages and scripts for our platform.",
    keywords: [
        "contact language data collection",
        "get in touch",
        "technical support",
        "partnerships",
        "new languages",
        "collaboration",
        "linguistic research",
        "language technology support"
    ],
    openGraph: {
        title: "Contact Language Data Collection | Get in Touch",
        description: "Reach out to our team for collaborations, technical support, or to propose new languages for our open-source platform.",
        type: "website",
        images: [
            {
                url: "/og-contact.jpg",
                width: 1200,
                height: 630,
                alt: "Contact Language Data Collection Team",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Contact Language Data Collection",
        description: "Get in touch with our team for collaborations and technical support.",
        images: ["/og-contact.jpg"],
    },
};

export default function ContactPage() {

    return (
        <div className="w-full max-w-2xl md:max-w-4xl py-8 px-4 mx-auto animate-fade-in-up">
            <Breadcrumb items={[{ label: 'Contact', href: '/contact' }]} />
            <div className="text-center mb-8 animate-bounce-in">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 animate-pulse">
                        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800">Contact us</h1>
                </div>
                <p className="mt-2 text-slate-600 text-lg animate-fade-in-up animate-delay-200">Questions, collaborations, or feedback? We&apos;d love to hear from you.</p>
            </div>

            <ContactForm />

            <div className="mt-12 space-y-4">
                <h2 className="text-2xl font-bold text-slate-800">How We&apos;ll Respond</h2>
                <p className="text-slate-600">We aim to respond to all inquiries within <strong>2 business days</strong>. For more complex queries, it may take a bit longer, but we&apos;ll keep you updated.</p>
                <p className="text-slate-600">
                    Prefer email? Reach us directly at{' '}
                    <a
                        href="mailto:alvynabranches&#46;gmail&#46;com"
                        className="text-blue-600 hover:underline font-medium"
                        aria-label="Email contact at ai4lril github io"
                    >
                        alvynabranches&#46;gmail&#46;com
                    </a>
                </p>
                <p className="text-slate-600">
                    Your message and contact information will be handled securely in accordance with our{' '}
                    <Link href="/privacy" className="text-blue-600 hover:underline font-medium">
                        Privacy Policy
                    </Link>
                    .
                </p>
            </div>

            <hr className="my-12 border-slate-200" />

            <div className="text-center mb-8">
                <TeamPhoto />
                <h3 className="text-xl font-semibold text-slate-800">Meet Our Team</h3>
                <p className="text-slate-600">We&apos;re a passionate group of linguists, developers, and researchers dedicated to preserving and advancing Indian languages through AI.</p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-xl font-bold text-blue-800 mb-2">Collaboration Opportunities</h3>
                <p className="text-blue-700">Are you a researcher, institution, or organization interested in partnering on language data projects? We&apos;d love to hear your ideas! Whether it&apos;s joint research, dataset sharing, or technical collaborations, let&apos;s work together to support linguistic diversity.</p>
            </div>

            <div className="text-center py-8">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Connect With Us</h3>
                <p className="text-slate-600 mb-6">Follow us for updates on language data collection and AI research.</p>
                <div className="flex justify-center gap-6">
                    <a
                        href="https://twitter.com/alvynabranches"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Follow us on Twitter"
                        className="text-slate-600 hover:text-blue-700 transition-colors"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.21 4.21 0 001.85-2.32 8.39 8.39 0 01-2.66 1.02 4.18 4.18 0 00-7.12 3.81A11.86 11.86 0 013 4.9a4.17 4.17 0 001.29 5.58 4.13 4.13 0 01-1.9-.52v.05a4.18 4.18 0 003.35 4.1 4.21 4.21 0 01-1.89.07 4.18 4.18 0 003.9 2.9A8.39 8.39 0 012 19.54a11.84 11.84 0 006.41 1.88c7.69 0 11.89-6.37 11.89-11.89l-.01-.54A8.5 8.5 0 0022.46 6z" />
                        </svg>
                    </a>
                    <a
                        href="https://github.com/ai4lril"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Visit our GitHub"
                        className="text-slate-600 hover:text-blue-700 transition-colors"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.016c0 4.422 2.865 8.166 6.839 9.49.5.093.682-.216.682-.48 0-.237-.009-.866-.014-1.701-2.782.605-3.369-1.343-3.369-1.343-.455-1.158-1.11-1.467-1.11-1.467-.907-.62.069-.607.069-.607 1.003.07 1.53 1.031 1.53 1.031.892 1.53 2.341 1.088 2.91.833.091-.647.35-1.088.636-1.338-2.221-.253-4.555-1.112-4.555-4.945 0-1.092.39-1.987 1.029-2.687-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.026 2.748-1.026.546 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.687 0 3.842-2.337 4.688-4.566 4.937.359.31.678.92.678 1.854 0 1.337-.012 2.416-.012 2.744 0 .266.18.576.688.478A10.02 10.02 0 0022 12.016C22 6.484 17.523 2 12 2z" clipRule="evenodd" />
                        </svg>
                    </a>
                </div>
            </div>

            <hr className="my-12 border-slate-200" />

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-800 text-center">Frequently Asked Questions</h2>
                <div className="max-w-3xl mx-auto space-y-4">
                    <details className="bg-white border border-slate-200 rounded-lg p-4">
                        <summary className="font-semibold text-slate-700 cursor-pointer pb-2">What should I include in my message?</summary>
                        <p className="text-slate-600 mt-2 pl-4">Please provide your name, email, and a clear description of your query. If it's about collaboration or technical support, include relevant details like the language or feature you're interested in.</p>
                    </details>
                    <details className="bg-white border border-slate-200 rounded-lg p-4">
                        <summary className="font-semibold text-slate-700 cursor-pointer pb-2">How long does it take to get a response?</summary>
                        <p className="text-slate-600 mt-2 pl-4">We strive to respond within 2 business days. For research partnerships or complex technical issues, we may need additional time but will acknowledge receipt promptly.</p>
                    </details>
                    <details className="bg-white border border-slate-200 rounded-lg p-4">
                        <summary className="font-semibold text-slate-700 cursor-pointer pb-2">Can I contribute to the project?</summary>
                        <p className="text-slate-600 mt-2 pl-4">Absolutely! We're always looking for contributors. Whether you're a linguist, developer, or language speaker, check our GitHub for open issues or contact us to discuss contribution opportunities.</p>
                    </details>
                    <details className="bg-white border border-slate-200 rounded-lg p-4">
                        <summary className="font-semibold text-slate-700 cursor-pointer pb-2">Is my information secure?</summary>
                        <p className="text-slate-600 mt-2 pl-4">Yes, we take data privacy seriously. Your contact information is used only to respond to your inquiry and is protected under our Privacy Policy. We do not share it with third parties without consent.</p>
                    </details>
                </div>
            </div>

        </div>
    );
}
