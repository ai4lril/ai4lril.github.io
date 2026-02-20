"use client";

import { useEffect, useState } from "react";
import { reviewItems } from "@/app/translate/data";
import { codeToLabel, LANGUAGES } from "@/lib/languages";
import { getPreferredLanguage, getPreferredTargetLanguage, setPreferredTargetLanguage } from "@/lib/langPreference";

export default function TranslateReviewPage() {
    const [lang, setLang] = useState<string | null>(null);
    const [target, setTarget] = useState<string>(""); // Start empty to avoid validation issues
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const saved = getPreferredLanguage();
        setLang(saved);
        const savedTarget = getPreferredTargetLanguage();
        if (savedTarget) {
            setTarget(savedTarget);
        } else {
            // Set default if no saved preference exists
            const defaultTarget = "eng_latn";
            setTarget(defaultTarget);
            setPreferredTargetLanguage(defaultTarget);
        }
        const onLangChanged = (e: Event) => {
            const code = (e as CustomEvent<string>).detail;
            setLang(code);
        };

        const onTargetChanged = (e: Event) => {
            const code = (e as CustomEvent<string>).detail;
            setTarget(code);
        };

        window.addEventListener('language-changed', onLangChanged as EventListener);
        window.addEventListener('translate-target-changed', onTargetChanged as EventListener);
        return () => {
            window.removeEventListener('language-changed', onLangChanged as EventListener);
            window.removeEventListener('translate-target-changed', onTargetChanged as EventListener);
        };
    }, []);



    // Filter review items based on target language if selected
    const filteredReviewItems = target
        ? reviewItems.filter(item => item.targetLang === target)
        : reviewItems;

    // If no items match the selected target language, show all items as fallback
    const finalFilteredItems = filteredReviewItems.length > 0 ? filteredReviewItems : reviewItems;

    // Reset index if it goes out of bounds after filtering
    useEffect(() => {
        if (index >= finalFilteredItems.length) {
            setIndex(0);
        }
    }, [index, finalFilteredItems.length]);

    const current = finalFilteredItems[index] || reviewItems[0];

    const nextItem = () => setIndex((prev) => (prev + 1) % finalFilteredItems.length);

    // Get all available languages except the current source language
    const targetOptions = LANGUAGES.filter(language => {
        // Only exclude if we have a valid current item with a source language
        if (current?.sourceLang) {
            return language.code !== current.sourceLang;
        }
        // If no current item, show all languages
        return true;
    });


    const vote = (isCorrect: boolean) => {
        // Only log in development environment
        if (process.env.NODE_ENV === 'development') {
            console.log("Translate review", { id: current.id, correct: isCorrect });
        }
        nextItem();
    };

    return (
        <div className="w-full max-w-2xl md:max-w-4xl py-4 px-2 md:px-4 mx-auto animate-fade-in-up">
            <h1 className="text-xl md:text-2xl font-bold text-center mb-1 animate-bounce-in">Translation Review</h1>
            <div className="text-center mb-6 space-y-3">
                <div>
                    <span suppressHydrationWarning className="inline-block text-xs px-3 py-2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium animate-bounce-in">{codeToLabel(lang)}</span>
                </div>

                {/* Target Language Selection */}
                <div className="space-y-2 max-w-xs mx-auto">
                    {target && filteredReviewItems.length === 0 && (
                        <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-center">
                            No items available for selected language. Showing all items.
                        </div>
                    )}
                    <label className="text-sm font-semibold text-slate-800 flex items-center gap-2 justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Target Language
                        {!target && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    <select
                        value={target || ""}
                        onChange={(e) => {
                            const val = e.target.value;
                            setTarget(val);
                            setPreferredTargetLanguage(val);
                        }}
                        className={`w-full px-4 py-3 neu-pressed rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 ${!target || target === current?.sourceLang
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <option value="">Select target language...</option>
                        {targetOptions.map((language) => (
                            <option
                                key={language.code}
                                value={language.code}
                            >
                                {language.name}
                            </option>
                        ))}
                    </select>

                    {/* Error message */}
                    {(!target || target === current?.sourceLang) && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            Please select a different target language
                        </p>
                    )}


                </div>
            </div>

            <div className="w-full relative">
                <div className="absolute inset-0 bg-linear-to-b from-blue-50/30 to-indigo-50/30 -z-10 rounded-xl blur-xl hidden md:block"></div>

                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 w-full">
                    {/* Source + candidate card */}
                    <div className="neu-raised rounded-md md:rounded-lg p-4 shadow-md border border-gray-100 relative overflow-hidden flex flex-col">
                        <div className="absolute -right-8 -top-8 w-20 h-20 bg-indigo-100/50 rounded-full opacity-70 hidden sm:block"></div>
                        <div className="absolute -left-6 -bottom-6 w-16 h-16 bg-blue-100/50 rounded-full opacity-70 hidden sm:block"></div>

                        <h2 className="text-md md:text-lg font-semibold mb-3 text-gray-800 relative">
                            <span className="inline-block relative pb-1">
                                Given translation
                                <span className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-linear-to-r from-indigo-500 to-purple-500"></span>
                            </span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <div className="text-xs text-slate-500 mb-1">Source ({codeToLabel(current.sourceLang)})</div>
                                <div className="w-full p-3 neu-raised rounded-xl text-slate-800 mb-2">
                                    {current.sourceText}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 mb-1">Target ({codeToLabel(current.targetLang)})</div>
                                <div className="w-full p-3 neu-raised rounded-xl text-slate-800 mb-2">
                                    {current.candidate}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-3 justify-center">
                            <button onClick={() => vote(true)} className="group bg-linear-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg px-6 py-3 font-semibold shadow-lg hover:shadow-xl border-2 border-emerald-400 hover:border-emerald-500 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Correct</span>
                            </button>
                            <button onClick={() => vote(false)} className="group bg-linear-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-lg px-6 py-3 font-semibold shadow-lg hover:shadow-xl border-2 border-red-400 hover:border-red-500 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>Incorrect</span>
                            </button>
                            <button onClick={nextItem} className="group neu-btn-secondary rounded-lg px-6 py-3 font-semibold text-slate-700 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 min-h-[48px]">
                                <span>Skip</span>
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Tips card */}
                    <div className="neu-raised rounded-md md:rounded-lg p-4 shadow-md border border-gray-100 relative overflow-hidden mt-4 md:mt-0 flex flex-col">
                        <div className="absolute -right-6 -top-6 w-16 h-16 bg-amber-100/50 rounded-full opacity-70 hidden sm:block"></div>

                        <h2 className="text-md md:text-lg font-semibold mb-3 text-gray-800 relative">
                            <span className="inline-block relative pb-1">
                                Review tips
                                <span className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-linear-to-r from-amber-500 to-orange-500"></span>
                            </span>
                        </h2>

                        <ul className="text-sm text-slate-700 space-y-2 list-disc ml-5">
                            <li>Is meaning preserved correctly?</li>
                            <li>Is the phrasing natural in the target language?</li>
                            <li>Is punctuation/script appropriate?</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
