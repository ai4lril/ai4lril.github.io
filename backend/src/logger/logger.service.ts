import { Injectable } from '@nestjs/common';

@Injectable()
export class LoggerService {

    constructor() {
        // Simple console-based logger to avoid winston dependencies
    }

    // Simple logging methods
    info(message: string, meta?: any) {
        console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta) : '');
    }

    error(message: string, error?: Error, meta?: any) {
        console.error(`[ERROR] ${message}`, error?.message || '', meta ? JSON.stringify(meta) : '');
    }

    warn(message: string, meta?: any) {
        console.warn(`[WARN] ${message}`, meta ? JSON.stringify(meta) : '');
    }

    debug(message: string, meta?: any) {
        console.debug(`[DEBUG] ${message}`, meta ? JSON.stringify(meta) : '');
    }

    // Performance logging
    performance(operation: string, duration: number, meta?: any) {
        console.log(`[PERF] ${operation} took ${duration}ms`, meta ? JSON.stringify(meta) : '');
    }

    // Data access logging
    dataAccess(message: string, meta?: any) {
        console.log(`[DATA] ${message}`, meta ? JSON.stringify(meta) : '');
    }

    // Cache logging
    cache(operation: 'HIT' | 'MISS' | 'SET', key: string, isSensitive: boolean, meta?: any) {
        console.log(`[CACHE] ${operation} ${key}`, meta ? JSON.stringify(meta) : '');
    }

    // Database logging
    database(operation: string, table: string, duration?: number, meta?: any) {
        const durationStr = duration ? ` (${duration}ms)` : '';
        console.log(`[DB] ${operation} on ${table}${durationStr}`, meta ? JSON.stringify(meta) : '');
    }

    // Log sensitive data processing
    logSensitiveData(message: string, sensitiveFields: string[], meta?: any) {
        console.warn(`[SENSITIVE] ${message}`, { sensitiveFields, ...meta });
    }

    // Mask sensitive data
    maskSensitiveData(value: string, fieldName: string): string {
        if (!value) return value;

        switch (fieldName) {
            case 'userId':
                return value.length > 4 ? value.substring(0, 4) + '****' : '****';
            case 'email':
                const atIndex = value.indexOf('@');
                if (atIndex > 0) {
                    return value.substring(0, 2) + '****' + value.substring(atIndex);
                }
                return '****@****';
            case 'name':
                return value.length > 2 ? value.substring(0, 1) + '****' : '****';
            case 'phone':
                return value.length > 4 ? value.substring(0, 2) + '****' + value.substring(value.length - 2) : '****';
            default:
                return value.length > 4 ? value.substring(0, 2) + '****' : '****';
        }
    }

    // User activity logging
    userActivity(userId: string, action: string, resource: string, meta?: any) {
        console.log(`[USER_ACTIVITY] ${action} on ${resource}`, {
            userId: this.maskSensitiveData(userId, 'userId'),
            action,
            resource,
            ...meta
        });
    }

    // Security logging method
    security(message: string, meta?: any) {
        console.log(`[SECURITY] ${message}`, meta ? JSON.stringify(meta) : '');
    }

    // GDPR compliance logging
    gdpr(message: string, meta?: any) {
        console.log(`[GDPR] ${message}`, meta ? JSON.stringify(meta) : '');
    }
}
