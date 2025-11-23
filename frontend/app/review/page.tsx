"use client";

import { useEffect, useState } from "react";
import TextBox from "@/components/TextBox";
import { codeToLabel } from "@/lib/languages";
import { getPreferredLanguage } from "@/lib/langPreference";

export default function Review() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [skipped, setSkipped] = useState(false);
    const [lang, setLang] = useState<string | null>(null);

    useEffect(() => {
        const saved = getPreferredLanguage();
        setLang(saved);
        const onLangChanged = (e: Event) => {
            const code = (e as CustomEvent<string>).detail;
            setLang(code);
        };
        window.addEventListener('language-changed', onLangChanged as EventListener);
        return () => window.removeEventListener('language-changed', onLangChanged as EventListener);
    }, [lang]);

    const handleSubmit = (transcript: string) => {
        setIsSubmitting(true);
        // Simulate backend call
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 2000);
        }, 1000);
        console.log(transcript);
    };

    const handleSkip = () => {
        setSkipped(true);
        setTimeout(() => setSkipped(false), 1500);
    };

    return (
        <div className="w-full max-w-2xl md:max-w-4xl py-4 px-1 sm:px-2 md:px-4 mx-auto animate-fade-in-up">
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-1 animate-bounce-in">Review Transcription</h1>
            <div className="text-center mb-3">
                <span className="inline-block text-xs px-3 py-2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium animate-bounce-in">{codeToLabel(lang)}</span>
            </div>
            <p className="text-center text-gray-600 mb-4 md:mb-6 text-base md:text-lg animate-fade-in-up animate-delay-200">
                Listen to the audio and review the provided transcription. Make corrections if needed, then submit your review.
            </p>
            <div className="w-full relative">
                <div className="absolute inset-0 bg-linear-to-br from-cyan-50/40 to-indigo-100/30 -z-10 rounded-xl blur-xl hidden md:block"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
                    {/* Audio Player Section */}
                    <div className="glass rounded-xl p-3 sm:p-4 md:p-6 shadow-lg border border-gray-100 flex flex-col items-center justify-center min-h-[220px] sm:min-h-[260px] md:min-h-[340px] relative overflow-hidden">
                        {/* Decorative circles */}
                        <div className="absolute -top-8 -left-8 w-24 h-24 sm:w-32 sm:h-32 bg-cyan-100/60 rounded-full opacity-60 pointer-events-none"></div>
                        <div className="absolute -bottom-10 -right-10 w-28 h-28 sm:w-36 sm:h-36 bg-indigo-100/50 rounded-full opacity-50 pointer-events-none"></div>
                        <div className="w-full flex flex-col items-center">
                            <audio
                                controls
                                className="my-3 sm:my-5 w-full max-w-xs"
                                src="/sample-audio.mp3"
                            >
                                Your browser does not support the audio element.
                            </audio>
                            <div className="text-center text-gray-500 text-xs sm:text-sm">
                                Listen to the audio above and review the transcription.
                            </div>
                        </div>
                    </div>
                    {/* Review Section */}
                    <div className="glass rounded-xl p-3 sm:p-4 md:p-6 shadow-lg border border-gray-100 flex flex-col relative overflow-hidden">
                        {/* Decorative circles */}
                        <div className="absolute -top-8 -left-8 w-20 h-20 sm:w-28 sm:h-28 bg-amber-100/60 rounded-full opacity-60 pointer-events-none"></div>
                        <div className="absolute -bottom-10 -right-10 w-16 h-16 sm:w-24 sm:h-24 bg-blue-100/50 rounded-full opacity-50 pointer-events-none"></div>
                        <h2 className="text-base md:text-xl font-semibold text-gray-800 mb-2 text-center">Transcription Review</h2>
                        <div className="mb-3 md:mb-4 min-h-[80px] md:min-h-[100px] h-auto flex-1 relative z-10">
                            <TextBox
                                onSubmit={handleSubmit}
                                placeholder="Review and edit the transcription if necessary..."
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row-reverse gap-2 sm:gap-3 mt-2">
                            <button
                                onClick={() => document.forms[0].requestSubmit()}
                                disabled={isSubmitting || submitted}
                                className={`group flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border-2 ${
                                    isSubmitting
                                        ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                        : submitted
                                            ? "bg-linear-to-r from-green-500 to-emerald-600 border-green-400 text-white"
                                            : "bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-blue-400 text-white hover:scale-[1.02] active:scale-[0.98]"
                                }`}
                            >
                                <span className="flex items-center justify-center gap-2">
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
                                            Submitted!
                                        </>
                                    ) : (
                                        <>
                                            <span>Submit Review</span>
                                            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        </>
                                    )}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={handleSkip}
                                disabled={isSubmitting || submitted || skipped}
                                className="group flex-1 bg-white/95 hover:bg-white shadow-lg hover:shadow-xl px-6 py-3 rounded-lg border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 transition-all duration-300 hover:scale-105 active:scale-95 font-medium flex items-center justify-center gap-2"
                            >
                                <span>Skip</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 transition-transform group-hover:translate-x-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                className="group flex-1 bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl px-6 py-3 rounded-lg border-2 border-amber-400 hover:border-amber-500 font-semibold transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h6v-2a2 2 0 012-2h2a2 2 0 012 2v2h6" />
                                </svg>
                                <span>Edit</span>
                            </button>
                        </div>
                        <div className="text-center text-xs text-gray-400 mt-2">
                            {submitted && "Thank you for your review!"}
                            {skipped && "Clip skipped."}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
