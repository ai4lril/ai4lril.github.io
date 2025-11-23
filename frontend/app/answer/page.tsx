"use client";

import DialogBox from "@/components/DialogBox"
import RecordBtn from "@/components/RecordBtn";
import BottomBar from "@/components/BottomBar";
import { useState, useEffect } from "react";
import { codeToLabel } from "@/lib/languages";
import { getPreferredLanguage } from "@/lib/langPreference";


export default function Answer() {
    // State to store the recorded audio file and its URL
    const [recordedAudio, setRecordedAudio] = useState<File | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
    const [lang, setLang] = useState<string | null>(null);

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

    // Handle submit button click
    const handleSubmit = () => {
        if (recordedAudio) {
            console.log("Submitting audio:", recordedAudio.name);
            // Here you would handle the submission logic

            // Reset audio state after submission
            setRecordedAudio(null);
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
                setAudioUrl(undefined);
            }
        }
    };

    // Init language + clean up URLs when component unmounts
    useEffect(() => {
        const saved = getPreferredLanguage();
        setLang(saved);
        const onLangChanged = (e: Event) => {
            const code = (e as CustomEvent<string>).detail;
            setLang(code);
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
                    <DialogBox />
                    <div className="mt-6">
                        <RecordBtn onAudioRecorded={handleAudioRecorded} />
                    </div>
                </div>
            </div>

            <BottomBar
                audioSrc={audioUrl}
                onSkip={handleSkip}
                onSubmit={handleSubmit}
            />
        </div>
    )
}