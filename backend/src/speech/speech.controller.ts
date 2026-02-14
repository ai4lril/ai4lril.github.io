import {
  Get,
  Post,
  Body,
  Query,
  Request,
  UseGuards,
  Controller,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SpeechService } from './speech.service';
import { CombinedAuthGuard } from '../auth/combined-auth.guard';
import { SaveRecordingDto } from './dto/save-recording.dto';
import { SaveValidationDto } from './dto/save-validation.dto';
import { QueueService } from '../queue/queue.service';
import { MediaUploadJobData } from '../queue/interfaces/media-upload-job.interface';

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

@ApiTags('speech')
@Controller('speech')
export class SpeechController {
  constructor(
    private readonly speechService: SpeechService,
    private readonly queueService: QueueService,
  ) { }

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
  @HttpCode(HttpStatus.ACCEPTED)
  async saveSpeechRecording(
    @Body(ValidationPipe) body: SaveRecordingDto,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }

    const audioBuffer = Buffer.from(body.audioFile, 'base64');
    const mediaType = body.mediaType || 'audio';

    // Create job data
    const jobData: MediaUploadJobData = {
      userId,
      mediaBuffer: audioBuffer,
      fileName: `speech-${body.sentenceId}-${Date.now()}.${body.audioFormat}`,
      contentType: `${mediaType}/${body.audioFormat}`,
      mediaType: mediaType as 'audio' | 'video',
      duration: body.duration || 0,
      sentenceId: body.sentenceId,
      priority: 5, // Default priority
    };

    // Add job to appropriate queue
    const job =
      mediaType === 'video'
        ? await this.queueService.addVideoUploadJob(jobData)
        : await this.queueService.addAudioUploadJob(jobData);

    return {
      success: true,
      jobId: job.id,
      status: 'queued',
      message: 'Recording upload queued for processing',
    };
  }

  @Get('recording/status/:jobId')
  async getRecordingStatus(@Param('jobId') jobId: string) {
    return this.queueService.getJobStatus(jobId);
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
