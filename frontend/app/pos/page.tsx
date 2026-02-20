"use client";

import { useEffect, useMemo, useState } from "react";
import { tokenizeByScript, detectScript } from "@/lib/tokenize";
import { POS_TAGS } from "./pos";
import { posSentences } from "./sentences";
import { codeToLabel } from "@/lib/languages";
import { getPreferredLanguage } from "@/lib/langPreference";
import { API_BASE_URL } from "@/lib/api-config";

function shuffle<T>(arr: T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export default function PosPage() {
    const [lang, setLang] = useState<string | null>(null);
    const [pool, setPool] = useState(posSentences);
    const [index, setIndex] = useState<number>(0);
    const [text, setText] = useState<string>(pool[0]?.text ?? "");
    const tokens = useMemo(() => tokenizeByScript(text, detectScript(text) || 'roman'), [text]);
    const [tags, setTags] = useState<Record<number, string>>({});
    const [missing, setMissing] = useState<Set<number>>(new Set());
    const [errorMsg, setErrorMsg] = useState<string>("");

    useEffect(() => {
        const saved = getPreferredLanguage();
        setLang(saved);
        const initial = saved ? shuffle(posSentences.filter(s => s.langCode === saved)) : shuffle(posSentences);
        setPool(initial);
        setIndex(0);
        setText(initial[0]?.text ?? "");
    }, []);

    useEffect(() => {
        const onLangChanged = (e: Event) => {
            const code = (e as CustomEvent<string>).detail;
            setLang(code);
            const nextPool = code ? shuffle(posSentences.filter(s => s.langCode === code)) : shuffle(posSentences);
            setPool(nextPool);
            setIndex(0);
            setText(nextPool[0]?.text ?? "");
            setTags({});
            setMissing(new Set());
            setErrorMsg("");
        };
        window.addEventListener('language-changed', onLangChanged as EventListener);
        return () => window.removeEventListener('language-changed', onLangChanged as EventListener);
    }, []);

    const handleTagChange = (i: number, tag: string) => {
        setTags(prev => ({ ...prev, [i]: tag }));
        if (missing.has(i) && tag) {
            const next = new Set(missing);
            next.delete(i);
            setMissing(next);
            if (next.size === 0) setErrorMsg("");
        }
    };

    const nextSentence = () => {
        const next = (index + 1) % pool.length;
        setIndex(next);
        setText(pool[next]?.text ?? "");
        setTags({});
        setMissing(new Set());
        setErrorMsg("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const missingIdx = new Set<number>();
        tokens.forEach((_, i) => { if (!tags[i] || !tags[i].trim()) missingIdx.add(i); });
        if (missingIdx.size > 0) {
            setMissing(missingIdx);
            setErrorMsg("Please tag all tokens before submitting.");
            return;
        }
        const sentence = pool[index];
        const annotations = tokens.map((tok, i) => ({ token: tok, tag: tags[i] }));
        console.log("POS annotations", { sentenceId: sentence?.id, lang, text, annotations });

        try {
            // Get auth token if available
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}/pos-annotation`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    sentenceId: sentence?.id,
                    annotations: annotations,
                    languageCode: lang || 'unknown'
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log("POS submitted successfully", result);

                // Show success message
                const successMsg = document.createElement('div');
                successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce-in';
                successMsg.textContent = 'POS annotations submitted successfully!';
                document.body.appendChild(successMsg);
                setTimeout(() => {
                    if (document.body.contains(successMsg)) {
                        document.body.removeChild(successMsg);
                    }
                }, 3000);

                nextSentence();
            } else {
                let errorMessage = "Failed to submit POS annotations";
                try {
                    const error = await response.json();
                    errorMessage = error.error || error.message || errorMessage;
                } catch (parseError) {
                    console.error('Error parsing response:', parseError);
                }
                console.error('Submission failed:', response.status, errorMessage);
                setErrorMsg(errorMessage);
            }
        } catch (error) {
            console.error("Error submitting POS:", error);
            setErrorMsg(`Network error: ${error instanceof Error ? error.message : 'Please check your connection and try again.'}`);
        }
    };

    return (
        <div className="w-full max-w-2xl md:max-w-4xl py-4 px-2 md:px-4 mx-auto animate-fade-in-up">
            <h1 className="text-xl md:text-2xl font-bold text-center mb-1 animate-bounce-in">Part-of-Speech Tagging</h1>
            <div className="text-center mb-3">
                <span className="inline-block text-xs px-3 py-2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium animate-bounce-in">{codeToLabel(lang)}</span>
            </div>
            <p className="text-center text-gray-600 mb-4 text-sm md:text-base animate-fade-in-up animate-delay-200">
                Tag each token in the sentence with UPOS (ADJ, NOUN, VERB, etc.).
            </p>

            {errorMsg && (
                <div className="text-center text-red-600 text-sm mb-3">{errorMsg}</div>
            )}

            <div className="w-full relative">
                <div className="absolute inset-0 bg-linear-to-b from-blue-50/30 to-indigo-50/30 -z-10 rounded-xl blur-xl hidden md:block"></div>

                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 w-full">
                    {/* Sentence + tagging card */}
                    <div className="neu-raised rounded-md md:rounded-lg p-4 shadow-md border border-gray-100 relative overflow-hidden flex flex-col">
                        <div className="absolute -right-8 -top-8 w-20 h-20 bg-indigo-100/50 rounded-full opacity-70 hidden sm:block"></div>
                        <div className="absolute -left-6 -bottom-6 w-16 h-16 bg-blue-100/50 rounded-full opacity-70 hidden sm:block"></div>

                        <h2 className="text-md md:text-lg font-semibold mb-3 text-gray-800 relative">
                            <span className="inline-block relative pb-1">
                                Sentence
                                <span className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-linear-to-r from-indigo-500 to-purple-500"></span>
                            </span>
                        </h2>

                        <div className="w-full p-4 neu-raised rounded-xl text-slate-800 mb-4">
                            {text}
                        </div>

                        {tokens.length > 0 && (
                            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                                <div className="card-wide neu-raised rounded-xl p-2 md:p-4">
                                    <div className="overflow-x-auto">
                                        <table className="w-full mx-auto text-sm">
                                            <thead>
                                                <tr className="text-slate-600 text-center">
                                                    <th className="py-2">Token</th>
                                                    <th className="py-2">UPOS Tag</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tokens.map((tok, i) => (
                                                    <tr key={i} className="border-t border-slate-100 odd:bg-white even:bg-slate-50 hover:bg-indigo-50/40">
                                                        <td className="py-2.5 text-center">
                                                            <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-slate-800">
                                                                {tok}
                                                            </span>
                                                        </td>
                                                        <td className="py-2.5 text-center">
                                                            <select
                                                                className={`text-sm rounded-full px-3 py-1 bg-white focus:outline-none ${missing.has(i) ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-300'} border focus:border-indigo-600`}
                                                                value={tags[i] || ""}
                                                                onChange={(e) => handleTagChange(i, e.target.value)}
                                                            >
                                                                <option value="">Tag…</option>
                                                                {POS_TAGS.map(tag => (
                                                                    <option key={tag} value={tag}>{tag}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="mt-4 flex gap-3 justify-center">
                                    <button type="submit" className="group bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg px-6 py-3 font-semibold shadow-lg hover:shadow-xl border-2 border-blue-400 hover:border-blue-500 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2">
                                        <span>Submit & Next</span>
                                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </button>
                                    <button type="button" onClick={nextSentence} className="group neu-btn-secondary rounded-lg px-6 py-3 font-semibold text-slate-700 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 min-h-[48px]">
                                        <span>Next sentence</span>
                                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Guidelines card */}
                    <div className="neu-raised rounded-md md:rounded-lg p-4 shadow-md border border-gray-100 relative overflow-hidden mt-4 md:mt-0 flex flex-col">
                        <div className="absolute -right-6 -top-6 w-16 h-16 bg-amber-100/50 rounded-full opacity-70 hidden sm:block"></div>

                        <h2 className="text-md md:text-lg font-semibold mb-3 text-gray-800 relative">
                            <span className="inline-block relative pb-1">
                                Tagging Guidelines
                                <span className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-linear-to-r from-amber-500 to-orange-500"></span>
                            </span>
                        </h2>

                        <div className="space-y-4 text-sm">
                            <div>
                                <h3 className="font-medium text-green-700 mb-1">Do</h3>
                                <ul className="text-gray-700 space-y-1 ml-5 list-disc">
                                    <li>Tag punctuation as PUNCT</li>
                                    <li>Use PROPN for proper nouns, NOUN otherwise</li>
                                    <li>Prefer VERB for main verbs, AUX for auxiliaries</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-medium text-red-700 mb-1">Don&apos;t</h3>
                                <ul className="text-gray-700 space-y-1 ml-5 list-disc">
                                    <li>Leave tokens untagged</li>
                                    <li>Confuse NUM with DET (numerals vs determiners)</li>
                                    <li>Overuse X; try to pick the closest tag</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
