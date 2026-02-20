"use client";

import { useEffect, useState, useCallback } from "react";
import { affectSentences, sentimentOptions } from '../data';
import { codeToLabel } from "@/lib/languages";
import { getPreferredLanguage } from "@/lib/langPreference";
import { recordDataProcessing } from '@/lib/compliance';

function shuffle<T>(arr: T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export default function SentimentPage() {
    const [current, setCurrent] = useState(affectSentences[0]);
    const [pool, setPool] = useState(affectSentences);
    const [index, setIndex] = useState(0);
    const [lang, setLang] = useState<string>('');
    const [sentiment, setSentiment] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const saved = getPreferredLanguage();
        setLang(saved || 'hin_deva');
        const filtered = affectSentences.filter(s => s.langCode === (saved || 'hin_deva'));
        const shuffled = shuffle(filtered.length > 0 ? filtered : affectSentences);
        setPool(shuffled);
        setCurrent(shuffled[0]);
    }, []);

    useEffect(() => {
        const onLangChanged = (e: Event) => {
            const code = (e as CustomEvent<string>).detail;
            setLang(code);
            const filtered = affectSentences.filter(s => s.langCode === code);
            const shuffled = shuffle(filtered.length > 0 ? filtered : affectSentences);
            setPool(shuffled);
            setIndex(0);
            setCurrent(shuffled[0]);
            setSentiment('');
            setError('');
        };
        window.addEventListener('language-changed', onLangChanged as EventListener);
        return () => window.removeEventListener('language-changed', onLangChanged as EventListener);
    }, []);

    const nextItem = useCallback(() => {
        setIndex(prevIndex => {
            const newIndex = prevIndex < pool.length - 1 ? prevIndex + 1 : 0;
            setCurrent(pool[newIndex] || affectSentences[0]);
            setSentiment('');
            setError('');
            if (newIndex === 0 && prevIndex !== 0) {
                alert('You have completed all available sentences! Starting over...');
            }
            return newIndex;
        });
    }, [pool]);

    const skipItem = useCallback(() => {
        if (current) {
            recordDataProcessing(current.id, 'sentiment_analysis_skip', 'consent', ['text']);
        }
        nextItem();
    }, [current, nextItem]);

    const submit = useCallback((e: React.FormEvent) => {
        e.preventDefault();

        if (!sentiment || sentiment.trim() === '') {
            setError('Please select a sentiment before submitting.');
            return;
        }

        const validSentiments = sentimentOptions.map(opt => opt.value);
        if (!validSentiments.includes(sentiment)) {
            setError('Please select a valid sentiment option.');
            return;
        }

        if (!current) {
            setError('No sentence loaded. Please try again.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            recordDataProcessing(current.id, 'sentiment_analysis', 'consent', ['text', 'sentiment']);

            if (process.env.NODE_ENV === 'development') {
                console.log('Sentiment Analysis Submission:', {
                    sentenceId: current.id,
                    sentenceText: current.text,
                    language: current.langCode,
                    sentiment: sentiment,
                    timestamp: new Date().toISOString()
                });
            }

            alert(`Sentiment "${sentimentOptions.find(opt => opt.value === sentiment)?.label}" recorded successfully!`);
            nextItem();
        } catch (err) {
            setError('An error occurred while submitting. Please try again.');
            console.error('Submission error:', err);
        } finally {
            setLoading(false);
        }
    }, [sentiment, current, nextItem]);

    if (!current) {
        return (
            <div className="container mx-auto py-12 px-4 max-w-2xl animate-fade-in-up">
                <div className="neu-raised rounded-2xl p-8 border border-slate-100 animate-bounce-in text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading sentences...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl md:max-w-4xl py-4 px-2 md:px-4 mx-auto animate-fade-in-up">
            <h1 className="text-xl md:text-2xl font-bold text-center mb-1 animate-bounce-in">Sentiment Analysis</h1>
            <div className="text-center mb-3">
                <span suppressHydrationWarning className="inline-block text-xs px-3 py-2 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-medium animate-bounce-in">{codeToLabel(lang)}</span>
            </div>
            <p className="text-center text-gray-600 mb-4 text-sm md:text-base animate-fade-in-up animate-delay-200">
                Classify the sentiment of sentences as positive, neutral, or negative.
            </p>

            {error && <div className="text-center text-red-600 text-sm mb-3">{error}</div>}

            <div className="w-full relative">
                <div className="absolute inset-0 bg-linear-to-b from-rose-50/30 to-pink-50/30 -z-10 rounded-xl blur-xl hidden md:block"></div>

                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 w-full">
                    {/* Source + sentiment selection card */}
                    <div className="neu-raised rounded-md md:rounded-lg p-4 shadow-md border border-gray-100 relative overflow-hidden flex flex-col">
                        <div className="absolute -right-8 -top-8 w-20 h-20 bg-rose-100/50 rounded-full opacity-70 hidden sm:block"></div>
                        <div className="absolute -left-6 -bottom-6 w-16 h-16 bg-pink-100/50 rounded-full opacity-70 hidden sm:block"></div>

                        <h2 className="text-md md:text-lg font-semibold mb-3 text-gray-800 relative">
                            <span className="inline-block relative pb-1">
                                Source sentence
                                <span className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-linear-to-r from-rose-500 to-pink-500"></span>
                            </span>
                        </h2>

                        <div className="w-full p-4 neu-raised rounded-xl text-slate-800 mb-4">
                            {current.text}
                        </div>

                        {/* Progress Indicator */}
                        <div className="mb-4">
                            <div className="flex justify-between text-sm text-slate-600 mb-2">
                                <span>Progress</span>
                                <span>{index + 1} of {pool.length}</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                    className="bg-rose-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${((index + 1) / pool.length) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-3">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                    </svg>
                                    Sentiment Classification
                                    {!sentiment && <span className="text-red-500 ml-1">*</span>}
                                </label>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {sentimentOptions.map((option) => (
                                        <label
                                            key={option.value}
                                            className={`
                                                relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all
                                                ${sentiment === option.value
                                                    ? 'border-rose-500 bg-rose-50 text-rose-700'
                                                    : 'neu-btn-secondary text-slate-700'
                                                }
                                            `}
                                        >
                                            <input
                                                type="radio"
                                                name="sentiment"
                                                value={option.value}
                                                checked={sentiment === option.value}
                                                onChange={(e) => {
                                                    setSentiment(e.target.value);
                                                    setError('');
                                                }}
                                                className="sr-only"
                                                required
                                            />
                                            <div className="flex items-center gap-2">
                                                <div className={`
                                                    w-4 h-4 rounded-full border-2 transition-all
                                                    ${sentiment === option.value
                                                        ? 'border-rose-500 bg-rose-500'
                                                        : 'border-slate-300'
                                                    }
                                                `}>
                                                    {sentiment === option.value && (
                                                        <div className="w-2 h-2 rounded-full bg-white mx-auto mt-0.5"></div>
                                                    )}
                                                </div>
                                                <span className="font-medium text-sm">{option.label}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                {/* Error message */}
                                {(!sentiment) && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        Please select a sentiment
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-3 justify-center">
                                <button
                                    type="submit"
                                    disabled={loading || !sentiment}
                                    className={`group px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border-2 ${(!sentiment || loading)
                                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-linear-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white border-rose-400 hover:border-rose-500 hover:scale-105 active:scale-95'
                                        } flex items-center gap-2`}
                                >
                                    <span>Submit & Next</span>
                                    {(!sentiment || loading) ? null : (
                                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    )}
                                </button>
                                <button type="button" onClick={skipItem} className="group neu-btn-secondary rounded-lg px-6 py-3 font-semibold text-slate-700 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 min-h-[48px]">
                                    <span>Skip & Next</span>
                                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Guidelines card */}
                    <div className="neu-raised rounded-md md:rounded-lg p-4 shadow-md border border-gray-100 relative overflow-hidden mt-4 md:mt-0 flex flex-col">
                        <div className="absolute -right-6 -top-6 w-16 h-16 bg-rose-100/50 rounded-full opacity-70 hidden sm:block"></div>

                        <h2 className="text-md md:text-lg font-semibold mb-3 text-gray-800 relative">
                            <span className="inline-block relative pb-1">
                                Sentiment guidelines
                                <span className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-linear-to-r from-rose-500 to-pink-500"></span>
                            </span>
                        </h2>

                        <ul className="text-sm text-slate-700 space-y-2 list-disc ml-5">
                            <li><strong>Positive:</strong> Expresses favorable emotions, satisfaction, or approval</li>
                            <li><strong>Neutral:</strong> Factual statements without emotional content</li>
                            <li><strong>Negative:</strong> Expresses unfavorable emotions, dissatisfaction, or disapproval</li>
                            <li>Use &quot;Skip&quot; if you&apos;re unsure about the sentiment</li>
                            <li>Consider the overall tone and context of the sentence</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
