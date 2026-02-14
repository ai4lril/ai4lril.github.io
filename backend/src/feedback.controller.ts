import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard, Roles } from './auth/rbac.guard';

@Controller('community/feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) { }

  @Post()
  async submitFeedback(
    @Body() body: { type: string; subject: string; message: string },
    @Request() req: any,
  ) {
    const userId = req.user?.id || null;
    return this.feedbackService.submitFeedback(
      userId,
      body.type,
      body.subject,
      body.message,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMyFeedback(
    @Request() req,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const userId = req.user.id;
    return this.feedbackService.getFeedback(
      userId,
      status,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR', 'ADMIN', 'SUPER_ADMIN')
  async getAllFeedback(
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.feedbackService.getFeedback(
      undefined,
      status,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Put(':id/respond')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR', 'ADMIN', 'SUPER_ADMIN')
  async respondToFeedback(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { response: string },
  ) {
    const adminUserId = req.user.id;
    return this.feedbackService.respondToFeedback(
      id,
      body.response,
      adminUserId,
    );
  }
}
