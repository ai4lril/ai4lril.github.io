"use client";

import DialogBox from "@/components/DialogBox"
import RecordBtn from "@/components/RecordBtn";
import BottomBar from "@/components/BottomBar";
import { useState, useEffect } from "react";
import { codeToLabel } from "@/lib/languages";
import { getPreferredLanguage } from "@/lib/langPreference";
import { API_BASE_URL } from "@/lib/api-config";


interface Question {
    id: string;
    text: string;
    languageCode: string;
    sentenceId: string;
}

export default function Answer() {
    // State to store the recorded audio file and its URL
    const [recordedAudio, setRecordedAudio] = useState<File | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
    const [lang, setLang] = useState<string | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Handle audio recorded from the RecordBtn component
    const handleAudioRecorded = (audioFile: File) => {
        // Clean up previous URL if it exists
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }

        // Store the audio file and create a URL for the audio player
        setRecordedAudio(audioFile);
        const newUrl = URL.createObjectURL(audioFile);
        setAudioUrl(newUrl);
    };

    // Handle skip button click
    const handleSkip = () => {
        // Reset audio state
        setRecordedAudio(null);
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
            setAudioUrl(undefined);
        }
    };

    const fetchQuestion = async (languageCode?: string) => {
        setLoading(true);
        setError(null);
        setCurrentQuestion(null);
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const url = new URL(`${API_BASE_URL}/question/sentences`);
            if (languageCode) {
                url.searchParams.set('languageCode', languageCode);
            }
            const response = await fetch(url.toString(), { headers });

            if (response.status === 404) {
                setCurrentQuestion(null);
                setError("No questions available for answering in this language.");
                return;
            }

            if (!response.ok) {
                throw new Error(`Failed to fetch question: ${response.statusText}`);
            }

            const data: Question[] = await response.json();
            if (data.length > 0) {
                setCurrentQuestion(data[0]);
            } else {
                setError("No questions available for answering in this language.");
            }
        } catch (err) {
            console.error("Error fetching question:", err);
            setError("Failed to load question. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handle submit button click
    const handleSubmit = async () => {
        if (!recordedAudio) {
            alert("No audio recorded");
            return;
        }

        if (!currentQuestion) {
            alert("No question loaded. Please wait for question to load.");
            return;
        }

        try {
            const questionId = currentQuestion.id;

            // Convert audio file to base64
            const audioBuffer = await recordedAudio.arrayBuffer();
            const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to submit answer');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/question/answer-recording`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    questionSubmissionId: questionId,
                    audioFile: base64Audio,
                    audioFormat: recordedAudio.type.split('/')[1] || 'wav',
                    duration: 0,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit answer');
            }

            // Reset audio state after submission
            setRecordedAudio(null);
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
                setAudioUrl(undefined);
            }
            // Fetch next question
            fetchQuestion(lang || undefined);
        } catch (error) {
            console.error('Error submitting answer:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to submit answer. Please try again.';
            alert(errorMessage);
        }
    };

    // Init language + clean up URLs when component unmounts
    useEffect(() => {
        const saved = getPreferredLanguage();
        setLang(saved);
        fetchQuestion(saved || undefined);

        const onLangChanged = (e: Event) => {
            const code = (e as CustomEvent<string>).detail;
            setLang(code);
            fetchQuestion(code || undefined);
        };
        window.addEventListener('language-changed', onLangChanged as EventListener);
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
            window.removeEventListener('language-changed', onLangChanged as EventListener);
        };
    }, [audioUrl]);

    return (
        <div className="flex flex-col items-center w-full h-full justify-center gap animate-fade-in-up px-4 sm:px-6 md:px-8">
            <p className="mt-7 sm:mt-3 text-center font-medium tracking-wide animate-bounce-in">
                <span className="inline-flex align-middle animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-blue-600 hover:scale-110 transition-transform duration-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                    </svg>
                </span>
                Respond as naturally as you can
            </p>
            <div className="w-full sm:max-w-[80%] mx-auto my-1 relative flex flex-col animate-slide-in-left">
                <div className="text-center mb-2">
                    <span className="inline-block text-xs px-3 py-2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium animate-bounce-in">{codeToLabel(lang)}</span>
                </div>
                <div className="absolute inset-0 bg-linear-to-b from-blue-50/30 to-indigo-50/30 -z-10 rounded-xl blur-xl hidden md:block"></div>
                <div className="flex-1 min-h-[40vh] max-h-fit p-6 sm:p-8
                      flex flex-col items-center justify-around 
                      glass rounded-md md:rounded-lg shadow-md relative z-20 border border-gray-100">
                    <div className="absolute -right-8 -top-8 w-20 h-20 bg-indigo-100/50 rounded-full opacity-70 hidden sm:block"></div>
                    <div className="absolute -left-6 -bottom-6 w-16 h-16 bg-blue-100/50 rounded-full opacity-70 hidden sm:block"></div>
                    <div className="flex flex-col items-center">
                        <h2 className="text-lg font-bold mb-4 tracking-tight">Answer the question below</h2>
                        <span className=" block w-[100px] h-[2px] bg-linear-to-r from-indigo-500 to-purple-500"></span>
                    </div>
                    {loading && <p className="text-gray-500">Loading question...</p>}
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {currentQuestion && <DialogBox currentSentence={{ id: currentQuestion.sentenceId, text: currentQuestion.text, languageCode: currentQuestion.languageCode }} />}
                    <div className="mt-6">
                        <RecordBtn onAudioRecorded={handleAudioRecorded} />
                    </div>
                </div>
            </div>

            <BottomBar
                audioSrc={audioUrl}
                onSkip={handleSkip}
                onSubmit={handleSubmit}
                disabled={!recordedAudio || !currentQuestion}
            />
        </div>
    )
}
