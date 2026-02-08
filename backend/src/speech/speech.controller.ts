import {
  Get,
  Post,
  Body,
  Query,
  Request,
  UseGuards,
  Controller,
  ValidationPipe,
} from '@nestjs/common';
import { SpeechService } from './speech.service';
import { CombinedAuthGuard } from '../auth/combined-auth.guard';
import { SaveRecordingDto } from './dto/save-recording.dto';
import { SaveValidationDto } from './dto/save-validation.dto';

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

@Controller('speech')
export class SpeechController {
  constructor(private readonly speechService: SpeechService) {}

  @Get('sentences')
  async getSpeechSentences(
    @Query('languageCode') languageCode?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Request() req?: RequestWithUser,
  ) {
    const userId = req?.user?.id;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.speechService.getSpeechSentences(
      languageCode,
      userId,
      pageNum,
      limitNum,
    );
  }

  @Post('recording')
  @UseGuards(CombinedAuthGuard)
  async saveSpeechRecording(
    @Body(ValidationPipe) body: SaveRecordingDto,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    const audioBuffer = Buffer.from(body.audioFile, 'base64');
    return this.speechService.saveSpeechRecording(
      body.sentenceId,
      audioBuffer,
      body.audioFormat,
      body.duration || 0,
      userId,
      body.mediaType || 'audio',
    );
  }

  @Get('listen-audio')
  async getAudioForValidation(
    @Query('languageCode') languageCode?: string,
    @Request() req?: RequestWithUser,
  ) {
    const userId = req?.user?.id;
    return this.speechService.getAudioForValidation(languageCode, userId);
  }

  @Post('listen-validation')
  @UseGuards(CombinedAuthGuard)
  async saveValidation(
    @Body(ValidationPipe) body: SaveValidationDto,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.speechService.saveValidation(
      body.speechRecordingId,
      body.isValid,
      userId,
    );
  }
}
