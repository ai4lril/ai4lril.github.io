import React, { useState, useRef, useEffect } from 'react';

interface RecordBtnProps {
    onAudioRecorded?: (wavFile: File) => void;
}

export default function RecordBtn({ onAudioRecorded }: RecordBtnProps) {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            audioChunksRef.current = [];

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = e => e.data.size > 0 && audioChunksRef.current.push(e.data);

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const fileName = `recording_${new Date().toISOString()}.wav`;
                const wavFile = new File([audioBlob], fileName, { type: 'audio/wav' });
                onAudioRecorded?.(wavFile);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    useEffect(() => () => {
        if (mediaRecorderRef.current && isRecording) stopRecording();
    }, [isRecording]);

    return (
        <div
            className={`relative flex items-center justify-center p-6 transition-all duration-500
                ${isRecording
                    ? 'before:content-[""] before:absolute before:inset-0 before:rounded-full before:bg-red-400/50 before:blur-2xl before:opacity-90 before:animate-pulse'
                    : 'before:content-[""] before:absolute before:inset-0 before:rounded-full before:bg-blue-400/40 before:blur-xl before:opacity-70'}`}
        >
            <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`relative rounded-full size-24 flex items-center justify-center transition-all duration-500 m-3 bg-white border-2
                    ${isRecording
                        ? 'bg-red-50 shadow-2xl shadow-red-500/40 ring-4 ring-red-400/50 hover:shadow-red-600/50 hover:ring-red-500/60 border-red-300'
                        : 'shadow-xl shadow-blue-400/30 ring-4 ring-blue-400/40 hover:shadow-blue-500/40 hover:ring-blue-500/50 hover:bg-blue-50 border-blue-300'}`}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
                style={{
                    boxShadow: isRecording
                        ? '0 0 40px 12px rgba(239, 68, 68, 0.3), 0 4px 12px 0 rgba(239, 68, 68, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        : '0 0 32px 8px rgba(59, 130, 246, 0.2), 0 4px 12px 0 rgba(59, 130, 246, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
            >
                {/* Outer ripple effect */}
                <span className={`absolute inset-0 rounded-full ${isRecording ? 'animate-ping bg-red-400/20' : 'bg-blue-400/10'} opacity-0 group-hover:opacity-100`}></span>

                {/* Inner glow */}
                <span className={`absolute inset-2 rounded-full ${isRecording ? 'bg-red-400/20 animate-pulse' : 'bg-blue-400/10'} opacity-60`}></span>

                {/* Icon */}
                {isRecording ? (
                    <svg width="36" height="36" viewBox="0 0 32 32" className="animate-pulse z-10 text-red-600 drop-shadow-sm">
                        <rect x="8" y="8" width="16" height="16" rx="3" fill="currentColor" />
                    </svg>
                ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" className="z-10 text-blue-600 drop-shadow-sm transition-transform duration-200 hover:scale-110" fill="currentColor">
                        <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z" />
                        <path d="M17 12c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V22h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                    </svg>
                )}

                {/* Recording indicator */}
                {isRecording && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50">
                        <div className="w-full h-full bg-red-400 rounded-full animate-ping"></div>
                    </div>
                )}
            </button>

            {/* Status text */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <span className={`text-sm font-medium transition-colors duration-300 ${isRecording ? 'text-red-600' : 'text-blue-600'
                    }`}>
                    {isRecording ? 'Recording...' : 'Click to record'}
                </span>
            </div>
        </div>
    );
}
