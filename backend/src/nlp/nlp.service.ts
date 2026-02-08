import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { LoggerService } from '../logger/logger.service';
import { ProgressService } from '../progress/progress.service';
import { NLP_CONFIG } from './nlp.config';
import { sanitizeInput } from '../common/utils/sanitize';

/**
 * Service for NLP (Natural Language Processing) operations
 * Handles NER, POS tagging, translation, sentiment analysis, and emotion detection
 * Note: Currently uses placeholder implementations - requires actual NLP model integration
 */
@Injectable()
export class NlpService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
    private logger: LoggerService,
    private progress: ProgressService,
  ) {}

  /**
   * Get NER sentences from database with caching
   *
   * @param languageCode - Optional ISO 639-3 + ISO 15924 language code filter
   * @param page - Page number for pagination (default: 1)
   * @param limit - Number of sentences per page (default: 50)
   * @returns Array of sentence objects for NER tagging
   */
  async getNerSentences(
    languageCode?: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const startTime = Date.now();

    try {
      this.logger.dataAccess('Fetching NER sentences', {
        languageCode: languageCode || 'all',
        operation: 'READ',
        resource: 'sentences',
      });

      const cacheKey = this.cacheService.generateCacheKey('ner_sentences', {
        languageCode: languageCode || 'all',
      });

      // Check cache first
      const cachedSentences = await this.cacheService.get(cacheKey);
      if (cachedSentences) {
        this.logger.cache('HIT', cacheKey, true, {
          operation: 'ner_sentences',
        });
        this.logger.performance('getNerSentences', Date.now() - startTime, {
          cached: true,
        });
        return cachedSentences;
      }

      const whereClause = languageCode
        ? { languageCode, isActive: true, taskType: 'ner' }
        : { isActive: true, taskType: 'ner' };

      const skip = (page - 1) * limit;
      const dbStartTime = Date.now();
      const sentences = await this.prisma.sentence.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      });
      this.logger.database('SELECT', 'sentences', Date.now() - dbStartTime, {
        count: sentences.length,
        taskType: 'ner',
      });

      // Shuffle the results for variety
      const shuffledSentences = sentences.sort(() => Math.random() - 0.5);

      // Cache for 10 minutes
      await this.cacheService.set(cacheKey, shuffledSentences, 600);
      this.logger.cache('SET', cacheKey, false, {
        operation: 'ner_sentences',
        ttl: 600,
      });

      this.logger.performance('getNerSentences', Date.now() - startTime, {
        cached: false,
        count: shuffledSentences.length,
      });

      return shuffledSentences;
    } catch (error) {
      this.logger.error('Error fetching NER sentences', error as Error, {
        languageCode: languageCode || 'all',
        operation: 'getNerSentences',
      });
      return [];
    }
  }

  /**
   * Get translation sentences from database with caching
   *
   * @param languageCode - Optional ISO 639-3 + ISO 15924 language code filter
   * @returns Array of sentence objects for translation
   */
  async getTranslationSentences(languageCode?: string) {
    try {
      const cacheKey = this.cacheService.generateCacheKey(
        'translation_sentences',
        { languageCode: languageCode || 'all' },
      );

      // Check cache first
      const cachedSentences = await this.cacheService.get(cacheKey);
      if (cachedSentences) {
        this.logger.cache('HIT', cacheKey, true, {
          operation: 'translation_sentences',
        });
        return cachedSentences;
      }

      const whereClause = languageCode
        ? { languageCode, isActive: true, taskType: 'translation' }
        : { isActive: true, taskType: 'translation' };

      const sentences = await this.prisma.sentence.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      });

      // Shuffle the results for variety
      const shuffledSentences = sentences.sort(() => Math.random() - 0.5);

      // Cache for 10 minutes
      await this.cacheService.set(cacheKey, shuffledSentences, 600);

      return shuffledSentences;
    } catch (error) {
      this.logger.error(
        'Error fetching translation sentences',
        error as Error,
        {
          languageCode: languageCode || 'all',
          operation: 'getTranslationSentences',
        },
      );
      return [];
    }
  }

  // Save NER annotation to database
  /**
   * Save NER annotations submitted by user
   *
   * @param sentenceId - ID of the sentence being annotated
   * @param annotations - Array of named entity annotations
   * @param languageCode - Language code for the annotations
   * @param userId - Optional user ID who submitted the annotations
   * @returns Success status and result ID
   * @throws NotFoundException if sentence not found
   */
  async saveNerAnnotation(
    sentenceId: string,
    annotations: any[],
    languageCode: string,
    userId?: string,
  ) {
    try {
      // Check if sentence exists
      const sentence = await this.prisma.sentence.findUnique({
        where: { id: sentenceId },
      });
      if (!sentence) {
        throw new NotFoundException('Sentence not found');
      }

      const annotation = await this.prisma.nerAnnotation.create({
        data: {
          sentenceId,
          userId,
          annotations,
          languageCode,
        },
      });

      // Mark as completed
      if (userId) {
        await this.progress.markCompleted(
          userId,
          'sentence',
          sentenceId,
          'ner',
        );
      }

      return {
        success: true,
        annotationId: annotation.id,
        message: 'NER annotation saved successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error saving NER annotation', error as Error, {
        sentenceId,
        operation: 'saveNerAnnotation',
      });
      throw new Error('Failed to save NER annotation');
    }
  }

  // Save NER processing result to database
  /**
   * Save NER processing result to database
   *
   * @param sentenceId - ID of the sentence processed
   * @param entities - Array of detected named entities
   * @param languageCode - Language code for the result
   * @param confidence - Optional confidence score
   * @param userId - Optional user ID who processed the result
   * @returns Success status and result ID
   * @throws NotFoundException if sentence not found
   */
  async saveNerResult(
    sentenceId: string,
    entities: any[],
    languageCode: string,
    confidence?: number,
    userId?: string,
  ) {
    try {
      const result = await this.prisma.nerResult.create({
        data: {
          sentenceId,
          userId,
          entities,
          confidence,
          languageCode,
        },
      });

      return {
        success: true,
        resultId: result.id,
        message: 'NER result saved successfully',
      };
    } catch (error) {
      this.logger.error('Error saving NER result', error as Error, {
        sentenceId,
        operation: 'saveNerResult',
      });
      throw new Error('Failed to save NER result');
    }
  }

  /**
   * Save POS tagging result to database
   *
   * @param sentenceId - ID of the sentence processed
   * @param tokens - Array of tokens with POS tags
   * @param languageCode - Language code for the result
   * @param userId - Optional user ID who processed the result
   * @returns Success status and result ID
   * @throws NotFoundException if sentence not found
   */
  async savePosResult(
    sentenceId: string,
    tokens: any[],
    languageCode: string,
    userId?: string,
  ) {
    try {
      // Check if sentence exists
      const sentence = await this.prisma.sentence.findUnique({
        where: { id: sentenceId },
      });
      if (!sentence) {
        throw new NotFoundException('Sentence not found');
      }

      const result = await this.prisma.posResult.create({
        data: {
          sentenceId,
          userId,
          tokens,
          languageCode,
        },
      });

      // Mark as completed
      if (userId) {
        await this.progress.markCompleted(
          userId,
          'sentence',
          sentenceId,
          'pos',
        );
      }

      return {
        success: true,
        resultId: result.id,
        message: 'POS result saved successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error saving POS result', error as Error, {
        sentenceId,
        operation: 'savePosResult',
      });
      throw new Error('Failed to save POS result');
    }
  }

  /**
   * Save POS annotation submitted by user (alias for savePosResult)
   *
   * @param sentenceId - ID of the sentence being annotated
   * @param tokens - Array of tokens with POS tags
   * @param languageCode - Language code for the annotations
   * @param userId - Optional user ID who submitted the annotations
   * @returns Success status and result ID
   */
  async savePosAnnotation(
    sentenceId: string,
    tokens: any[],
    languageCode: string,
    userId?: string,
  ) {
    return this.savePosResult(sentenceId, tokens, languageCode, userId);
  }

  /**
   * Save translation result to database
   *
   * @param sentenceId - ID of the source sentence
   * @param originalText - Original text in source language
   * @param translatedText - Translated text in target language
   * @param sourceLanguage - Source language code
   * @param targetLanguage - Target language code
   * @param confidence - Optional confidence score
   * @param userId - Optional user ID who created the translation
   * @returns Success status and result ID
   */
  async saveTranslationResult(
    sentenceId: string,
    originalText: string,
    translatedText: string,
    sourceLanguage: string,
    targetLanguage: string,
    confidence?: number,
    userId?: string,
  ) {
    try {
      const result = await this.prisma.translationResult.create({
        data: {
          sentenceId,
          userId,
          sourceLanguage,
          targetLanguage,
          originalText,
          translatedText,
          confidence,
        },
      });

      return {
        success: true,
        resultId: result.id,
        message: 'Translation result saved successfully',
      };
    } catch (error) {
      this.logger.error('Error saving translation result', error as Error, {
        sentenceId,
        operation: 'saveTranslationResult',
      });
      throw new Error('Failed to save translation result');
    }
  }

  /**
   * Save sentiment analysis result to database
   *
   * @param text - Text that was analyzed
   * @param sentiment - Sentiment label (positive, negative, neutral)
   * @param confidence - Confidence score (0-1)
   * @param languageCode - Language code for the result
   * @param sentenceId - Optional sentence ID
   * @param userId - Optional user ID who analyzed the text
   * @returns Success status and result ID
   */
  async saveSentimentResult(
    text: string,
    sentiment: string,
    confidence: number,
    languageCode: string,
    sentenceId?: string,
    userId?: string,
  ) {
    try {
      const result = await this.prisma.sentimentResult.create({
        data: {
          sentenceId,
          userId,
          text,
          sentiment,
          confidence,
          languageCode,
        },
      });

      return {
        success: true,
        resultId: result.id,
        message: 'Sentiment result saved successfully',
      };
    } catch (error) {
      this.logger.error('Error saving sentiment result', error as Error, {
        sentenceId,
        operation: 'saveSentimentResult',
      });
      throw new Error('Failed to save sentiment result');
    }
  }

  /**
   * Save sentiment annotation submitted by user with progress tracking
   *
   * @param sentenceId - ID of the sentence being annotated
   * @param sentiment - Sentiment label
   * @param confidence - Confidence score (0-1)
   * @param languageCode - Language code
   * @param text - Text that was analyzed
   * @param userId - Optional user ID who submitted the annotation
   * @returns Success status and result ID
   * @throws NotFoundException if sentence not found
   */
  async saveSentimentAnnotation(
    sentenceId: string,
    sentiment: string,
    confidence: number,
    languageCode: string,
    text: string,
    userId?: string,
  ) {
    // Check if sentence exists
    const sentence = await this.prisma.sentence.findUnique({
      where: { id: sentenceId },
    });
    if (!sentence) {
      throw new NotFoundException('Sentence not found');
    }

    const result = await this.saveSentimentResult(
      text,
      sentiment,
      confidence,
      languageCode,
      sentenceId,
      userId,
    );

    if (userId && sentenceId) {
      await this.progress.markCompleted(
        userId,
        'sentence',
        sentenceId,
        'sentiment',
      );
    }

    return result;
  }

  /**
   * Save emotion detection result to database
   *
   * @param text - Text that was analyzed
   * @param emotion - Emotion label (happy, sad, angry, etc.)
   * @param confidence - Confidence score (0-1)
   * @param languageCode - Language code for the result
   * @param sentenceId - Optional sentence ID
   * @param userId - Optional user ID who analyzed the text
   * @returns Success status and result ID
   */
  async saveEmotionResult(
    text: string,
    emotion: string,
    confidence: number,
    languageCode: string,
    sentenceId?: string,
    userId?: string,
  ) {
    try {
      const result = await this.prisma.emotionResult.create({
        data: {
          sentenceId,
          userId,
          text,
          emotion,
          confidence,
          languageCode,
        },
      });

      // Mark as completed
      if (userId && sentenceId) {
        await this.progress.markCompleted(
          userId,
          'sentence',
          sentenceId,
          'emotion',
        );
      }

      return {
        success: true,
        resultId: result.id,
        message: 'Emotion result saved successfully',
      };
    } catch (error) {
      this.logger.error('Error saving emotion result', error as Error, {
        sentenceId,
        operation: 'saveEmotionResult',
      });
      throw new Error('Failed to save emotion result');
    }
  }

  /**
   * Save emotion annotation submitted by user
   *
   * @param sentenceId - ID of the sentence being annotated
   * @param emotion - Emotion label
   * @param confidence - Confidence score (0-1)
   * @param languageCode - Language code
   * @param text - Text that was analyzed
   * @param userId - Optional user ID who submitted the annotation
   * @returns Success status and result ID
   * @throws NotFoundException if sentence not found
   */
  async saveEmotionAnnotation(
    sentenceId: string,
    emotion: string,
    confidence: number,
    languageCode: string,
    text: string,
    userId?: string,
  ) {
    // Check if sentence exists
    const sentence = await this.prisma.sentence.findUnique({
      where: { id: sentenceId },
    });
    if (!sentence) {
      throw new NotFoundException('Sentence not found');
    }

    return this.saveEmotionResult(
      text,
      emotion,
      confidence,
      languageCode,
      sentenceId,
      userId,
    );
  }

  /**
   * Get POS sentences from database with caching
   *
   * @param languageCode - Optional ISO 639-3 + ISO 15924 language code filter
   * @returns Array of sentence objects for POS tagging
   */
  async getPosSentences(languageCode?: string) {
    const startTime = Date.now();

    try {
      this.logger.dataAccess('Fetching POS sentences', {
        languageCode: languageCode || 'all',
        operation: 'READ',
        resource: 'sentences',
      });

      const cacheKey = this.cacheService.generateCacheKey('pos_sentences', {
        languageCode: languageCode || 'all',
      });

      // Check cache first
      const cachedSentences = await this.cacheService.get(cacheKey);
      if (cachedSentences) {
        this.logger.cache('HIT', cacheKey, true, {
          operation: 'pos_sentences',
        });
        this.logger.performance('getPosSentences', Date.now() - startTime, {
          cached: true,
        });
        return cachedSentences;
      }

      const whereClause = languageCode
        ? { languageCode, valid: true, taskType: 'speech' }
        : { valid: true, taskType: 'speech' };

      const dbStartTime = Date.now();
      const sentences = await this.prisma.sentence.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 100, // Limit to 100 sentences
      });
      this.logger.database('SELECT', 'sentences', Date.now() - dbStartTime, {
        count: sentences.length,
        taskType: 'pos',
      });

      // Cache the result
      await this.cacheService.set(cacheKey, sentences, 3600); // Cache for 1 hour
      this.logger.cache('MISS', cacheKey, false, {
        operation: 'pos_sentences',
      });

      this.logger.performance('getPosSentences', Date.now() - startTime, {
        cached: false,
      });
      return sentences;
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      this.logger.error('Error fetching POS sentences', errorObj, {
        operation: 'getPosSentences',
      });
      throw errorObj;
    }
  }

  /**
   * Get speech sentences from database with caching
   *
   * @param languageCode - Optional ISO 639-3 + ISO 15924 language code filter
   * @returns Array of sentence objects for speech recording
   */
  async getSpeechSentences(languageCode?: string) {
    try {
      const cacheKey = this.cacheService.generateCacheKey('speech_sentences', {
        languageCode: languageCode || 'all',
      });

      // Check cache first
      const cachedSentences = await this.cacheService.get(cacheKey);
      if (cachedSentences) {
        this.logger.cache('HIT', cacheKey, true, {
          operation: 'speech_sentences',
        });
        return cachedSentences;
      }

      const whereClause = languageCode
        ? { languageCode, isActive: true, taskType: 'speech' }
        : { isActive: true, taskType: 'speech' };

      const sentences = await this.prisma.sentence.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      });

      // Shuffle the results for variety
      const shuffledSentences = sentences.sort(() => Math.random() - 0.5);

      // Cache for 10 minutes
      await this.cacheService.set(cacheKey, shuffledSentences, 600);

      return shuffledSentences;
    } catch (error) {
      this.logger.error('Error fetching speech sentences', error as Error, {
        languageCode: languageCode || 'all',
        operation: 'getSpeechSentences',
      });
      return [];
    }
  }

  /**
   * Save translation submission to database
   * Creates new sentence record for translation and mapping between source and target
   *
   * @param srcSentenceId - ID of the source sentence
   * @param translation - Translated text
   * @param targetLang - Target language code
   * @param sourceLang - Source language code
   * @param userId - Optional user ID who submitted the translation
   * @returns Success status with sentence and mapping IDs
   * @throws NotFoundException if source sentence not found
   */
  async saveTranslationSubmission(
    srcSentenceId: string,
    translation: string,
    targetLang: string,
    sourceLang: string,
    userId?: string,
  ) {
    try {
      // Sanitize translation text
      const sanitizedTranslation = sanitizeInput(translation);

      // Use transaction to ensure atomicity
      return await this.prisma.$transaction(async (tx) => {
        // Check if source sentence exists
        const srcSentence = await tx.sentence.findUnique({
          where: { id: srcSentenceId },
        });
        if (!srcSentence) {
          throw new NotFoundException('Source sentence not found');
        }

        // Create a new sentence record for the translated text
        const targetSentence = await tx.sentence.create({
          data: {
            text: sanitizedTranslation,
            languageCode: targetLang,
            taskType: 'translation',
            difficulty: 'user_generated', // Mark as user-generated translation
          },
        });

        // Create the mapping between source and target sentences
        const mapping = await tx.translationMapping.create({
          data: {
            srcSentenceId,
            tgtSentenceId: targetSentence.id,
            userId,
          },
        });

        return {
          success: true,
          mappingId: mapping.id,
          srcSentenceId,
          tgtSentenceId: targetSentence.id,
          message: 'Translation submission saved successfully',
        };
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error saving translation submission:', error);
      throw new Error('Failed to save translation submission');
    }
  }

  // Save speech recording to database
  async saveSpeechRecording(
    sentenceId: string,
    audioFile: File | Buffer,
    audioFormat: string,
    duration?: number,
    userId?: string,
  ) {
    try {
      // In a real implementation, you'd upload the file to cloud storage
      // For now, we'll just store a placeholder path
      const fileName = `speech_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${audioFormat}`;
      const filePath = `/uploads/speech/${fileName}`;

      const recording = await this.prisma.speechRecording.create({
        data: {
          sentenceId,
          userId,
          audioFile: filePath,
          audioFormat,
          duration,
          fileSize:
            audioFile instanceof Buffer
              ? audioFile.length
              : (audioFile as File).size,
        },
      });

      return {
        success: true,
        recordingId: recording.id,
        audioFile: recording.audioFile,
        message: 'Speech recording saved successfully',
      };
    } catch (error) {
      this.logger.error('Error saving speech recording', error as Error, {
        sentenceId,
        operation: 'saveSpeechRecording',
      });
      throw new Error('Failed to save speech recording');
    }
  }

  /**
   * Process text for Named Entity Recognition (NER)
   * Currently returns placeholder - requires actual NLP model integration
   *
   * @param text - Text to process for named entities
   * @param annotations - Optional user-submitted annotations for storage
   * @param language - Optional language code for processing
   * @param sentenceId - Optional sentence ID for database lookup
   * @returns NER result with entities and confidence scores
   * @throws ServiceUnavailableException if NER processing is disabled
   */
  async processNER(
    text: string,
    annotations?: any[],
    language?: string,
    sentenceId?: string,
  ) {
    // If annotations are provided, this is user-submitted data for storage
    if (annotations) {
      this.logger.dataAccess('Received NER annotations', {
        operation: 'CREATE',
        resource: 'ner_annotations',
        sentenceId,
        language: language || 'auto',
      });

      return {
        success: true,
        message: 'NER annotations received and processed',
        data: {
          text,
          annotations,
          language,
          sentenceId,
          processed_at: new Date().toISOString(),
        },
      };
    }

    const cacheKey = this.cacheService.generateCacheKey('ner', {
      text: text.substring(0, 100),
      language: language || 'auto',
    });

    // Check cache first
    const cachedResult = await this.cacheService.get(cacheKey);
    if (cachedResult) {
      this.logger.cache('HIT', cacheKey, true, { operation: 'ner' });
      return cachedResult;
    }

    // Check database for existing NER results first
    if (sentenceId) {
      const existingResult = await this.prisma.nerResult.findFirst({
        where: {
          sentenceId,
          languageCode: language || 'auto',
          isValidated: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (existingResult) {
        this.logger.cache('HIT', cacheKey, true, {
          operation: 'ner',
          source: 'database',
        });
        const result = {
          text,
          entities: existingResult.entities,
          confidence: existingResult.confidence,
          processed_at: existingResult.createdAt.toISOString(),
          source: 'database',
        };
        await this.cacheService.set(cacheKey, result, 1800);
        return result;
      }
    }

    // Check if NER processing is enabled
    if (!NLP_CONFIG.ENABLE_NER_PROCESSING) {
      throw new ServiceUnavailableException(
        'NER processing is currently unavailable. This feature requires integration with an NLP service.',
      );
    }

    // TODO: Integrate with actual NER API/model here
    // For now, return a placeholder indicating real processing needed
    const result = {
      text,
      entities: [],
      confidence: 0,
      processed_at: new Date().toISOString(),
      source: 'placeholder',
      message: 'Real NER processing integration needed',
    };

    // Cache for 30 minutes
    await this.cacheService.set(cacheKey, result, 1800);

    return result;
  }

  /**
   * Process text for Part-of-Speech (POS) tagging
   * Currently returns placeholder - requires actual NLP model integration
   *
   * @param text - Text to process for POS tags
   * @param language - Optional language code for processing
   * @param sentenceId - Optional sentence ID for database lookup
   * @returns POS result with tokens and tags
   * @throws ServiceUnavailableException if POS processing is disabled
   */
  async processPOS(text: string, language?: string, sentenceId?: string) {
    const cacheKey = this.cacheService.generateCacheKey('pos', {
      text: text.substring(0, 100),
    });

    // Check cache first
    const cachedResult = await this.cacheService.get(cacheKey);
    if (cachedResult) {
      this.logger.cache('HIT', cacheKey, true, { operation: 'pos' });
      return cachedResult;
    }

    // Check database for existing POS results first
    if (sentenceId) {
      const existingResult = await this.prisma.posResult.findFirst({
        where: {
          sentenceId,
          languageCode: language || 'auto',
          isValidated: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (existingResult) {
        this.logger.cache('HIT', cacheKey, true, {
          operation: 'pos',
          source: 'database',
        });
        const result = {
          text,
          tokens: existingResult.tokens,
          processed_at: existingResult.createdAt.toISOString(),
          source: 'database',
        };
        await this.cacheService.set(cacheKey, result, 1800);
        return result;
      }
    }

    // Check if POS processing is enabled
    if (!NLP_CONFIG.ENABLE_POS_PROCESSING) {
      throw new ServiceUnavailableException(
        'POS tagging is currently unavailable. This feature requires integration with an NLP service.',
      );
    }

    // TODO: Integrate with actual POS tagging API/model here
    // For now, return a placeholder indicating real processing needed
    const result = {
      text,
      tokens: [],
      processed_at: new Date().toISOString(),
      source: 'placeholder',
      message: 'Real POS tagging integration needed',
    };

    // Cache for 30 minutes
    await this.cacheService.set(cacheKey, result, 1800);

    return result;
  }

  /**
   * Translate text from source language to target language
   * Currently returns placeholder - requires actual translation service integration
   *
   * @param text - Text to translate
   * @param targetLanguage - Target language code (ISO 639-3)
   * @param sourceLanguage - Optional source language code (auto-detect if not provided)
   * @param sentenceId - Optional sentence ID for database lookup
   * @returns Translation result with original and translated text
   * @throws ServiceUnavailableException if translation is disabled
   */
  async translate(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string,
    sentenceId?: string,
  ) {
    const cacheKey = this.cacheService.generateCacheKey('translate', {
      text: text.substring(0, 100),
      source: sourceLanguage || 'auto',
      target: targetLanguage,
    });

    // Check cache first
    const cachedResult = await this.cacheService.get(cacheKey);
    if (cachedResult) {
      this.logger.cache('HIT', cacheKey, true, { operation: 'translation' });
      return cachedResult;
    }

    // Check database for existing translation results first
    if (sentenceId) {
      const existingResult = await this.prisma.translationResult.findFirst({
        where: {
          sentenceId,
          sourceLanguage: sourceLanguage || 'auto',
          targetLanguage,
          isValidated: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (existingResult) {
        this.logger.cache('HIT', cacheKey, true, {
          operation: 'translation',
          source: 'database',
        });
        const result = {
          original_text: text,
          translated_text: existingResult.translatedText,
          source_language: existingResult.sourceLanguage,
          target_language: existingResult.targetLanguage,
          confidence: existingResult.confidence,
          processed_at: existingResult.createdAt.toISOString(),
          source: 'database',
        };
        await this.cacheService.set(cacheKey, result, 3600);
        return result;
      }
    }

    // Check if translation is enabled
    if (!NLP_CONFIG.ENABLE_TRANSLATION) {
      throw new ServiceUnavailableException(
        'Translation is currently unavailable. This feature requires integration with a translation service.',
      );
    }

    // TODO: Integrate with actual translation API/model here
    // For now, return a placeholder indicating real processing needed
    const result = {
      original_text: text,
      translated_text: `[${targetLanguage}] ${text}`,
      source_language: sourceLanguage || 'auto',
      target_language: targetLanguage,
      processed_at: new Date().toISOString(),
      source: 'placeholder',
      message: 'Real translation integration needed',
    };

    // Cache for 1 hour (translations are expensive)
    await this.cacheService.set(cacheKey, result, 3600);

    return result;
  }

  // Mock translate-review implementation
  reviewTranslation(
    originalText: string,
    translatedText: string,
    rating: number,
    feedback?: string,
  ) {
    return {
      original_text: originalText,
      translated_text: translatedText,
      rating,
      feedback,
      reviewed_at: new Date().toISOString(),
      status: 'reviewed',
    };
  }

  /**
   * Analyze sentiment of text (positive, negative, neutral)
   * Currently returns placeholder - requires actual sentiment analysis model integration
   *
   * @param text - Text to analyze for sentiment
   * @param userId - Optional user ID for logging
   * @param language - Optional language code for processing
   * @returns Sentiment analysis result with sentiment label and confidence
   * @throws ServiceUnavailableException if sentiment analysis is disabled
   */
  async analyzeSentiment(text: string, userId?: string, language?: string) {
    const startTime = Date.now();
    const cacheKey = this.cacheService.generateCacheKey('sentiment', {
      text: text.substring(0, 100),
    });

    try {
      this.logger.dataAccess('Sentiment analysis requested', {
        operation: 'PROCESS',
        resource: 'sentiment_analysis',
        textLength: text.length,
        userId: userId
          ? this.logger['maskSensitiveData'](userId, 'userId')
          : undefined,
      });

      // Check cache first
      const cachedResult = await this.cacheService.get(cacheKey);
      if (cachedResult) {
        this.logger.cache('HIT', cacheKey, true, {
          operation: 'sentiment_analysis',
        });
        this.logger.performance('analyzeSentiment', Date.now() - startTime, {
          cached: true,
        });
        return cachedResult;
      }

      // Log sensitive data processing
      if (
        text.includes('age') ||
        text.includes('birth') ||
        text.match(/\b\d{1,3}\s*(years?|yrs?|old)\b/i)
      ) {
        this.logger.logSensitiveData(
          'Sentiment analysis on potentially sensitive text',
          ['personal_info'],
          {
            textSnippet: text.substring(0, 50) + '...',
            userId: userId
              ? this.logger['maskSensitiveData'](userId, 'userId')
              : undefined,
          },
        );
      }

      // Check database for existing sentiment results first
      const existingResult = await this.prisma.sentimentResult.findFirst({
        where: {
          text,
          languageCode: language || 'auto',
          isValidated: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (existingResult) {
        this.logger.cache('HIT', cacheKey, true, {
          operation: 'sentiment',
          source: 'database',
        });
        const result = {
          text,
          sentiment: existingResult.sentiment,
          confidence: existingResult.confidence,
          processed_at: existingResult.createdAt.toISOString(),
          source: 'database',
        };
        await this.cacheService.set(cacheKey, result, 1800);
        return result;
      }

      // Check if sentiment analysis is enabled
      if (!NLP_CONFIG.ENABLE_SENTIMENT) {
        throw new ServiceUnavailableException(
          'Sentiment analysis is currently unavailable. This feature requires integration with an NLP service.',
        );
      }

      // TODO: Integrate with actual sentiment analysis API/model here
      // For now, return a placeholder indicating real processing needed
      const result = {
        text,
        sentiment: 'neutral',
        confidence: 0.5,
        processed_at: new Date().toISOString(),
        source: 'placeholder',
        message: 'Real sentiment analysis integration needed',
      };

      // Cache for 30 minutes
      await this.cacheService.set(cacheKey, result, 1800);
      this.logger.cache('SET', cacheKey, false, {
        operation: 'sentiment_analysis',
        ttl: 1800,
      });

      this.logger.performance('analyzeSentiment', Date.now() - startTime, {
        cached: false,
        sentiment: result.sentiment,
      });

      return result;
    } catch (error) {
      this.logger.error('Error in sentiment analysis', error as Error, {
        operation: 'analyzeSentiment',
        textLength: text.length,
        userId: userId
          ? this.logger['maskSensitiveData'](userId, 'userId')
          : undefined,
      });
      throw error;
    }
  }

  /**
   * Detect emotion in text (happy, sad, angry, etc.)
   * Currently returns placeholder - requires actual emotion detection model integration
   *
   * @param text - Text to analyze for emotion
   * @param language - Optional language code for processing
   * @returns Emotion detection result with emotion label and confidence
   * @throws ServiceUnavailableException if emotion detection is disabled
   */
  async detectEmotion(text: string, language?: string) {
    const cacheKey = this.cacheService.generateCacheKey('emotion', {
      text: text.substring(0, 100),
    });

    // Check cache first
    const cachedResult = await this.cacheService.get(cacheKey);
    if (cachedResult) {
      this.logger.cache('HIT', cacheKey, true, { operation: 'emotion' });
      return cachedResult;
    }

    // Check database for existing emotion results first
    const languageCode = language || 'auto';
    const existingResult = await this.prisma.emotionResult.findFirst({
      where: {
        text,
        languageCode,
        isValidated: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingResult) {
      this.logger.cache('HIT', cacheKey, true, {
        operation: 'emotion',
        source: 'database',
      });
      const result = {
        text,
        emotion: existingResult.emotion,
        confidence: existingResult.confidence,
        processed_at: existingResult.createdAt.toISOString(),
        source: 'database',
      };
      await this.cacheService.set(cacheKey, result, 1800);
      return result;
    }

    // Check if emotion detection is enabled
    if (!NLP_CONFIG.ENABLE_EMOTION) {
      throw new ServiceUnavailableException(
        'Emotion detection is currently unavailable. This feature requires integration with an NLP service.',
      );
    }

    // TODO: Integrate with actual emotion detection API/model here
    // For now, return a placeholder indicating real processing needed
    const result = {
      text,
      emotion: 'neutral',
      confidence: 0.5,
      processed_at: new Date().toISOString(),
      source: 'placeholder',
      message: 'Real emotion detection integration needed',
    };

    // Cache for 30 minutes
    await this.cacheService.set(cacheKey, result, 1800);

    return result;
  }

  /**
   * Get question sentences from database with caching
   *
   * @param languageCode - Optional ISO 639-3 + ISO 15924 language code filter
   * @returns Array of question sentence objects
   */
  async getQuestionSentences(languageCode?: string) {
    try {
      const cacheKey = this.cacheService.generateCacheKey(
        'question_sentences',
        { languageCode: languageCode || 'all' },
      );

      // Check cache first
      const cachedSentences = await this.cacheService.get(cacheKey);
      if (cachedSentences) {
        this.logger.cache('HIT', cacheKey, true, {
          operation: 'question_sentences',
        });
        return cachedSentences;
      }

      const whereClause = languageCode
        ? { languageCode, isActive: true, taskType: 'question' }
        : { isActive: true, taskType: 'question' };

      const sentences = await this.prisma.sentence.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      });

      // Shuffle the results for variety
      const shuffledSentences = sentences.sort(() => Math.random() - 0.5);

      // Cache for 10 minutes
      await this.cacheService.set(cacheKey, shuffledSentences, 600);

      return shuffledSentences;
    } catch (error) {
      console.error('Error fetching question sentences:', error);
      return [];
    }
  }

  /**
   * Save question submission to database
   *
   * @param questionText - Question text to submit
   * @param languageCode - Language code for the question
   * @param userId - Optional user ID who submitted the question
   * @returns Success status with submission and sentence IDs
   */
  async saveQuestionSubmission(
    questionText: string,
    languageCode: string,
    userId?: string,
  ) {
    try {
      // Sanitize question text
      const sanitizedText = sanitizeInput(questionText);

      // First, create a new sentence record for the question
      const questionSentence = await this.prisma.sentence.create({
        data: {
          text: sanitizedText,
          languageCode,
          taskType: 'question',
          difficulty: 'user_generated',
        },
      });

      // Then create the question submission record
      const submission = await this.prisma.questionSubmission.create({
        data: {
          sentenceId: questionSentence.id,
          userId,
          submittedText: sanitizedText,
          languageCode,
        },
      });

      return {
        success: true,
        submissionId: submission.id,
        sentenceId: questionSentence.id,
        message: 'Question submission saved successfully',
      };
    } catch (error) {
      this.logger.error('Error saving question submission', error as Error, {
        languageCode,
        operation: 'saveQuestionSubmission',
      });
      throw new Error('Failed to save question submission');
    }
  }
}
