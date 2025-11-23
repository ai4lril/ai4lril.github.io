// Frontend Logging System
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    SECURITY = 4
}

export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    category: string;
    userId?: string;
    sessionId?: string;
    userAgent?: string;
    url?: string;
    metadata?: Record<string, any>;
    compliance?: 'GDPR' | 'CCPA' | 'HIPAA';
}

class FrontendLogger {
    private logLevel: LogLevel = LogLevel.INFO;
    private sessionId: string;
    private userId?: string;
    private logs: LogEntry[] = [];
    private maxLogsInMemory = 100;

    constructor() {
        this.sessionId = this.generateSessionId();
        this.initializeLogger();

        // Set log level from environment
        if (process.env.NODE_ENV === 'development') {
            this.logLevel = LogLevel.DEBUG;
        }
    }

    private initializeLogger() {
        // Listen for unhandled errors
        window.addEventListener('error', (event: ErrorEvent) => {
            this.error('Unhandled JavaScript Error', undefined, {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            });
        });

        // Listen for unhandled promise rejections
        window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
            this.error('Unhandled Promise Rejection', undefined, {
                reason: event.reason,
                promise: event.promise
            });
        });

        // Log page visibility changes
        document.addEventListener('visibilitychange', () => {
            this.info('Page Visibility Changed', {
                hidden: document.hidden,
                visibilityState: document.visibilityState
            });
        });
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    setUserId(userId: string) {
        this.userId = userId;
        this.info('User authenticated', { userId: this.maskSensitiveData(userId, 'userId') });
    }

    private createLogEntry(level: LogLevel, message: string, category: string, metadata?: Record<string, any>): LogEntry {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            category,
            userId: this.userId ? this.maskSensitiveData(this.userId, 'userId') : undefined,
            sessionId: this.sessionId,
            userAgent: navigator.userAgent,
            url: window.location.href,
            metadata
        };
    }

    private shouldLog(level: LogLevel): boolean {
        return level >= this.logLevel;
    }

    private logToConsole(entry: LogEntry) {
        const levelColors = {
            [LogLevel.DEBUG]: '#9CA3AF',
            [LogLevel.INFO]: '#3B82F6',
            [LogLevel.WARN]: '#F59E0B',
            [LogLevel.ERROR]: '#EF4444',
            [LogLevel.SECURITY]: '#DC2626'
        };

        const levelNames = {
            [LogLevel.DEBUG]: 'DEBUG',
            [LogLevel.INFO]: 'INFO',
            [LogLevel.WARN]: 'WARN',
            [LogLevel.ERROR]: 'ERROR',
            [LogLevel.SECURITY]: 'SECURITY'
        };

        console.log(
            `%c[${entry.timestamp}] %c${levelNames[entry.level]} %c[${entry.category}] %c${entry.message}`,
            'color: #6B7280',
            `color: ${levelColors[entry.level]}`,
            'color: #7C3AED',
            'color: inherit',
            entry.metadata || {}
        );
    }

    private async sendToBackend(entry: LogEntry) {
        try {
            // Only send important logs to backend
            if (entry.level >= LogLevel.WARN || entry.compliance) {
                await fetch('/api/logs', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(entry),
                    // Don't block the main thread
                    keepalive: true
                });
            }
        } catch (error) {
            // Don't log errors from logging to avoid infinite loops
            console.error('Failed to send log to backend:', error);
        }
    }

    private storeLog(entry: LogEntry) {
        this.logs.push(entry);
        if (this.logs.length > this.maxLogsInMemory) {
            this.logs.shift();
        }

        // Store in localStorage for debugging (only in development)
        if (process.env.NODE_ENV === 'development') {
            try {
                localStorage.setItem('voice_data_logs', JSON.stringify(this.logs.slice(-20)));
            } catch (error) {
                // Ignore localStorage errors
            }
        }
    }

    private log(level: LogLevel, message: string, category: string, metadata?: Record<string, any>) {
        if (!this.shouldLog(level)) return;

        const entry = this.createLogEntry(level, message, category, metadata);

        // Log to console
        this.logToConsole(entry);

        // Store in memory
        this.storeLog(entry);

        // Send to backend if important
        this.sendToBackend(entry);
    }

    // Public logging methods
    debug(message: string, metadata?: Record<string, any>) {
        this.log(LogLevel.DEBUG, message, 'DEBUG', metadata);
    }

    info(message: string, metadata?: Record<string, any>) {
        this.log(LogLevel.INFO, message, 'INFO', metadata);
    }

    warn(message: string, metadata?: Record<string, any>) {
        this.log(LogLevel.WARN, message, 'WARN', metadata);
    }

    error(message: string, error?: Error, metadata?: Record<string, any>) {
        const errorMetadata = {
            ...metadata,
            error: error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : undefined
        };
        this.log(LogLevel.ERROR, message, 'ERROR', errorMetadata);
    }

    security(message: string, metadata?: Record<string, any>) {
        const securityMetadata = { ...metadata, compliance: 'GDPR' as const };
        this.log(LogLevel.SECURITY, message, 'SECURITY', securityMetadata);
    }

    // User interaction logging
    userAction(action: string, element?: string, metadata?: Record<string, any>) {
        this.log(LogLevel.INFO, `User Action: ${action}`, 'USER_INTERACTION', {
            ...metadata,
            action,
            element,
            timestamp: Date.now()
        });
    }

    // API call logging
    apiCall(method: string, url: string, status?: number, duration?: number, metadata?: Record<string, any>) {
        this.log(LogLevel.INFO, `API Call: ${method} ${url}`, 'API', {
            ...metadata,
            method,
            url,
            status,
            duration
        });
    }

    // Performance logging
    performance(metric: string, value: number, metadata?: Record<string, any>) {
        this.log(LogLevel.INFO, `Performance: ${metric}`, 'PERFORMANCE', {
            ...metadata,
            metric,
            value,
            unit: 'ms'
        });
    }

    // Sensitive data processing logging
    sensitiveData(action: string, dataTypes: string[], metadata?: Record<string, any>) {
        this.log(LogLevel.SECURITY, `Sensitive Data: ${action}`, 'SENSITIVE_DATA', {
            ...metadata,
            action,
            dataTypes,
            compliance: 'GDPR'
        });
    }

    // Form interaction logging (with sensitive data masking)
    formInteraction(formId: string, action: string, fields?: Record<string, any>, metadata?: Record<string, any>) {
        const maskedFields = fields ? this.maskFormData(fields) : undefined;

        this.log(LogLevel.INFO, `Form ${action}: ${formId}`, 'FORM_INTERACTION', {
            ...metadata,
            formId,
            action,
            fields: maskedFields
        });
    }

    // Mask sensitive form data
    private maskFormData(fields: Record<string, any>): Record<string, any> {
        const masked = { ...fields };
        const sensitiveFields = ['password', 'email', 'phone', 'age', 'ssn', 'creditCard'];

        for (const field of sensitiveFields) {
            if (masked[field]) {
                masked[field] = this.maskSensitiveData(masked[field], field);
            }
        }

        return masked;
    }

    // Sensitive data masking
    public maskSensitiveData(data: string, type: string): string {
        if (!data || typeof data !== 'string') return data;

        switch (type) {
            case 'password':
                return '********';
            case 'email':
                const atIndex = data.indexOf('@');
                if (atIndex > 0) {
                    return data.substring(0, 2) + '****' + data.substring(atIndex);
                }
                return '****@****';
            case 'phone':
                return data.length > 4 ? data.substring(0, 2) + '****' + data.substring(data.length - 2) : '****';
            case 'age':
                return '[REDACTED]';
            case 'ssn':
            case 'creditCard':
                return data.length > 4 ? '****' + data.substring(data.length - 4) : '****';
            default:
                return data.length > 4 ? data.substring(0, 2) + '****' : '****';
        }
    }

    // Get recent logs (for debugging)
    getRecentLogs(count: number = 10): LogEntry[] {
        return this.logs.slice(-count);
    }

    // Export logs for debugging
    exportLogs(): string {
        return JSON.stringify(this.logs, null, 2);
    }

    // Clear logs
    clearLogs() {
        this.logs = [];
    }
}

// Create singleton instance
export const logger = new FrontendLogger();

// Export for use in components
export default logger;
