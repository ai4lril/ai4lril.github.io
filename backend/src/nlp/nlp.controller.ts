import {
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Request,
  Controller,
  ValidationPipe,
} from '@nestjs/common';
import { NlpService } from './nlp.service';
import { CombinedAuthGuard } from '../auth/combined-auth.guard';
import { ProcessNerDto } from './dto/process-ner.dto';
import { SaveNerAnnotationDto } from './dto/save-ner-annotation.dto';
import { ProcessPosDto } from './dto/process-pos.dto';
import { TranslateDto } from './dto/translate.dto';
import { AnalyzeSentimentDto } from './dto/analyze-sentiment.dto';
import { DetectEmotionDto } from './dto/detect-emotion.dto';
import { SavePosAnnotationDto } from './dto/save-pos-annotation.dto';
import { SaveSentimentAnnotationDto } from './dto/save-sentiment-annotation.dto';
import { SaveEmotionAnnotationDto } from './dto/save-emotion-annotation.dto';

interface RequestWithUser {
  user?: {
    id: string;
    email?: string;
    username?: string;
    display_name?: string;
    first_name?: string;
    last_name?: string;
  };
}

@Controller()
export class NlpController {
  constructor(private readonly nlpService: NlpService) {}

  @Get('ner-sentences')
  getNerSentences(
    @Query('languageCode') languageCode?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.nlpService.getNerSentences(languageCode, pageNum, limitNum);
  }

  @Get('translation-sentences')
  getTranslationSentences(@Query('languageCode') languageCode?: string) {
    return this.nlpService.getTranslationSentences(languageCode);
  }

  @Get('speech-sentences')
  getSpeechSentences(@Query('languageCode') languageCode?: string) {
    return this.nlpService.getSpeechSentences(languageCode);
  }

  @Get('pos-sentences')
  getPosSentences(@Query('languageCode') languageCode?: string) {
    return this.nlpService.getPosSentences(languageCode);
  }

  @Post('ner')
  processNER(@Body(ValidationPipe) body: ProcessNerDto) {
    return this.nlpService.processNER(
      body.text,
      body.annotations,
      body.language,
      body.sentenceId,
    );
  }

  @Post('ner-annotation')
  @UseGuards(CombinedAuthGuard)
  saveNerAnnotation(
    @Body(ValidationPipe) body: SaveNerAnnotationDto,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.nlpService.saveNerAnnotation(
      body.sentenceId,
      body.annotations,
      body.languageCode || 'en',
      userId,
    );
  }

  @Post('translation-submission')
  @UseGuards(CombinedAuthGuard)
  saveTranslationSubmission(
    @Body()
    body: {
      sentenceId: string;
      translation?: string;
      translatedText?: string;
      targetLang?: string;
      targetLanguageCode?: string;
      sourceLang?: string;
      sourceLanguageCode?: string;
    },
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    const translation = body.translation || body.translatedText || '';
    const targetLang = body.targetLang || body.targetLanguageCode || 'en';
    const sourceLang = body.sourceLang || body.sourceLanguageCode || 'en';
    return this.nlpService.saveTranslationSubmission(
      body.sentenceId,
      translation,
      targetLang,
      sourceLang,
      userId,
    );
  }

  @Post('speech-recording')
  @UseGuards(CombinedAuthGuard)
  async saveSpeechRecording(
    @Body()
    body: {
      sentenceId: string;
      audioFile: string; // Base64 encoded audio file
      audioFormat: string;
      duration?: number;
    },
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    try {
      // Convert base64 to buffer for storage
      const audioBuffer = Buffer.from(body.audioFile, 'base64');

      return await this.nlpService.saveSpeechRecording(
        body.sentenceId,
        audioBuffer,
        body.audioFormat,
        body.duration,
        userId,
      );
    } catch (error) {
      return {
        success: false,
        message: 'Failed to save speech recording',
        error: (error as Error).message,
      };
    }
  }

  @Post('pos')
  processPOS(@Body(ValidationPipe) body: ProcessPosDto) {
    return this.nlpService.processPOS(
      body.text,
      body.language,
      body.sentenceId,
    );
  }

  @Post('translate')
  translate(@Body(ValidationPipe) body: TranslateDto) {
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
  analyzeSentiment(@Body(ValidationPipe) body: AnalyzeSentimentDto) {
    return this.nlpService.analyzeSentiment(
      body.text,
      body.userId,
      body.language,
    );
  }

  @Post('emotion')
  detectEmotion(@Body(ValidationPipe) body: DetectEmotionDto) {
    return this.nlpService.detectEmotion(body.text, body.language);
  }

  @Post('pos-annotation')
  @UseGuards(CombinedAuthGuard)
  savePosAnnotation(
    @Body(ValidationPipe) body: SavePosAnnotationDto,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    const annotations = body.annotations || body.tags || [];
    return this.nlpService.savePosAnnotation(
      body.sentenceId,
      annotations,
      body.languageCode || 'en',
      userId,
    );
  }

  @Post('sentiment-annotation')
  @UseGuards(CombinedAuthGuard)
  saveSentimentAnnotation(
    @Body(ValidationPipe) body: SaveSentimentAnnotationDto,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.nlpService.saveSentimentAnnotation(
      body.sentenceId,
      body.sentiment,
      body.confidence || 0.5,
      body.languageCode || 'en',
      body.text || '',
      userId,
    );
  }

  @Post('emotion-annotation')
  @UseGuards(CombinedAuthGuard)
  saveEmotionAnnotation(
    @Body(ValidationPipe) body: SaveEmotionAnnotationDto,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.nlpService.saveEmotionAnnotation(
      body.sentenceId,
      body.emotion,
      body.confidence || 0.5,
      body.languageCode || 'en',
      body.text || '',
      userId,
    );
  }

  @Get('question-sentences')
  getQuestionSentences(@Query('languageCode') languageCode?: string) {
    return this.nlpService.getQuestionSentences(languageCode);
  }

  @Post('question-submission')
  @UseGuards(CombinedAuthGuard)
  async saveQuestionSubmission(
    @Body()
    body: {
      questionText: string;
      languageCode: string;
    },
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    try {
      return await this.nlpService.saveQuestionSubmission(
        body.questionText,
        body.languageCode,
        userId,
      );
    } catch (error) {
      return {
        success: false,
        message: 'Failed to save question submission',
        error: (error as Error).message,
      };
    }
  }
}
