import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class NlpService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
    private logger: LoggerService,
  ) { }

  // Get NER sentences from database with caching
  async getNerSentences(languageCode?: string) {
    const startTime = Date.now();

    try {
      this.logger.dataAccess('Fetching NER sentences', {
        languageCode: languageCode || 'all',
        operation: 'READ',
        resource: 'sentences'
      });

      const cacheKey = this.cacheService.generateCacheKey('ner_sentences', { languageCode: languageCode || 'all' });

      // Check cache first
      const cachedSentences = await this.cacheService.get(cacheKey);
      if (cachedSentences) {
        this.logger.cache('HIT', cacheKey, true, { operation: 'ner_sentences' });
        this.logger.performance('getNerSentences', Date.now() - startTime, { cached: true });
        return cachedSentences;
      }

      const whereClause = languageCode
        ? { languageCode, isActive: true, taskType: 'ner' }
        : { isActive: true, taskType: 'ner' };

      const dbStartTime = Date.now();
      const sentences = await this.prisma.sentence.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      });
      this.logger.database('SELECT', 'sentences', Date.now() - dbStartTime, {
        count: sentences.length,
        taskType: 'ner'
      });

      // Shuffle the results for variety
      const shuffledSentences = sentences.sort(() => Math.random() - 0.5);

      // Cache for 10 minutes
      await this.cacheService.set(cacheKey, shuffledSentences, 600);
      this.logger.cache('SET', cacheKey, false, { operation: 'ner_sentences', ttl: 600 });

      this.logger.performance('getNerSentences', Date.now() - startTime, {
        cached: false,
        count: shuffledSentences.length
      });

      return shuffledSentences;
    } catch (error) {
      this.logger.error('Error fetching NER sentences', error as Error, {
        languageCode: languageCode || 'all',
        operation: 'getNerSentences'
      });
      return [];
    }
  }

  // Get translation sentences from database with caching
  async getTranslationSentences(languageCode?: string) {
    try {
      const cacheKey = this.cacheService.generateCacheKey('translation_sentences', { languageCode: languageCode || 'all' });

      // Check cache first
      const cachedSentences = await this.cacheService.get(cacheKey);
      if (cachedSentences) {
        console.log('Returning cached translation sentences');
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
      console.error('Error fetching translation sentences:', error);
      return [];
    }
  }

  // Save NER annotation to database
  async saveNerAnnotation(sentenceId: string, annotations: any[], languageCode: string, userId?: string) {
    try {
      const annotation = await this.prisma.nerAnnotation.create({
        data: {
          sentenceId,
          userId,
          annotations,
          languageCode,
        },
      });

      return {
        success: true,
        annotationId: annotation.id,
        message: 'NER annotation saved successfully',
      };
    } catch (error) {
      console.error('Error saving NER annotation:', error);
      throw new Error('Failed to save NER annotation');
    }
  }

  // Save NER processing result to database
  async saveNerResult(sentenceId: string, entities: any[], languageCode: string, confidence?: number, userId?: string) {
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
      console.error('Error saving NER result:', error);
      throw new Error('Failed to save NER result');
    }
  }

  // Save POS processing result to database
  async savePosResult(sentenceId: string, tokens: any[], languageCode: string, userId?: string) {
    try {
      const result = await this.prisma.posResult.create({
        data: {
          sentenceId,
          userId,
          tokens,
          languageCode,
        },
      });

      return {
        success: true,
        resultId: result.id,
        message: 'POS result saved successfully',
      };
    } catch (error) {
      console.error('Error saving POS result:', error);
      throw new Error('Failed to save POS result');
    }
  }

  // Save translation result to database
  async saveTranslationResult(sentenceId: string, originalText: string, translatedText: string, sourceLanguage: string, targetLanguage: string, confidence?: number, userId?: string) {
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
      console.error('Error saving translation result:', error);
      throw new Error('Failed to save translation result');
    }
  }

  // Save sentiment analysis result to database
  async saveSentimentResult(text: string, sentiment: string, confidence: number, languageCode: string, sentenceId?: string, userId?: string) {
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
      console.error('Error saving sentiment result:', error);
      throw new Error('Failed to save sentiment result');
    }
  }

  // Save emotion detection result to database
  async saveEmotionResult(text: string, emotion: string, confidence: number, languageCode: string, sentenceId?: string, userId?: string) {
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

      return {
        success: true,
        resultId: result.id,
        message: 'Emotion result saved successfully',
      };
    } catch (error) {
      console.error('Error saving emotion result:', error);
      throw new Error('Failed to save emotion result');
    }
  }

  // Get speech sentences from database with caching
  async getSpeechSentences(languageCode?: string) {
    try {
      const cacheKey = this.cacheService.generateCacheKey('speech_sentences', { languageCode: languageCode || 'all' });

      // Check cache first
      const cachedSentences = await this.cacheService.get(cacheKey);
      if (cachedSentences) {
        console.log('Returning cached speech sentences');
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
      console.error('Error fetching speech sentences:', error);
      return [];
    }
  }

  // Save translation submission to database (new pattern)
  async saveTranslationSubmission(
    srcSentenceId: string,
    translation: string,
    targetLang: string,
    sourceLang: string,
    userId?: string
  ) {
    try {
      // First, create a new sentence record for the translated text
      const targetSentence = await this.prisma.sentence.create({
        data: {
          text: translation,
          languageCode: targetLang,
          taskType: 'translation',
          difficulty: 'user_generated', // Mark as user-generated translation
        },
      });

      // Then create the mapping between source and target sentences
      const mapping = await this.prisma.translationMapping.create({
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
    } catch (error) {
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
    userId?: string
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
          fileSize: audioFile instanceof Buffer ? audioFile.length : (audioFile as File).size,
        },
      });

      return {
        success: true,
        recordingId: recording.id,
        audioFile: recording.audioFile,
        message: 'Speech recording saved successfully',
      };
    } catch (error) {
      console.error('Error saving speech recording:', error);
      throw new Error('Failed to save speech recording');
    }
  }

  // NER implementation with caching - replace with actual NLP model
  async processNER(text: string, annotations?: any[], language?: string, sentenceId?: string) {
    // If annotations are provided, this is user-submitted data for storage
    if (annotations) {
      console.log('Received NER annotations:', {
        text,
        annotations,
        language,
        sentenceId,
        timestamp: new Date().toISOString()
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
        }
      };
    }

    const cacheKey = this.cacheService.generateCacheKey('ner', {
      text: text.substring(0, 100),
      language: language || 'auto'
    });

    // Check cache first
    const cachedResult = await this.cacheService.get(cacheKey);
    if (cachedResult) {
      console.log('Returning cached NER processing result');
      return cachedResult;
    }

    // Check database for existing NER results first
    if (sentenceId) {
      const existingResult = await this.prisma.nerResult.findFirst({
        where: {
          sentenceId,
          languageCode: language || 'auto',
          isValidated: true
        },
        orderBy: { createdAt: 'desc' }
      });

      if (existingResult) {
        this.logger.cache('HIT', cacheKey, true, { operation: 'ner', source: 'database' });
        const result = {
          text,
          entities: existingResult.entities,
          confidence: existingResult.confidence,
          processed_at: existingResult.createdAt.toISOString(),
          source: 'database'
        };
        await this.cacheService.set(cacheKey, result, 1800);
        return result;
      }
    }

    // TODO: Integrate with actual NER API/model here
    // For now, return a placeholder indicating real processing needed
    const result = {
      text,
      entities: [],
      confidence: 0,
      processed_at: new Date().toISOString(),
      source: 'placeholder',
      message: 'Real NER processing integration needed'
    };

    // Cache for 30 minutes
    await this.cacheService.set(cacheKey, result, 1800);

    return result;
  }

  // POS tagging implementation with caching
  async processPOS(text: string, language?: string, sentenceId?: string) {
    const cacheKey = this.cacheService.generateCacheKey('pos', { text: text.substring(0, 100) });

    // Check cache first
    const cachedResult = await this.cacheService.get(cacheKey);
    if (cachedResult) {
      console.log('Returning cached POS tagging result');
      return cachedResult;
    }

    // Check database for existing POS results first
    if (sentenceId) {
      const existingResult = await this.prisma.posResult.findFirst({
        where: {
          sentenceId,
          languageCode: language || 'auto',
          isValidated: true
        },
        orderBy: { createdAt: 'desc' }
      });

      if (existingResult) {
        this.logger.cache('HIT', cacheKey, true, { operation: 'pos', source: 'database' });
        const result = {
          text,
          tokens: existingResult.tokens,
          processed_at: existingResult.createdAt.toISOString(),
          source: 'database'
        };
        await this.cacheService.set(cacheKey, result, 1800);
        return result;
      }
    }

    // TODO: Integrate with actual POS tagging API/model here
    // For now, return a placeholder indicating real processing needed
    const result = {
      text,
      tokens: [],
      processed_at: new Date().toISOString(),
      source: 'placeholder',
      message: 'Real POS tagging integration needed'
    };

    // Cache for 30 minutes
    await this.cacheService.set(cacheKey, result, 1800);

    return result;
  }

  // Translation implementation with caching
  async translate(text: string, targetLanguage: string, sourceLanguage?: string, sentenceId?: string) {
    const cacheKey = this.cacheService.generateCacheKey('translate', {
      text: text.substring(0, 100),
      source: sourceLanguage || 'auto',
      target: targetLanguage
    });

    // Check cache first
    const cachedResult = await this.cacheService.get(cacheKey);
    if (cachedResult) {
      console.log('Returning cached translation result');
      return cachedResult;
    }

    // Check database for existing translation results first
    if (sentenceId) {
      const existingResult = await this.prisma.translationResult.findFirst({
        where: {
          sentenceId,
          sourceLanguage: sourceLanguage || 'auto',
          targetLanguage,
          isValidated: true
        },
        orderBy: { createdAt: 'desc' }
      });

      if (existingResult) {
        this.logger.cache('HIT', cacheKey, true, { operation: 'translation', source: 'database' });
        const result = {
          original_text: text,
          translated_text: existingResult.translatedText,
          source_language: existingResult.sourceLanguage,
          target_language: existingResult.targetLanguage,
          confidence: existingResult.confidence,
          processed_at: existingResult.createdAt.toISOString(),
          source: 'database'
        };
        await this.cacheService.set(cacheKey, result, 3600);
        return result;
      }
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
      message: 'Real translation integration needed'
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

  // Sentiment analysis with caching and security logging
  async analyzeSentiment(text: string, userId?: string, language?: string) {
    const startTime = Date.now();
    const cacheKey = this.cacheService.generateCacheKey('sentiment', { text: text.substring(0, 100) });

    try {
      this.logger.dataAccess('Sentiment analysis requested', {
        operation: 'PROCESS',
        resource: 'sentiment_analysis',
        textLength: text.length,
        userId: userId ? this.logger['maskSensitiveData'](userId, 'userId') : undefined
      });

      // Check cache first
      const cachedResult = await this.cacheService.get(cacheKey);
      if (cachedResult) {
        this.logger.cache('HIT', cacheKey, true, { operation: 'sentiment_analysis' });
        this.logger.performance('analyzeSentiment', Date.now() - startTime, { cached: true });
        return cachedResult;
      }

      // Log sensitive data processing
      if (text.includes('age') || text.includes('birth') || text.match(/\b\d{1,3}\s*(years?|yrs?|old)\b/i)) {
        this.logger.logSensitiveData('Sentiment analysis on potentially sensitive text', ['personal_info'], {
          textSnippet: text.substring(0, 50) + '...',
          userId: userId ? this.logger['maskSensitiveData'](userId, 'userId') : undefined
        });
      }

      // Check database for existing sentiment results first
      const existingResult = await this.prisma.sentimentResult.findFirst({
        where: {
          text,
          languageCode: language || 'auto',
          isValidated: true
        },
        orderBy: { createdAt: 'desc' }
      });

      if (existingResult) {
        this.logger.cache('HIT', cacheKey, true, { operation: 'sentiment', source: 'database' });
        const result = {
          text,
          sentiment: existingResult.sentiment,
          confidence: existingResult.confidence,
          processed_at: existingResult.createdAt.toISOString(),
          source: 'database'
        };
        await this.cacheService.set(cacheKey, result, 1800);
        return result;
      }

      // TODO: Integrate with actual sentiment analysis API/model here
      // For now, return a placeholder indicating real processing needed
      const result = {
        text,
        sentiment: 'neutral',
        confidence: 0.5,
        processed_at: new Date().toISOString(),
        source: 'placeholder',
        message: 'Real sentiment analysis integration needed'
      };

      // Cache for 30 minutes
      await this.cacheService.set(cacheKey, result, 1800);
      this.logger.cache('SET', cacheKey, false, { operation: 'sentiment_analysis', ttl: 1800 });

      this.logger.performance('analyzeSentiment', Date.now() - startTime, {
        cached: false,
        sentiment: result.sentiment
      });

      return result;
    } catch (error) {
      this.logger.error('Error in sentiment analysis', error as Error, {
        operation: 'analyzeSentiment',
        textLength: text.length,
        userId: userId ? this.logger['maskSensitiveData'](userId, 'userId') : undefined
      });
      throw error;
    }
  }

  // Emotion detection with caching
  async detectEmotion(text: string, language?: string) {
    const cacheKey = this.cacheService.generateCacheKey('emotion', { text: text.substring(0, 100) });

    // Check cache first
    const cachedResult = await this.cacheService.get(cacheKey);
    if (cachedResult) {
      console.log('Returning cached emotion detection');
      return cachedResult;
    }

    // Check database for existing emotion results first
    const existingResult = await this.prisma.emotionResult.findFirst({
      where: {
        text,
        languageCode: language || 'auto' || 'auto',
        isValidated: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (existingResult) {
      this.logger.cache('HIT', cacheKey, true, { operation: 'emotion', source: 'database' });
      const result = {
        text,
        emotion: existingResult.emotion,
        confidence: existingResult.confidence,
        processed_at: existingResult.createdAt.toISOString(),
        source: 'database'
      };
      await this.cacheService.set(cacheKey, result, 1800);
      return result;
    }

    // TODO: Integrate with actual emotion detection API/model here
    // For now, return a placeholder indicating real processing needed
    const result = {
      text,
      emotion: 'neutral',
      confidence: 0.5,
      processed_at: new Date().toISOString(),
      source: 'placeholder',
      message: 'Real emotion detection integration needed'
    };

    // Cache for 30 minutes
    await this.cacheService.set(cacheKey, result, 1800);

    return result;
  }

  // Get question sentences from database with caching
  async getQuestionSentences(languageCode?: string) {
    try {
      const cacheKey = this.cacheService.generateCacheKey('question_sentences', { languageCode: languageCode || 'all' });

      // Check cache first
      const cachedSentences = await this.cacheService.get(cacheKey);
      if (cachedSentences) {
        console.log('Returning cached question sentences');
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

  // Save question submission to database
  async saveQuestionSubmission(
    questionText: string,
    languageCode: string,
    userId?: string
  ) {
    try {
      // First, create a new sentence record for the question
      const questionSentence = await this.prisma.sentence.create({
        data: {
          text: questionText,
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
          submittedText: questionText,
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
      console.error('Error saving question submission:', error);
      throw new Error('Failed to save question submission');
    }
  }

}
