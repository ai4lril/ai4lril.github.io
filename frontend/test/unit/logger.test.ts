import { logger } from '../../lib/logger';

// Mock console methods
const mockConsole = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    group: jest.fn(),
    groupEnd: jest.fn()
};

global.console = { ...global.console, ...mockConsole };

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock performance
global.performance = {
    ...global.performance,
    now: jest.fn(() => 1000)
};

describe('Frontend Logger', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        logger.clearLogs();
    });

    describe('Basic Logging', () => {
        it('should log debug messages', () => {
            logger.debug('Debug message', { test: 'data' });

            expect(mockConsole.log).toHaveBeenCalledWith(
                expect.stringContaining('[DEBUG]'),
                expect.stringContaining('Debug message')
            );
        });

        it('should log info messages', () => {
            logger.info('Info message', { userId: '123' });

            expect(mockConsole.log).toHaveBeenCalledWith(
                expect.stringContaining('[INFO]'),
                expect.stringContaining('Info message')
            );
        });

        it('should log warning messages', () => {
            logger.warn('Warning message', { severity: 'medium' });

            expect(mockConsole.log).toHaveBeenCalledWith(
                expect.stringContaining('[WARN]'),
                expect.stringContaining('Warning message')
            );
        });

        it('should log error messages with error details', () => {
            const testError = new Error('Test error');
            logger.error('Error occurred', testError, { context: 'test' });

            expect(mockConsole.log).toHaveBeenCalledWith(
                expect.stringContaining('[ERROR]'),
                expect.stringContaining('Error occurred')
            );
        });
    });

    describe('Security Logging', () => {
        it('should log security events', () => {
            logger.security('Security breach attempt', {
                ipAddress: '192.168.1.100',
                userAgent: 'suspicious-agent'
            });

            expect(mockConsole.log).toHaveBeenCalledWith(
                expect.stringContaining('[SECURITY]'),
                expect.stringContaining('Security breach attempt')
            );
        });

        it('should log sensitive data processing', () => {
            logger.sensitiveData('Processing user data', ['email', 'phone'], {
                operation: 'export',
                userId: 'user123'
            });

            expect(mockConsole.log).toHaveBeenCalledWith(
                expect.stringContaining('[SENSITIVE_DATA]'),
                expect.stringContaining('Processing user data')
            );
        });
    });

    describe('User Activity Logging', () => {
        it('should log user actions', () => {
            logger.userAction('button_click', 'submit-btn', {
                page: '/sentiment',
                timestamp: Date.now()
            });

            expect(mockConsole.log).toHaveBeenCalledWith(
                expect.stringContaining('[USER_INTERACTION]'),
                expect.stringContaining('User Action: button_click')
            );
        });

        it('should log form interactions with sensitive data masking', () => {
            logger.formInteraction('login-form', 'submit', {
                username: 'testuser',
                password: 'secret123',
                email: 'user@example.com'
            });

            expect(mockConsole.log).toHaveBeenCalledWith(
                expect.stringContaining('[FORM_INTERACTION]'),
                expect.any(String),
                expect.objectContaining({
                    formId: 'login-form',
                    action: 'submit',
                    fields: expect.objectContaining({
                        username: 'testuser',
                        password: '********',
                        email: 'us****@****.com'
                    })
                })
            );
        });
    });

    describe('API Call Logging', () => {
        it('should log API calls with performance metrics', () => {
            logger.apiCall('POST', '/api/sentiment', 200, 150, {
                requestSize: 256,
                responseSize: 512
            });

            expect(mockConsole.log).toHaveBeenCalledWith(
                expect.stringContaining('[API]'),
                expect.stringContaining('API Call: POST /api/sentiment')
            );
        });

        it('should log failed API calls', () => {
            logger.apiCall('GET', '/api/data', 404, 50, {
                error: 'Not found'
            });

            expect(mockConsole.log).toHaveBeenCalledWith(
                expect.stringContaining('[API]'),
                expect.stringContaining('API Call: GET /api/data')
            );
        });
    });

    describe('Performance Logging', () => {
        it('should log performance metrics', () => {
            logger.performance('page_load', 1250, {
                page: '/sentiment',
                resources: 15
            });

            expect(mockConsole.log).toHaveBeenCalledWith(
                expect.stringContaining('[PERFORMANCE]'),
                expect.stringContaining('Performance: page_load')
            );
        });

        it('should handle different metric types', () => {
            logger.performance('api_response', 450, { endpoint: '/api/ner' });
            logger.performance('render_time', 89, { component: 'SentimentForm' });
            logger.performance('cache_hit', 5, { key: 'sentiment_cache' });

            expect(mockConsole.log).toHaveBeenCalledTimes(3);
        });
    });

    describe('Data Masking', () => {
        it('should mask email addresses', () => {
            expect(logger.maskSensitiveData('user@example.com', 'email')).toBe('us****@****.com');
            expect(logger.maskSensitiveData('test.email@domain.co.uk', 'email')).toBe('te****@****.co.uk');
        });

        it('should mask passwords', () => {
            expect(logger.maskSensitiveData('mypassword123', 'password')).toBe('********');
            expect(logger.maskSensitiveData('', 'password')).toBe('********');
        });

        it('should mask phone numbers', () => {
            expect(logger.maskSensitiveData('+1234567890', 'phone')).toBe('+12****7890');
            expect(logger.maskSensitiveData('123-456-7890', 'phone')).toBe('12****7890');
        });

        it('should mask user IDs', () => {
            expect(logger.maskSensitiveData('user123456789', 'userId')).toBe('user12****6789');
            expect(logger.maskSensitiveData('short', 'userId')).toBe('****');
        });

        it('should mask credit card numbers', () => {
            expect(logger.maskSensitiveData('4111111111111111', 'creditCard')).toBe('****1111');
        });

        it('should mask age data', () => {
            expect(logger.maskSensitiveData('25', 'age')).toBe('[REDACTED]');
        });

        it('should handle invalid inputs', () => {
            expect(logger.maskSensitiveData('', 'email')).toBe('');
            expect(logger.maskSensitiveData(null as any, 'email')).toBe(null);
            expect(logger.maskSensitiveData(undefined as any, 'email')).toBe(undefined);
        });
    });

    describe('Log Management', () => {
        it('should store logs in memory', () => {
            logger.info('Test log 1');
            logger.warn('Test log 2');
            logger.error('Test log 3');

            const logs = logger.getRecentLogs();
            expect(logs).toHaveLength(3);
            expect(logs[0].message).toBe('Test log 1');
            expect(logs[1].message).toBe('Test log 2');
            expect(logs[2].message).toBe('Test log 3');
        });

        it('should limit logs in memory', () => {
            // Add more than the default limit (100)
            for (let i = 0; i < 105; i++) {
                logger.info(`Log message ${i}`);
            }

            const logs = logger.getRecentLogs();
            expect(logs.length).toBeLessThanOrEqual(100);
        });

        it('should clear logs', () => {
            logger.info('Test log');
            expect(logger.getRecentLogs()).toHaveLength(1);

            logger.clearLogs();
            expect(logger.getRecentLogs()).toHaveLength(0);
        });

        it('should export logs as JSON', () => {
            logger.info('Export test');
            const exportData = logger.exportLogs();

            expect(typeof exportData).toBe('string');
            expect(() => JSON.parse(exportData)).not.toThrow();
        });
    });

    describe('Session Management', () => {
        it('should set user ID', () => {
            logger.setUserId('testUser123');

            expect(mockConsole.log).toHaveBeenCalledWith(
                expect.stringContaining('[INFO]'),
                expect.stringContaining('User authenticated')
            );
        });

        it('should include user ID in logs after setting', () => {
            logger.setUserId('testUser123');
            logger.info('Test message');

            const logs = logger.getRecentLogs();
            expect(logs[logs.length - 1].userId).toBe('testU****23');
        });
    });

    describe('Error Handling', () => {
        it('should handle unhandled errors', () => {
            const errorEvent = new ErrorEvent('error', {
                message: 'Test error',
                filename: 'test.js',
                lineno: 42,
                colno: 10,
                error: new Error('Original error')
            });

            // Simulate unhandled error
            window.dispatchEvent(errorEvent);

            expect(mockConsole.log).toHaveBeenCalledWith(
                expect.stringContaining('[ERROR]'),
                expect.stringContaining('Unhandled JavaScript Error')
            );
        });

        it('should handle unhandled promise rejections', () => {
            const rejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
                reason: 'Promise rejection test',
                promise: Promise.reject('test')
            });

            window.dispatchEvent(rejectionEvent);

            expect(mockConsole.log).toHaveBeenCalledWith(
                expect.stringContaining('[ERROR]'),
                expect.stringContaining('Unhandled Promise Rejection')
            );
        });
    });

    describe('Privacy Compliance', () => {
        it('should not log sensitive data in plain text', () => {
            logger.formInteraction('registration-form', 'submit', {
                email: 'user@example.com',
                password: 'secret123',
                age: '25',
                phone: '+1234567890'
            });

            const logs = logger.getRecentLogs();
            const formLog = logs.find(log => log.category === 'FORM_INTERACTION');

            expect(formLog?.metadata?.fields?.email).toBe('us****@****.com');
            expect(formLog?.metadata?.fields?.password).toBe('********');
            expect(formLog?.metadata?.fields?.age).toBe('[REDACTED]');
            expect(formLog?.metadata?.fields?.phone).toBe('+12****7890');
        });

        it('should mark security events appropriately', () => {
            logger.security('Suspicious activity detected');

            const logs = logger.getRecentLogs();
            const securityLog = logs.find(log => log.category === 'SECURITY');

            expect(securityLog?.compliance).toBe('GDPR');
            expect(securityLog?.level).toBe(4); // SECURITY level
        });
    });
});
