"use client";

import DialogBox from "@/components/DialogBox"
import RecordBtn from "@/components/RecordBtn";
import BottomBar from "@/components/BottomBar";
import { useState, useEffect } from "react";
import { codeToLabel } from "@/lib/languages";
import { getPreferredLanguage } from "@/lib/langPreference";

interface SpeechSentence {
    id: string;
    text: string;
    languageCode: string;
    isActive: boolean;
    difficulty?: string;
    createdAt: string;
    updatedAt: string;
}


export default function Speak() {
    // State to store the recorded audio file and its URL
    const [recordedAudio, setRecordedAudio] = useState<File | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
    const [lang, setLang] = useState<string | null>(null);

    // Speech sentences state
    const [sentences, setSentences] = useState<SpeechSentence[]>([]);
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Fetch speech sentences from backend
    const fetchSpeechSentences = async (languageCode?: string) => {
        try {
            setLoading(true);
            const url = languageCode
                ? `/api/speech-sentences?languageCode=${languageCode}`
                : '/api/speech-sentences';

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch speech sentences');
            }

            const fetchedSentences = await response.json();
            setSentences(fetchedSentences);
            setCurrentSentenceIndex(0);
        } catch (error) {
            console.error('Error fetching speech sentences:', error);
            setSentences([]);
        } finally {
            setLoading(false);
        }
    };

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
        nextSentence();
    };

    // Navigate to next sentence
    const nextSentence = () => {
        if (sentences.length === 0) return;

        const nextIndex = (currentSentenceIndex + 1) % sentences.length;
        setCurrentSentenceIndex(nextIndex);

        // Reset audio state for new sentence
        setRecordedAudio(null);
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
            setAudioUrl(undefined);
        }
    };

    // Get current sentence
    const currentSentence = sentences.length > 0 ? sentences[currentSentenceIndex] : undefined;

    // Handle submit button click
    const handleSubmit = async () => {
        if (!recordedAudio || !currentSentence) {
            alert("No audio recorded or sentence available");
            return;
        }

        try {
            setSubmitting(true);

            // Convert audio file to base64
            const audioBuffer = await recordedAudio.arrayBuffer();
            const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

            // Submit to backend
            const response = await fetch('/api/speech-recording', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sentenceId: currentSentence.id,
                    audioFile: base64Audio,
                    audioFormat: recordedAudio.type.split('/')[1] || 'wav',
                    duration: 0, // Could be calculated from audio duration
                    // userId: undefined // Add when authentication is implemented
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit speech recording');
            }

            const result = await response.json();

            if (result.success) {
                alert("Speech recording submitted successfully!");
                nextSentence();
            } else {
                throw new Error(result.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Error submitting speech recording:', error);
            alert(`Failed to submit recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setSubmitting(false);
        }
    };

    // Init language and fetch sentences + clean up URLs when component unmounts
    useEffect(() => {
        const saved = getPreferredLanguage();
        setLang(saved);
        fetchSpeechSentences(saved || undefined);

        function onLangChanged(e: Event) {
            const code = (e as CustomEvent<string>).detail;
            setLang(code);
            fetchSpeechSentences(code);
        }

        window.addEventListener('language-changed', onLangChanged as EventListener);
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
            window.removeEventListener('language-changed', onLangChanged as EventListener);
        };
    }, []);

    return (
        <div className="flex flex-col items-center w-full h-full justify-center gap animate-fade-in-up">
            <p className="mt-7 sm:mt-3 text-center animate-bounce-in">click <span className="inline-flex animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-blue-600 hover:scale-110 transition-transform duration-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
            </span> then read the sentence aloud</p>
            <div className="w-full card-wide mx-auto my-2 relative flex flex-col animate-slide-in-left">
                <div className="text-center mb-2">
                    <span className="inline-block text-xs px-3 py-2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium animate-bounce-in">{codeToLabel(lang)}</span>
                </div>
                <div className="w-full relative">
                    {/* Always show the gradient border, even if the card is short */}
                    <div className="absolute left-0 top-0 h-full w-[5px] sm:w-[6px] rounded-l-2xl bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 shadow-lg z-10"></div>
                    <div className="flex-1 min-h-[40vh] max-h-fit sm:px-8 p-8 xs:px-4
                      flex flex-col items-center justify-around 
                      glass rounded-r-2xl shadow-2xl relative z-20 border border-gray-100 ml-[5px] sm:ml-[5px]">
                        <DialogBox
                            currentSentence={currentSentence}
                            loading={loading}
                        />

                        <RecordBtn onAudioRecorded={handleAudioRecorded} />
                    </div>
                </div>
            </div>

            <BottomBar
                audioSrc={audioUrl}
                onSkip={handleSkip}
                onSubmit={handleSubmit}
                disabled={loading || submitting}
            />
        </div>
    )
}