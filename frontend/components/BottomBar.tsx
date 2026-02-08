import React, { useRef, useState } from 'react';

interface BottomBarProps {
    audioSrc?: string; // Source URL for the audio/video player
    mediaType?: 'audio' | 'video'; // Type of media to play
    onSkip: () => void; // Callback when skip is clicked
    onSubmit: () => void; // Callback when submit is clicked
    disabled?: boolean; // Optional prop to disable buttons
}

export default function BottomBar({ audioSrc, mediaType = 'audio', onSkip, onSubmit, disabled = false }: BottomBarProps) {

    const audioRef = useRef<HTMLAudioElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const isVideo = mediaType === 'video';

    const handlePlayPause = () => {
        const mediaEl = isVideo ? videoRef.current : audioRef.current;
        if (!mediaEl) return;

        if (isPlaying) {
            mediaEl.pause();
        } else {
            mediaEl.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="sm:mt-10 bg-linear-to-r from-blue-50/80 via-indigo-50/70 to-purple-50/80 sm:bg-white/90 sm:rounded-full rounded-xl w-full max-w-2xl mx-auto px-4 py-4 sm:shadow-xl border border-indigo-100/50 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 transition-all duration-300 hover:shadow-2xl">
            {/* Skip Button */}
            <button
                onClick={onSkip}
                className="group bg-white/95 hover:bg-white shadow-lg hover:shadow-xl w-[60vw] sm:w-[220px] min-w-[140px] px-6 py-3 sm:py-3 rounded-full text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-300 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
            >
                <span>Skip</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 transition-transform group-hover:translate-x-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
                </svg>
            </button>

            {/* Audio/Video + Submit Group */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto justify-end">
                {/* Media Player */}
                <div className="bg-white/90 hover:bg-white shadow-lg hover:shadow-xl border border-gray-200 flex items-center justify-center space-x-4 px-6 sm:px-8 w-full sm:w-auto py-3 rounded-full transition-all duration-300 hover:scale-105">
                    <button
                        onClick={handlePlayPause}
                        className="text-blue-600 hover:text-blue-700 focus:outline-none transition-all duration-200 hover:scale-110 p-1 rounded-full hover:bg-blue-50"
                        disabled={!audioSrc}
                    >
                        {isPlaying ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="drop-shadow-sm">
                                <rect x="6" y="4" width="4" height="16" rx="1" />
                                <rect x="14" y="4" width="4" height="16" rx="1" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="drop-shadow-sm">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </button>

                    {/* Hidden audio element */}
                    {!isVideo && (
                        <audio
                            ref={audioRef}
                            src={audioSrc}
                            className="hidden"
                            onEnded={() => setIsPlaying(false)}
                        />
                    )}

                    {/* Hidden video element for audio-only playback in bottom bar */}
                    {isVideo && (
                        <video
                            ref={videoRef}
                            src={audioSrc}
                            className="hidden"
                            onEnded={() => setIsPlaying(false)}
                        />
                    )}

                    {audioSrc ? (
                        <span className="text-sm text-blue-700 font-semibold">
                            {isVideo ? 'Play Video' : 'Play Recording'}
                        </span>
                    ) : (
                        <span className="text-sm text-gray-400 italic">No recording</span>
                    )}

                    {/* Visual indicator */}
                    {isPlaying && (
                        <div className="flex space-x-1">
                            <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                            <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    onClick={onSubmit}
                    disabled={disabled || !audioSrc}
                    className={`group w-[40vw] sm:w-auto min-w-[110px] px-6 py-3 rounded-full transition-all duration-300 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl border-2 ${audioSrc
                        ? 'bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-green-400 hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-300 hover:scale-105 active:scale-95'
                        : 'bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                        }`}
                >
                    <span className="flex items-center gap-2">
                        <span>Submit</span>
                        {audioSrc && (
                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        )}
                    </span>
                </button>
            </div>
        </div>
    );
}
