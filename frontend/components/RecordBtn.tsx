import React, { useState, useRef, useEffect } from 'react';

interface RecordBtnProps {
    mode?: 'audio' | 'video';
    onAudioRecorded?: (file: File) => void;
}

export default function RecordBtn({ mode = 'audio', onAudioRecorded }: RecordBtnProps) {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startRecording = async () => {
        try {
            chunksRef.current = [];

            const constraints: MediaStreamConstraints =
                mode === 'video'
                    ? { audio: true, video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } }
                    : { audio: true };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            // Show video preview when in video mode
            if (mode === 'video' && videoPreviewRef.current) {
                videoPreviewRef.current.srcObject = stream;
                videoPreviewRef.current.play();
            }

            const mimeType = mode === 'video'
                ? (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm')
                : (MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm');

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = e => e.data.size > 0 && chunksRef.current.push(e.data);

            mediaRecorder.onstop = () => {
                const isVideo = mode === 'video';
                const blobType = isVideo ? 'video/webm' : 'audio/wav';
                const ext = isVideo ? 'webm' : 'wav';
                const blob = new Blob(chunksRef.current, { type: blobType });
                const fileName = `recording_${new Date().toISOString()}.${ext}`;
                const file = new File([blob], fileName, { type: blobType });
                onAudioRecorded?.(file);

                // Stop video preview
                if (videoPreviewRef.current) {
                    videoPreviewRef.current.srcObject = null;
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error(`Error accessing ${mode === 'video' ? 'camera/microphone' : 'microphone'}:`, error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            setIsRecording(false);
        }
    };

    // Cleanup on unmount or mode change
    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current && isRecording) {
                stopRecording();
            }
        };
    }, [isRecording]);

    // Stop recording if mode changes while recording
    useEffect(() => {
        if (isRecording) {
            stopRecording();
        }
    }, [mode]);

    const isVideo = mode === 'video';

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Video preview - shown when in video mode */}
            {isVideo && (
                <div className={`relative rounded-2xl overflow-hidden shadow-xl border-2 transition-all duration-500 ${isRecording
                        ? 'border-red-400 shadow-red-500/30'
                        : 'border-blue-300 shadow-blue-400/20'
                    }`}>
                    <video
                        ref={videoPreviewRef}
                        muted
                        playsInline
                        className="w-64 h-48 sm:w-80 sm:h-60 object-cover bg-gray-900 rounded-2xl"
                    />
                    {!isRecording && !streamRef.current && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-2xl">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
                                <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                        </div>
                    )}
                    {isRecording && (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-600/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            REC
                        </div>
                    )}
                </div>
            )}

            {/* Record button */}
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
                    aria-label={isRecording ? "Stop recording" : `Start ${isVideo ? 'video' : 'audio'} recording`}
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
                    ) : isVideo ? (
                        // Video camera icon
                        <svg width="32" height="32" viewBox="0 0 24 24" className="z-10 text-blue-600 drop-shadow-sm transition-transform duration-200 hover:scale-110" fill="currentColor">
                            <path d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                    ) : (
                        // Microphone icon
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
                    <span className={`text-sm font-medium transition-colors duration-300 whitespace-nowrap ${isRecording ? 'text-red-600' : 'text-blue-600'
                        }`}>
                        {isRecording ? 'Recording...' : `Click to record ${isVideo ? 'video' : 'audio'}`}
                    </span>
                </div>
            </div>
        </div>
    );
}
