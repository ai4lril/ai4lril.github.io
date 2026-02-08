import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { WriteService } from './write.service';
import { CombinedAuthGuard } from './auth/combined-auth.guard';
import { SubmitSentencesDto } from './dto/submit-sentences.dto';

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

@Controller('write')
export class WriteController {
  constructor(private readonly writeService: WriteService) {}

  @Post('submission')
  @UseGuards(CombinedAuthGuard)
  async submitSentences(
    @Body(ValidationPipe) body: SubmitSentencesDto,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    // Handle both array and string formats
    let sentencesText: string;
    if (Array.isArray(body.sentences)) {
      if (body.sentences.length === 0) {
        throw new BadRequestException('Sentences array cannot be empty');
      }
      sentencesText = body.sentences.join('\n');
    } else if (typeof body.sentences === 'string') {
      sentencesText = body.sentences;
    } else {
      throw new BadRequestException(
        'Sentences must be either a string or an array',
      );
    }

    // Validate required fields
    if (!sentencesText || !sentencesText.trim()) {
      throw new BadRequestException('Sentences text is required');
    }
    if (!body.languageCode) {
      throw new BadRequestException('Language code is required');
    }

    return this.writeService.submitSentences(
      sentencesText,
      body.languageCode,
      body.citation || '',
    );
  }
}
