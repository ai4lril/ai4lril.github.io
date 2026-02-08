"use client";

import DialogBox from "@/components/DialogBox"
import RecordBtn from "@/components/RecordBtn";
import BottomBar from "@/components/BottomBar";
import { useState, useEffect } from "react";
import { codeToLabel } from "@/lib/languages";
import { getPreferredLanguage } from "@/lib/langPreference";
import { showToast } from "@/lib/toast";
import { API_BASE_URL } from "@/lib/api-config";

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
    // State to store the recorded media file and its URL
    const [recordedMedia, setRecordedMedia] = useState<File | null>(null);
    const [mediaUrl, setMediaUrl] = useState<string | undefined>(undefined);
    const [lang, setLang] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'audio' | 'video'>('audio');

    // Speech sentences state
    const [sentences, setSentences] = useState<SpeechSentence[]>([]);
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Fetch speech sentences from backend
    const fetchSpeechSentences = async (languageCode?: string) => {
        try {
            setLoading(true);
            const url = new URL(`${API_BASE_URL}/speech/sentences`);
            if (languageCode) {
                url.searchParams.set('languageCode', languageCode);
            }

            // Get auth token if available
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(url.toString(), { headers });
            if (!response.ok) {
                const errorText = await response.text().catch(() => 'No response body');
                console.error(`Fetch failed for ${url}: Status ${response.status} (${response.statusText}). Response:`, errorText);
                throw new Error(`Failed to fetch speech sentences: ${response.status} ${response.statusText}`);
            }

            const fetchedSentences = await response.json();
            setSentences(fetchedSentences);
            setCurrentSentenceIndex(0);
        } catch (err) {
            console.error('Error fetching speech sentences:', err);
            setSentences([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle media recorded from the RecordBtn component
    const handleMediaRecorded = (file: File) => {
        // Clean up previous URL if it exists
        if (mediaUrl) {
            URL.revokeObjectURL(mediaUrl);
        }

        // Store the file and create a URL for playback
        setRecordedMedia(file);
        const newUrl = URL.createObjectURL(file);
        setMediaUrl(newUrl);
    };

    // Handle skip button click
    const handleSkip = () => {
        // Reset media state
        setRecordedMedia(null);
        if (mediaUrl) {
            URL.revokeObjectURL(mediaUrl);
            setMediaUrl(undefined);
        }
        nextSentence();
    };

    // Navigate to next sentence
    const nextSentence = () => {
        if (sentences.length === 0) return;

        const nextIndex = (currentSentenceIndex + 1) % sentences.length;
        setCurrentSentenceIndex(nextIndex);

        // Reset media state for new sentence
        setRecordedMedia(null);
        if (mediaUrl) {
            URL.revokeObjectURL(mediaUrl);
            setMediaUrl(undefined);
        }
    };

    // Get current sentence
    const currentSentence = sentences.length > 0 ? sentences[currentSentenceIndex] : undefined;

    // Handle submit button click
    const handleSubmit = async () => {
        if (!recordedMedia || !currentSentence) {
            showToast("No recording or sentence available", "error");
            return;
        }

        // Validate media format
        // For audio mode, prioritize WAV (48kHz) format
        const allowedAudioFormats = ['audio/wav', 'audio/webm', 'audio/mp3', 'audio/ogg', 'audio/mpeg'];
        const allowedVideoFormats = ['video/webm', 'video/mp4'];
        const allowedFormats = mediaType === 'video'
            ? [...allowedVideoFormats, ...allowedAudioFormats]
            : allowedAudioFormats;

        if (!allowedFormats.includes(recordedMedia.type)) {
            const expectedFormat = mediaType === 'audio' 
                ? '48kHz WAV format' 
                : 'WebM or MP4 format';
            showToast(`Unsupported format: ${recordedMedia.type}. Expected ${expectedFormat}.`, "error");
            return;
        }

        // For audio mode, warn if not WAV (though it should always be WAV now)
        if (mediaType === 'audio' && recordedMedia.type !== 'audio/wav') {
            console.warn('Audio recording is not in WAV format:', recordedMedia.type);
        }

        try {
            setSubmitting(true);

            // Calculate duration using Web Audio API (works for both audio and video)
            let duration = 0;
            try {
                duration = await calculateMediaDuration(recordedMedia, mediaType);
                // Validate duration
                const MIN_DURATION = 0.5; // 0.5 seconds
                const MAX_DURATION = 300; // 5 minutes (generous for video)
                if (duration < MIN_DURATION) {
                    showToast(`Recording too short (${duration.toFixed(1)}s). Minimum is ${MIN_DURATION}s.`, "error");
                    return;
                }
                if (duration > MAX_DURATION) {
                    showToast(`Recording too long (${duration.toFixed(1)}s). Maximum is ${MAX_DURATION}s.`, "error");
                    return;
                }
            } catch (durationError) {
                console.warn('Could not calculate duration:', durationError);
                showToast("Warning: Could not validate duration. Proceeding anyway.", "warning");
            }

            // Convert File to base64 for backend
            const arrayBuffer = await recordedMedia.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
            const base64Audio = btoa(binary);

            // Get auth token
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // Submit to backend using JSON with base64 encoded file
            const response = await fetch(`${API_BASE_URL}/speech/recording`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    sentenceId: currentSentence.id,
                    audioFile: base64Audio,
                    audioFormat: recordedMedia.type.split('/')[1] || 'webm',
                    mediaType: mediaType,
                    duration: duration,
                }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Failed to submit recording' }));
                throw new Error(error.message || 'Failed to submit recording');
            }

            const result = await response.json();

            if (result.success) {
                showToast(`${mediaType === 'video' ? 'Video' : 'Audio'} recording submitted successfully!`, "success");
                nextSentence();
            } else {
                throw new Error(result.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Error submitting recording:', error);
            showToast(`Failed to submit recording: ${error instanceof Error ? error.message : 'Unknown error'}`, "error");
        } finally {
            setSubmitting(false);
        }
    };

    // Handle media type change
    const handleMediaTypeChange = (newType: 'audio' | 'video') => {
        if (newType === mediaType) return;

        // Reset recording when switching modes
        setRecordedMedia(null);
        if (mediaUrl) {
            URL.revokeObjectURL(mediaUrl);
            setMediaUrl(undefined);
        }
        setMediaType(newType);
    };

    // Init language and fetch sentences + clean up URLs when component unmounts
    useEffect(() => {
        const saved = getPreferredLanguage();
        setLang(saved);
        fetchSpeechSentences(saved || undefined);

        const onLangChanged = (e: Event) => {
            const code = (e as CustomEvent<string>).detail;
            setLang(code);
            fetchSpeechSentences(code);
        };

        window.addEventListener('language-changed', onLangChanged as EventListener);
        return () => {
            if (mediaUrl) {
                URL.revokeObjectURL(mediaUrl);
            }
            window.removeEventListener('language-changed', onLangChanged as EventListener);
        };
    }, [mediaUrl]);

    return (
        <div className="flex flex-col items-center w-full h-full justify-center gap animate-fade-in-up">
            <p className="mt-7 sm:mt-3 text-center animate-bounce-in">
                {mediaType === 'video' ? (
                    <>click <span className="inline-flex animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-blue-600 hover:scale-110 transition-transform duration-300">
                            <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                    </span> then read the sentence aloud</>
                ) : (
                    <>click <span className="inline-flex animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-blue-600 hover:scale-110 transition-transform duration-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                        </svg>
                    </span> then read the sentence aloud</>
                )}
            </p>
            <div className="w-full card-wide mx-auto my-2 relative flex flex-col animate-slide-in-left">
                <div className="text-center mb-2 flex items-center justify-center gap-3 flex-wrap">
                    <span className="inline-block text-xs px-3 py-2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium animate-bounce-in">{codeToLabel(lang)}</span>

                    {/* Audio/Video Toggle */}
                    <div className="inline-flex rounded-full bg-gray-100 border border-gray-200 p-0.5 shadow-sm">
                        <button
                            onClick={() => handleMediaTypeChange('audio')}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${mediaType === 'audio'
                                    ? 'bg-white text-blue-700 shadow-md border border-blue-200'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                            </svg>
                            Audio
                        </button>
                        <button
                            onClick={() => handleMediaTypeChange('video')}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${mediaType === 'video'
                                    ? 'bg-white text-blue-700 shadow-md border border-blue-200'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                            Video
                        </button>
                    </div>
                </div>
                <div className="w-full relative">
                    {/* Always show the gradient border, even if the card is short */}
                    <div className="absolute left-0 top-0 h-full w-[5px] sm:w-[6px] rounded-l-2xl bg-linear-to-b from-blue-500 via-indigo-500 to-purple-500 shadow-lg z-10"></div>
                    <div className="flex-1 min-h-[40vh] max-h-fit sm:px-8 p-8 xs:px-4
                      flex flex-col items-center justify-around 
                      glass rounded-r-2xl shadow-2xl relative z-20 border border-gray-100 ml-[5px] sm:ml-[5px]">
                        <DialogBox
                            currentSentence={currentSentence}
                            loading={loading}
                        />

                        <RecordBtn mode={mediaType} onAudioRecorded={handleMediaRecorded} />
                    </div>
                </div>
            </div>

            {/* Video preview of recorded video */}
            {mediaType === 'video' && mediaUrl && (
                <div className="w-full max-w-md mx-auto mt-2 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                    <video
                        src={mediaUrl}
                        controls
                        className="w-full rounded-2xl"
                        style={{ maxHeight: '300px' }}
                    />
                </div>
            )}

            <BottomBar
                audioSrc={mediaUrl}
                mediaType={mediaType}
                onSkip={handleSkip}
                onSubmit={handleSubmit}
                disabled={loading || submitting}
            />
        </div>
    )
}

// Helper function for media duration calculation
async function calculateMediaDuration(blob: Blob, mediaType: 'audio' | 'video'): Promise<number> {
    if (mediaType === 'video') {
        // Use HTMLVideoElement for video duration
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(blob);
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                const { duration } = video;
                URL.revokeObjectURL(url);
                if (isFinite(duration) && duration > 0) {
                    resolve(duration);
                } else {
                    reject(new Error('Could not determine video duration'));
                }
            };
            video.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load video metadata'));
            };
            video.src = url;
        });
    }

    // Use Web Audio API for audio duration
    return new Promise((resolve, reject) => {
        const getAudioContext = (): AudioContext => {
            if ('AudioContext' in window) {
                return new (window as typeof globalThis).AudioContext();
            }
            if ('webkitAudioContext' in window) {
                return new (window as unknown as { webkitAudioContext: new () => AudioContext }).webkitAudioContext();
            }
            throw new Error('AudioContext not supported');
        };

        const audioContext = getAudioContext();
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                const { duration } = audioBuffer;
                audioContext.close();
                resolve(duration);
            } catch {
                reject(new Error("Failed to decode audio file"));
            }
        };

        reader.onerror = () => {
            reject(new Error("Failed to read audio file"));
        };
        reader.readAsArrayBuffer(blob);
    });
}
