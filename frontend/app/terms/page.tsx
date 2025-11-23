import Link from 'next/link';
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service | Usage Guidelines",
    description: "Read the terms of service for Language Data Collection. Understand our usage guidelines, data handling policies, and user responsibilities for contributing to linguistic research.",
    keywords: [
        "terms of service",
        "usage guidelines",
        "user agreement",
        "data contribution terms",
        "linguistic research terms",
        "platform usage rules",
        "open source terms",
        "language data terms"
    ],
    openGraph: {
        title: "Terms of Service | Language Data Collection",
        description: "Understand our usage guidelines and terms for contributing to linguistic research and AI development.",
        type: "website",
        images: [
            {
                url: "/og-terms.jpg",
                width: 1200,
                height: 630,
                alt: "Terms of Service - Language Data Collection",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Terms of Service | Language Data Collection",
        description: "Read our usage guidelines and terms for contributing to linguistic research.",
        images: ["/og-terms.jpg"],
    },
};

export default function TermsPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-3xl animate-fade-in-up">
            <div className="glass rounded-2xl p-6 md:p-8 border border-slate-100 animate-bounce-in">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 animate-pulse">
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Terms of Service</h1>
                        <p className="mt-1 text-slate-600">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">What You're Agreeing To (Quick Summary)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-green-100 mt-1">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-700">Ethical Contributions</h3>
                                <p className="text-sm text-slate-600">Submit voice/text for research—grant non-exclusive license for open use.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-blue-100 mt-1">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-700">Privacy First</h3>
                                <p className="text-sm text-slate-600">Your data anonymized; rights to access/delete via <Link href="/data-rights">Portal</Link>.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-purple-100 mt-1">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-700">No Abuse</h3>
                                <p className="text-sm text-slate-600">Follow community guidelines; report issues to <Link href="/contact">Contact</Link>.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-red-100 mt-1">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-700">Limited Liability</h3>
                                <p className="text-sm text-slate-600">Service 'as is'; no damages for indirect losses.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Need Privacy info?</p>
                        <p className="text-base font-semibold text-slate-800 mt-1">Read the Privacy Policy</p>
                        <p className="text-sm text-slate-600 mt-2">Understand how we handle your language data.</p>
                        <Link href="/privacy" className="mt-3 inline-flex items-center gap-1 text-indigo-600 font-medium hover:underline">
                            Go to Privacy →
                        </Link>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Exercise your rights</p>
                        <p className="text-base font-semibold text-slate-800 mt-1">Data Rights Portal</p>
                        <p className="text-sm text-slate-600 mt-2">Submit access, deletion, or portability requests anytime.</p>
                        <Link href="/data-rights" className="mt-3 inline-flex items-center gap-1 text-indigo-600 font-medium hover:underline">
                            Open portal →
                        </Link>
                    </div>
                </div>

                <section className="mt-8 space-y-4 text-slate-700 leading-relaxed">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h3 className="text-lg font-semibold text-blue-800 mb-2">📋 Legal Compliance Notice</h3>
                        <p className="text-blue-700 text-sm">
                            These terms comply with international standards including GDPR, CCPA, and other privacy regulations.
                            By using this platform, you agree to our data processing practices and legal obligations.
                        </p>
                    </div>

                    <p>
                        These comprehensive Terms of Service (&quot;Terms&quot;) govern your access to and use of the Language Data Collection
                        platform and related services (the &quot;Service&quot;) for contributing and reviewing language data, including but
                        not limited to speech, text, and token-level annotations. These Terms incorporate our Privacy Policy,
                        Cookie Policy, and Data Processing Agreement by reference and together form the complete agreement
                        between you and us.
                    </p>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                        <h3 className="text-lg font-semibold text-green-800 mb-2">⚖️ Binding Legal Agreement</h3>
                        <p className="text-green-700 text-sm">
                            These Terms constitute a legally binding agreement. Please read them carefully before using our Platform.
                            If you do not agree to these Terms, you must not use our Platform.
                        </p>
                    </div>
                </section>

                <details className="mt-8 bg-white border border-slate-200 rounded-lg p-4 open:bg-slate-50" id="eligibility">
                    <summary className="font-semibold text-slate-800 cursor-pointer pb-2 flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-100">
                            <span className="text-sm font-bold text-blue-600">1</span>
                        </div>
                        Eligibility & Accounts
                    </summary>
                    <div className="mt-3">
                        <p className="text-slate-700">In simple terms: You must be 18+ and keep your account secure.</p>
                        <ul className="mt-3 list-disc ml-6 space-y-2 text-slate-700">
                            <li>You must be able to form a binding contract in your jurisdiction to use the Service.</li>
                            <li>You are responsible for maintaining the confidentiality of any credentials you use.</li>
                        </ul>
                    </div>
                </details>

                <details className="mt-8 bg-white border border-slate-200 rounded-lg p-4 open:bg-slate-50" id="contributions">
                    <summary className="font-semibold text-slate-800 cursor-pointer pb-2 flex items-center gap-3">
                        <div className="p-2 rounded-full bg-emerald-100">
                            <span className="text-sm font-bold text-emerald-600">2</span>
                        </div>
                        Contributions
                    </summary>
                    <div className="mt-3">
                        <p className="text-slate-700">In simple terms: Only share your own content—no harmful or illegal stuff.</p>
                        <p className="mt-3 text-slate-700">
                            <strong>Retraction:</strong> Request deletion via <Link href="/data-rights">Portal</Link>—processed in 30 days, propagated to datasets.
                        </p>
                        <p className="text-slate-700">
                            <strong>Attribution:</strong> Opt-out of public mention in releases via settings; default anonymized.
                        </p>
                    </div>
                </details>

                <section className="mt-8 border border-slate-200 rounded-2xl p-4 bg-white/95">
                    <h3 className="text-lg font-semibold text-slate-800">Localized examples for Indian contributors</h3>
                    <ul className="list-disc ml-6 mt-3 space-y-2 text-sm text-slate-700">
                        <li><strong>Bhashini pilots:</strong> If you donate Marathi speech clips for government pilots, they remain open-source and attribution-optional.</li>
                        <li><strong>Academic partners:</strong> IIT and IIIT labs can reuse sanitized data under the same CC licenses; no exclusive commercial rights.</li>
                        <li><strong>Community archives:</strong> Tribal knowledge keepers can flag sacred terms—we redact them before dataset release.</li>
                    </ul>
                </section>

                <section className="mt-10">
                    <h2 className="text-xl font-semibold text-slate-800">3. Licenses to Your Contributions</h2>
                    <p className="mt-3 text-slate-700">
                        To support research and development for Indian languages and scripts, you grant us and our research
                        collaborators a worldwide, non-exclusive, royalty-free, sublicensable license to use, reproduce,
                        adapt, publish, distribute, and create derivative works from your Contributions for research,
                        educational, and product-improvement purposes. Where we release datasets, we will use reasonable
                        efforts to remove direct identifiers and document any curation steps.
                    </p>
                </section>

                <section className="mt-10">
                    <h2 className="text-xl font-semibold text-slate-800">4. Privacy</h2>
                    <p className="mt-3 text-slate-700">
                        Our processing of data is described in the <Link href="/privacy" className="text-indigo-700 underline">Privacy Policy</Link>.
                        By using the Service, you agree to that policy.
                    </p>
                    <p className="text-slate-700">
                        Manage consents at <Link href="/privacy-settings">Settings</Link>; exercise rights via <Link href="/data-rights">Portal</Link> (e.g., GDPR form: <Link href="/data-rights/gdpr">Direct</Link>).
                    </p>
                </section>

                <section className="mt-10">
                    <h2 className="text-xl font-semibold text-slate-800">5. Community & Attribution</h2>
                    <details className="mt-8 bg-white border border-slate-200 rounded-lg p-4 open:bg-slate-50" id="community">
                        <summary className="font-semibold text-slate-800 cursor-pointer pb-2 flex items-center gap-3">
                            <div className="p-2 rounded-full bg-yellow-100">
                                <span className="text-sm font-bold text-yellow-600">6</span>
                            </div>
                            Community & Collaboration
                        </summary>
                        <div className="mt-3">
                            <p className="text-slate-700">In simple terms: Be respectful; report bad behavior.</p>
                            <ul className="mt-3 list-disc ml-6 space-y-2 text-slate-700">
                                <li><strong>Expectations:</strong> Positive interactions; no harassment based on language/culture.</li>
                                <li><strong>Reporting:</strong> Use <Link href="/contact">form</Link> or <Link href="/admin/moderation">report button</Link>; 24-hour review.</li>
                                <li><strong>Moderation:</strong> Warnings, bans for violations; appeals via DPO.</li>
                            </ul>
                            <p className="text-slate-700">
                                <strong>Data-Sharing:</strong> Collaborations (e.g., AI4LRIL) under DPAs; anonymized for research—see <Link href="/privacy#partners">Privacy Partners</Link>.
                            </p>
                        </div>
                    </details>
                </section>

                <section className="mt-10">
                    <h2 className="text-xl font-semibold text-slate-800">6. Prohibited Conduct</h2>
                    <ul className="mt-3 list-disc ml-6 space-y-2 text-slate-700">
                        <li>Do not misuse the Service, including attempting unauthorized access or disrupting operations.</li>
                        <li>Do not submit spam, malware, or any content that harms others or the Service.</li>
                        <li>Do not attempt to reidentify individuals from anonymized datasets released by the project.</li>
                    </ul>
                </section>

                <section className="mt-10">
                    <h2 className="text-xl font-semibold text-slate-800">7. Intellectual Property</h2>
                    <p className="mt-3 text-slate-700">
                        The Service, including its UI, code, and content (excluding user Contributions), is protected by
                        applicable intellectual property laws. You may not copy, modify, or create derivative works except as
                        permitted by law or with written permission.
                    </p>
                </section>

                <section className="mt-10">
                    <h2 className="text-xl font-semibold text-slate-800">8. Disclaimers</h2>
                    <p className="mt-3 text-slate-700">
                        THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED,
                        INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
                        AND NON-INFRINGEMENT. We do not guarantee that the Service will be uninterrupted, error-free, or
                        secure.
                    </p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                        <h3 className="font-semibold text-red-800 mb-2">Examples:</h3>
                        <ul className="list-disc ml-6 space-y-1 text-red-700">
                            <li>Service down? No liability for missed contributions.</li>
                            <li>Data re-use issue? Covered by license—opt-out to limit.</li>
                        </ul>
                    </div>
                </section>

                <section className="mt-10">
                    <h2 className="text-xl font-semibold text-slate-800">9. Limitation of Liability</h2>
                    <p className="mt-3 text-slate-700">
                        TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE AND OUR COLLABORATORS WILL NOT BE LIABLE FOR ANY INDIRECT,
                        INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER
                        INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES,
                        RESULTING FROM YOUR ACCESS TO OR USE OF (OR INABILITY TO USE) THE SERVICE.
                    </p>
                </section>

                <section className="mt-10">
                    <h2 className="text-xl font-semibold text-slate-800">10. Indemnification</h2>
                    <p className="mt-3 text-slate-700">
                        You agree to indemnify and hold harmless the project maintainers and collaborators from and against
                        any claims, liabilities, damages, losses, and expenses arising out of or in any way connected with
                        your use of the Service or your Contributions.
                    </p>
                </section>

                <section className="mt-10">
                    <h2 className="text-xl font-semibold text-slate-800">11. Termination</h2>
                    <p className="mt-3 text-slate-700">
                        We may suspend or terminate your access to the Service at any time for any reason, including for
                        violating these Terms. Upon termination, Sections that by their nature should survive will survive
                        (e.g., Licenses to Contributions, Disclaimers, Limitation of Liability, Indemnification).
                    </p>
                </section>

                <section className="mt-10">
                    <h2 className="text-xl font-semibold text-slate-800">12. Changes to the Service or Terms</h2>
                    <p className="mt-3 text-slate-700">
                        We may update the Service and these Terms from time to time. If changes are material, we will take
                        reasonable steps to notify users (e.g., via this page). Your continued use of the Service after
                        changes become effective constitutes acceptance of the updated Terms.
                    </p>
                    <p className="mt-3 text-slate-700">
                        <strong>Notifications:</strong> Material changes via email/dashboard (30 days notice); access previous at <Link href="/terms-changelog">Changelog</Link>.
                    </p>
                </section>

                <section className="mt-10">
                    <h2 className="text-xl font-semibold text-slate-800">13. Governing Law</h2>
                    <p className="mt-3 text-slate-700">
                        These Terms are governed by the laws of the jurisdiction where the project is primarily operated,
                        without regard to its conflict of law principles.
                    </p>
                    <p className="mt-3 text-slate-700">
                        <strong>Jurisdiction:</strong> Primarily based in India (governed by Indian law, DPDP 2023); covers global users with EU (GDPR), US (CCPA) supplements. Disputes in Mumbai courts.
                    </p>
                    <p className="text-slate-700">
                        <strong>Localizations:</strong> Available in 22 Indian languages via <Link href="/languages">switcher</Link>; contact for others.
                    </p>
                </section>

                {/* Data Processing Agreement */}
                <section className="mt-10 animate-fade-in-up animate-delay-400">
                    <details open className="rounded-2xl border border-purple-200 bg-white/95 p-4">
                        <summary className="flex items-center gap-3 text-xl font-semibold text-slate-800 cursor-pointer">
                            <div className="p-2 rounded-full bg-purple-100">
                                <span className="text-sm font-bold text-purple-600">15</span>
                            </div>
                            Data Processing Agreement (GDPR Article 28)
                        </summary>
                        <div className="mt-3 h-1 w-20 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"></div>
                        <div className="mt-4 space-y-4">
                            <p className="text-slate-700">
                                If you are processing personal data on behalf of a controller (data controller), you agree to:
                            </p>

                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <h3 className="font-semibold text-purple-800 mb-2">Controller-Processor Obligations</h3>
                                <ul className="list-disc ml-6 space-y-1 text-purple-700">
                                    <li>Process personal data only on documented instructions from the controller</li>
                                    <li>Implement appropriate technical and organizational measures for security</li>
                                    <li>Ensure that persons authorized to process data are committed to confidentiality</li>
                                    <li>Assist the controller in responding to data subject rights requests</li>
                                    <li>Cooperate with supervisory authorities regarding data processing activities</li>
                                    <li>Notify the controller of any personal data breaches within 24 hours</li>
                                    <li>Make available all information necessary to demonstrate compliance</li>
                                    <li>Delete or return personal data at the end of the processing relationship</li>
                                </ul>
                            </div>

                            <p className="text-slate-700">
                                Our Data Processing Agreement template is available upon request and incorporates these GDPR requirements.
                            </p>
                        </div>
                    </details>
                </section>

                {/* Limitation of Liability */}
                <section className="mt-10 animate-fade-in-up animate-delay-500">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
                        <div className="p-2 rounded-full bg-red-100">
                            <span className="text-sm font-bold text-red-600">16</span>
                        </div>
                        Limitation of Liability
                    </h2>
                    <div className="mt-3 h-1 w-20 bg-gradient-to-r from-red-400 to-red-600 rounded-full"></div>

                    <div className="mt-4 space-y-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h3 className="font-semibold text-red-800 mb-2">⚠️ Important Liability Limitations</h3>
                            <p className="text-red-700 text-sm mb-3">
                                Please read this section carefully as it limits our liability to you.
                            </p>
                            <ul className="list-disc ml-6 space-y-1 text-red-700">
                                <li><strong>Exclusion of Indirect Damages:</strong> We are not liable for indirect, incidental, consequential, special, or punitive damages</li>
                                <li><strong>Data Loss:</strong> We are not liable for any loss or corruption of your data</li>
                                <li><strong>Service Interruptions:</strong> We are not liable for service interruptions or unavailability</li>
                                <li><strong>Third-Party Actions:</strong> We are not liable for actions of third parties using our platform</li>
                                <li><strong>Maximum Liability:</strong> Our total liability is limited to the amount paid by you in the 12 months preceding the claim</li>
                            </ul>
                        </div>

                        <p className="text-slate-700">
                            These limitations apply to the maximum extent permitted by applicable law. Some jurisdictions
                            do not allow the exclusion of certain warranties or limitation of liability, so some of the
                            above limitations may not apply to you.
                        </p>
                    </div>
                </section>

                {/* Indemnification */}
                <section className="mt-10 animate-fade-in-up animate-delay-600">
                    <details open className="rounded-2xl border border-orange-200 bg-white/95 p-4">
                        <summary className="flex items-center gap-3 text-xl font-semibold text-slate-800 cursor-pointer">
                            <div className="p-2 rounded-full bg-orange-100">
                                <span className="text-sm font-bold text-orange-600">17</span>
                            </div>
                            Indemnification
                        </summary>
                        <div className="mt-3 h-1 w-20 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>

                        <div className="mt-4 space-y-4">
                            <p className="text-slate-700">
                                You agree to indemnify, defend, and hold harmless Language Data Collection, its officers,
                                directors, employees, agents, and affiliates from and against any and all claims, demands,
                                actions, damages, losses, costs, liabilities, and expenses (including attorneys&apos; fees)
                                arising out of or related to:
                            </p>

                            <ul className="list-disc ml-6 space-y-2 text-slate-700">
                                <li>Your use of the Service</li>
                                <li>Your violation of these Terms</li>
                                <li>Your violation of any third-party rights</li>
                                <li>Your violation of applicable laws or regulations</li>
                                <li>Any content you submit or make available through the Service</li>
                            </ul>

                            <p className="text-slate-700">
                                We reserve the right to assume the exclusive defense and control of any matter subject to
                                indemnification by you, and you agree to cooperate with our defense of such claims.
                            </p>
                        </div>
                    </details>
                </section>

                {/* Dispute Resolution */}
                <section className="mt-10 animate-fade-in-up animate-delay-700">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
                        <div className="p-2 rounded-full bg-teal-100">
                            <span className="text-sm font-bold text-teal-600">18</span>
                        </div>
                        Dispute Resolution
                    </h2>
                    <div className="mt-3 h-1 w-20 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full"></div>

                    <div className="mt-4 space-y-4">
                        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                            <h3 className="font-semibold text-teal-800 mb-2">Dispute Resolution Process</h3>
                            <ol className="list-decimal ml-6 space-y-2 text-teal-700">
                                <li><strong>Informal Resolution:</strong> Contact us first to seek an informal resolution</li>
                                <li><strong>Mediation:</strong> If informal resolution fails, we agree to participate in mediation</li>
                                <li><strong>Arbitration:</strong> Any disputes not resolved through mediation will be resolved through binding arbitration</li>
                                <li><strong>Class Action Waiver:</strong> You agree to resolve disputes only on an individual basis, not as a class action</li>
                            </ol>
                        </div>

                        <p className="text-slate-700">
                            This dispute resolution process applies to the maximum extent permitted by applicable law.
                            Nothing in this section prevents us from seeking injunctive relief in court for violations
                            of intellectual property rights or other proprietary rights.
                        </p>
                    </div>
                </section>

                {/* Force Majeure */}
                <section className="mt-10 animate-fade-in-up animate-delay-800">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
                        <div className="p-2 rounded-full bg-gray-100">
                            <span className="text-sm font-bold text-gray-600">19</span>
                        </div>
                        Force Majeure
                    </h2>
                    <div className="mt-3 h-1 w-20 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full"></div>

                    <p className="mt-3 text-slate-700">
                        We will not be liable for any failure or delay in performing our obligations under these Terms
                        that is due to events beyond our reasonable control, including but not limited to natural disasters,
                        war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents,
                        pandemics, strikes, or shortages of transportation facilities, fuel, energy, labor, or materials.
                    </p>
                </section>

                {/* Severability */}
                <section className="mt-10 animate-fade-in-up animate-delay-900">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
                        <div className="p-2 rounded-full bg-indigo-100">
                            <span className="text-sm font-bold text-indigo-600">20</span>
                        </div>
                        Severability
                    </h2>
                    <div className="mt-3 h-1 w-20 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full"></div>

                    <p className="mt-3 text-slate-700">
                        If any provision of these Terms is found to be unenforceable or invalid, that provision will be
                        limited or eliminated to the minimum extent necessary so that the Terms will otherwise remain
                        in full force and effect and enforceable.
                    </p>
                </section>

                {/* Waiver */}
                <section className="mt-10 animate-fade-in-up animate-delay-1000">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
                        <div className="p-2 rounded-full bg-pink-100">
                            <span className="text-sm font-bold text-pink-600">21</span>
                        </div>
                        Waiver
                    </h2>
                    <div className="mt-3 h-1 w-20 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full"></div>

                    <p className="mt-3 text-slate-700">
                        No waiver of any term of these Terms shall be deemed a further or continuing waiver of such term
                        or any other term, and our failure to assert any right or provision under these Terms shall not
                        constitute a waiver of such right or provision.
                    </p>
                </section>

                {/* Entire Agreement */}
                <section className="mt-10 animate-fade-in-up animate-delay-1100">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
                        <div className="p-2 rounded-full bg-green-100">
                            <span className="text-sm font-bold text-green-600">22</span>
                        </div>
                        Entire Agreement
                    </h2>
                    <div className="mt-3 h-1 w-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>

                    <p className="mt-3 text-slate-700">
                        These Terms, together with our Privacy Policy, Cookie Policy, and any other legal notices
                        published by us on the Service, constitute the entire agreement between you and us regarding
                        the use of the Service and supersede all prior and contemporaneous written or oral agreements
                        between you and us.
                    </p>
                </section>

                <section className="mt-10" id="terms-changelog">
                    <h2 className="text-xl font-semibold text-slate-800">Change log & version history</h2>
                    <p className="mt-2 text-sm text-slate-600">We highlight significant updates and keep prior versions archived.</p>
                    <ul className="mt-4 space-y-3 text-sm text-slate-700">
                        <li>
                            <span className="font-semibold text-slate-900">v1.3 – November 2025:</span> Added localized collaboration examples, clarified consent references, and introduced change log.
                        </li>
                        <li>
                            <span className="font-semibold text-slate-900">v1.2 – September 2025:</span> Converted major sections into accordions and added Data Processing Annex.
                        </li>
                    </ul>
                    <p className="mt-2 text-xs text-slate-500">Need an older copy? Email legal@language-data-collection.org with “Terms archive”.</p>
                </section>

                <section className="mt-10">
                    <h2 className="text-xl font-semibold text-slate-800">Contact & Legal Notices</h2>
                    <div className="mt-4 space-y-4">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-800 mb-2">General Inquiries</h3>
                            <p className="text-gray-700">
                                For questions about these Terms, please reach out via the Contact page or email us at:
                                <strong> legal@language-data-collection.org</strong>
                            </p>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-800 mb-2">Legal Notices</h3>
                            <p className="text-gray-700">
                                For service of legal notices, please contact our legal department at:
                                <strong> legal@language-data-collection.org</strong>
                            </p>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-800 mb-2">Data Protection Officer</h3>
                            <p className="text-gray-700">
                                Our Data Protection Officer can be contacted at:
                                <strong> dpo@language-data-collection.org</strong>
                            </p>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notice</h3>
                            <p className="text-yellow-700 text-sm">
                                These Terms were last updated on {new Date().toLocaleDateString()}. We reserve the right to
                                modify these Terms at any time. Your continued use of the Service after any such changes
                                constitutes your acceptance of the new Terms.
                            </p>
                        </div>
                    </div>
                </section>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                    Last Updated: {new Date().toLocaleDateString()} | Version 1.0
                </div>
            </div>
        </div>
    );
}
