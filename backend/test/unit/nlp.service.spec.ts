import { Test, TestingModule } from '@nestjs/testing';
import { NlpService } from '../../src/nlp/nlp.service';
import { CacheService } from '../../src/cache/cache.service';
import { LoggerService } from '../../src/logger/logger.service';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('NlpService', () => {
    let service: NlpService;
    let cacheService: CacheService;
    let loggerService: LoggerService;
    let prismaService: PrismaService;

    const mockCacheService = {
        generateCacheKey: jest.fn(),
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        exists: jest.fn()
    };

    const mockLoggerService = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        dataAccess: jest.fn(),
        performance: jest.fn(),
        cache: jest.fn(),
        security: jest.fn(),
        userActivity: jest.fn(),
        apiRequest: jest.fn(),
        database: jest.fn(),
        maskSensitiveData: jest.fn((data: string) => `masked_${data}`)
    };

    const mockPrismaService = {
        sentence: {
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        },
        nerAnnotation: {
            create: jest.fn(),
            findMany: jest.fn()
        },
        translationMapping: {
            create: jest.fn()
        }
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NlpService,
                {
                    provide: CacheService,
                    useValue: mockCacheService
                },
                {
                    provide: LoggerService,
                    useValue: mockLoggerService
                },
                {
                    provide: PrismaService,
                    useValue: mockPrismaService
                }
            ],
        }).compile();

        service = module.get<NlpService>(NlpService);
        cacheService = module.get<CacheService>(CacheService);
        loggerService = module.get<LoggerService>(LoggerService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('analyzeSentiment', () => {
        const testText = 'I love this amazing project!';
        const cacheKey = 'sentiment_text_I_love_this_amazing_project_';

        beforeEach(() => {
            mockCacheService.generateCacheKey.mockReturnValue(cacheKey);
        });

        it('should return cached sentiment if available', async () => {
            const cachedResult = {
                text: testText,
                sentiment: 'positive',
                confidence: 0.95,
                processed_at: '2024-01-01T00:00:00.000Z'
            };

            mockCacheService.get.mockResolvedValue(cachedResult);
            mockCacheService.set.mockResolvedValue(undefined);

            const result = await service.analyzeSentiment(testText);

            expect(result).toEqual(cachedResult);
            expect(mockCacheService.get).toHaveBeenCalledWith(cacheKey);
            expect(mockCacheService.set).not.toHaveBeenCalled();
            expect(mockLoggerService.cache).toHaveBeenCalledWith('HIT', cacheKey, true, expect.any(Object));
        });

        it('should analyze sentiment and cache result if not cached', async () => {
            mockCacheService.get.mockResolvedValue(null);
            mockCacheService.set.mockResolvedValue(undefined);

            const result = await service.analyzeSentiment(testText);

            expect(result).toHaveProperty('text', testText);
            expect(result).toHaveProperty('sentiment');
            expect(result).toHaveProperty('confidence');
            expect(result).toHaveProperty('processed_at');

            expect(mockCacheService.get).toHaveBeenCalledWith(cacheKey);
            expect(mockCacheService.set).toHaveBeenCalledWith(cacheKey, expect.any(Object), 1800);
            expect(mockLoggerService.cache).toHaveBeenCalledWith('SET', cacheKey, false, expect.any(Object));
        });

        it('should log sensitive data processing', async () => {
            const sensitiveText = 'I am 25 years old and live in New York';
            mockCacheService.get.mockResolvedValue(null);
            mockCacheService.set.mockResolvedValue(undefined);

            await service.analyzeSentiment(sensitiveText);

            expect(mockLoggerService.logSensitiveData).toHaveBeenCalledWith(
                'Sentiment analysis on potentially sensitive text',
                ['personal_info'],
                expect.objectContaining({
                    textSnippet: expect.any(String),
                    userId: undefined
                })
            );
        });

        it('should handle errors gracefully', async () => {
            mockCacheService.get.mockRejectedValue(new Error('Cache error'));

            await expect(service.analyzeSentiment(testText)).rejects.toThrow();
            expect(mockLoggerService.error).toHaveBeenCalled();
        });
    });

    describe('detectEmotion', () => {
        const testText = 'I am so happy today!';
        const cacheKey = 'emotion_text_I_am_so_happy_today_';

        beforeEach(() => {
            mockCacheService.generateCacheKey.mockReturnValue(cacheKey);
        });

        it('should detect emotion and cache result', async () => {
            mockCacheService.get.mockResolvedValue(null);
            mockCacheService.set.mockResolvedValue(undefined);

            const result = await service.detectEmotion(testText);

            expect(result).toHaveProperty('text', testText);
            expect(result).toHaveProperty('emotion');
            expect(result).toHaveProperty('confidence');
            expect(result).toHaveProperty('processed_at');

            expect(mockCacheService.set).toHaveBeenCalledWith(cacheKey, expect.any(Object), 1800);
        });

        it('should return cached emotion if available', async () => {
            const cachedResult = {
                text: testText,
                emotion: 'joy',
                confidence: 0.9,
                processed_at: '2024-01-01T00:00:00.000Z'
            };

            mockCacheService.get.mockResolvedValue(cachedResult);

            const result = await service.detectEmotion(testText);

            expect(result).toEqual(cachedResult);
            expect(mockLoggerService.cache).toHaveBeenCalledWith('HIT', cacheKey, true, expect.any(Object));
        });
    });

    describe('processNER', () => {
        const testText = 'John works at Google';
        const cacheKey = 'ner_text_John_works_at_Google_language_auto';

        beforeEach(() => {
            mockCacheService.generateCacheKey.mockReturnValue(cacheKey);
        });

        it('should process NER and cache result', async () => {
            mockCacheService.get.mockResolvedValue(null);
            mockCacheService.set.mockResolvedValue(undefined);

            const result = await service.processNER(testText);

            expect(result).toHaveProperty('text', testText);
            expect(result).toHaveProperty('entities');
            expect(result).toHaveProperty('processed_at');
            expect(Array.isArray(result.entities)).toBe(true);
        });

        it('should handle user annotations correctly', async () => {
            const annotations = [
                { text: 'John', label: 'PERSON', start: 0, end: 4 }
            ];

            const result = await service.processNER(testText, annotations, 'en', 'sentence123');

            expect(result).toHaveProperty('success', true);
            expect(result).toHaveProperty('message');
            expect(result).toHaveProperty('data');
            expect(mockCacheService.get).not.toHaveBeenCalled();
            expect(mockCacheService.set).not.toHaveBeenCalled();
        });
    });

    describe('processPOS', () => {
        const testText = 'The quick brown fox';
        const cacheKey = 'pos_text_The_quick_brown_fox';

        beforeEach(() => {
            mockCacheService.generateCacheKey.mockReturnValue(cacheKey);
        });

        it('should process POS tagging and cache result', async () => {
            mockCacheService.get.mockResolvedValue(null);
            mockCacheService.set.mockResolvedValue(undefined);

            const result = await service.processPOS(testText);

            expect(result).toHaveProperty('text', testText);
            expect(result).toHaveProperty('tokens');
            expect(result).toHaveProperty('processed_at');
            expect(Array.isArray(result.tokens)).toBe(true);
        });
    });

    describe('translate', () => {
        const testText = 'Hello world';
        const cacheKey = 'translate_text_Hello_world_source_auto_target_es';

        beforeEach(() => {
            mockCacheService.generateCacheKey.mockReturnValue(cacheKey);
        });

        it('should translate text and cache result', async () => {
            mockCacheService.get.mockResolvedValue(null);
            mockCacheService.set.mockResolvedValue(undefined);

            const result = await service.translate(testText, 'es', 'en');

            expect(result).toHaveProperty('original_text', testText);
            expect(result).toHaveProperty('translated_text');
            expect(result).toHaveProperty('target_language', 'es');
            expect(result).toHaveProperty('source_language', 'en');

            expect(mockCacheService.set).toHaveBeenCalledWith(cacheKey, expect.any(Object), 3600);
        });

        it('should return cached translation if available', async () => {
            const cachedResult = {
                original_text: testText,
                translated_text: 'Hola mundo',
                source_language: 'en',
                target_language: 'es',
                processed_at: '2024-01-01T00:00:00.000Z'
            };

            mockCacheService.get.mockResolvedValue(cachedResult);

            const result = await service.translate(testText, 'es', 'en');

            expect(result).toEqual(cachedResult);
            expect(mockLoggerService.cache).toHaveBeenCalledWith('HIT', cacheKey, true, expect.any(Object));
        });
    });

    describe('getNerSentences', () => {
        it('should retrieve and cache NER sentences', async () => {
            const mockSentences = [
                { id: '1', text: 'Sample sentence 1', languageCode: 'en', taskType: 'ner' },
                { id: '2', text: 'Sample sentence 2', languageCode: 'en', taskType: 'ner' }
            ];

            mockCacheService.generateCacheKey.mockReturnValue('ner_sentences_all');
            mockCacheService.get.mockResolvedValue(null);
            mockCacheService.set.mockResolvedValue(undefined);
            mockPrismaService.sentence.findMany.mockResolvedValue(mockSentences);

            const result = await service.getNerSentences();

            expect(result).toHaveLength(2);
            expect(mockPrismaService.sentence.findMany).toHaveBeenCalledWith({
                where: { isActive: true, taskType: 'ner' },
                orderBy: { createdAt: 'desc' }
            });
            expect(mockCacheService.set).toHaveBeenCalledWith('ner_sentences_all', expect.any(Array), 600);
        });

        it('should return cached sentences if available', async () => {
            const cachedSentences = [
                { id: '1', text: 'Cached sentence', languageCode: 'en', taskType: 'ner' }
            ];

            mockCacheService.generateCacheKey.mockReturnValue('ner_sentences_en');
            mockCacheService.get.mockResolvedValue(cachedSentences);

            const result = await service.getNerSentences('en');

            expect(result).toEqual(cachedSentences);
            expect(mockPrismaService.sentence.findMany).not.toHaveBeenCalled();
        });
    });

    describe('saveNerAnnotation', () => {
        const mockAnnotation = {
            id: 'annotation123',
            sentenceId: 'sentence123',
            userId: 'user123',
            annotations: [{ text: 'John', label: 'PERSON', start: 0, end: 4 }],
            languageCode: 'en'
        };

        it('should save NER annotation successfully', async () => {
            mockPrismaService.nerAnnotation.create.mockResolvedValue(mockAnnotation);

            const result = await service.saveNerAnnotation(
                mockAnnotation.sentenceId,
                mockAnnotation.annotations,
                mockAnnotation.languageCode,
                mockAnnotation.userId
            );

            expect(result).toHaveProperty('success', true);
            expect(result).toHaveProperty('annotationId', mockAnnotation.id);
            expect(mockPrismaService.nerAnnotation.create).toHaveBeenCalledWith({
                data: {
                    sentenceId: mockAnnotation.sentenceId,
                    userId: mockAnnotation.userId,
                    annotations: mockAnnotation.annotations,
                    languageCode: mockAnnotation.languageCode
                }
            });
        });

        it('should handle errors when saving annotation', async () => {
            mockPrismaService.nerAnnotation.create.mockRejectedValue(new Error('Database error'));

            await expect(service.saveNerAnnotation(
                mockAnnotation.sentenceId,
                mockAnnotation.annotations,
                mockAnnotation.languageCode
            )).rejects.toThrow('Failed to save NER annotation');

            expect(mockLoggerService.error).toHaveBeenCalled();
        });
    });
});
