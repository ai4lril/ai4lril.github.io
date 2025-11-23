import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../../src/logger/logger.service';

describe('LoggerService Security', () => {
    let loggerService: LoggerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [LoggerService],
        }).compile();

        loggerService = module.get<LoggerService>(LoggerService);
    });

    describe('maskSensitiveData', () => {
        it('should mask email addresses correctly', () => {
            expect(loggerService.maskSensitiveData('user@example.com', 'email')).toBe('us****@****.com');
            expect(loggerService.maskSensitiveData('test.email@domain.co.uk', 'email')).toBe('te****@****.co.uk');
        });

        it('should mask phone numbers correctly', () => {
            expect(loggerService.maskSensitiveData('+1234567890', 'phone')).toBe('+1234****90');
            expect(loggerService.maskSensitiveData('123-456-7890', 'phone')).toBe('123-4****890');
        });

        it('should mask user IDs correctly', () => {
            expect(loggerService.maskSensitiveData('user123456789', 'userId')).toBe('user12****6789');
            expect(loggerService.maskSensitiveData('short', 'userId')).toBe('****');
        });

        it('should mask passwords completely', () => {
            expect(loggerService.maskSensitiveData('mypassword123', 'password')).toBe('********');
            expect(loggerService.maskSensitiveData('', 'password')).toBe('********');
        });

        it('should mask credit card numbers correctly', () => {
            expect(loggerService.maskSensitiveData('1234567890123456', 'creditCard')).toBe('****3456');
            expect(loggerService.maskSensitiveData('123456789', 'creditCard')).toBe('****6789');
        });

        it('should mask age data completely', () => {
            expect(loggerService.maskSensitiveData('25', 'age')).toBe('[REDACTED]');
            expect(loggerService.maskSensitiveData('30 years old', 'age')).toBe('[REDACTED]');
        });

        it('should mask SSN correctly', () => {
            expect(loggerService.maskSensitiveData('123-45-6789', 'ssn')).toBe('****6789');
            expect(loggerService.maskSensitiveData('123456789', 'ssn')).toBe('****6789');
        });

        it('should handle empty or invalid data', () => {
            expect(loggerService.maskSensitiveData('', 'email')).toBe('');
            expect(loggerService.maskSensitiveData(null as any, 'email')).toBe(null);
            expect(loggerService.maskSensitiveData(undefined as any, 'email')).toBe(undefined);
        });
    });
});

describe('Security Compliance Tests', () => {
    let loggerService: LoggerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [LoggerService],
        }).compile();

        loggerService = module.get<LoggerService>(LoggerService);
    });

    describe('GDPR Compliance', () => {
        it('should log GDPR-compliant data access', () => {
            const logSpy = jest.spyOn(loggerService, 'gdpr');

            loggerService.gdpr('User data accessed for legitimate purpose', {
                userId: 'user123',
                purpose: 'service_provision',
                legalBasis: 'contract'
            });

            expect(logSpy).toHaveBeenCalledWith(
                'User data accessed for legitimate purpose',
                expect.objectContaining({
                    userId: 'user123',
                    purpose: 'service_provision',
                    legalBasis: 'contract'
                })
            );
        });

        it('should log data access with proper masking', () => {
            const logSpy = jest.spyOn(loggerService, 'dataAccess');

            loggerService.dataAccess('Data export requested', {
                userId: 'sensitiveUser123',
                dataTypes: ['personal_info', 'contact_details'],
                purpose: 'data_portability'
            });

            expect(logSpy).toHaveBeenCalledWith(
                'Data export requested',
                expect.objectContaining({
                    userId: 'sensitiveUser123',
                    dataTypes: ['personal_info', 'contact_details'],
                    purpose: 'data_portability'
                })
            );
        });
    });

    describe('Security Event Logging', () => {
        it('should log security events appropriately', () => {
            const securitySpy = jest.spyOn(loggerService, 'security');

            loggerService.security('Failed login attempt', {
                ipAddress: '192.168.1.100',
                userAgent: 'Mozilla/5.0...',
                attemptedUsername: 'admin',
                failureReason: 'invalid_password'
            });

            expect(securitySpy).toHaveBeenCalledWith(
                'Failed login attempt',
                expect.objectContaining({
                    ipAddress: '192.168.1.100',
                    attemptedUsername: 'admin',
                    failureReason: 'invalid_password'
                })
            );
        });

        it('should log sensitive data processing', () => {
            const sensitiveSpy = jest.spyOn(loggerService, 'logSensitiveData');

            loggerService.logSensitiveData(
                'Processing user demographic data',
                ['age', 'location', 'ethnicity'],
                {
                    operation: 'analytics',
                    retentionPeriod: '2_years'
                }
            );

            expect(sensitiveSpy).toHaveBeenCalledWith(
                'Processing user demographic data',
                ['age', 'location', 'ethnicity'],
                expect.objectContaining({
                    operation: 'analytics',
                    retentionPeriod: '2_years'
                })
            );
        });
    });

    describe('Input Validation and Sanitization', () => {
        it('should detect and log potential SQL injection attempts', () => {
            const securitySpy = jest.spyOn(loggerService, 'security');

            // Simulate suspicious input
            const suspiciousInput = "'; DROP TABLE users; --";

            loggerService.security('Potential SQL injection detected', {
                input: suspiciousInput,
                pattern: 'sql_injection',
                severity: 'high'
            });

            expect(securitySpy).toHaveBeenCalledWith(
                'Potential SQL injection detected',
                expect.objectContaining({
                    input: suspiciousInput,
                    pattern: 'sql_injection',
                    severity: 'high'
                })
            );
        });

        it('should detect and log XSS attempts', () => {
            const securitySpy = jest.spyOn(loggerService, 'security');

            const xssAttempt = '<script>alert("XSS")</script>';

            loggerService.security('Potential XSS attempt detected', {
                input: xssAttempt,
                pattern: 'xss',
                severity: 'high',
                context: 'user_input'
            });

            expect(securitySpy).toHaveBeenCalledWith(
                'Potential XSS attempt detected',
                expect.objectContaining({
                    pattern: 'xss',
                    severity: 'high'
                })
            );
        });
    });
});

