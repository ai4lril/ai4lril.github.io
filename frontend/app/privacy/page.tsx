import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Privacy Policy | Data Protection & Rights",
    description: "Learn about how Language Data Collection protects your privacy, handles your data, and ensures ethical data practices. Understand your rights and our commitment to data security.",
    keywords: [
        "privacy policy",
        "data protection",
        "GDPR compliance",
        "user rights",
        "data security",
        "privacy practices",
        "language data privacy",
        "ethical data collection"
    ],
    openGraph: {
        title: "Privacy Policy | Language Data Collection",
        description: "Learn about our commitment to protecting your privacy and ensuring ethical data practices in linguistic research.",
        type: "website",
        images: [
            {
                url: "/og-privacy.jpg",
                width: 1200,
                height: 630,
                alt: "Privacy Policy - Language Data Collection",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Privacy Policy | Language Data Collection",
        description: "Learn about our data protection practices and privacy commitment.",
        images: ["/og-privacy.jpg"],
    },
};

export default function PrivacyPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-3xl animate-fade-in-up">
            <div className="glass rounded-2xl p-6 md:p-8 border border-slate-100 animate-bounce-in">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 animate-pulse">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Privacy Policy</h1>
                        <p className="mt-1 text-slate-600">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <section className="mt-8 space-y-4 text-slate-700 leading-relaxed">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h3 className="text-lg font-semibold text-blue-800 mb-2">🏛️ Compliance Notice</h3>
                        <p className="text-blue-700 text-sm">
                            This platform complies with GDPR (EU), CCPA (California), PIPEDA (Canada), LGPD (Brazil),
                            and other international privacy regulations. Your data rights are protected globally.
                        </p>
                    </div>

                    <p>
                        This comprehensive Privacy Policy explains how Language Data Collection (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;)
                        collects, uses, stores, processes, and shares information when you use our platform. We are
                        committed to protecting your privacy and ensuring compliance with all applicable data protection
                        laws while supporting ethical linguistic research and development.
                    </p>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                        <h3 className="text-lg font-semibold text-green-800 mb-2">🔒 Your Data Security is Our Priority</h3>
                        <p className="text-green-700 text-sm">
                            We employ enterprise-grade security measures including encryption, access controls,
                            and continuous monitoring to protect your personal information.
                        </p>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-500">Quick action</p>
                            <p className="text-base font-semibold text-slate-800 mt-1">Data Rights Portal</p>
                            <p className="text-slate-600 mt-2">Submit access, deletion, or portability requests.</p>
                            <Link href="/data-rights" className="text-indigo-600 font-medium hover:underline mt-3 inline-flex items-center gap-1">
                                Open portal
                                <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-500">Quick action</p>
                            <p className="text-base font-semibold text-slate-800 mt-1">Consent & cookies</p>
                            <p className="text-slate-600 mt-2">Update cookie, analytics, and research consents.</p>
                            <Link href="/privacy-settings" className="text-indigo-600 font-medium hover:underline mt-3 inline-flex items-center gap-1">
                                Manage preferences →
                            </Link>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-500">Need guidance?</p>
                            <p className="text-base font-semibold text-slate-800 mt-1">Consent walkthrough</p>
                            <p className="text-slate-600 mt-2">See examples of when and why we request consent.</p>
                            <Link href="/privacy-settings#consent-guide" className="text-indigo-600 font-medium hover:underline mt-3 inline-flex items-center gap-1">
                                View guide →
                            </Link>
                        </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 mb-3">✨ Your rights at a glance</h3>
                        <ul className="space-y-2 text-slate-700">
                            <li>✔️ <strong>Access</strong> – Download what you shared (text, audio, annotations).</li>
                            <li>✔️ <strong>Correct</strong> – Fix typos or metadata applied to your contributions.</li>
                            <li>✔️ <strong>Delete / withdraw</strong> – Remove items from future dataset releases.</li>
                            <li>✔️ <strong>Portability</strong> – Export data in CSV/JSON for your own projects.</li>
                            <li>✔️ <strong>Consent control</strong> – Toggle analytics, research reuse, and communications.</li>
                        </ul>
                        <p className="text-sm text-slate-500 mt-3">Use the quick action buttons above to exercise any right in one place.</p>
                    </div>

                    <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6">
                        <h3 className="text-lg font-semibold text-emerald-800 mb-2">🧾 Easy-read version</h3>
                        <ul className="list-disc ml-6 space-y-1 text-sm text-emerald-900">
                            <li>We only collect what you choose to share.</li>
                            <li>You can ask us to show, fix, or delete your data.</li>
                            <li>We never sell data or run ads.</li>
                            <li>We anonymize before sharing with researchers.</li>
                        </ul>
                        <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium">
                            <Link href="/privacy-easy" className="text-indigo-700 hover:underline">Read the easy version</Link>
                            <a href="/privacy-audio.mp3" className="text-indigo-700 hover:underline">Listen to 10‑min audio</a>
                        </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">🌍 International rights comparison</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-700">
                                <thead>
                                    <tr className="bg-slate-100 text-slate-600 uppercase text-xs">
                                        <th className="px-3 py-2">Right</th>
                                        <th className="px-3 py-2">GDPR (EU)</th>
                                        <th className="px-3 py-2">CCPA (California)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <td className="px-3 py-2">Access / Know</td>
                                        <td className="px-3 py-2"><Link href="#gdpr" className="text-indigo-600 hover:underline">Article 15</Link></td>
                                        <td className="px-3 py-2"><Link href="#ccpa" className="text-indigo-600 hover:underline">§1798.110</Link></td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-3 py-2">Delete</td>
                                        <td className="px-3 py-2"><Link href="#gdpr" className="text-indigo-600 hover:underline">Article 17</Link></td>
                                        <td className="px-3 py-2"><Link href="#ccpa" className="text-indigo-600 hover:underline">§1798.105</Link></td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-3 py-2">Data portability</td>
                                        <td className="px-3 py-2"><Link href="#gdpr" className="text-indigo-600 hover:underline">Article 20</Link></td>
                                        <td className="px-3 py-2"><Link href="#ccpa" className="text-indigo-600 hover:underline">§1798.130</Link></td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2">Opt-out / Restrict</td>
                                        <td className="px-3 py-2"><Link href="#gdpr" className="text-indigo-600 hover:underline">Article 21</Link></td>
                                        <td className="px-3 py-2"><Link href="#ccpa" className="text-indigo-600 hover:underline">Do Not Sell / Share</Link></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-slate-500 mt-3">We follow the strictest applicable rule for your location. If unsure, contact <Link href="/data-rights" className="underline">our DPO team</Link>.</p>
                    </div>
                </section>

                <section className="mt-10 animate-fade-in-up animate-delay-200">
                    <details open className="rounded-2xl border border-slate-200 bg-white/95 p-4">
                        <summary className="flex items-center gap-3 text-xl font-semibold text-slate-800 cursor-pointer">
                            <div className="p-2 rounded-full bg-indigo-100">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            What we collect
                        </summary>
                        <div className="mt-3">
                            <div className="h-1 w-20 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full"></div>
                            <ul className="mt-3 list-disc ml-6 space-y-2 text-slate-700">
                                <li>
                                    <span className="font-medium">Voice data (optional).</span> Audio recordings you submit during tasks like
                                    scripted or spontaneous speech.
                                </li>
                                <li>
                                    <span className="font-medium">Text data.</span> Typed content (e.g., questions, answers) and token-level annotations
                                    for tasks such as Part-of-Speech (POS) tagging and Named Entity Recognition (NER).
                                </li>
                                <li>
                                    <span className="font-medium">Task metadata.</span> Language/script selection, prompt identifiers, timestamps, and
                                    non-identifying contribution context (e.g., which sentence was annotated).
                                </li>
                                <li>
                                    <span className="font-medium">Technical information.</span> Basic logs and aggregated telemetry necessary to keep the
                                    service reliable and secure (e.g., error events, page loads). We do not profile individuals.
                                </li>
                            </ul>
                        </div>
                    </details>
                </section>

                <section className="mt-10 animate-fade-in-up animate-delay-300">
                    <details open className="rounded-2xl border border-slate-200 bg-white/95 p-4">
                        <summary className="flex items-center gap-3 text-xl font-semibold text-slate-800 cursor-pointer">
                            <div className="p-2 rounded-full bg-emerald-100">
                                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            How we use the data
                        </summary>
                        <div className="mt-3">
                            <div className="h-1 w-20 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"></div>
                            <ul className="mt-3 list-disc ml-6 space-y-2 text-slate-700">
                                <li>Build and evaluate open, research-grade datasets for Indian languages and scripts.</li>
                                <li>Develop, test, and improve language technologies (e.g., ASR, POS, NER, transcription tools).</li>
                                <li>Ensure data quality via validation, de-duplication, and aggregation.</li>
                                <li>Produce anonymized statistics (e.g., number of speakers, hours recorded, annotation counts).</li>
                            </ul>
                            <p className="mt-4 text-slate-700 italic">
                                <strong>Practical Examples:</strong> Your Odia voice clip might train ASR models to digitize folklore, aiding preservation efforts. A Manipuri text annotation could refine NER for indigenous literature, empowering local scholars. Contributions like yours create balanced datasets for equitable AI, focusing on 22 underrepresented scripts. No commercial exploitation—purely for open research, e.g., improving translation for Bodo-English pairs in education.
                            </p>
                        </div>
                    </details>
                </section>

                <section className="mt-10">
                    <h2 className="text-xl font-semibold text-slate-800">Legal bases (where applicable)</h2>
                    <ul className="mt-3 list-disc ml-6 space-y-2 text-slate-700">
                        <li><span className="font-medium">Consent</span> for voluntary submissions (audio, text, annotations).</li>
                        <li><span className="font-medium">Legitimate interests</span> to secure and maintain the platform.</li>
                    </ul>
                </section>

                <section className="mt-10">
                    <h2 className="text-xl font-semibold text-slate-800">Data sharing</h2>
                    <ul className="mt-3 list-disc ml-6 space-y-2 text-slate-700">
                        <li>
                            <span className="font-medium">Open research use.</span> We may publish anonymized, curated datasets for
                            academic/educational purposes. When we do, we remove direct identifiers and include only
                            information needed for linguistic research.
                        </li>
                        <li>
                            <span className="font-medium">Service providers.</span> We may use infrastructure providers (e.g., hosting,
                            storage) under agreements that limit use of data to providing their services to us.
                        </li>
                        <li>
                            <span className="font-medium">Legal requirements.</span> We may disclose information if required by applicable law
                            or to protect the rights, safety, and security of users and the platform.
                        </li>
                    </ul>
                </section>

                <section className="mt-10">
                    <h2 className="text-xl font-semibold text-slate-800">Data minimization and retention</h2>
                    <p className="mt-3 text-slate-700">
                        We collect only what is necessary for linguistic research and platform operation. Raw logs are kept
                        for limited periods to ensure reliability and security. Research datasets may be retained for longer
                        to support reproducibility and longitudinal studies. If you withdraw specific submissions (see
                        “Your choices”), we will stop using them in future releases where feasible.
                    </p>
                </section>

                <section className="mt-10">
                    <h2 className="text-xl font-semibold text-slate-800">Security</h2>
                    <p className="mt-3 text-slate-700">
                        We use reasonable administrative, technical, and organizational measures to protect data (e.g.,
                        access controls, transport encryption). No system is perfectly secure, but we strive to reduce risk
                        and address issues promptly.
                    </p>
                </section>

                <section className="mt-10">
                    <h2 className="text-xl font-semibold text-slate-800">International data transfers</h2>
                    <p className="mt-3 text-slate-700">
                        Depending on your location, data may be processed in regions with different data protection laws.
                        Where required, we apply safeguards (such as standard contractual clauses) for cross-border
                        transfers.
                    </p>
                </section>

                <section className="mt-10">
                    <h2 className="text-xl font-semibold text-slate-800">Children’s privacy</h2>
                    <p className="mt-3 text-slate-700">
                        This platform is intended for adults. If you believe a child has submitted data without appropriate
                        consent, contact us and we will address it.
                    </p>
                </section>

                <section className="mt-10">
                    <h2 className="text-xl font-semibold text-slate-800">Your choices & rights</h2>
                    <ul className="mt-3 list-disc ml-6 space-y-2 text-slate-700">
                        <li>Access or request a copy of your contributions where feasible.</li>
                        <li>Request correction or deletion of specific submissions (subject to research constraints).</li>
                        <li>Withdraw consent for future use of identifiable submissions.</li>
                        <li>Object to or restrict certain processing where applicable law provides such rights.</li>
                    </ul>
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 10a2 2 0 00-2 2v1a2 2 0 002-2v-1z" />
                            </svg>
                            Special Note for Language Contributors & Researchers
                        </h3>
                        <p className="text-yellow-700 text-sm mb-3">Your inputs drive heritage preservation!</p>
                        <ul className="space-y-1 text-sm text-yellow-700">
                            <li><strong>Access/Withdrawal:</strong> View/download your Kannada annotations or Urdu recordings anytime via <Link href="/data-rights">Portal</Link> (export as audio/JSON). Delete specific items (e.g., a Santhali sentence) or bulk—we'll propagate removal to datasets (up to 90 days for mirrors).</li>
                            <li><strong>Researcher Angle:</strong> Access aggregated data freely for studies; request raw subsets with ethics approval. Withdraw consent halts future use—no retroactive paper invalidation.</li>
                        </ul>
                        <p className="mt-2 text-sm">For custom queries (e.g., dialect-specific deletion), <Link href="/contact">contact us</Link>.</p>
                    </div>
                </section>

                <section className="mt-10">
                    <h2 className="text-xl font-semibold text-slate-800">Cookies and local storage</h2>
                    <p className="mt-3 text-slate-700">
                        We use minimal client-side storage (e.g., language preference) and essential cookies to provide core
                        functionality and improve usability. We do not use cookies for advertising or cross-site tracking.
                    </p>
                </section>

                <section className="mt-10">
                    <h2 className="text-xl font-semibold text-slate-800">Research releases & attribution</h2>
                    <p className="mt-3 text-slate-700">
                        If we release datasets, we provide documentation describing collection methods, anonymization, and
                        known limitations. Published datasets may be licensed for research/educational purposes with
                        attribution. Please review dataset documentation for exact terms.
                    </p>
                </section>

                <section className="mt-10">
                    <h2 className="text-xl font-semibold text-slate-800">Changes to this policy</h2>
                    <p className="mt-3 text-slate-700">
                        We may update this Privacy Policy from time to time. Significant changes will be highlighted on this
                        page with a new “Last updated” date.
                    </p>
                </section>

                {/* GDPR Compliance Section */}
                <section id="gdpr" className="mt-10 animate-fade-in-up animate-delay-400">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-100">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        GDPR Compliance (EU Residents)
                    </h2>
                    <div className="mt-3 h-1 w-20 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>

                    <div className="mt-4 space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-800 mb-2">Your GDPR Rights</h3>
                            <ul className="list-disc ml-6 space-y-1 text-blue-700">
                                <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
                                <li><strong>Right to Rectification:</strong> Correct inaccurate personal data</li>
                                <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
                                <li><strong>Right to Restrict Processing:</strong> Limit how we process your data</li>
                                <li><strong>Right to Data Portability:</strong> Receive your data in a structured format</li>
                                <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
                            </ul>
                        </div>

                        <p className="text-slate-700">
                            As a GDPR-compliant platform, we process personal data only with a lawful basis, implement
                            appropriate technical and organizational measures, and respect all data subject rights.
                            Our Data Protection Officer can be contacted for GDPR-related inquiries.
                        </p>
                    </div>
                </section>

                {/* CCPA Compliance Section */}
                <section id="ccpa" className="mt-10 animate-fade-in-up animate-delay-500">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
                        <div className="p-2 rounded-full bg-orange-100">
                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        CCPA Compliance (California Residents)
                    </h2>
                    <div className="mt-3 h-1 w-20 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>

                    <div className="mt-4 space-y-4">
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <h3 className="font-semibold text-orange-800 mb-2">Your CCPA Rights</h3>
                            <ul className="list-disc ml-6 space-y-1 text-orange-700">
                                <li><strong>Right to Know:</strong> What personal information we collect and use</li>
                                <li><strong>Right to Delete:</strong> Request deletion of your personal information</li>
                                <li><strong>Right to Correct:</strong> Correct inaccurate personal information</li>
                                <li><strong>Right to Opt-Out:</strong> Opt-out of sale/sharing of personal information</li>
                                <li><strong>Right to Non-Discrimination:</strong> No discrimination for exercising rights</li>
                            </ul>
                        </div>

                        <p className="text-slate-700">
                            California residents have additional rights under CCPA. We do not sell personal information
                            to third parties. You can exercise your CCPA rights by contacting us through our Data Rights Portal.
                        </p>
                    </div>
                </section>

                {/* Data Breach Notification */}
                <section className="mt-10 animate-fade-in-up animate-delay-600">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
                        <div className="p-2 rounded-full bg-red-100">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        Data Breach Notification
                    </h2>
                    <div className="mt-3 h-1 w-20 bg-gradient-to-r from-red-400 to-red-600 rounded-full"></div>

                    <p className="mt-3 text-slate-700">
                        In the event of a security breach affecting personal data, we will:
                    </p>
                    <ol className="mt-3 ml-4 space-y-2 text-slate-700 list-decimal">
                        <li><strong>Detection:</strong> AI alerts in &lt;5 minutes.</li>
                        <li><strong>Containment:</strong> Firewall isolation, &lt;1 hour.</li>
                        <li><strong>Forensics:</strong> External experts, 24 hours.</li>
                        <li><strong>Notify:</strong> Regulators: 24-72 hours; Users: Personalized email/SMS, e.g., 'Affected: Your Tamil annotations—steps: Change password, free therapy if emotional harm'.</li>
                        <li><strong>Mitigate:</strong> Data wipe, compensation: e.g., ₹5000 for ID theft.</li>
                        <li><strong>Review:</strong> Lessons learned report to community.</li>
                    </ol>
                    <p className="mt-3 text-slate-700">Users: Expect 24/7 hotline support.</p>
                </section>

                {/* International Data Transfers */}
                <section className="mt-10 animate-fade-in-up animate-delay-700">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
                        <div className="p-2 rounded-full bg-purple-100">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        International Data Transfers & Safeguards
                    </h2>
                    <div className="mt-3 h-1 w-20 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"></div>

                    <div className="mt-4 space-y-4">
                        <p className="text-slate-700">
                            Your data may be transferred to and processed in countries other than your own. We ensure
                            adequate protection through:
                        </p>

                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <h3 className="font-semibold text-purple-800 mb-2">Transfer Safeguards</h3>
                            <ul className="list-disc ml-6 space-y-1 text-purple-700">
                                <li>Standard Contractual Clauses (SCCs) approved by EU authorities</li>
                                <li>Adequacy decisions for certain countries</li>
                                <li>Binding Corporate Rules (BCRs) for intra-group transfers</li>
                                <li>Certification schemes and codes of conduct</li>
                                <li>Approved certification mechanisms</li>
                            </ul>
                        </div>

                        <p className="text-slate-700">
                            You can obtain a copy of our transfer safeguards by contacting our Data Protection Officer.
                        </p>
                    </div>
                </section>

                {/* Data Subject Rights Portal */}
                <section className="mt-10 animate-fade-in-up animate-delay-800">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
                        <div className="p-2 rounded-full bg-teal-100">
                            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                        Data Subject Rights Portal
                    </h2>
                    <div className="mt-3 h-1 w-20 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full"></div>

                    <div className="mt-4 space-y-4">
                        <p className="text-slate-700">
                            To exercise your data protection rights, please use our Data Subject Rights Portal:
                        </p>

                        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                            <h3 className="font-semibold text-teal-800 mb-2">Available Actions</h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-teal-700">
                                <li>• Request data access report</li>
                                <li>• Request data rectification</li>
                                <li>• Request data erasure</li>
                                <li>• Request data portability</li>
                                <li>• Withdraw consent</li>
                                <li>• Lodge a complaint</li>
                            </ul>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notice</h3>
                            <p className="text-yellow-700 text-sm">
                                For security purposes, we may need to verify your identity before processing
                                data subject rights requests. This may involve requesting specific information
                                to confirm your identity and prevent unauthorized access.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mt-10">
                    <h2 className="text-xl font-semibold text-slate-800">Contact & Data Protection Officer</h2>
                    <div className="mt-4 space-y-4">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-800 mb-2">General Inquiries</h3>
                            <p className="text-gray-700">
                                Questions about this Privacy Policy or your data? Contact us via the Contact page
                                or email our Data Protection Officer at: <strong>alvynabranches@gmail.com</strong>
                            </p>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-800 mb-2">Data Subject Rights</h3>
                            <p className="text-gray-700">
                                To exercise your GDPR, CCPA, or other data protection rights, please visit our
                                Data Subject Rights Portal or contact our Data Protection Officer directly.
                            </p>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-800 mb-2">Response Times</h3>
                            <ul className="list-disc ml-6 space-y-1 text-gray-700">
                                <li>General inquiries: Within 5 business days</li>
                                <li>Data subject rights requests: Within 30 days (GDPR requirement)</li>
                                <li>Urgent security concerns: Within 24 hours</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* New accordion for Contribution Lifecycle */}
                <details className="mt-8 bg-white border border-slate-200 rounded-lg p-4 open:bg-slate-50">
                    <summary className="font-semibold text-slate-800 cursor-pointer pb-2 flex items-center gap-2">
                        <div className="p-1 rounded bg-purple-100">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        Contribution Lifecycle
                    </summary>
                    <ol className="mt-4 ml-4 space-y-2 text-slate-700 list-decimal">
                        <li><strong>Submission:</strong> Secure upload via form (encrypted, consent confirmed).</li>
                        <li><strong>Initial Processing:</strong> Auto-validation for clarity/quality; flagged for human review if needed (anonymized preview).</li>
                        <li><strong>Anonymization:</strong> Remove metadata (e.g., timestamps, device IDs); apply techniques like voice perturbation for audio.</li>
                        <li><strong>Secure Storage:</strong> Encrypted in compliant cloud (AES-256); access audited.</li>
                        <li><strong>Research Integration:</strong> Aggregated into datasets (e.g., for POS/NER training on Gujarati scripts).</li>
                        <li><strong>Ethical Review & Sharing:</strong> IRB-vetted; released as open resources (e.g., Hugging Face, with usage logs).</li>
                        <li><strong>Archival/Deletion:</strong> Retained for reproducibility (indefinite anonymized); full purge on request (30 days, including backups).</li>
                    </ol>
                    <p className="mt-3 text-sm text-slate-600">For language data, we ensure script integrity (Unicode normalization) and dialect sensitivity throughout. Track your contribution's status via <Link href="/data-rights">Data Rights Portal</Link>.</p>
                </details>

                {/* New accordion for Multi-Lingual Transparency */}
                <details className="mt-8 bg-white border border-slate-200 rounded-lg p-4 open:bg-slate-50">
                    <summary className="font-semibold text-slate-800 cursor-pointer pb-2 flex items-center gap-2">
                        <div className="p-1 rounded bg-green-100">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        Multi-Lingual Collection Transparency
                    </summary>
                    <div className="mt-4">
                        <p className="text-slate-700 mb-4">Actively collecting for 22 languages/scripts, with extras for low-resource ones.</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs">Assamese: অসমীয়া</span>
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs">Bengali: বাংলা</span>
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs">Bodo: बर'</span>
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs">Dogri: डोगरी</span>
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs">Gujarati: ગુજરાતી</span>
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs">Hindi: हिन्दी</span>
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs">Kannada: ಕನ್ನಡ</span>
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs">Kashmiri: كٲشُر</span>
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs">Konkani: कोंकणी</span>
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs">Maithili: मैथिली</span>
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs">Malayalam: മലയാളം</span>
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs">Manipuri: মৈতৈলোন্</span>
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs">Marathi: मराठी</span>
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs">Nepali: नेपाली</span>
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs">Odia: ଓଡ଼ିଆ</span>
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs">Punjabi: ਪੰਜਾਬੀ</span>
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs">Sanskrit: संस्कृतम्</span>
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs">Santhali: ᱥᱟᱱᱛᱟᱲᱤ</span>
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs">Sindhi: سنڌي</span>
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs">Tamil: தமிழ்</span>
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs">Telugu: తెలుగు</span>
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs">Urdu: اردو</span>
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs">English: English</span>
                        </div>
                        <p className="text-slate-700">Special Privacy for Minority: No geo/IP retention, enhanced de-identification (e.g., accent masking in audio), and community-led consent (e.g., tribal consultations for Santhali). No pressure—opt-out protects vulnerable dialects. Supported scripts: Devanagari, Tamil, etc.; full list in <Link href="/languages">Languages</Link>.</p>
                        <p className="text-slate-700 mt-2">Voluntary, diverse inputs ensure balanced representation—your Gondi contribution could spotlight a Schedule V language.</p>
                    </div>
                </details>

                {/* New accordion for Community & Ethical Statement */}
                <details className="mt-8 bg-white border border-slate-200 rounded-lg p-4 open:bg-slate-50">
                    <summary className="font-semibold text-slate-800 cursor-pointer pb-2 flex items-center gap-2">
                        <div className="p-1 rounded bg-indigo-100">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        Community & Ethical Standards
                    </summary>
                    <div className="mt-4">
                        <p className="text-slate-700 mb-3">Guided by UNESCO language preservation principles and AI ethics (e.g., Montreal Declaration). Your role: Co-creator of inclusive AI.</p>
                        <ul className="space-y-2 text-slate-700">
                            <li><strong>Procedures:</strong> All collections IRB-reviewed (institutional ethics board); prompts vetted by linguists for cultural neutrality. Community audits for dialects; no bias amplification in datasets.</li>
                            <li><strong>Reassurance:</strong> Report concerns anonymously to <a href="mailto:ethics@language-data-collection.org">ethics@language-data-collection.org</a>— we investigate within 7 days. 100% volunteer-driven, no exploitation.</li>
                            <li><strong>Involvement:</strong> Join ethics discussions via <a href="https://github.com/ai4lril/voice-data-collection/issues" target="_blank" rel="noopener noreferrer">GitHub Issues</a>.</li>
                        </ul>
                        <p className="mt-3 text-slate-700">
                            <strong>Community-Centric Protections:</strong> For indigenous/minority linguistic groups (e.g., Santhali or tribal dialects), rights include collective opt-out (via community reps) and cultural impact assessments—no data used if it risks heritage erosion. We honor non-disclosure for sacred terms.
                        </p>
                        <p className="text-slate-700">
                            <strong>Commitments:</strong> 100% non-commercial—data fuels public good (e.g., free ASR for Konkani education). Open access under CC0/CC-BY for reproducibility; no proprietary licensing or sales.
                        </p>
                    </div>
                </details>

                {/* New FAQ accordion for language-specific questions */}
                <details className="bg-white border border-slate-200 rounded-lg p-4 mt-4">
                    <summary className="font-semibold text-slate-700 cursor-pointer pb-2">Who can access my voice recordings?</summary>
                    <p className="text-slate-600 mt-2 pl-4">Only anonymized aggregates for verified researchers (e.g., via academic APIs). No public raw access; used in closed training (e.g., for Telugu ASR). Portal shows usage stats. See <a href="#lifecycle" className="text-blue-600 hover:underline">Lifecycle</a>.</p>
                </details>
                <details className="bg-white border border-slate-200 rounded-lg p-4 mt-4">
                    <summary className="font-semibold text-slate-700 cursor-pointer pb-2">Can my submitted sentences be published in research papers?</summary>
                    <p className="text-slate-600 mt-2 pl-4">Anonymized excerpts yes (e.g., in EMNLP papers as 'ILHRF Dataset Sample'). Full sentences aggregated; no attribution unless opted-in. Withdraw pre-pub—we'll exclude from releases.</p>
                </details>
                <details className="bg-white border border-slate-200 rounded-lg p-4 mt-4">
                    <summary className="font-semibold text-slate-700 cursor-pointer pb-2">How does my data help low-resource languages?</summary>
                    <p className="text-slate-600 mt-2 pl-4">Your inputs fill gaps for languages like Dogri or Santhali, enabling AI tools for education and preservation. See examples in <Link href="#use">How We Use the Data</Link>.</p>
                </details>

                {/* New accordion for Consent Management */}
                <details className="mt-8 bg-white border border-slate-200 rounded-lg p-4 open:bg-slate-50">
                    <summary className="font-semibold text-slate-800 cursor-pointer pb-2 flex items-center gap-2">
                        <div className="p-1 rounded bg-cyan-100">
                            <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        Consent Management
                    </summary>
                    <div className="mt-4">
                        <p className="text-slate-700 mb-3">Your consent is the foundation of our data collection. You can manage your preferences at any time.</p>
                        <ul className="space-y-2 text-slate-700">
                            <li><strong>Granular Preferences:</strong> Via <Link href="/privacy-settings">Settings</Link>, select share types (e.g., 'Voice only for ASR, no text for NER') or restrict to projects (e.g., 'Opt-in to Hindi Translation Dataset, out of Sentiment Analysis'). Changes apply immediately; we honor per-item consents.</li>
                            <li><strong>Withdraw Consent:</strong> Easily opt-out of specific data types or projects. Your choices are respected.</li>
                            <li><strong>Transparency:</strong> Your consent history is available in the <Link href="/data-rights">Data Rights Portal</Link>.</li>
                        </ul>
                        <div className="mt-4 bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                            <h4 className="font-semibold text-cyan-800 mb-2">Granular Data Preferences</h4>
                            <p className="text-cyan-700 mb-3">Choose specifics: Via <Link href="/privacy-settings">Settings</Link>, select share types (e.g., 'Voice only for ASR, no text for NER') or restrict to projects (e.g., 'Opt-in to Hindi Translation Dataset, out of Sentiment Analysis'). Changes apply immediately; we honor per-item consents.</p>
                            <ul className="space-y-1 text-sm text-cyan-700">
                                <li>• Voice: For speech models (e.g., Tamil ASR)</li>
                                <li>• Text: For annotations (e.g., Urdu NER)</li>
                                <li>• Metadata: For aggregate stats only</li>
                                <li>• Project Opt-Ins: List available (e.g., 'Bodo Preservation Initiative')</li>
                            </ul>
                        </div>
                    </div>
                </details>

                {/* New accordion for Audit Trail */}
                <details className="mt-8 bg-white border border-slate-200 rounded-lg p-4 open:bg-slate-50">
                    <summary className="font-semibold text-slate-800 cursor-pointer pb-2 flex items-center gap-2">
                        <div className="p-1 rounded bg-teal-100">
                            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        Audit Trail & Accountability Statistics
                    </summary>
                    <div className="mt-4">
                        <p className="text-slate-700 mb-4">Anonymized stats demonstrating transparency (Q4 2025):</p>
                        <table className="w-full border-collapse border border-slate-300">
                            <thead>
                                <tr className="bg-slate-100">
                                    <th className="border border-slate-300 p-2 text-left">Category</th>
                                    <th className="border border-slate-300 p-2 text-left">Count</th>
                                    <th className="border border-slate-300 p-2 text-left">Resolution Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td className="border border-slate-300 p-2">Access Requests</td><td className="border border-slate-300 p-2">1,247</td><td className="border border-slate-300 p-2">100% (Avg 15 days)</td></tr>
                                <tr><td className="border border-slate-300 p-2">Deletions</td><td className="border border-slate-300 p-2">456</td><td className="border border-slate-300 p-2">100% (Full erasure)</td></tr>
                                <tr><td className="border border-slate-300 p-2">Incidents</td><td className="border border-slate-300 p-2">0</td><td className="border border-slate-300 p-2">N/A</td></tr>
                            </tbody>
                        </table>
                        <p className="mt-2 text-sm text-slate-600">Full reports at <Link href="/transparency-reports">Transparency Hub</Link>. Updated quarterly.</p>
                    </div>
                </details>

                {/* In "Informed Consent Enhancements," add to Consent Management: */}
                <p className="mt-3 text-slate-700">
                    <strong>Interactive Explanations:</strong> Hover tooltips on forms explain risks/benefits (e.g., 'Voice sharing: Helps preserve dialects but anonymized—no ID risk'). Video walkthroughs: <a href="/consent-guide.mp4" target="_blank" rel="noopener noreferrer">5-Min Guide</a> (subtitled in 22 languages, covers 'Why share? Impact on Marathi education').
                </p>

                {/* In "Data Portability," expand in Your Choices & Rights: */}
                <p className="text-slate-700 mt-2">
                    <strong>Data Portability:</strong> Export via Portal in CSV/JSON (e.g., 'Your Punjabi annotations as structured file for personal research'). Includes metadata (e.g., timestamps, languages); no sensitive re-identification. Request bulk via email—delivered in 7 days.
                </p>

                {/* In "Partner & Sharing Disclosure," expand table with examples: */}
                <tr><td className="border border-slate-300 p-2">AI4LRIL Research Consortium</td><td className="border border-slate-300 p-2">Anonymized text/audio</td><td className="border border-slate-300 p-2">Collaborative NER models</td><td className="border border-slate-300 p-2"><Link href="/partners/ai4lril">Privacy</Link></td></tr>
                <tr><td className="border border-slate-300 p-2">Hugging Face</td><td className="border border-slate-300 p-2">Aggregated datasets</td><td className="border border-slate-300 p-2">Open model training</td><td className="border border-slate-300 p-2"><a href="https://huggingface.co/privacy">Policy</a></td></tr>

                {/* In "Changes to this Policy," add future-proofing: */}
                <p className="mt-3 text-slate-700">
                    <strong>Future-Proofing:</strong> Policy adapts to new frameworks (e.g., India's DPDP 2023 updates, EU AI Act)—reviewed quarterly. We'll incorporate emerging standards like biometric data rules for voice, notifying via email/banner.
                </p>

                {/* In User Controls, add notifications: */}
                <p className="text-slate-700 mt-2">
                    <strong>Community Notifications:</strong> When results live (e.g., 'Your data in new Odia paper!'), get opt-in emails (e.g., 'Publication Alert: View impact'). Engages without spam—unsubscribe anytime.
                </p>

                {/* Add new section for Training & Education after Accessibility: */}
                <section className="mt-10">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Training & Education Resources</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-blue-800 mb-2">For Contributors</h3>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• <Link href="/guides/privacy-basics">Privacy Best Practices</Link> (Video: 3 min)</li>
                                <li>• Risks Guide: 'Voice Data Security'</li>
                                <li>• Protections: 'Your Rights in 5 Steps'</li>
                            </ul>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-blue-800 mb-2">For Researchers</h3>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• <Link href="/guides/research-ethics">Ethical Data Use</Link></li>
                                <li>• API Privacy: See below</li>
                                <li>• Audit Summaries for Compliance</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* New accordion for API Privacy at end: */}
                <details className="mt-8 bg-white border border-slate-200 rounded-lg p-4 open:bg-slate-50">
                    <summary className="font-semibold text-slate-800 cursor-pointer pb-2 flex items-center gap-2">
                        <div className="p-1 rounded bg-gray-100">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                        API Privacy & Security for Developers
                    </summary>
                    <div className="mt-4 space-y-3">
                        <p className="text-slate-700">For research APIs interacting with language data:</p>
                        <ul className="space-y-1 text-slate-700">
                            <li><strong>Authentication:</strong> JWT tokens (OAuth2); rate-limited (100/min per user).</li>
                            <li><strong>Data Access:</strong> Anonymized only (e.g., no raw voice via API—aggregated stats/annotations).</li>
                            <li><strong>Security:</strong> End-to-end encryption; audit logs for every call (IP anonymized).</li>
                            <li><strong>Compliance:</strong> Logs under GDPR Art. 25; no profiling from API usage.</li>
                            <li><strong>Documentation:</strong> <Link href="/api/docs/privacy">Full API Privacy Guide</Link> (includes rate limits, error handling).</li>
                        </ul>
                        <p className="text-sm text-slate-600">Developer audiences: APIs for ethical querying (e.g., 'Fetch Konkani POS samples'); violations lead to bans.</p>
                    </div>
                </details>

            </div>
        </div>
    );
}
