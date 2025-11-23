"use client";

import { useState } from "react";

// Sanitize input to prevent XSS
function sanitizeInput(value: string): string {
    return value
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .replace(/\\/g, '&#x5C;')
        .replace(/\n/g, '<br>')
        .replace(/\r/g, '')
        .replace(/\t/g, '    ')
        .trim();
}

// Additional security: Check for suspicious patterns
function containsSuspiciousPatterns(value: string): boolean {
    const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /vbscript:/i,
        /onload=/i,
        /onerror=/i,
        /onclick=/i,
        /onmouseover=/i,
        /data:text/i,
        /data:application/i,
        /<iframe/i,
        /<object/i,
        /<embed/i,
        /expression\(/i,
        /vbscript:/i,
        /data:image/i,
        /<meta/i,
        /<link/i,
        /<style/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(value));
}

// Additional validation: Check for potentially dangerous Unicode characters
function containsDangerousUnicode(value: string): boolean {
    // Check for right-to-left override characters and other potentially malicious Unicode
    const dangerousUnicode = [
        /\u202E/g, // Right-to-Left Override
        /\u202D/g, // Left-to-Right Override
        /\u202C/g, // Pop Directional Formatting
        /\u200E/g, // Left-to-Right Mark
        /\u200F/g, // Right-to-Left Mark
    ];

    return dangerousUnicode.some(pattern => pattern.test(value));
}

function isValidEmail(value: string): boolean {
    // More robust email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(value) && value.length <= 254;
}

// Rate limiting for form submissions
let lastSubmissionTime = 0;
const SUBMISSION_COOLDOWN = 30000; // 30 seconds

function canSubmitForm(): boolean {
    const now = Date.now();
    if (now - lastSubmissionTime < SUBMISSION_COOLDOWN) {
        return false;
    }
    lastSubmissionTime = now;
    return true;
}

export default function ContactForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    const validate = () => {
        const next: Record<string, string> = {};

        // Check for suspicious patterns before sanitization
        if (containsSuspiciousPatterns(name) || containsSuspiciousPatterns(email) || containsSuspiciousPatterns(message)) {
            next.general = "Your input contains potentially harmful content. Please review and try again.";
            return next;
        }

        // Check for dangerous Unicode characters
        if (containsDangerousUnicode(name) || containsDangerousUnicode(email) || containsDangerousUnicode(message)) {
            next.general = "Your input contains unsupported characters. Please use standard text only.";
            return next;
        }

        // Sanitize inputs before validation
        const sanitizedName = sanitizeInput(name);
        const sanitizedEmail = sanitizeInput(email);
        const sanitizedMessage = sanitizeInput(message);

        if (!sanitizedName || sanitizedName.length < 2) next.name = "Please enter a valid name (at least 2 characters).";
        if (!sanitizedEmail) next.email = "Please enter your email.";
        else if (!isValidEmail(sanitizedEmail)) next.email = "Please enter a valid email address.";
        if (!sanitizedMessage || sanitizedMessage.length < 10) next.message = "Please enter a message (at least 10 characters).";

        return next;
    };

    const handleBlur = (field: string) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        const validationErrors = validate();
        setErrors((prev) => ({ ...prev, [field]: validationErrors[field] || "" }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Rate limiting check
        if (!canSubmitForm()) {
            setErrors({ general: "Please wait 30 seconds before submitting another message." });
            return;
        }

        const formData = new FormData(e.target as HTMLFormElement);
        if (formData.get('website')?.toString().trim()) {
            setErrors({ general: "Spam detected. Please try submitting again without filling hidden fields." });
            return;
        }

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setTouched({ name: true, email: true, message: true });
            return;
        }

        setSubmitting(true);
        setErrors({}); // Clear any previous errors

        try {
            // Sanitize data before sending
            const sanitizedData = {
                name: sanitizeInput(name),
                email: sanitizeInput(email),
                message: sanitizeInput(message)
            };

            // Simulate sending with sanitized data
            // Only log in development environment
            if (process.env.NODE_ENV === 'development') {
                console.log("Sending sanitized contact form data:", sanitizedData);
            }
            await new Promise(res => setTimeout(res, 800));

            setSuccess("Thanks! Your message has been sent. We'll get back within 24–48 hours.");
            setName("");
            setEmail("");
            setMessage("");
            setTouched({});
            setErrors({});
        } catch {
            setErrors({ general: "An error occurred while sending your message. Please try again." });
        } finally {
            setSubmitting(false);
        }
    };

    const showError = (field: string) => touched[field] && errors[field];

    return (
        <>
            {success && (
                <div role="alert" className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in-up">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-green-800 font-medium">{success}</p>
                    </div>
                </div>
            )}

            {errors.general && (
                <div role="alert" className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in-up">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-red-800 font-medium">{errors.general}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                            Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={() => handleBlur("name")}
                            className={`w-full px-4 py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${showError("name") ? "border-red-300" : "border-slate-300"
                                }`}
                            placeholder="Your full name"
                            aria-invalid={showError("name")}
                            aria-describedby={showError("name") ? "name-error" : undefined}
                        />
                        {showError("name") && (
                            <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                            Email *
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => handleBlur("email")}
                            className={`w-full px-4 py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${showError("email") ? "border-red-300" : "border-slate-300"
                                }`}
                            placeholder="your.email@example.com"
                            aria-invalid={showError("email")}
                            aria-describedby={showError("email") ? "email-error" : undefined}
                        />
                        {showError("email") && (
                            <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">{errors.email}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                        Message *
                    </label>
                    <p className="text-slate-500 text-sm mb-2">Describe your query or feedback in detail. We appreciate detailed messages to better assist you.</p>
                    <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onBlur={() => handleBlur("message")}
                        rows={6}
                        className={`w-full px-4 py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical ${showError("message") ? "border-red-300" : "border-slate-300"
                            }`}
                        placeholder="Tell us about your project, collaboration idea, or how we can help..."
                        aria-invalid={showError("message")}
                        aria-describedby={showError("message") ? "message-error" : undefined}
                    />
                    {showError("message") && (
                        <p id="message-error" className="mt-1 text-sm text-red-600" role="alert">{errors.message}</p>
                    )}
                </div>

                <div style={{ position: 'absolute', left: '-9999px' }}>
                    <input
                        type="text"
                        name="website"
                        tabIndex={-1}
                        aria-hidden="true"
                        autoComplete="off"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:cursor-not-allowed"
                    >
                        {submitting && (
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        )}
                        {submitting ? "Sending..." : "Send Message"}
                    </button>
                </div>
            </form>
        </>
    );
}
