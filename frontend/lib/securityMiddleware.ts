// Advanced Security Middleware for Language Data Collection Platform
// Implements rate limiting, input validation, CSRF protection, and security monitoring

import { reportSecurityEvent } from './securityMonitor';

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

interface SecurityConfig {
    rateLimitWindow: number; // in milliseconds
    maxRequests: number;
    csrfTokenLength: number;
    inputValidationRules: Record<string, RegExp>;
}

class SecurityMiddleware {
    private rateLimitMap = new Map<string, RateLimitEntry>();
    private csrfTokens = new Set<string>();
    private config: SecurityConfig;

    constructor() {
        this.config = {
            rateLimitWindow: 60000, // 1 minute
            maxRequests: 100, // requests per window
            csrfTokenLength: 32,
            inputValidationRules: {
                email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                name: /^[a-zA-Z\s]{2,50}$/,
                text: /^[\w\s\p{P}\p{S}]{1,5000}$/u,
                language: /^[a-z]{2,3}(_[a-z]{4})?$/,
                url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
                phone: /^\+?[\d\s\-\(\)]{10,15}$/
            }
        };

        this.initializeSecurityMonitoring();
    }

    private initializeSecurityMonitoring(): void {
        if (typeof window === 'undefined') return;

        // Monitor for suspicious network requests
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const [, config] = args;

            // Rate limiting check
            if (!this.checkRateLimit('fetch')) {
                reportSecurityEvent('rate_limit_exceeded', 'high', 'API rate limit exceeded');
                throw new Error('Rate limit exceeded. Please wait before making more requests.');
            }

            // CSRF protection for state-changing requests
            if (
                config &&
                (config.method === 'POST' || config.method === 'PUT' || config.method === 'DELETE') &&
                !this.validateCsrfToken()
            ) {
                reportSecurityEvent('csrf_violation', 'critical', 'CSRF token validation failed');
                throw new Error('Security validation failed. Please refresh the page.');
            }

            try {
                const response = await originalFetch(...args);

                // Monitor for unusual response patterns
                if (response.status === 429) {
                    reportSecurityEvent('rate_limit_response', 'medium', 'Received 429 Too Many Requests');
                } else if (response.status >= 400 && response.status < 500) reportSecurityEvent('client_error', 'low', `Client error: ${response.status}`);

                return response;
            } catch (error) {
                reportSecurityEvent('network_error', 'medium', `Network request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                throw error;
            }
        };

        // Monitor for suspicious form submissions
        document.addEventListener('submit', (e: Event) => {
            const form = e.target as HTMLFormElement;
            if (!this.validateFormSubmission(form)) {
                e.preventDefault();
                reportSecurityEvent('invalid_form_submission', 'high', 'Form submission failed validation');
                alert('Form validation failed. Please check your input.');
            }
        });

        // Monitor for suspicious DOM manipulation
        const observer = new MutationObserver((mutations: MutationRecord[]) => {
            let suspiciousChanges = 0;
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node as Element;
                        if (element.tagName === 'SCRIPT' || element.tagName === 'IFRAME') {
                            suspiciousChanges++;
                        }
                    }
                });
            });

            if (suspiciousChanges > 0) {
                reportSecurityEvent('dom_manipulation', 'high', `${suspiciousChanges} suspicious DOM changes detected`);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Monitor for clipboard access
        document.addEventListener('paste', (e: ClipboardEvent) => {
            const { clipboardData } = e;
            if (clipboardData) {
                const text = clipboardData.getData('text');
                if (text && text?.length > 10000) reportSecurityEvent('large_clipboard_paste', 'medium', 'Large clipboard content detected');
            }
        });
    }

    public checkRateLimit(identifier: string): boolean {
        const now = Date.now();
        const key = `${identifier}_${Math.floor(now / this.config.rateLimitWindow)}`;
        const entry = this.rateLimitMap.get(key);

        if (!entry || now > entry.resetTime) {
            this.rateLimitMap.set(key, {
                count: 1,
                resetTime: now + this.config.rateLimitWindow
            });
            return true;
        }

        if (entry.count >= this.config.maxRequests) {
            return false;
        }

        entry.count++;
        return true;
    }

    private generateCsrfToken(): string {
        const array = new Uint8Array(this.config.csrfTokenLength);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    private validateCsrfToken(): boolean {
        // For static sites, we'll use a simpler approach
        // In a real application, this would validate against server-generated tokens
        const token = sessionStorage.getItem('csrf_token');
        return token !== null && token.length === this.config.csrfTokenLength * 2;
    }

    private validateFormSubmission(form: HTMLFormElement): boolean {
        const inputs = form.querySelectorAll('input, textarea, select');
        let isValid = true;

        inputs.forEach((input) => {
            const element = input as HTMLInputElement;
            const { value } = element;
            const name = element.name ?? element.id;

            if (name && value && !this.validateInput(name, value)) {
                if (!this.validateInput(name, value)) {
                    isValid = false;
                    element.classList.add('border-red-500');
                } else {
                    element.classList.remove('border-red-500');
                }
            }
        });

        return isValid;
    }

    public validateInput(fieldName: string, value: string): boolean {
        const rule = this.config.inputValidationRules[fieldName];
        if (!rule) return true; // No specific rule for this field

        return rule.test(value);
    }

    // Public methods for external use
    public getCsrfToken(): string {
        const token = sessionStorage.getItem('csrf_token') ?? this.generateCsrfToken();
        sessionStorage.setItem('csrf_token', token);
        return token ?? '';
    }

    public sanitizeInput(input: string): string {
        // Remove potentially dangerous characters and patterns
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/data:text\/html/gi, '')
            .replace(/vbscript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .slice(0, 10000); // Limit length
    }

    public validateFileUpload(file: File): boolean {
        // Validate file type and size
        const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/m4a', 'text/plain', 'application/json'];
        const maxSize = 50 * 1024 * 1024; // 50MB

        if (!allowedTypes.includes(file.type)) {
            reportSecurityEvent('invalid_file_type', 'medium', `Invalid file type: ${file.type}`);
            return false;
        }

        if (file.size > maxSize) {
            reportSecurityEvent('file_too_large', 'medium', `File too large: ${file.size} bytes`);
            return false;
        }

        return true;
    }
}

// Create singleton instance
export const securityMiddleware = new SecurityMiddleware();

// Export utility functions
export const getCsrfToken = () => securityMiddleware.getCsrfToken();
export const validateInput = (fieldName: string, value: string) => securityMiddleware.validateInput(fieldName, value);
export const checkRateLimit = (identifier: string) => securityMiddleware.checkRateLimit(identifier);
export const sanitizeInput = (input: string) => securityMiddleware.sanitizeInput(input);
export const validateFileUpload = (file: File) => securityMiddleware.validateFileUpload(file);

export default securityMiddleware;
