import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { NlpService } from './nlp.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
// @UseGuards(JwtAuthGuard) // Temporarily disabled for testing
export class NlpController {
  constructor(private readonly nlpService: NlpService) { }

  @Get('ner-sentences')
  getNerSentences(@Query('languageCode') languageCode?: string) {
    return this.nlpService.getNerSentences(languageCode);
  }

  @Get('translation-sentences')
  getTranslationSentences(@Query('languageCode') languageCode?: string) {
    return this.nlpService.getTranslationSentences(languageCode);
  }

  @Get('speech-sentences')
  getSpeechSentences(@Query('languageCode') languageCode?: string) {
    return this.nlpService.getSpeechSentences(languageCode);
  }

  @Post('ner')
  processNER(@Body() body: { text: string; annotations?: any[]; language?: string; sentenceId?: string }) {
    return this.nlpService.processNER(body.text, body.annotations, body.language, body.sentenceId);
  }

  @Post('ner-annotation')
  saveNerAnnotation(@Body() body: { sentenceId: string; annotations: any[]; languageCode: string; userId?: string }) {
    return this.nlpService.saveNerAnnotation(body.sentenceId, body.annotations, body.languageCode, body.userId);
  }

  @Post('translation-submission')
  saveTranslationSubmission(@Body() body: {
    sentenceId: string;
    translation: string;
    targetLang: string;
    sourceLang: string;
    userId?: string
  }) {
    return this.nlpService.saveTranslationSubmission(
      body.sentenceId,
      body.translation,
      body.targetLang,
      body.sourceLang,
      body.userId
    );
  }

  @Post('speech-recording')
  async saveSpeechRecording(
    @Body() body: {
      sentenceId: string;
      audioFile: string; // Base64 encoded audio file
      audioFormat: string;
      duration?: number;
      userId?: string;
    }
  ) {
    try {
      // Convert base64 to buffer for storage
      const audioBuffer = Buffer.from(body.audioFile, 'base64');

      return await this.nlpService.saveSpeechRecording(
        body.sentenceId,
        audioBuffer,
        body.audioFormat,
        body.duration,
        body.userId
      );
    } catch (error) {
      return {
        success: false,
        message: 'Failed to save speech recording',
        error: (error as Error).message
      };
    }
  }

  @Post('pos')
  processPOS(@Body() body: { text: string; language?: string; sentenceId?: string }) {
    return this.nlpService.processPOS(body.text, body.language, body.sentenceId);
  }

  @Post('translate')
  translate(
    @Body()
    body: {
      text: string;
      target_language: string;
      source_language?: string;
      sentenceId?: string;
    },
  ) {
    return this.nlpService.translate(
      body.text,
      body.target_language,
      body.source_language,
      body.sentenceId,
    );
  }

  @Post('translate-review')
  reviewTranslation(
    @Body()
    body: {
      original_text: string;
      translated_text: string;
      rating: number;
      feedback?: string;
    },
  ) {
    return this.nlpService.reviewTranslation(
      body.original_text,
      body.translated_text,
      body.rating,
      body.feedback,
    );
  }

  @Post('sentiment')
  analyzeSentiment(@Body() body: { text: string; userId?: string; language?: string }) {
    return this.nlpService.analyzeSentiment(body.text, body.userId, body.language);
  }

  @Post('emotion')
  detectEmotion(@Body() body: { text: string; language?: string }) {
    return this.nlpService.detectEmotion(body.text, body.language);
  }

  @Get('question-sentences')
  getQuestionSentences(@Query('languageCode') languageCode?: string) {
    return this.nlpService.getQuestionSentences(languageCode);
  }

  @Post('question-submission')
  async saveQuestionSubmission(
    @Body() body: {
      questionText: string;
      languageCode: string;
      userId?: string;
    }
  ) {
    try {
      return await this.nlpService.saveQuestionSubmission(
        body.questionText,
        body.languageCode,
        body.userId
      );
    } catch (error) {
      return {
        success: false,
        message: 'Failed to save question submission',
        error: (error as Error).message
      };
    }
  }
}
