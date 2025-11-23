import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Data Subject Rights Portal | Exercise Your Privacy Rights",
    description: "Access, correct, delete, or export your personal data. Exercise your GDPR, CCPA, and other data protection rights through our secure portal.",
    keywords: [
        "data subject rights",
        "GDPR rights",
        "CCPA rights",
        "data access",
        "data deletion",
        "privacy rights",
        "data portability",
        "consent management",
        "subject access request"
    ],
    openGraph: {
        title: "Data Subject Rights Portal | ILHRF",
        description: "Exercise your data protection rights securely and efficiently.",
        type: "website",
        images: [
            {
                url: "/og-data-rights.jpg",
                width: 1200,
                height: 630,
                alt: "Data Subject Rights Portal - ILHRF",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Data Subject Rights Portal | ILHRF",
        description: "Secure access to your data rights and privacy controls.",
        images: ["/og-data-rights.jpg"],
    },
};

export default function DataRightsPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl animate-fade-in-up">
            <div className="glass rounded-2xl p-6 md:p-8 border border-slate-100 animate-bounce-in">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-full bg-gradient-to-br from-green-100 to-blue-100 animate-pulse">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Data Subject Rights Portal</h1>
                        <p className="mt-1 text-slate-600">Exercise your data protection rights securely</p>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">🛡️ Your Rights are Protected</h3>
                    <p className="text-blue-700 text-sm">
                        This portal allows you to exercise your data protection rights under GDPR, CCPA, and other
                        international privacy regulations. All requests are processed securely and efficiently.
                    </p>
                </div>

                {/* GDPR Rights Section */}
                <section className="mt-10 animate-fade-in-up animate-delay-200">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-100">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        GDPR Rights (EU Residents)
                    </h2>
                    <div className="mt-3 h-1 w-20 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>

                    <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 title="GDPR Article 15" className="font-semibold text-blue-800 mb-2">Right to Access (Article 15)</h3>
                                <p className="text-blue-700 text-sm mb-3">
                                    Request a copy of your personal data we process.
                                </p>
                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                                    Request Data Access
                                </button>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h3 title="GDPR Article 16" className="font-semibold text-green-800 mb-2">Right to Rectification (Article 16)</h3>
                                <p className="text-green-700 text-sm mb-3">
                                    Correct inaccurate or incomplete personal data.
                                </p>
                                <button className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                                    Request Correction
                                </button>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <h3 title="GDPR Article 17" className="font-semibold text-red-800 mb-2">Right to Erasure (Article 17)</h3>
                                <p className="text-red-700 text-sm mb-3">
                                    Request deletion of your personal data.
                                </p>
                                <button className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                                    Request Deletion
                                </button>
                            </div>

                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <h3 title="GDPR Article 20" className="font-semibold text-purple-800 mb-2">Right to Data Portability (Article 20)</h3>
                                <p className="text-purple-700 text-sm mb-3">
                                    Receive your data in a structured format.
                                </p>
                                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                                    Request Data Export
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <h3 title="GDPR Article 18" className="font-semibold text-orange-800 mb-2">Right to Restrict Processing (Article 18)</h3>
                                <p className="text-orange-700 text-sm mb-3">
                                    Limit how we process your personal data.
                                </p>
                                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                                    Request Restriction
                                </button>
                            </div>

                            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                                <h3 title="GDPR Article 21" className="font-semibold text-teal-800 mb-2">Right to Object (Article 21)</h3>
                                <p className="text-teal-700 text-sm mb-3">
                                    Object to processing based on legitimate interests.
                                </p>
                                <button className="w-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                                    Object to Processing
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CCPA Rights Section */}
                <section className="mt-10 animate-fade-in-up animate-delay-300">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
                        <div className="p-2 rounded-full bg-orange-100">
                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        CCPA Rights (California Residents)
                    </h2>
                    <div className="mt-3 h-1 w-20 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>

                    <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <h3 title="CCPA §1798.110" className="font-semibold text-orange-800 mb-2">Right to Know</h3>
                                <p className="text-orange-700 text-sm mb-3">
                                    What personal information we collect and use.
                                </p>
                                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                                    Request Information
                                </button>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <h3 title="CCPA §1798.105" className="font-semibold text-red-800 mb-2">Right to Delete</h3>
                                <p className="text-red-700 text-sm mb-3">
                                    Request deletion of your personal information.
                                </p>
                                <button className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                                    Request Deletion
                                </button>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h3 title="CCPA §1798.106" className="font-semibold text-green-800 mb-2">Right to Correct</h3>
                                <p className="text-green-700 text-sm mb-3">
                                    Correct inaccurate personal information.
                                </p>
                                <button className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                                    Request Correction
                                </button>
                            </div>

                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <h3 title="CCPA §1798.120" className="font-semibold text-purple-800 mb-2">Do Not Sell My Info</h3>
                                <p className="text-purple-700 text-sm mb-3">
                                    Opt-out of sale/sharing of personal information.
                                </p>
                                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                                    Opt-Out of Sale
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Consent Management */}
                <section className="mt-10 animate-fade-in-up animate-delay-400">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
                        <div className="p-2 rounded-full bg-teal-100">
                            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        Consent Management
                    </h2>
                    <div className="mt-3 h-1 w-20 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full"></div>

                    <div className="mt-4 space-y-4">
                        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                            <h3 className="font-semibold text-teal-800 mb-2">Manage Your Consents</h3>
                            <p className="text-teal-700 text-sm mb-4">
                                Review and modify your consent preferences for different types of data processing.
                            </p>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                    <div>
                                        <h4 className="font-medium text-gray-800">Research Data Collection</h4>
                                        <p className="text-sm text-gray-600">Contributing language data for research</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                    <div>
                                        <h4 className="font-medium text-gray-800">Analytics & Performance</h4>
                                        <p className="text-sm text-gray-600">Website usage analytics and improvements</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                    <div>
                                        <h4 className="font-medium text-gray-800">Communication Preferences</h4>
                                        <p className="text-sm text-gray-600">Updates about research and platform changes</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-10">
                    <h2 className="text-xl font-semibold text-slate-800">Consents by data type</h2>
                    <p className="text-sm text-slate-600 mt-1">Fine-grained control across audio, text, and metadata contributions.</p>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {[
                            { title: "Audio contributions", description: "Speech clips, spontaneous responses", link: "/privacy-settings#audio" },
                            { title: "Text & annotations", description: "Transcripts, POS/NER labels", link: "/privacy-settings#text" },
                            { title: "Metadata & analytics", description: "Language choices, device info", link: "/privacy-settings#metadata" },
                        ].map((item) => (
                            <div key={item.title} className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm">
                                <h3 className="font-semibold text-slate-800">{item.title}</h3>
                                <p className="text-slate-600 mt-1">{item.description}</p>
                                <Link href={item.link} className="text-indigo-600 hover:underline mt-3 inline-flex items-center gap-1">
                                    Manage consent →
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Request Status & History */}
                <section className="mt-10 animate-fade-in-up animate-delay-500">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
                        <div className="p-2 rounded-full bg-gray-100">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        Request History & Status
                    </h2>
                    <div className="mt-3 h-1 w-20 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full"></div>

                    <div className="mt-4 space-y-4">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-800 mb-2">Recent Requests</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                    <div>
                                        <h4 className="font-medium text-gray-800">Data Access Request</h4>
                                        <p className="text-sm text-gray-600">Submitted on Dec 15, 2024</p>
                                    </div>
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                                        Processing
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                    <div>
                                        <h4 className="font-medium text-gray-800">Consent Withdrawal</h4>
                                        <p className="text-sm text-gray-600">Submitted on Dec 10, 2024</p>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                        Completed
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white/95 p-4">
                            <h3 className="font-semibold text-slate-800 mb-2">Live tracking & ETAs</h3>
                            <ol className="relative border-l border-slate-200 ml-3 space-y-4 text-sm text-slate-700">
                                <li className="pl-4">
                                    <span className="absolute -left-1 top-1 w-3 h-3 rounded-full bg-indigo-500"></span>
                                    Request submitted → instant confirmation email.
                                </li>
                                <li className="pl-4">
                                    <span className="absolute -left-1 top-1 w-3 h-3 rounded-full bg-yellow-500"></span>
                                    Identity verification → within 3 business days.
                                </li>
                                <li className="pl-4">
                                    <span className="absolute -left-1 top-1 w-3 h-3 rounded-full bg-emerald-500"></span>
                                    Fulfillment → 15 days (EU) / 45 days (US). Complex exports may take longer; we'll notify you.
                                </li>
                            </ol>
                        </div>
                    </div>
                </section>

                {/* Help & Support */}
                <section className="mt-10 animate-fade-in-up animate-delay-600">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
                        <div className="p-2 rounded-full bg-indigo-100">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        Need Help?
                    </h2>
                    <div className="mt-3 h-1 w-20 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full"></div>

                    <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                                <h3 className="font-semibold text-indigo-800 mb-2">Contact Data Protection Officer</h3>
                                <p className="text-indigo-700 text-sm mb-3">
                                    For questions about your rights or assistance with requests:
                                </p>
                                <p className="text-indigo-700 text-sm font-medium">
                                    Email: dpo@language-data-collection.org
                                </p>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h3 className="font-semibold text-green-800 mb-2">General Support</h3>
                                <p className="text-green-700 text-sm mb-3">
                                    For technical support or general inquiries:
                                </p>
                                <p className="text-green-700 text-sm font-medium">
                                    Email: support@language-data-collection.org
                                </p>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Response Times</h3>
                            <ul className="list-disc ml-6 space-y-1 text-yellow-700">
                                <li><strong>GDPR Rights Requests:</strong> Responded within 30 days</li>
                                <li><strong>CCPA Rights Requests:</strong> Responded within 45 days</li>
                                <li><strong>Urgent Security Concerns:</strong> Responded within 24 hours</li>
                                <li><strong>General Inquiries:</strong> Responded within 5 business days</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Legal Notice */}
                <div className="mt-10 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">Legal Notice</h3>
                    <p className="text-gray-700 text-sm">
                        This Data Subject Rights Portal is provided in compliance with GDPR Article 12-23, CCPA Sections 1798.100-1798.199,
                        and other applicable data protection regulations. All requests are logged for compliance purposes and processed
                        securely. Your rights are protected globally, regardless of your location.
                    </p>
                </div>
            </div>
        </div>
    );
}
