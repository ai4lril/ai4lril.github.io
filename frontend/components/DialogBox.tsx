
import React, { useState, useEffect } from 'react';
import { getPreferredLanguage } from '@/lib/langPreference';

interface SpeechSentence {
    id: string;
    text: string;
    languageCode: string;
    difficulty?: string;
}

interface DialogBoxProps {
    currentSentence?: SpeechSentence;
    loading?: boolean;
}

export default function DialogBox({ currentSentence, loading = false }: DialogBoxProps) {
    const [lang, setLang] = useState<string | null>(null);

    useEffect(() => {
        const saved = getPreferredLanguage();
        setLang(saved);

        function onLangChanged(e: Event) {
            const code = (e as CustomEvent<string>).detail;
            setLang(code);
        }

        window.addEventListener('language-changed', onLangChanged as EventListener);
        return () => {
            window.removeEventListener('language-changed', onLangChanged as EventListener);
        };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-blue-600">Loading sentence...</span>
            </div>
        );
    }
    return (


        <p
            className="text-center font-semibold break-words pt-3"
            style={{
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                lineHeight: '1.4',
            }}
        >
            {currentSentence?.text || "No sentence available. Please select a language."}
        </p>

    );
}