describe('Data Privacy Tests', () => {
    let loggerService: LoggerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [LoggerService],
        }).compile();

        loggerService = module.get<LoggerService>(LoggerService);
    });

    describe('PII Data Handling', () => {
        it('should properly mask PII in logs', () => {
            const testCases = [
                { input: 'john.doe@example.com', type: 'email', expected: 'jo****@****.com' },
                { input: '+1-555-123-4567', type: 'phone', expected: '+1-5****567' },
                { input: 'user123456789', type: 'userId', expected: 'user12****6789' },
                { input: '123-45-6789', type: 'ssn', expected: '****6789' },
                { input: '4111111111111111', type: 'creditCard', expected: '****1111' },
                { input: '25', type: 'age', expected: '[REDACTED]' }
            ];

            testCases.forEach(({ input, type, expected }) => {
                const result = loggerService.maskSensitiveData(input, type);
                expect(result).toBe(expected);
            });
        });

        it('should handle edge cases in PII masking', () => {
            expect(loggerService.maskSensitiveData('', 'email')).toBe('');
            expect(loggerService.maskSensitiveData('a@b.c', 'email')).toBe('****@****');
            expect(loggerService.maskSensitiveData('123', 'phone')).toBe('****23');
            expect(loggerService.maskSensitiveData('ab', 'userId')).toBe('****');
        });
    });

    describe('Audit Trail', () => {
        it('should maintain audit trail for data access', () => {
            const dataAccessSpy = jest.spyOn(loggerService, 'dataAccess');

            loggerService.dataAccess('User profile accessed', {
                userId: 'user123',
                accessorId: 'admin456',
                resource: 'user_profile',
                action: 'READ',
                ipAddress: '192.168.1.100'
            });

            expect(dataAccessSpy).toHaveBeenCalledWith(
                'User profile accessed',
                expect.objectContaining({
                    userId: 'user123',
                    accessorId: 'admin456',
                    resource: 'user_profile',
                    action: 'READ'
                })
            );
        });

        it('should log consent management activities', () => {
            const gdprSpy = jest.spyOn(loggerService, 'gdpr');

            loggerService.gdpr('User consent granted', {
                userId: 'user123',
                consentType: 'data_processing',
                consentGiven: true,
                consentDate: new Date().toISOString(),
                ipAddress: '192.168.1.100'
            });

            expect(gdprSpy).toHaveBeenCalledWith(
                'User consent granted',
                expect.objectContaining({
                    userId: 'user123',
                    consentType: 'data_processing',
                    consentGiven: true
                })
            );
        });
    });
});
