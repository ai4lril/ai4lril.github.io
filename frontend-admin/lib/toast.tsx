"use client";

import { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

let toastListeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

export function showToast(message: string, type: ToastType = 'info', duration: number = 5000) {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { id, message, type, duration };

    toasts = [...toasts, newToast];
    toastListeners.forEach(listener => listener([...toasts]));

    // Auto remove after duration
    setTimeout(() => {
        removeToast(id);
    }, duration);

    return id;
}

export function removeToast(id: string) {
    toasts = toasts.filter(t => t.id !== id);
    toastListeners.forEach(listener => listener([...toasts]));
}

export function useToasts() {
    const [currentToasts, setCurrentToasts] = useState<Toast[]>(toasts);

    useEffect(() => {
        const listener = (newToasts: Toast[]) => {
            setCurrentToasts(newToasts);
        };

        toastListeners.push(listener);
        return () => {
            toastListeners = toastListeners.filter(l => l !== listener);
        };
    }, []);

    return currentToasts;
}

export function ToastContainer() {
    const toasts = useToasts();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`
            px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-md
            flex items-center justify-between gap-3
            animate-in slide-in-from-right
            ${toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
                            toast.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
                                toast.type === 'warning' ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' :
                                    'bg-blue-50 border border-blue-200 text-blue-800'
                        }
          `}
                >
                    <div className="flex-1">
                        <p className="text-sm font-medium">{toast.message}</p>
                    </div>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    );
}

