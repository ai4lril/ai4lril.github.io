"use client";

import { useEffect, useState } from "react";
import TextBox from "@/components/TextBox";
import { codeToLabel } from "@/lib/languages";
import { getPreferredLanguage } from "@/lib/langPreference";

interface QuestionSentence {
    id: string;
    text: string;
    languageCode: string;
    isActive: boolean;
    difficulty?: string;
    createdAt: string;
    updatedAt: string;
}

export default function Question() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [lang, setLang] = useState<string | null>(null);
    const [questionSentences, setQuestionSentences] = useState<QuestionSentence[]>([]);
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    // Fetch question sentences from backend
    const fetchQuestionSentences = async (languageCode?: string) => {
        try {
            setLoading(true);
            const url = languageCode
                ? `/api/question-sentences?languageCode=${languageCode}`
                : '/api/question-sentences';

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch question sentences');
            }

            const fetchedSentences = await response.json();
            setQuestionSentences(fetchedSentences);
            setCurrentSentenceIndex(0);
        } catch (error) {
            console.error('Error fetching question sentences:', error);
            setQuestionSentences([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const saved = getPreferredLanguage();
        setLang(saved);
        fetchQuestionSentences(saved || undefined);

        function onLangChanged(e: Event) {
            const code = (e as CustomEvent<string>).detail;
            setLang(code);
            fetchQuestionSentences(code);
        }
        window.addEventListener('language-changed', onLangChanged as EventListener);
        return () => window.removeEventListener('language-changed', onLangChanged as EventListener);
    }, []);

    const handleSubmit = async (question: string) => {
        if (!question.trim()) {
            alert("Please enter a question");
            return;
        }

        try {
            setIsSubmitting(true);

            // Submit to backend
            const response = await fetch('/api/question-submission', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    questionText: question.trim(),
                    languageCode: lang || 'eng_latn',
                    // userId: undefined // Add when authentication is implemented
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit question');
            }

            const result = await response.json();

            if (result.success) {
                setSubmitted(true);
                // Reset after showing success message
                setTimeout(() => setSubmitted(false), 3000);
                // Optionally move to next sentence if available
                if (questionSentences.length > 1) {
                    setCurrentSentenceIndex((prev) => (prev + 1) % questionSentences.length);
                }
            } else {
                throw new Error(result.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Error submitting question:', error);
            alert(`Failed to submit question: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-2xl md:max-w-4xl py-4 px-2 md:px-4 mx-auto animate-fade-in-up">
            <h1 className="text-xl md:text-2xl font-bold text-center mb-1 animate-bounce-in">Add a Question</h1>
            <div className="text-center mb-2">
                <span className="inline-block text-xs px-3 py-2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium animate-bounce-in">{codeToLabel(lang)}</span>
            </div>

            <p className="text-center text-gray-600 mb-4 text-sm md:text-base animate-fade-in-up animate-delay-200">
                Submit questions for others to answer. Good questions help us collect valuable voice data.
            </p>

            {loading && (
                <div className="text-center mb-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading question examples...</p>
                </div>
            )}

            {!loading && questionSentences.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">Example Questions:</h3>
                    <p className="text-sm text-blue-700 italic">
                        "{questionSentences[currentSentenceIndex]?.text}"
                    </p>
                </div>
            )}

            <div className="w-full relative">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-indigo-50/30 -z-10 rounded-xl blur-xl hidden md:block"></div>

                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 w-full">
                    {/* Question input section */}
                    <div className="glass rounded-md md:rounded-lg p-4 shadow-md border border-gray-100 relative overflow-hidden flex flex-col">
                        {/* Decorative circles */}
                        <div className="absolute -right-8 -top-8 w-20 h-20 bg-indigo-100/50 rounded-full opacity-70 hidden sm:block"></div>
                        <div className="absolute -left-6 -bottom-6 w-16 h-16 bg-blue-100/50 rounded-full opacity-70 hidden sm:block"></div>

                        <h2 className="text-md md:text-lg font-semibold mb-3 text-gray-800 relative">
                            <span className="inline-block relative pb-1">
                                Your Question
                                <span className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500"></span>
                            </span>
                        </h2>

                        <div className="mb-4 min-h-[100px] h-auto flex-1 relative z-10">
                            <TextBox
                                onSubmit={handleSubmit}
                                placeholder="Type your thought-provoking question here..."
                            />
                        </div>

                        <button
                            onClick={() => document.forms[0].requestSubmit()}
                            disabled={isSubmitting || submitted || loading}
                            className={`group w-full px-6 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border-2 mt-4 ${isSubmitting || loading
                                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                : submitted
                                    ? "bg-gradient-to-r from-green-500 to-emerald-600 border-green-400 text-white"
                                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-blue-400 text-white hover:scale-[1.02] active:scale-[0.98]"
                                }`}
                        >
                            <span className="flex items-center justify-center gap-3">
                                {loading ? (
                                    <>
                                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Loading...
                                    </>
                                ) : isSubmitting ? (
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
                                        <span>Submit Question</span>
                                        <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </>
                                )}
                            </span>
                        </button>
                    </div>

                    {/* Guidelines section */}
                    <div className="glass rounded-md md:rounded-lg p-4 shadow-md border border-gray-100 relative overflow-hidden mt-4 md:mt-0 flex flex-col">
                        {/* Decorative circle */}
                        <div className="absolute -right-6 -top-6 w-16 h-16 bg-amber-100/50 rounded-full opacity-70 hidden sm:block"></div>

                        <h2 className="text-md md:text-lg font-semibold mb-3 text-gray-800 relative">
                            <span className="inline-block relative pb-1">
                                Question Guidelines
                                <span className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 to-orange-500"></span>
                            </span>
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-green-700 mb-2 flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Do
                                </h3>
                                <ul className="text-sm text-gray-700 space-y-1 ml-6">
                                    <li>Use correct spelling and grammar</li>
                                    <li>Choose simple questions anyone can understand</li>
                                    <li>Ask questions that can be answered in a few sentences</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-red-700 mb-2 flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Don&apos;t
                                </h3>
                                <ul className="text-sm text-gray-700 space-y-1 ml-6">
                                    <li>Ask for personal or identifying information</li>
                                    <li>Include prejudiced or offensive content</li>
                                    <li>Ask sensitive or inappropriate questions</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
