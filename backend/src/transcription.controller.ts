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
import { TranscriptionService } from './transcription.service';
import { CombinedAuthGuard } from './auth/combined-auth.guard';
import { SubmitTranscriptionDto } from './dto/submit-transcription.dto';
import { SubmitReviewDto } from './dto/submit-review.dto';

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

@Controller('transcription')
export class TranscriptionController {
  constructor(private readonly transcriptionService: TranscriptionService) {}

  @Get('audio')
  async getAudioForTranscription(
    @Query('languageCode') languageCode?: string,
    @Request() req?: RequestWithUser,
  ) {
    const userId = req?.user?.id;
    return this.transcriptionService.getAudioForTranscription(
      languageCode,
      userId,
    );
  }

  @Post('submission')
  @UseGuards(CombinedAuthGuard)
  async submitTranscription(
    @Body(ValidationPipe) body: SubmitTranscriptionDto,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.transcriptionService.submitTranscription(
      body.speechRecordingId,
      body.transcriptionText,
      userId,
    );
  }

  @Get('review')
  async getTranscriptionsForReview(
    @Query('languageCode') languageCode?: string,
    @Request() req?: RequestWithUser,
  ) {
    const userId = req?.user?.id;
    return this.transcriptionService.getTranscriptionsForReview(
      languageCode,
      userId,
    );
  }

  @Post('review-submission')
  @UseGuards(CombinedAuthGuard)
  async submitReview(
    @Body(ValidationPipe) body: SubmitReviewDto,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.transcriptionService.submitReview(
      body.transcriptionReviewId,
      body.isApproved,
      userId,
    );
  }
}
