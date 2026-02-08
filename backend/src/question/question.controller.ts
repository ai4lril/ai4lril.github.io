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
import { QuestionService } from './question.service';
import { CombinedAuthGuard } from '../auth/combined-auth.guard';
import { SubmitQuestionDto } from './dto/submit-question.dto';
import { SaveAnswerDto } from './dto/save-answer.dto';

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
  constructor(private readonly questionService: QuestionService) {}

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
  async saveAnswer(
    @Body(ValidationPipe) body: SaveAnswerDto,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    const audioBuffer = Buffer.from(body.audioFile, 'base64');
    return this.questionService.saveAnswer(
      body.questionSubmissionId,
      audioBuffer,
      body.audioFormat,
      body.duration || 0,
      userId,
    );
  }
}
