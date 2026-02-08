import { useState, useEffect } from 'react';

interface TextBoxProps {
    onSubmit?: (text: string) => void;
    placeholder?: string;
    defaultValue?: string;
    disabled?: boolean;
}

export default function TextBox({
    onSubmit,
    placeholder = "Type your question here...",
    defaultValue = '',
    disabled = false,
}: TextBoxProps) {
    const [text, setText] = useState<string>(defaultValue);

    useEffect(() => {
        if (defaultValue) {
            setText(defaultValue);
        }
    }, [defaultValue]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit && text.trim()) {
            onSubmit(text);
        }
    };

    return (
        <div className="h-full w-full">
            <form className="w-full h-full" onSubmit={handleSubmit}>
                <textarea
                    className="w-full h-full p-4 rounded-xl border border-slate-200 bg-white/90 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none resize-none placeholder:text-slate-400 text-slate-800 shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder={placeholder}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={disabled}
                ></textarea>
            </form>
        </div>
    );
}