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
import { QuestionService } from './question.service';
import { CombinedAuthGuard } from '../auth/combined-auth.guard';
import { SubmitQuestionDto } from './dto/submit-question.dto';
import { SaveAnswerDto } from './dto/save-answer.dto';
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

@Controller('question')
export class QuestionController {
  constructor(
    private readonly questionService: QuestionService,
    private readonly queueService: QueueService,
  ) { }

  @Post('submission')
  @UseGuards(CombinedAuthGuard)
  async submitQuestion(
    @Body(ValidationPipe) body: SubmitQuestionDto,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    return await this.questionService.submitQuestion(
      body.questionText,
      body.languageCode,
      userId,
    );
  }

  @Get('sentences')
  async getValidatedQuestions(
    @Query('languageCode') languageCode?: string,
    @Request() req?: RequestWithUser,
  ) {
    const userId = req?.user?.id;
    return this.questionService.getValidatedQuestions(languageCode, userId);
  }

  @Post('answer-recording')
  @UseGuards(CombinedAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  async saveAnswer(
    @Body(ValidationPipe) body: SaveAnswerDto,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }

    const audioBuffer = Buffer.from(body.audioFile, 'base64');

    // Create job data
    const jobData: MediaUploadJobData = {
      userId,
      mediaBuffer: audioBuffer,
      fileName: `answer-${body.questionSubmissionId}-${Date.now()}.${body.audioFormat}`,
      contentType: `audio/${body.audioFormat}`,
      mediaType: 'audio',
      duration: body.duration || 0,
      questionSubmissionId: body.questionSubmissionId,
      priority: 5, // Default priority
    };

    // Add job to audio queue
    const job = await this.queueService.addAudioUploadJob(jobData);

    return {
      success: true,
      jobId: job.id,
      status: 'queued',
      message: 'Answer recording queued for processing',
    };
  }

  @Get('answer-recording/status/:jobId')
  async getAnswerStatus(@Param('jobId') jobId: string) {
    return this.queueService.getJobStatus(jobId);
  }
}
