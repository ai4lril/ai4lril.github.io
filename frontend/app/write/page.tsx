"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { codeToLabel, LANGUAGES } from "@/lib/languages";
import { getPreferredLanguage } from "@/lib/langPreference";
import { showToast } from "@/lib/toast";
import { API_BASE_URL } from "@/lib/api-config";

export default function AddSentence() {
    const router = useRouter();
    const [sentence, setSentence] = useState("");
    const [citation, setCitation] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [lang, setLang] = useState<string | null>(null);
    const sentenceRef = useRef<HTMLTextAreaElement>(null);
    const citationRef = useRef<HTMLInputElement>(null);
    const confirmRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const saved = getPreferredLanguage();
        setLang(saved);
        const onLangChanged = (e: Event) => {
            const code = (e as CustomEvent<string>).detail;
            setLang(code);
        };
        window.addEventListener('language-changed', onLangChanged as EventListener);
        return () => window.removeEventListener('language-changed', onLangChanged as EventListener);
    }, []);

    // Note: Using controlled components, so refs are only for DOM access if needed

    // Real-time validation state
    const [validationErrors, setValidationErrors] = useState<{
        sentence: boolean;
        citation: boolean;
        confirmed: boolean;
    }>({
        sentence: false,
        citation: false,
        confirmed: false,
    });

    // Update validation errors in real-time
    useEffect(() => {
        setValidationErrors({
            sentence: sentence.trim() === "",
            citation: citation.trim() === "",
            confirmed: !confirmed,
        });
    }, [sentence, citation, confirmed]);

    const isFormValid = useMemo(() => {
        const sentenceValid = sentence.trim() !== "";
        const citationValid = citation.trim() !== "";
        return sentenceValid && citationValid && confirmed;
    }, [sentence, citation, confirmed]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isFormValid) {
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                showToast('Please login to submit sentences. Authentication is required.', "error");
                router.push('/login');
                return;
            }

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            };

            // Validate language code
            const languageCode = lang || 'eng_latn';
            const isValidLanguage = LANGUAGES.some(l => l.code === languageCode);
            if (!isValidLanguage) {
                alert(`Invalid language code: ${languageCode}. Please select a valid language.`);
                return;
            }

            const payload = {
                sentences: sentence.trim(),
                languageCode,
                citation: citation.trim(),
            };

            const response = await fetch(`${API_BASE_URL}/write/submission`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to submit sentences' }));
                throw new Error(errorData.error || errorData.message || 'Failed to submit sentences');
            }

            await response.json();
            setIsSubmitting(false);
            setSubmitted(true);
            setSentence("");
            setCitation("");
            setConfirmed(false);
            setTimeout(() => setSubmitted(false), 3000);
        } catch (error) {
            console.error('Error submitting sentences:', error);
            setIsSubmitting(false);
            const errorMessage = error instanceof Error ? error.message : 'Failed to submit sentences. Please try again.';
            showToast(errorMessage, "error");
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto py-8 px-2 md:px-4">
            <h1 className="text-xl md:text-2xl font-bold text-center mb-1 flex items-center justify-center gap-2">
                Add a public domain sentence
                <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 3.5a2.121 2.121 0 113 3L7 19.5 3 21l1.5-4L16.5 3.5z" /></svg>
            </h1>
            <div className="text-center mb-3">
                <span className="inline-block text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">{codeToLabel(lang)}</span>
            </div>
            <p className="text-center text-gray-600 mb-6 text-sm md:text-base italic">
                Your sentence will help build a free, open dataset for everyone. Thank you for contributing!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8 w-full">
                {/* Form Section */}
                <form onSubmit={handleSubmit} className="glass rounded-md md:rounded-lg p-6 shadow-md border border-gray-100 flex flex-col gap-6">
                    <div className="space-y-2">
                        <label className="block font-semibold text-gray-800" htmlFor="sentence">
                            Sentence
                            <span className="text-gray-500 text-sm ml-2">({sentence.length}/200)</span>
                        </label>
                        <div className="relative">
                            <textarea
                                ref={sentenceRef}
                                id="sentence"
                                name="sentence"
                                className="w-full min-h-[120px] border-2 border-gray-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-vertical transition-all duration-200 bg-white/50 hover:bg-white hover:border-gray-300 placeholder-gray-400 text-gray-800"
                                placeholder="Enter your public domain sentence here..."
                                value={sentence}
                                onChange={(e) => {
                                    setSentence(e.target.value);
                                }}
                                required
                                maxLength={200}
                            />
                            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                                {200 - sentence.length} remaining
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block font-semibold text-gray-800" htmlFor="citation">
                            Citation
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                            <input
                                ref={citationRef}
                                id="citation"
                                name="citation"
                                type="text"
                                className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 bg-white/50 hover:bg-white hover:border-gray-300 placeholder-gray-400 text-gray-800"
                                placeholder="Reference the source of your sentence..."
                                value={citation}
                                onChange={(e) => {
                                    setCitation(e.target.value);
                                }}
                                required
                            />
                            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                    </div>
                    <div className={`bg-blue-50/50 border rounded-lg p-4 transition-colors ${!confirmed ? 'border-red-300 bg-red-50/30' : 'border-blue-200'}`}>
                        <div className="flex items-start gap-3">
                            <input
                                ref={confirmRef}
                                type="checkbox"
                                id="confirm"
                                name="confirm"
                                checked={confirmed}
                                onChange={(e) => {
                                    setConfirmed(e.target.checked);
                                }}
                                className="mt-1 accent-blue-600 w-5 h-5 rounded border-2 border-gray-300 focus:ring-2 focus:ring-blue-400 transition-all duration-200 cursor-pointer"
                                required
                            />
                            <label htmlFor="confirm" className="text-sm select-none cursor-pointer text-gray-700 leading-relaxed flex-1">
                                I confirm that this sentence is <strong>public domain</strong> and I have permission to upload it. By submitting, I agree to make it available for research and educational purposes.
                            </label>
                        </div>
                    </div>
                    {/* Validation feedback */}
                    <div className="text-xs text-center mb-2">
                        {!isFormValid && !isSubmitting && !submitted && (
                            <div className="text-red-500 p-2 bg-red-50 rounded border border-red-200">
                                {validationErrors.sentence && "⚠ Please enter a sentence. "}
                                {validationErrors.citation && "⚠ Please provide a citation. "}
                                {validationErrors.confirmed && "⚠ Please confirm the public domain statement."}
                            </div>
                        )}
                        {isFormValid && !isSubmitting && !submitted && (
                            <div className="text-green-600 p-2 bg-green-50 rounded border border-green-200">
                                ✓ Form is ready to submit
                            </div>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting || submitted || !isFormValid}
                        className={`group w-full px-6 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border-2 ${submitted
                            ? "bg-linear-to-r from-green-500 to-emerald-600 border-green-400 text-white cursor-not-allowed"
                            : isSubmitting || !isFormValid
                                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-blue-400 text-white hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                            }`}
                        aria-disabled={isSubmitting || submitted || !isFormValid}
                        style={{ pointerEvents: (isSubmitting || submitted || !isFormValid) ? 'none' : 'auto' }}
                    >
                        <span className="flex items-center justify-center gap-3">
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Submitting...
                                </>
                            ) : submitted ? (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Submitted Successfully!
                                </>
                            ) : (
                                <>
                                    <span>Submit Sentence</span>
                                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </>
                            )}
                        </span>
                    </button>
                </form>
                {/* Guidelines Section */}
                <div className="glass rounded-md md:rounded-lg p-6 shadow-md border border-gray-100 flex flex-col">
                    <h2 className="text-md md:text-lg font-semibold mb-3 text-gray-800">What sentences can I add?</h2>
                    <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                        <li>Must be in the public domain (no copyright restrictions)</li>
                        <li>Keep it under 15 words</li>
                        <li>Use proper grammar, spelling, and punctuation</li>
                        <li>Supports all Indian languages and scripts (Devanagari, Tamil, Telugu, Bengali, etc.)</li>
                        <li>Do not include personal, sensitive, or offensive content</li>
                        <li>Provide a valid citation for the source</li>
                        <li>Write naturally and conversationally</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
